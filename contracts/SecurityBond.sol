/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
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
    string constant public DEPRIVE_ACTION = "deprive";

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct RewardMeta {
        uint256 rewardFraction;
        uint256 rewardNonce;
        uint256 unlockTime;
        mapping(address => mapping(uint256 => uint256)) claimNonceByCurrency;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    BalanceLib.Balance private deposited;
    TxHistoryLib.TxHistory private txHistory;
    InUseCurrencyLib.InUseCurrency private inUseCurrencies;

    mapping(address => RewardMeta) public rewardMetaByWallet;
    mapping(address => BalanceLib.Balance) private stagedByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ReceiveEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event RewardEvent(address wallet, uint256 rewardFraction, uint256 unlockTimeoutInSeconds);
    event DepriveEvent(address wallet);
    event ClaimAndTransferToBeneficiaryEvent(address from, Beneficiary beneficiary, string balance, int256 amount,
        address currencyCt, uint256 currencyId, string standard);
    event ClaimAndStageEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event WithdrawEvent(address from, int256 amount, address currencyCt, uint256 currencyId, string standard);

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

    function receiveEthersTo(address wallet, string)
    public
    payable
    {
        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to balance
        deposited.add(amount, address(0), 0);
        txHistory.addDeposit(amount, address(0), 0);

        // Add currency to in-use list
        inUseCurrencies.addItem(address(0), 0);

        // Emit event
        emit ReceiveEvent(wallet, amount, address(0), 0);
    }

    function receiveTokens(string, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        receiveTokensTo(msg.sender, "", amount, currencyCt, currencyId, standard);
    }

    function receiveTokensTo(address wallet, string, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = transferController(currencyCt, standard);
        require(
            address(controller).delegatecall(
                controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId
            )
        );

        // Add to balance
        deposited.add(amount, currencyCt, currencyId);
        txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add currency to in-use list
        inUseCurrencies.addItem(currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, amount, currencyCt, currencyId);
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

    function stagedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return stagedByWallet[wallet].get(currencyCt, currencyId);
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
        return rewardMetaByWallet[wallet].claimNonceByCurrency[currencyCt][currencyId];
    }

    function reward(address wallet, uint256 rewardFraction, uint256 unlockTimeoutInSeconds)
    public
    notNullAddress(wallet)
    onlyEnabledServiceAction(REWARD_ACTION)
    {
        // Update reward
        rewardMetaByWallet[wallet].rewardFraction = rewardFraction.clampMax(uint256(ConstantsLib.PARTS_PER()));
        rewardMetaByWallet[wallet].rewardNonce++;
        rewardMetaByWallet[wallet].unlockTime = block.timestamp.add(unlockTimeoutInSeconds);

        // Emit event
        emit RewardEvent(wallet, rewardFraction, unlockTimeoutInSeconds);
    }

    function deprive(address wallet)
    public
    onlyEnabledServiceAction(DEPRIVE_ACTION)
    {
        // Update reward
        rewardMetaByWallet[wallet].rewardFraction = 0;
        rewardMetaByWallet[wallet].rewardNonce++;
        rewardMetaByWallet[wallet].unlockTime = 0;

        // Emit event
        emit DepriveEvent(wallet);
    }

    function claimAndTransferToBeneficiary(Beneficiary beneficiary, string balance, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        // Claim reward
        int256 claimedAmount = _claim(msg.sender, currencyCt, currencyId);

        // Execute transfer
        if (currencyCt == address(0) && currencyId == 0)
            beneficiary.receiveEthersTo.value(uint256(claimedAmount))(msg.sender, balance);

        else {
            TransferController controller = transferController(currencyCt, standard);
            require(
                address(controller).delegatecall(
                    controller.getApproveSignature(), beneficiary, uint256(claimedAmount), currencyCt, currencyId
                )
            );
            beneficiary.receiveTokensTo(msg.sender, balance, claimedAmount, currencyCt, currencyId, standard);
        }

        // Emit event
        emit ClaimAndTransferToBeneficiaryEvent(msg.sender, beneficiary, balance, claimedAmount, currencyCt, currencyId, standard);
    }

    function claimAndStage(address currencyCt, uint256 currencyId)
    public
    {
        // Claim reward
        int256 claimedAmount = _claim(msg.sender, currencyCt, currencyId);

        // Update staged balance
        stagedByWallet[msg.sender].add(claimedAmount, currencyCt, currencyId);

        // Emit event
        emit ClaimAndStageEvent(msg.sender, claimedAmount, currencyCt, currencyId);
    }

    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        // Require that amount is strictly positive
        require(amount.isNonZeroPositiveInt256());

        // Clamp amount to the max given by staged balance
        amount = amount.clampMax(stagedByWallet[msg.sender].get(currencyCt, currencyId));

        // Subtract to per-wallet staged balance
        stagedByWallet[msg.sender].sub(amount, currencyCt, currencyId);

        // Execute transfer
        if (currencyCt == address(0) && currencyId == 0)
            msg.sender.transfer(uint256(amount));

        else {
            TransferController controller = transferController(currencyCt, standard);
            require(
                address(controller).delegatecall(
                    controller.getDispatchSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId
                )
            );
        }

        // Emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId, standard);
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _claim(address wallet, address currencyCt, uint256 currencyId)
    private
    returns (int256)
    {
        require(inUseCurrencies.has(currencyCt, currencyId));
        require(0 < rewardMetaByWallet[wallet].rewardFraction);
        require(block.timestamp >= rewardMetaByWallet[wallet].unlockTime);
        require(
            rewardMetaByWallet[wallet].claimNonceByCurrency[currencyCt][currencyId] < rewardMetaByWallet[wallet].rewardNonce
        );

        // Set stage nonce of currency to the reward nonce
        rewardMetaByWallet[wallet].claimNonceByCurrency[currencyCt][currencyId] = rewardMetaByWallet[wallet].rewardNonce;

        // Calculate claimed amount
        int256 claimedAmount = deposited
        .get(currencyCt, currencyId)
        .mul(SafeMathIntLib.toInt256(rewardMetaByWallet[wallet].rewardFraction))
        .div(ConstantsLib.PARTS_PER());

        // Move from balance to staged
        deposited.sub(claimedAmount, currencyCt, currencyId);

        // Return claimed amount
        return claimedAmount;
    }
}