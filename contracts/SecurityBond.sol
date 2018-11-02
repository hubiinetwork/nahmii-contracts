/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {Configurable} from "./Configurable.sol";
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";
import {Servable} from "./Servable.sol";
import {Ownable} from "./Ownable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {TransferController} from "./TransferController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";

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

    BalanceLib.Balance private active;
    InUseCurrencyLib.InUseCurrency private inUseCurrencies;

    uint256 public withdrawalTimeout;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetWithdrawalTimeoutEvent(uint256 timeoutInSeconds);
    event DepositEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event StageEvent(address from, uint256 fraction);
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

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        depositEthersTo(msg.sender);
    }

    function depositEthersTo(address wallet)
    public
    payable
    {
        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to active balance
        active.add(amount, address(0), 0);
        walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

        // Add currency to in-use list
        inUseCurrencies.addItem(address(0), 0);

        // Emit event
        emit DepositEvent(wallet, amount, address(0), 0);
    }

    function depositTokens(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        depositTokensTo(msg.sender, amount, currencyCt, currencyId, standard);
    }

    function depositTokensTo(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        require(address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId));

        // Add to per-wallet deposited balance
        active.add(amount, currencyCt, currencyId);
        walletMap[wallet].txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add currency to in-use list
        inUseCurrencies.addItem(currencyCt, currencyId);

        // Emit event
        emit DepositEvent(wallet, amount, currencyCt, currencyId);
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

    //
    // Balance retrieval functions
    // -----------------------------------------------------------------------------------------------------------------
    function activeBalance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return active.get(currencyCt, currencyId);
    }

    function stagedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        require(wallet != address(0));

        return walletMap[wallet].staged.get(currencyCt, currencyId);
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(address wallet, uint256 fraction)
    public
    notNullAddress(wallet)
    onlyDeployerOrEnabledServiceAction(STAGE_ACTION)
    {
        uint256 startTime;

        uint256 numCurrencies = inUseCurrencies.getLength();
        int256 partsPer = configuration.PARTS_PER();
        for (uint256 i = 0; i < numCurrencies; i++) {
            MonetaryTypesLib.Currency memory currency = inUseCurrencies.getAt(i);

            int256 amount = active.get(currency.ct, currency.id).mul(
                SafeMathIntLib.toInt256(fraction)
            ).div(partsPer);

            // Move from active balance to staged
            active.sub(amount, currency.ct, currency.id);
            walletMap[wallet].staged.add(amount, currency.ct, currency.id);

            // Add substage info
            startTime = block.timestamp + ((wallet == deployer) ? withdrawalTimeout : 0);
            walletMap[wallet].subStaged[currency.ct][currency.id].list.push(SubStageItem(amount, startTime));
        }

        // Emit event
        emit StageEvent(wallet, fraction);
    }

    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        uint256 currentIndex;
        int256 toSendAmount;
        int256 thisRoundAmount;

        require(amount.isNonZeroPositiveInt256());

        // Start withdrawal from current substage
        SubStageInfo storage ssi = walletMap[msg.sender].subStaged[currencyCt][currencyId];
        toSendAmount = 0;
        while (toSendAmount < amount) {
            currentIndex = ssi.currentIndex;

            if (currentIndex >= ssi.list.length)
                break;

            if (block.timestamp < ssi.list[currentIndex].startTimestamp)
                break;

            thisRoundAmount = (amount - toSendAmount).clampMax(ssi.list[currentIndex].availableAmount);

            ssi.list[currentIndex].availableAmount = ssi.list[currentIndex].availableAmount.sub_nn(thisRoundAmount);
            if (ssi.list[currentIndex].availableAmount == 0)
                ssi.currentIndex++;

            toSendAmount = toSendAmount + thisRoundAmount;
        }
        if (toSendAmount == 0)
            return;

        // Subtract to per-wallet staged balance (will check for sufficient funds)
        walletMap[msg.sender].staged.sub(toSendAmount, currencyCt, currencyId);

        walletMap[msg.sender].txHistory.addWithdrawal(toSendAmount, currencyCt, currencyId);

        // Execute transfer
        if (currencyCt == address(0))
            msg.sender.transfer(uint256(toSendAmount));
        else {
            TransferController controller = getTransferController(currencyCt, standard);
            require(address(controller).delegatecall(controller.getDispatchSignature(), this, msg.sender, uint256(toSendAmount), currencyCt, currencyId));
        }

        // Emit event
        emit WithdrawEvent(msg.sender, toSendAmount, currencyCt, currencyId);
    }

    function withdrawal(address wallet, uint index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return walletMap[wallet].txHistory.withdrawal(index);
    }

    function withdrawalsCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletMap[wallet].txHistory.withdrawalsCount();
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }
}