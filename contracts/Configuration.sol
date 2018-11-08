/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Modifiable} from "./Modifiable.sol";
import {Ownable} from "./Ownable.sol";
import {Servable} from "./Servable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {BlockNumbUintsLib} from "./BlockNumbUintsLib.sol";
import {BlockNumbIntsLib} from "./BlockNumbIntsLib.sol";
import {BlockNumbDisdIntsLib} from "./BlockNumbDisdIntsLib.sol";
import {ConstantsLib} from "./ConstantsLib.sol";

/**
@title Configuration
@notice An oracle for configurations values
*/
contract Configuration is Modifiable, Ownable, Servable {
    using SafeMathIntLib for int256;
    using BlockNumbUintsLib for BlockNumbUintsLib.BlockNumbUints;
    using BlockNumbIntsLib for BlockNumbIntsLib.BlockNumbInts;
    using BlockNumbDisdIntsLib for BlockNumbDisdIntsLib.BlockNumbDisdInts;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public OPERATIONAL_MODE_ACTION = "operational_mode";

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum OperationalMode {Normal, Exit}

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    OperationalMode public operationalMode = OperationalMode.Normal;

    BlockNumbUintsLib.BlockNumbUints updateDelayBlocksByBlockNumber;
    BlockNumbUintsLib.BlockNumbUints confirmationBlocksByBlockNumber;

    BlockNumbDisdIntsLib.BlockNumbDisdInts tradeMakerFeeByBlockNumber;
    BlockNumbDisdIntsLib.BlockNumbDisdInts tradeTakerFeeByBlockNumber;
    BlockNumbDisdIntsLib.BlockNumbDisdInts paymentFeeByBlockNumber;
    mapping(address => mapping(uint256 => BlockNumbDisdIntsLib.BlockNumbDisdInts)) currencyPaymentFeeByBlockNumber;

    BlockNumbIntsLib.BlockNumbInts tradeMakerMinimumFeeByBlockNumber;
    BlockNumbIntsLib.BlockNumbInts tradeTakerMinimumFeeByBlockNumber;
    BlockNumbIntsLib.BlockNumbInts paymentMinimumFeeByBlockNumber;
    mapping(address => mapping(uint256 => BlockNumbIntsLib.BlockNumbInts)) currencyPaymentMinimumFeeByBlockNumber;

    BlockNumbUintsLib.BlockNumbUints cancelOrderChallengeTimeoutByBlockNumber;
    BlockNumbUintsLib.BlockNumbUints settlementChallengeTimeoutByBlockNumber;

    BlockNumbUintsLib.BlockNumbUints walletSettlementStakeFractionByBlockNumber;
    BlockNumbUintsLib.BlockNumbUints operatorSettlementStakeFractionByBlockNumber;
    BlockNumbUintsLib.BlockNumbUints fraudStakeFractionByBlockNumber;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetOperationalModeExitEvent();
    event SetUpdateDelayBlocksEvent(uint256 blockNumber, uint256 newBlocks);
    event SetConfirmationBlocksEvent(uint256 blockNumber, uint256 newBlocks);
    event SetTradeMakerFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetTradeTakerFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetPaymentFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetCurrencyPaymentFeeEvent(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 nominal,
        int256[] discountTiers, int256[] discountValues);
    event SetTradeMakerMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetTradeTakerMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetPaymentMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetCurrencyPaymentMinimumFeeEvent(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 nominal);
    event SetCancelOrderChallengeTimeoutEvent(uint256 blockNumber, uint256 timeoutInSeconds);
    event SetSettlementChallengeTimeoutEvent(uint256 blockNumber, uint256 timeoutInSeconds);
    event SetWalletSettlementStakeFractionEvent(uint256 blockNumber, uint256 stakeFraction);
    event SetOperatorSettlementStakeFractionEvent(uint256 blockNumber, uint256 stakeFraction);
    event SetFraudStakeFractionEvent(uint256 blockNumber, uint256 stakeFraction);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
        updateDelayBlocksByBlockNumber.addEntry(block.number, 0);
        confirmationBlocksByBlockNumber.addEntry(block.number, 12);

        tradeMakerFeeByBlockNumber.addNominalEntry(block.number, 1e15);
        tradeTakerFeeByBlockNumber.addNominalEntry(block.number, 2e15);
        paymentFeeByBlockNumber.addNominalEntry(block.number, 1e15);
        tradeMakerMinimumFeeByBlockNumber.addEntry(block.number, 1e14);
        tradeTakerMinimumFeeByBlockNumber.addEntry(block.number, 2e14);
        paymentMinimumFeeByBlockNumber.addEntry(block.number, 1e14);

        cancelOrderChallengeTimeoutByBlockNumber.addEntry(block.number, 3 days);
        settlementChallengeTimeoutByBlockNumber.addEntry(block.number, 5 days);

        walletSettlementStakeFractionByBlockNumber.addEntry(block.number, 1e17);
        operatorSettlementStakeFractionByBlockNumber.addEntry(block.number, 5e17);
        fraudStakeFractionByBlockNumber.addEntry(block.number, 5e17);
    }

    //
    // Public functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set operational mode to Exit
    /// @dev Once operational mode is set to Exit it may not be set back to Normal
    function setOperationalModeExit()
    public
    onlyDeployerOrEnabledServiceAction(OPERATIONAL_MODE_ACTION)
    {
        operationalMode = OperationalMode.Exit;
        emit SetOperationalModeExitEvent();
    }

    /// @notice Return true if operational mode is Normal
    function isOperationalModeNormal()
    public
    view
    returns (bool)
    {
        return OperationalMode.Normal == operationalMode;
    }

    /// @notice Return true if operational mode is Exit
    function isOperationalModeExit()
    public
    view
    returns (bool)
    {
        return OperationalMode.Exit == operationalMode;
    }

    /// @notice Get the current value of update delay blocks
    /// @return The value of update delay blocks
    function updateDelayBlocks()
    public
    view
    returns (uint256)
    {
        return updateDelayBlocksByBlockNumber.currentValue();
    }

    /// @notice Get the count of update delay blocks values
    /// @return The count of update delay blocks values
    function updateDelayBlocksCount()
    public
    view
    returns (uint256)
    {
        return updateDelayBlocksByBlockNumber.count();
    }

    /// @notice Set the number of update delay blocks
    /// @param blockNumber Block number from which the update applies
    /// @param newUpdateDelayBlocks The new update delay blocks value
    function setUpdateDelayBlocks(uint256 blockNumber, uint256 newUpdateDelayBlocks)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        updateDelayBlocksByBlockNumber.addEntry(blockNumber, newUpdateDelayBlocks);
        emit SetUpdateDelayBlocksEvent(blockNumber, newUpdateDelayBlocks);
    }

    /// @notice Get the current value of confirmation blocks
    /// @return The value of confirmation blocks
    function confirmationBlocks()
    public
    view
    returns (uint256)
    {
        return confirmationBlocksByBlockNumber.currentValue();
    }

    /// @notice Get the count of confirmation blocks values
    /// @return The count of confirmation blocks values
    function confirmationBlocksCount()
    public
    view
    returns (uint256)
    {
        return confirmationBlocksByBlockNumber.count();
    }

    /// @notice Set the number of confirmation blocks
    /// @param blockNumber Block number from which the update applies
    /// @param newConfirmationBlocks The new confirmation blocks value
    function setConfirmationBlocks(uint256 blockNumber, uint256 newConfirmationBlocks)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        confirmationBlocksByBlockNumber.addEntry(blockNumber, newConfirmationBlocks);
        emit SetConfirmationBlocksEvent(blockNumber, newConfirmationBlocks);
    }

    /// @notice Get number of trade maker fee block number tiers
    function tradeMakerFeesCount()
    public
    view
    returns (uint256)
    {
        return tradeMakerFeeByBlockNumber.count();
    }

    /// @notice Get trade maker relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Block number from which the update applies
    /// @param discountTier Tiered value that determines discount
    function tradeMakerFee(uint256 blockNumber, int256 discountTier)
    public
    view
    returns (int256)
    {
        return tradeMakerFeeByBlockNumber.discountedValueAt(blockNumber, discountTier);
    }

    /// @notice Set trade maker nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Block number from which the update applies
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setTradeMakerFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        tradeMakerFeeByBlockNumber.addDiscountedEntry(blockNumber, nominal, discountTiers, discountValues);
        emit SetTradeMakerFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of trade taker fee block number tiers
    function tradeTakerFeesCount()
    public
    view
    returns (uint256)
    {
        return tradeTakerFeeByBlockNumber.count();
    }

    /// @notice Get trade taker relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Block number from which the update applies
    /// @param discountTier Tiered value that determines discount
    function tradeTakerFee(uint256 blockNumber, int256 discountTier)
    public
    view
    returns (int256)
    {
        return tradeTakerFeeByBlockNumber.discountedValueAt(blockNumber, discountTier);
    }

    /// @notice Set trade taker nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Block number from which the update applies
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setTradeTakerFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        tradeTakerFeeByBlockNumber.addDiscountedEntry(blockNumber, nominal, discountTiers, discountValues);
        emit SetTradeTakerFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of payment fee block number tiers
    function paymentFeesCount()
    public
    view
    returns (uint256)
    {
        return paymentFeeByBlockNumber.count();
    }

    /// @notice Get payment relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Block number from which the update applies
    /// @param discountTier Tiered value that determines discount
    function paymentFee(uint256 blockNumber, int256 discountTier)
    public
    view
    returns (int256)
    {
        return paymentFeeByBlockNumber.discountedValueAt(blockNumber, discountTier);
    }

    /// @notice Set payment nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Block number from which the update applies
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setPaymentFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        paymentFeeByBlockNumber.addDiscountedEntry(blockNumber, nominal, discountTiers, discountValues);
        emit SetPaymentFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of payment fee block number tiers of given currency
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function currencyPaymentFeesCount(address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return currencyPaymentFeeByBlockNumber[currencyCt][currencyId].count();
    }

    /// @notice Get payment relative fee for given currency at given block number, possibly discounted by
    /// discount tier value
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    /// @param blockNumber Block number from which the update applies
    /// @param discountTier Tiered value that determines discount
    function currencyPaymentFee(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 discountTier)
    public
    view
    returns (int256)
    {
        if (0 < currencyPaymentFeeByBlockNumber[currencyCt][currencyId].count())
            return currencyPaymentFeeByBlockNumber[currencyCt][currencyId].discountedValueAt(
                blockNumber, discountTier
            );
        else
            return paymentFee(blockNumber, discountTier);
    }

    /// @notice Set payment nominal relative fee and discount tiers and values for given currency at given
    /// block number tier
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    /// @param blockNumber Block number from which the update applies
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setCurrencyPaymentFee(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 nominal,
        int256[] discountTiers, int256[] discountValues)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        currencyPaymentFeeByBlockNumber[currencyCt][currencyId].addDiscountedEntry(
            blockNumber, nominal, discountTiers, discountValues
        );
        emit SetCurrencyPaymentFeeEvent(
            currencyCt, currencyId, blockNumber, nominal, discountTiers, discountValues
        );
    }

    /// @notice Get number of minimum trade maker fee block number tiers
    function tradeMakerMinimumFeesCount()
    public
    view
    returns (uint256)
    {
        return tradeMakerMinimumFeeByBlockNumber.count();
    }

    /// @notice Get trade maker minimum relative fee at given block number
    /// @param blockNumber Block number from which the update applies
    function tradeMakerMinimumFee(uint256 blockNumber)
    public
    view
    returns (int256)
    {
        return tradeMakerMinimumFeeByBlockNumber.valueAt(blockNumber);
    }

    /// @notice Set trade maker minimum relative fee at given block number tier
    /// @param blockNumber Block number from which the update applies
    /// @param nominal Minimum relative fee
    function setTradeMakerMinimumFee(uint256 blockNumber, int256 nominal)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        tradeMakerMinimumFeeByBlockNumber.addEntry(blockNumber, nominal);
        emit SetTradeMakerMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum trade taker fee block number tiers
    function tradeTakerMinimumFeesCount()
    public
    view
    returns (uint256)
    {
        return tradeTakerMinimumFeeByBlockNumber.count();
    }

    /// @notice Get trade taker minimum relative fee at given block number
    /// @param blockNumber Block number from which the update applies
    function tradeTakerMinimumFee(uint256 blockNumber)
    public
    view
    returns (int256)
    {
        return tradeTakerMinimumFeeByBlockNumber.valueAt(blockNumber);
    }

    /// @notice Set trade taker minimum relative fee at given block number tier
    /// @param blockNumber Block number from which the update applies
    /// @param nominal Minimum relative fee
    function setTradeTakerMinimumFee(uint256 blockNumber, int256 nominal)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        tradeTakerMinimumFeeByBlockNumber.addEntry(blockNumber, nominal);
        emit SetTradeTakerMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum payment fee block number tiers
    function paymentMinimumFeesCount()
    public
    view
    returns (uint256)
    {
        return paymentMinimumFeeByBlockNumber.count();
    }

    /// @notice Get payment minimum relative fee at given block number
    /// @param blockNumber Block number from which the update applies
    function paymentMinimumFee(uint256 blockNumber)
    public
    view
    returns (int256)
    {
        return paymentMinimumFeeByBlockNumber.valueAt(blockNumber);
    }

    /// @notice Set payment minimum relative fee at given block number tier
    /// @param blockNumber Block number from which the update applies
    /// @param nominal Minimum relative fee
    function setPaymentMinimumFee(uint256 blockNumber, int256 nominal)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        paymentMinimumFeeByBlockNumber.addEntry(blockNumber, nominal);
        emit SetPaymentMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum payment fee block number tiers for given currency
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function currencyPaymentMinimumFeesCount(address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return currencyPaymentMinimumFeeByBlockNumber[currencyCt][currencyId].count();
    }

    /// @notice Get payment minimum relative fee for given currency at given block number
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    /// @param blockNumber Block number from which the update applies
    function currencyPaymentMinimumFee(address currencyCt, uint256 currencyId, uint256 blockNumber)
    public
    view
    returns (int256)
    {
        if (0 < currencyPaymentMinimumFeeByBlockNumber[currencyCt][currencyId].count())
            return currencyPaymentMinimumFeeByBlockNumber[currencyCt][currencyId].valueAt(blockNumber);
        else
            return paymentMinimumFee(blockNumber);
    }

    /// @notice Set payment minimum relative fee for given currency at given block number tier
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    /// @param blockNumber Block number from which the update applies
    /// @param nominal Minimum relative fee
    function setCurrencyPaymentMinimumFee(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 nominal)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        currencyPaymentMinimumFeeByBlockNumber[currencyCt][currencyId].addEntry(blockNumber, nominal);
        emit SetCurrencyPaymentMinimumFeeEvent(currencyCt, currencyId, blockNumber, nominal);
    }

    /// @notice Get the current value of cancel order challenge timeout
    /// @return The value of cancel order challenge timeout
    function cancelOrderChallengeTimeout()
    public
    view
    returns (uint256)
    {
        return cancelOrderChallengeTimeoutByBlockNumber.currentValue();
    }

    /// @notice Set timeout of cancel order challenge
    /// @param blockNumber Block number from which the update applies
    /// @param timeoutInSeconds Timeout duration in seconds
    function setCancelOrderChallengeTimeout(uint256 blockNumber, uint256 timeoutInSeconds)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        cancelOrderChallengeTimeoutByBlockNumber.addEntry(blockNumber, timeoutInSeconds);
        emit SetCancelOrderChallengeTimeoutEvent(blockNumber, timeoutInSeconds);
    }

    /// @notice Get the current value of settlement challenge timeout
    /// @return The value of settlement challenge timeout
    function settlementChallengeTimeout()
    public
    view
    returns (uint256)
    {
        return settlementChallengeTimeoutByBlockNumber.currentValue();
    }

    /// @notice Set timeout of settlement challenges
    /// @param blockNumber Block number from which the update applies
    /// @param timeoutInSeconds Timeout duration in seconds
    function setSettlementChallengeTimeout(uint256 blockNumber, uint256 timeoutInSeconds)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        settlementChallengeTimeoutByBlockNumber.addEntry(blockNumber, timeoutInSeconds);
        emit SetSettlementChallengeTimeoutEvent(blockNumber, timeoutInSeconds);
    }

    /// @notice Get the current value of wallet settlement stake fraction
    /// @return The value of wallet settlement stake fraction
    function walletSettlementStakeFraction()
    public
    view
    returns (uint256)
    {
        return walletSettlementStakeFractionByBlockNumber.currentValue();
    }

    /// @notice Set fraction of security bond that will be gained from successfully challenging
    /// in settlement challenge triggered by wallet
    /// @param blockNumber Block number from which the update applies
    /// @param stakeFraction The fraction gained
    function setWalletSettlementStakeFraction(uint256 blockNumber, uint256 stakeFraction)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        walletSettlementStakeFractionByBlockNumber.addEntry(blockNumber, stakeFraction);
        emit SetWalletSettlementStakeFractionEvent(blockNumber, stakeFraction);
    }

    /// @notice Get the current value of operator settlement stake fraction
    /// @return The value of operator settlement stake fraction
    function operatorSettlementStakeFraction()
    public
    view
    returns (uint256)
    {
        return operatorSettlementStakeFractionByBlockNumber.currentValue();
    }

    /// @notice Set fraction of security bond that will be gained from successfully challenging
    /// in settlement challenge triggered by operator
    /// @param blockNumber Block number from which the update applies
    /// @param stakeFraction The fraction gained
    function setOperatorSettlementStakeFraction(uint256 blockNumber, uint256 stakeFraction)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        operatorSettlementStakeFractionByBlockNumber.addEntry(blockNumber, stakeFraction);
        emit SetOperatorSettlementStakeFractionEvent(blockNumber, stakeFraction);
    }

    /// @notice Get the current value of fraud stake fraction
    /// @return The value of fraud stake fraction
    function fraudStakeFraction()
    public
    view
    returns (uint256)
    {
        return fraudStakeFractionByBlockNumber.currentValue();
    }

    /// @notice Set fraction of security bond that will be gained from successfully challenging
    /// in fraud challenge
    /// @param blockNumber Block number from which the update applies
    /// @param stakeFraction The fraction gained
    function setFraudStakeFraction(uint256 blockNumber, uint256 stakeFraction)
    public
    onlyDeployer
    onlyDelayedBlockNumber(blockNumber)
    {
        fraudStakeFractionByBlockNumber.addEntry(blockNumber, stakeFraction);
        emit SetFraudStakeFractionEvent(blockNumber, stakeFraction);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyDelayedBlockNumber(uint256 blockNumber) {
        require(0 == updateDelayBlocksByBlockNumber.count() || blockNumber >= block.number + updateDelayBlocksByBlockNumber.currentValue());
        _;
    }
}