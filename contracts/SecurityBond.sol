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
import {FungibleBalanceLib} from "./FungibleBalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {CurrenciesLib} from "./CurrenciesLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {TransferController} from "./TransferController.sol";
import {ConstantsLib} from "./ConstantsLib.sol";

/**
 * @title SecurityBond
 * @notice Fund that contains crypto incentive for challenging operator fraud.
 */
contract SecurityBond is Ownable, Configurable, AccrualBeneficiary, Servable, TransferControllerManageable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using FungibleBalanceLib for FungibleBalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using CurrenciesLib for CurrenciesLib.Currencies;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public REWARD_ACTION = "reward";
    string constant public DEPRIVE_ACTION = "deprive";

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct FractionalReward {
        uint256 fraction;
        uint256 nonce;
        uint256 unlockTime;
    }

    struct AmountedReward {
        int256 amount;
        uint256 nonce;
        uint256 unlockTime;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    FungibleBalanceLib.Balance private deposited;
    TxHistoryLib.TxHistory private txHistory;
    CurrenciesLib.Currencies private inUseCurrencies;

    mapping(address => FractionalReward) public fractionalRewardByWallet;

    // TODO Rename amounted to absolute
    mapping(address => mapping(address => mapping(uint256 => AmountedReward))) public amountedRewardByWalletCurrency;

    mapping(address => mapping(address => mapping(uint256 => uint256))) public claimNonceByWalletCurrency;

    mapping(address => FungibleBalanceLib.Balance) private stagedByWallet;

    mapping(address => uint256) public nonceByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ReceiveEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event RewardByFractionEvent(address wallet, uint256 fraction, uint256 unlockTimeoutInSeconds);
    event RewardByAmountEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId,
        uint256 unlockTimeoutInSeconds);
    event DepriveEvent(address wallet);
    event ClaimAndTransferToBeneficiaryEvent(address from, Beneficiary beneficiary, string balanceType, int256 amount,
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
    /// @notice Fallback function that deposits ethers
    function() public payable {
        receiveEthersTo(msg.sender, "");
    }

    /// @notice Receive ethers to
    /// @param wallet The concerned wallet address
    function receiveEthersTo(address wallet, string)
    public
    payable
    {
        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to balance
        deposited.add(amount, address(0), 0);
        txHistory.addDeposit(amount, address(0), 0);

        // Add currency to in-use list
        inUseCurrencies.add(address(0), 0);

        // Emit event
        emit ReceiveEvent(wallet, amount, address(0), 0);
    }

    /// @notice Receive tokens
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function receiveTokens(string, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        receiveTokensTo(msg.sender, "", amount, currencyCt, currencyId, standard);
    }

    /// @notice Receive tokens to
    /// @param wallet The address of the concerned wallet
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
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
        inUseCurrencies.add(currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, amount, currencyCt, currencyId);
    }

    /// @notice Get the count of deposits
    /// @return The count of deposits
    function depositsCount()
    public
    view
    returns (uint256)
    {
        return txHistory.depositsCount();
    }

    /// @notice Get the deposit at the given index
    /// @return The deposit at the given index
    function deposit(uint index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return txHistory.deposit(index);
    }

    /// @notice Get the deposited balance of the given currency
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The deposited balance
    function depositedBalance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return deposited.get(currencyCt, currencyId);
    }

    /// @notice Get the fractional amount deposited balance of the given currency
    /// @param currencyCt The contract address of the currency that the wallet is deprived
    /// @param currencyId The ID of the currency that the wallet is deprived
    /// @param fraction The fraction of sums that the wallet is rewarded
    /// @return The fractional amount of deposited balance
    function depositedFractionalBalance(address currencyCt, uint256 currencyId, uint256 fraction)
    public
    view
    returns (int256)
    {
        return deposited.get(currencyCt, currencyId)
        .mul(SafeMathIntLib.toInt256(fraction))
        .div(ConstantsLib.PARTS_PER());
    }

    /// @notice Get the staged balance of the given currency
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The deposited balance
    function stagedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return stagedByWallet[wallet].get(currencyCt, currencyId);
    }

    /// @notice Get the count of currencies recorded
    /// @return The number of currencies
    function inUseCurrenciesCount()
    public
    view
    returns (uint256)
    {
        return inUseCurrencies.count();
    }

    /// @notice Get the currencies recorded with indices in the given range
    /// @param low The lower currency index
    /// @param up The upper currency index
    /// @return The currencies of the given index range
    function inUseCurrenciesByIndices(uint256 low, uint256 up)
    public
    view
    returns (MonetaryTypesLib.Currency[])
    {
        return inUseCurrencies.getByIndices(low, up);
    }

    /// @notice Reward the given wallet the given fraction of funds, where the reward is locked
    /// for the given number of seconds
    /// @param wallet The concerned wallet
    /// @param fraction The fraction of sums that the wallet is rewarded
    /// @param unlockTimeoutInSeconds The number of seconds for which the reward is locked and should
    /// be claimed
    function rewardByFraction(address wallet, uint256 fraction, uint256 unlockTimeoutInSeconds)
    public
    notNullAddress(wallet)
    onlyEnabledServiceAction(REWARD_ACTION)
    {
        // Update fractional reward
        fractionalRewardByWallet[wallet].fraction = fraction.clampMax(uint256(ConstantsLib.PARTS_PER()));
        fractionalRewardByWallet[wallet].nonce = ++nonceByWallet[wallet];
        fractionalRewardByWallet[wallet].unlockTime = block.timestamp.add(unlockTimeoutInSeconds);

        // Emit event
        emit RewardByFractionEvent(wallet, fraction, unlockTimeoutInSeconds);
    }

    /// @notice Reward the given wallet the given amount of funds, where the reward is locked
    /// for the given number of seconds
    /// @param wallet The concerned wallet
    /// @param amount The amount that the wallet is rewarded
    /// @param currencyCt The contract address of the currency that the wallet is rewarded
    /// @param currencyId The ID of the currency that the wallet is rewarded
    /// @param unlockTimeoutInSeconds The number of seconds for which the reward is locked and should
    /// be claimed
    function rewardByAmount(address wallet, int256 amount, address currencyCt, uint256 currencyId,
        uint256 unlockTimeoutInSeconds)
    public
    notNullAddress(wallet)
    onlyEnabledServiceAction(REWARD_ACTION)
    {
        // Update figural reward
        amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].amount = amount;
        amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].nonce = ++nonceByWallet[wallet];
        amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].unlockTime = block.timestamp.add(unlockTimeoutInSeconds);

        // Emit event
        emit RewardByAmountEvent(wallet, amount, currencyCt, currencyId, unlockTimeoutInSeconds);
    }


    // TODO Split into depriveFractional and depriveAmounted (or depriveAbsolute)
    /// @notice Deprive the given wallet of any reward it has been granted
    /// @param wallet The concerned wallet
    /// @param currencyCt The contract address of the currency that the wallet is deprived
    /// @param currencyId The ID of the currency that the wallet is deprived
    function deprive(address wallet, address currencyCt, uint256 currencyId)
    public
    onlyEnabledServiceAction(DEPRIVE_ACTION)
    {
        _depriveFractional(wallet);
        _depriveAmounted(wallet, currencyCt, currencyId);

        // Emit event
        emit DepriveEvent(wallet);
    }

    /// @notice Claim reward and transfer to beneficiary
    /// @param beneficiary The concerned beneficiary
    /// @param balanceType The target balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function claimAndTransferToBeneficiary(Beneficiary beneficiary, string balanceType, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        // Claim reward
        int256 claimedAmount = _claim(msg.sender, currencyCt, currencyId);

        // Subtract from deposited balance
        deposited.sub(claimedAmount, currencyCt, currencyId);

        // Execute transfer
        if (address(0) == currencyCt && 0 == currencyId)
            beneficiary.receiveEthersTo.value(uint256(claimedAmount))(msg.sender, balanceType);

        else {
            TransferController controller = transferController(currencyCt, standard);
            require(
                address(controller).delegatecall(
                    controller.getApproveSignature(), beneficiary, uint256(claimedAmount), currencyCt, currencyId
                )
            );
            beneficiary.receiveTokensTo(msg.sender, balanceType, claimedAmount, currencyCt, currencyId, standard);
        }

        // Emit event
        emit ClaimAndTransferToBeneficiaryEvent(msg.sender, beneficiary, balanceType, claimedAmount, currencyCt, currencyId, standard);
    }

    /// @notice Claim reward and stage for later withdrawal
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function claimAndStage(address currencyCt, uint256 currencyId)
    public
    {
        // Claim reward
        int256 claimedAmount = _claim(msg.sender, currencyCt, currencyId);

        // Subtract from deposited balance
        deposited.sub(claimedAmount, currencyCt, currencyId);

        // Add to staged balance
        stagedByWallet[msg.sender].add(claimedAmount, currencyCt, currencyId);

        // Emit event
        emit ClaimAndStageEvent(msg.sender, claimedAmount, currencyCt, currencyId);
    }

    /// @notice Withdraw from staged balance of msg.sender
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
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
        if (address(0) == currencyCt && 0 == currencyId)
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
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _depriveFractional(address wallet)
    private
    {
        // Update fractional reward
        fractionalRewardByWallet[wallet].fraction = 0;
        fractionalRewardByWallet[wallet].nonce = ++nonceByWallet[wallet];
        fractionalRewardByWallet[wallet].unlockTime = 0;
    }

    function _depriveAmounted(address wallet, address currencyCt, uint256 currencyId)
    private
    {
        // Update amounted reward
        amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].amount = 0;
        amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].nonce = ++nonceByWallet[wallet];
        amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].unlockTime = 0;
    }

    function _claim(address wallet, address currencyCt, uint256 currencyId)
    private
    returns (int256)
    {
        // Combine claim nonce from rewards
        uint256 claimNonce = fractionalRewardByWallet[wallet].nonce.clampMin(
            amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].nonce
        );

        // Require that new claim nonce is greater than current stored one
        require(claimNonce > claimNonceByWalletCurrency[wallet][currencyCt][currencyId]);

        // Combine claim amount from rewards
        int256 claimAmount = _fractionalRewardAmountByWalletCurrency(wallet, currencyCt, currencyId).add(
            _amountedRewardAmountByWalletCurrency(wallet, currencyCt, currencyId)
        ).clampMax(
            deposited.get(currencyCt, currencyId)
        );

        // Require that claim amount is strictly positive, indicating that there is an amount to claim
        require(0 < claimAmount);

        // Update stored claim nonce for wallet and currency
        claimNonceByWalletCurrency[wallet][currencyCt][currencyId] = claimNonce;

        return claimAmount;
    }

    function _fractionalRewardAmountByWalletCurrency(address wallet, address currencyCt, uint256 currencyId)
    private
    view
    returns (int256)
    {
        if (
            claimNonceByWalletCurrency[wallet][currencyCt][currencyId] < fractionalRewardByWallet[wallet].nonce &&
            block.timestamp >= fractionalRewardByWallet[wallet].unlockTime
        )
            return deposited.get(currencyCt, currencyId)
            .mul(SafeMathIntLib.toInt256(fractionalRewardByWallet[wallet].fraction))
            .div(ConstantsLib.PARTS_PER());

        else
            return 0;
    }

    function _amountedRewardAmountByWalletCurrency(address wallet, address currencyCt, uint256 currencyId)
    private
    view
    returns (int256)
    {
        if (
            claimNonceByWalletCurrency[wallet][currencyCt][currencyId] < amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].nonce &&
            block.timestamp >= amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].unlockTime
        )
            return amountedRewardByWalletCurrency[wallet][currencyCt][currencyId].amount.clampMax(
                deposited.get(currencyCt, currencyId)
            );

        else
            return 0;
    }
}