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
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {TransferController} from "./TransferController.sol";
import {ConstantsLib} from "./ConstantsLib.sol";

/**
@title SecurityBond
@notice Fund that contains crypto incentive for challenging operator fraud.
*/
contract SecurityBond is Ownable, Configurable, AccrualBeneficiary, Servable, TransferControllerManageable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public REWARD_ACTION = "reward";

    string constant public DEPOSIT_BALANCE_TYPE = "deposit";

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct RewardMeta {
        uint256 rewardFraction;
        uint256 rewardNonce;
        mapping(address => mapping(uint256 => uint256)) stageNonceByCurrency;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    BalanceLib.Balance private deposited;
    TxHistoryLib.TxHistory private txHistory;
    InUseCurrencyLib.InUseCurrency private inUseCurrencies;

    mapping(address => RewardMeta) public rewardMetaByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ReceiveEvent(address from, string balanceType, int256 amount, address currencyCt, uint256 currencyId);
    event RewardEvent(address wallet, uint256 rewardFraction);
    event StageToBeneficiaryEvent(address from, Beneficiary beneficiary, int256 amount,
        address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) Servable() public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        receiveEthersTo(msg.sender, "");
    }

    function receiveEthersTo(address wallet, string balanceType)
    public
    payable
    {
        require(
            0 == bytes(balanceType).length ||
            keccak256(abi.encodePacked(DEPOSIT_BALANCE_TYPE)) == keccak256(abi.encodePacked(balanceType))
        );

        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to balance
        deposited.add(amount, address(0), 0);
        txHistory.addDeposit(amount, address(0), 0);

        // Add currency to in-use list
        inUseCurrencies.addItem(address(0), 0);

        // Emit event
        emit ReceiveEvent(wallet, balanceType, amount, address(0), 0);
    }

    function receiveTokens(string balanceType, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        receiveTokensTo(msg.sender, balanceType, amount, currencyCt, currencyId, standard);
    }

    function receiveTokensTo(address wallet, string balanceType, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        require(
            0 == bytes(balanceType).length ||
            keccak256(abi.encodePacked(DEPOSIT_BALANCE_TYPE)) == keccak256(abi.encodePacked(balanceType))
        );

        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        require(address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId));

        // Add to balance
        deposited.add(amount, currencyCt, currencyId);
        txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add currency to in-use list
        inUseCurrencies.addItem(currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, balanceType, amount, currencyCt, currencyId);
    }

    function deposit(uint index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return txHistory.deposit(index);
    }

    function depositsCount()
    public
    view
    returns (uint256)
    {
        return txHistory.depositsCount();
    }

    function depositedBalance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return deposited.get(currencyCt, currencyId);
    }

    function inUseCurrenciesCount()
    public
    view
    returns (uint256)
    {
        return inUseCurrencies.list.length;
    }

    function inUseCurrenciesByIndices(uint256 low, uint256 up)
    public
    view
    returns (MonetaryTypesLib.Currency[])
    {
        require(low <= up);

        up = up > inUseCurrencies.list.length - 1 ? inUseCurrencies.list.length - 1 : up;
        MonetaryTypesLib.Currency[] memory _inUseCurrencies = new MonetaryTypesLib.Currency[](up - low + 1);
        for (uint256 i = low; i <= up; i++)
            _inUseCurrencies[i - low] = inUseCurrencies.list[i];

        return _inUseCurrencies;
    }

    function stageNonceByWalletCurrency(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return rewardMetaByWallet[wallet].stageNonceByCurrency[currencyCt][currencyId];
    }

    function reward(address wallet, uint256 _rewardFraction)
    public
    notNullAddress(wallet)
    onlyEnabledServiceAction(REWARD_ACTION)
    {
        // Store reward
        rewardMetaByWallet[wallet].rewardFraction = _rewardFraction.clampMax(uint256(ConstantsLib.PARTS_PER()));
        rewardMetaByWallet[wallet].rewardNonce++;

        // Emit event
        emit RewardEvent(wallet, _rewardFraction);
    }

    function stageToBeneficiary(Beneficiary beneficiary, address currencyCt, uint256 currencyId)
    public
    {
        require(inUseCurrencies.has(currencyCt, currencyId));
        require(
            rewardMetaByWallet[msg.sender].stageNonceByCurrency[currencyCt][currencyId] < rewardMetaByWallet[msg.sender].rewardNonce
        );

        // Set stage nonce of currency to the reward nonce
        rewardMetaByWallet[msg.sender].stageNonceByCurrency[currencyCt][currencyId] = rewardMetaByWallet[msg.sender].rewardNonce;

        // Calculate amount to stage
        int256 amount = deposited
        .get(currencyCt, currencyId)
        .mul(SafeMathIntLib.toInt256(rewardMetaByWallet[msg.sender].rewardFraction))
        .div(ConstantsLib.PARTS_PER());

        // Move from balance to staged
        deposited.sub(amount, currencyCt, currencyId);

        // Transfer funds to the beneficiary
        if (currencyCt == address(0) && currencyId == 0)
            beneficiary.receiveEthersTo.value(uint256(amount))(msg.sender, "staged");

        else {
            // Approve of beneficiary
            TransferController controller = getTransferController(currencyCt, "");
            require(address(controller).delegatecall(controller.getApproveSignature(), beneficiary, uint256(amount), currencyCt, currencyId));

            // Transfer funds to the beneficiary
            beneficiary.receiveTokensTo(msg.sender, "staged", amount, currencyCt, currencyId, "");
        }

        // Emit event
        emit StageToBeneficiaryEvent(msg.sender, beneficiary, amount, currencyCt, currencyId);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }
}