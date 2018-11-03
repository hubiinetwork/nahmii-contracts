/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Configurable} from "./Configurable.sol";
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";
import {Servable} from "./Servable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {TransferController} from "./TransferController.sol";

/**
@title SecurityBond
@notice Fund that contains crypto incentive for challenging operator fraud.
*/
contract SecurityBond is Ownable, Configurable, AccrualBeneficiary, Servable, TransferControllerManageable {
    using SafeMathIntLib for int256;
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public STAGE_ACTION = "stage";

    string constant public BALANCE = "balance";

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct SubStageItem {
        int256 availableAmount;
        uint256 startTimestamp;
    }

    struct SubStageInfo {
        uint256 currentIndex;
        SubStageItem[] list;
    }

    struct Wallet {
        BalanceLib.Balance staged;
        mapping(address => mapping(uint256 => SubStageInfo)) subStaged;

        TxHistoryLib.TxHistory txHistory;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;

    BalanceLib.Balance private _balance;
    InUseCurrencyLib.InUseCurrency private inUseCurrencies;

    uint256 public withdrawalTimeout;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetWithdrawalTimeoutEvent(uint256 timeoutInSeconds);
    event ReceiveEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event StageEvent(address from, uint256 fraction);
    event StageToBeneficiaryEvent(address from, uint256 fraction);
    event WithdrawEvent(address to, int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) Servable() public {
        withdrawalTimeout = 30 minutes;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function setWithdrawalTimeout(uint256 timeoutInSeconds)
    public
    onlyDeployer
    {
        withdrawalTimeout = timeoutInSeconds;

        // Emit event
        emit SetWithdrawalTimeoutEvent(timeoutInSeconds);
    }

    function() public payable {
        receiveEthersTo(msg.sender, "");
    }

    function receiveEthersTo(address wallet, string balance)
    public
    payable
    {
        require(0 == bytes(balance).length || keccak256(abi.encodePacked(BALANCE)) == keccak256(abi.encodePacked(balance)));

        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to balance
        _balance.add(amount, address(0), 0);
        walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

        // Add currency to in-use list
        inUseCurrencies.addItem(address(0), 0);

        // Emit event
        emit ReceiveEvent(wallet, amount, address(0), 0);
    }

    function receiveTokens(string balance, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        receiveTokensTo(msg.sender, balance, amount, currencyCt, currencyId, standard);
    }

    function receiveTokensTo(address wallet, string balance, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        require(0 == bytes(balance).length || keccak256(abi.encodePacked(BALANCE)) == keccak256(abi.encodePacked(balance)));

        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        require(address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId));

        // Add to balance
        _balance.add(amount, currencyCt, currencyId);
        walletMap[wallet].txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add currency to in-use list
        inUseCurrencies.addItem(currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, amount, currencyCt, currencyId);
    }

    function deposit(address wallet, uint index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return walletMap[wallet].txHistory.deposit(index);
    }

    function depositsCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletMap[wallet].txHistory.depositsCount();
    }

    function balance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return _balance.get(currencyCt, currencyId);
    }

    function stageToBeneficiary(address wallet, Beneficiary beneficiary, uint256 fraction)
    public
    notNullAddress(wallet)
    onlyDeployerOrEnabledServiceAction(STAGE_ACTION)
    {
        uint256 numCurrencies = inUseCurrencies.getLength();
        int256 partsPer = configuration.PARTS_PER();
        for (uint256 i = 0; i < numCurrencies; i++) {
            MonetaryTypesLib.Currency memory currency = inUseCurrencies.getAt(i);

            int256 amount = _balance
            .get(currency.ct, currency.id)
            .mul(SafeMathIntLib.toInt256(fraction))
            .div(partsPer);

            // Move from balance to staged
            _balance.sub(amount, currency.ct, currency.id);

            // Transfer funds to the beneficiary
            if (currency.ct == address(0) && currency.id == 0)
                beneficiary.receiveEthersTo.value(uint256(amount))(wallet, "staged");

            else {
                // Approve of beneficiary
                TransferController controller = getTransferController(currency.ct, "");
                require(address(controller).delegatecall(controller.getApproveSignature(), beneficiary, uint256(amount), currency.ct, currency.id));

                // Transfer funds to the beneficiary
                beneficiary.receiveTokensTo(wallet, "staged", amount, currency.ct, currency.id, "");
            }
        }

        // Emit event
        emit StageToBeneficiaryEvent(wallet, fraction);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }
}