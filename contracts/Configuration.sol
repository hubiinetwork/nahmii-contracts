/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Servable} from "./Servable.sol";
import {Ownable} from "./Ownable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";

/**
@title Configuration
@notice An oracle for configurations values
*/
contract Configuration is Ownable, Servable {
    using SafeMathIntLib for int256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public OPERATIONAL_MODE_ACTION = "operational_mode";

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum OperationalMode {Normal, Exit}

    //
    // Custom types
    // -----------------------------------------------------------------------------------------------------------------
    struct TieredDiscount {
        int256 tier;
        int256 value;
    }

    struct DiscountableFee {
        uint256 blockNumber;
        int256 nominal;
        TieredDiscount[] discounts;
    }

    struct StaticFee {
        uint256 blockNumber;
        int256 nominal;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    OperationalMode public operationalMode = OperationalMode.Normal;

    int256 constant public PARTS_PER = 1e18;

    uint256 public confirmations;

    mapping(uint256 => DiscountableFee) blockNumberTradeMakerFeeMap;
    mapping(uint256 => DiscountableFee) blockNumberTradeTakerFeeMap;
    mapping(uint256 => DiscountableFee) blockNumberPaymentFeeMap;
    mapping(address => mapping(uint256 => mapping(uint256 => DiscountableFee))) currencyBlockNumberPaymentFeeMap;
    uint256[] public tradeMakerFeeBlockNumberList;
    uint256[] public tradeTakerFeeBlockNumberList;
    uint256[] public paymentFeeBlockNumberList;
    mapping(address => mapping(uint256 => uint256[])) public currencyPaymentFeeBlockNumbersMap;

    mapping(uint256 => StaticFee) blockNumberTradeMakerMinimumFeeMap;
    mapping(uint256 => StaticFee) blockNumberTradeTakerMinimumFeeMap;
    mapping(uint256 => StaticFee) blockNumberPaymentMinimumFeeMap;
    mapping(address => mapping(uint256 => mapping(uint256 => StaticFee))) currencyBlockNumberPaymentMinimumFeeMap;
    uint256[] public tradeMakerMinimumFeeBlockNumberList;
    uint256[] public tradeTakerMinimumFeeBlockNumberList;
    uint256[] public paymentMinimumFeeBlockNumberList;
    mapping(address => mapping(uint256 => uint256[])) public currencyPaymentMinimumFeeBlockNumbersMap;

    uint256 public cancelOrderChallengeTimeout;
    uint256 public settlementChallengeTimeout;

    MonetaryTypes.Figure public unchallengeOrderCandidateByTradeStake;
    MonetaryTypes.Figure public falseWalletSignatureStake;
    MonetaryTypes.Figure public duplicateDriipNonceStake;
    MonetaryTypes.Figure public doubleSpentOrderStake;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetOperationalModeExitEvent();
    event SetConfirmationsEvent(uint256 oldConfirmations, uint256 newConfirmations);
    event SetTradeMakerFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetTradeTakerFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetPaymentFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetCurrencyPaymentFeeEvent(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetTradeMakerMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetTradeTakerMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetPaymentMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetCurrencyPaymentMinimumFeeEvent(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 nominal);
    event SetCancelOrderChallengeTimeoutEvent(uint256 timeout);
    event SetSettlementChallengeTimeoutEvent(uint256 timeout);
    event SetUnchallengeDriipSettlementOrderByTradeStakeEvent(int256 amount, address currencyCt, uint256 currencyId);
    event SetFalseWalletSignatureStakeEvent(int256 amount, address currencyCt, uint256 currencyId);
    event SetDuplicateDriipNonceStakeEvent(int256 amount, address currencyCt, uint256 currencyId);
    event SetDoubleSpentOrderStakeEvent(int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
        confirmations = 12;
        cancelOrderChallengeTimeout = 3 hours;
        settlementChallengeTimeout = 5 hours;
    }

    //
    // Public functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set operational mode to Exit
    /// @dev Once operational mode is set to Exit it may not be set back to Normal
    function setOperationalModeExit() public onlyDeployerOrEnabledServiceAction(OPERATIONAL_MODE_ACTION) {
        operationalMode = OperationalMode.Exit;
        emit SetOperationalModeExitEvent();
    }

    /// @notice Return true if operational mode is Normal
    function isOperationalModeNormal() public view returns (bool) {
        return OperationalMode.Normal == operationalMode;
    }

    /// @notice Return true if operational mode is Exit
    function isOperationalModeExit() public view returns (bool) {
        return OperationalMode.Exit == operationalMode;
    }

    /// @notice Return the parts per constant
    function getPartsPer() public pure returns (int256) {
        return PARTS_PER;
    }

    /// @notice Return the number of confirmations
    function getConfirmations() public view returns (uint256) {
        return confirmations;
    }

    /// @notice Set the number of confirmations
    /// @param newConfirmations The new confirmations value
    function setConfirmations(uint256 newConfirmations) public onlyDeployer {
        if (confirmations != newConfirmations) {
            uint256 oldConfirmations = confirmations;
            confirmations = newConfirmations;
            emit SetConfirmationsEvent(oldConfirmations, newConfirmations);
        }
    }

    /// @notice Get trade maker relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getTradeMakerFee(uint256 blockNumber, int256 discountTier) public view returns (int256) {
        require(0 < tradeMakerFeeBlockNumberList.length);
        uint256 index = getIndexOfLower(tradeMakerFeeBlockNumberList, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = tradeMakerFeeBlockNumberList[index - 1];
            DiscountableFee storage fee = blockNumberTradeMakerFeeMap[setBlockNumber];
            return getDiscountableFee(fee, discountTier);
        } else
            return 0;
    }

    /// @notice Set trade maker nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setTradeMakerFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) public onlyDeployer
        onlyConfirmableBlockNumber(blockNumber)
    {
        DiscountableFee storage fee = blockNumberTradeMakerFeeMap[blockNumber];
        setDiscountableFee(fee, tradeMakerFeeBlockNumberList, blockNumber, nominal, discountTiers, discountValues);
        emit SetTradeMakerFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of trade maker fee tiers
    function getTradeMakerFeesCount() public view returns (uint256) {
        return tradeMakerFeeBlockNumberList.length;
    }

    /// @notice Get trade taker relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getTradeTakerFee(uint256 blockNumber, int256 discountTier) public view returns (int256) {
        require(0 < tradeTakerFeeBlockNumberList.length);
        uint256 index = getIndexOfLower(tradeTakerFeeBlockNumberList, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = tradeTakerFeeBlockNumberList[index - 1];
            DiscountableFee storage fee = blockNumberTradeTakerFeeMap[setBlockNumber];
            return getDiscountableFee(fee, discountTier);
        } else
            return 0;
    }

    /// @notice Set trade taker nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setTradeTakerFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) public onlyDeployer
        onlyConfirmableBlockNumber(blockNumber)
    {
        DiscountableFee storage fee = blockNumberTradeTakerFeeMap[blockNumber];
        setDiscountableFee(fee, tradeTakerFeeBlockNumberList, blockNumber, nominal, discountTiers, discountValues);
        emit SetTradeTakerFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of trade taker fee tiers
    function getTradeTakerFeesCount() public view returns (uint256) {
        return tradeTakerFeeBlockNumberList.length;
    }

    /// @notice Get payment relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getPaymentFee(uint256 blockNumber, int256 discountTier) public view returns (int256) {
        require(0 < paymentFeeBlockNumberList.length);
        uint256 index = getIndexOfLower(paymentFeeBlockNumberList, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = paymentFeeBlockNumberList[index - 1];
            DiscountableFee storage fee = blockNumberPaymentFeeMap[setBlockNumber];
            return getDiscountableFee(fee, discountTier);
        } else
            return 0;
    }

    /// @notice Set payment nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setPaymentFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) public onlyDeployer
        onlyConfirmableBlockNumber(blockNumber)
    {
        DiscountableFee storage fee = blockNumberPaymentFeeMap[blockNumber];
        setDiscountableFee(fee, paymentFeeBlockNumberList, blockNumber, nominal, discountTiers, discountValues);
        emit SetPaymentFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of payment fee tiers
    function getPaymentFeesCount() public view returns (uint256) {
        return paymentFeeBlockNumberList.length;
    }

    /// @notice Get payment relative fee for given currency at given block number, possibly discounted by discount tier value
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getCurrencyPaymentFee(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 discountTier) public view returns (int256) {
        // If no currency specific fee has not been set the currency agnostic one should be used
        if (0 == currencyPaymentFeeBlockNumbersMap[currencyCt][currencyId].length)
            return getPaymentFee(blockNumber, discountTier);

        uint256 index = getIndexOfLower(currencyPaymentFeeBlockNumbersMap[currencyCt][currencyId], blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = currencyPaymentFeeBlockNumbersMap[currencyCt][currencyId][index - 1];
            DiscountableFee storage fee = currencyBlockNumberPaymentFeeMap[currencyCt][currencyId][setBlockNumber];
            return getDiscountableFee(fee, discountTier);
        } else
            return getCurrencyPaymentMinimumFee(currencyCt, currencyId, blockNumber);
    }

    /// @notice Set payment nominal relative fee and discount tiers and values for given currency at given block number tier
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    /// @param blockNumber Lower block number tier
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setCurrencyPaymentFee(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) public onlyDeployer
        onlyConfirmableBlockNumber(blockNumber)
    {
        DiscountableFee storage fee = currencyBlockNumberPaymentFeeMap[currencyCt][currencyId][blockNumber];
        setDiscountableFee(fee, currencyPaymentFeeBlockNumbersMap[currencyCt][currencyId], blockNumber, nominal, discountTiers, discountValues);
        emit SetCurrencyPaymentFeeEvent(currencyCt, currencyId, blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of payment fee tiers of given currency
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function getCurrencyPaymentFeesCount(address currencyCt, uint256 currencyId) public view returns (uint256) {
        return currencyPaymentFeeBlockNumbersMap[currencyCt][currencyId].length;
    }

    /// @notice Get trade maker minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getTradeMakerMinimumFee(uint256 blockNumber) public view returns (int256) {
        require(0 < tradeMakerMinimumFeeBlockNumberList.length);
        uint256 index = getIndexOfLower(tradeMakerMinimumFeeBlockNumberList, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = tradeMakerMinimumFeeBlockNumberList[index - 1];
            StaticFee storage fee = blockNumberTradeMakerMinimumFeeMap[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set trade maker minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setTradeMakerMinimumFee(uint256 blockNumber, int256 nominal) public onlyDeployer
        onlyConfirmableBlockNumber(blockNumber)
    {
        StaticFee storage fee = blockNumberTradeMakerMinimumFeeMap[blockNumber];
        setStaticFee(fee, tradeMakerMinimumFeeBlockNumberList, blockNumber, nominal);
        emit SetTradeMakerMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum trade maker fee tiers
    function getTradeMakerMinimumFeesCount() public view returns (uint256) {
        return tradeMakerMinimumFeeBlockNumberList.length;
    }

    /// @notice Get trade taker minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getTradeTakerMinimumFee(uint256 blockNumber) public view returns (int256) {
        require(0 < tradeTakerMinimumFeeBlockNumberList.length);
        uint256 index = getIndexOfLower(tradeTakerMinimumFeeBlockNumberList, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = tradeTakerMinimumFeeBlockNumberList[index - 1];
            StaticFee storage fee = blockNumberTradeTakerMinimumFeeMap[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set trade taker minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setTradeTakerMinimumFee(uint256 blockNumber, int256 nominal) public onlyDeployer
        onlyConfirmableBlockNumber(blockNumber)
    {
        StaticFee storage fee = blockNumberTradeTakerMinimumFeeMap[blockNumber];
        setStaticFee(fee, tradeTakerMinimumFeeBlockNumberList, blockNumber, nominal);
        emit SetTradeTakerMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum trade taker fee tiers
    function getTradeTakerMinimumFeesCount() public view returns (uint256) {
        return tradeTakerMinimumFeeBlockNumberList.length;
    }

    /// @notice Get payment minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getPaymentMinimumFee(uint256 blockNumber) public view returns (int256) {
        require(0 < paymentMinimumFeeBlockNumberList.length);
        uint256 index = getIndexOfLower(paymentMinimumFeeBlockNumberList, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = paymentMinimumFeeBlockNumberList[index - 1];
            StaticFee storage fee = blockNumberPaymentMinimumFeeMap[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set payment minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setPaymentMinimumFee(uint256 blockNumber, int256 nominal) public onlyDeployer
        onlyConfirmableBlockNumber(blockNumber)
    {
        StaticFee storage fee = blockNumberPaymentMinimumFeeMap[blockNumber];
        setStaticFee(fee, paymentMinimumFeeBlockNumberList, blockNumber, nominal);
        emit SetPaymentMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum payment fee tiers
    function getPaymentMinimumFeesCount() public view returns (uint256) {
        return paymentMinimumFeeBlockNumberList.length;
    }

    /// @notice Get payment minimum relative fee for given currency at given block number
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    /// @param blockNumber Lower block number for the tier
    function getCurrencyPaymentMinimumFee(address currencyCt, uint256 currencyId, uint256 blockNumber) public view returns (int256) {
        // If no currency specific fee has been set the currency agnostic one should be used
        if (0 == currencyPaymentMinimumFeeBlockNumbersMap[currencyCt][currencyId].length)
            return getPaymentMinimumFee(blockNumber);

        uint256 index = getIndexOfLower(currencyPaymentMinimumFeeBlockNumbersMap[currencyCt][currencyId], blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = currencyPaymentMinimumFeeBlockNumbersMap[currencyCt][currencyId][index - 1];
            StaticFee storage fee = currencyBlockNumberPaymentMinimumFeeMap[currencyCt][currencyId][setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set payment minimum relative fee for given currency at given block number tier
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setCurrencyPaymentMinimumFee(address currencyCt, uint256 currencyId, uint256 blockNumber, int256 nominal) public onlyDeployer
        onlyConfirmableBlockNumber(blockNumber)
    {
        StaticFee storage fee = currencyBlockNumberPaymentMinimumFeeMap[currencyCt][currencyId][blockNumber];
        setStaticFee(fee, currencyPaymentMinimumFeeBlockNumbersMap[currencyCt][currencyId], blockNumber, nominal);
        emit SetCurrencyPaymentMinimumFeeEvent(currencyCt, currencyId, blockNumber, nominal);
    }

    /// @notice Get number of minimum payment fee tiers for given currency
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function getCurrencyPaymentMinimumFeesCount(address currencyCt, uint256 currencyId) public view returns (uint256) {
        return currencyPaymentMinimumFeeBlockNumbersMap[currencyCt][currencyId].length;
    }

    /// @notice Set timeout of cancel order challenge
    /// @param timeout Timeout duration
    function setCancelOrderChallengeTimeout(uint256 timeout) public onlyDeployer {
        cancelOrderChallengeTimeout = timeout;
        emit SetCancelOrderChallengeTimeoutEvent(timeout);
    }

    /// @notice Set timeout of settlement challenges
    /// @param timeout Timeout duration
    function setSettlementChallengeTimeout(uint256 timeout) public onlyDeployer {
        settlementChallengeTimeout = timeout;
        emit SetSettlementChallengeTimeoutEvent(timeout);
    }

    /// @notice Set currency and amount that will be gained when someone successfully unchallenges
    /// (driip settlement) order candidate by trade
    /// @param amount Amount gained
    /// @param currencyCt Contract address of currency gained (address(0) == ETH)
    /// @param currencyId ID of currency gained (0 for ETH and ERC20)
    function setUnchallengeOrderCandidateByTradeStake(int256 amount, address currencyCt, uint256 currencyId) public onlyDeployer {
        unchallengeOrderCandidateByTradeStake = MonetaryTypes.Figure(amount, MonetaryTypes.Currency(currencyCt, currencyId));
        emit SetUnchallengeDriipSettlementOrderByTradeStakeEvent(amount, currencyCt, currencyId);
    }

    /// @notice Get the currency and amount that will be gained when someone successfully
    /// unchallenges (driip settlement) order candidate by trade
    function getUnchallengeOrderCandidateByTradeStake() public view returns (int256, address, uint256) {
        return (unchallengeOrderCandidateByTradeStake.amount, unchallengeOrderCandidateByTradeStake.currency.ct, unchallengeOrderCandidateByTradeStake.currency.id);
    }

    /// @notice Set currency and amount that will be gained when someone successfully challenges
    /// false wallet signature on order or payment
    /// @param amount Amount gained
    /// @param currencyCt Contract address of currency gained (address(0) == ETH)
    /// @param currencyId ID of currency gained (0 for ETH and ERC20)
    function setFalseWalletSignatureStake(int256 amount, address currencyCt, uint256 currencyId) public onlyDeployer {
        falseWalletSignatureStake = MonetaryTypes.Figure(amount, MonetaryTypes.Currency(currencyCt, currencyId));
        emit SetFalseWalletSignatureStakeEvent(amount, currencyCt, currencyId);
    }

    /// @notice Get the figure that will be gained when someone successfully challenges
    /// false wallet signature on order or payment
    function getFalseWalletSignatureStake() public view returns (int256, address, uint256) {
        return (falseWalletSignatureStake.amount, falseWalletSignatureStake.currency.ct, falseWalletSignatureStake.currency.id);
    }

    /// @notice Set currency and amount that will be gained when someone successfully challenges
    /// duplicate driip nonce
    /// @param amount Amount gained
    /// @param currencyCt Contract address of currency gained (address(0) == ETH)
    /// @param currencyId ID of currency gained (0 for ETH and ERC20)
    function setDuplicateDriipNonceStake(int256 amount, address currencyCt, uint256 currencyId) public onlyDeployer {
        duplicateDriipNonceStake = MonetaryTypes.Figure(amount, MonetaryTypes.Currency(currencyCt, currencyId));
        emit SetDuplicateDriipNonceStakeEvent(amount, currencyCt, currencyId);
    }

    /// @notice Get the figure that will be gained when someone successfully challenges
    /// duplicate driip nonce
    function getDuplicateDriipNonceStake() public view returns (int256, address, uint256) {
        return (duplicateDriipNonceStake.amount, duplicateDriipNonceStake.currency.ct, duplicateDriipNonceStake.currency.id);
    }

    /// @notice Set currency and amount that will be gained when someone successfully challenges
    /// double spent order
    /// @param amount Amount gained
    /// @param currencyCt Contract address of currency gained (address(0) == ETH)
    /// @param currencyId ID of currency gained (0 for ETH and ERC20)
    function setDoubleSpentOrderStake(int256 amount, address currencyCt, uint256 currencyId) public onlyDeployer {
        doubleSpentOrderStake = MonetaryTypes.Figure(amount, MonetaryTypes.Currency(currencyCt, currencyId));
        emit SetDoubleSpentOrderStakeEvent(amount, currencyCt, currencyId);
    }

    /// @notice Get the figure that will be gained when someone successfully challenges
    /// double spent order
    function getDoubleSpentOrderStake() public view returns (int256, address, uint256) {
        return (doubleSpentOrderStake.amount, doubleSpentOrderStake.currency.ct, doubleSpentOrderStake.currency.id);
    }

    //
    // Internal functions
    // -----------------------------------------------------------------------------------------------------------------
    function setDiscountableFee(DiscountableFee storage fee, uint256[] storage feeBlockNumbers,
        uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) internal onlyDeployer
    {
        require(discountTiers.length == discountValues.length);

        feeBlockNumbers.push(blockNumber);

        fee.blockNumber = blockNumber;
        fee.nominal = nominal;

        fee.discounts.length = 0;
        for (uint256 i = 0; i < discountTiers.length; i++)
            fee.discounts.push(TieredDiscount({tier : discountTiers[i], value : discountValues[i]}));
    }

    function getDiscountableFee(DiscountableFee storage fee, int discountTier) internal view returns (int256) {
        uint256 index = getIndexOfLowerTier(fee.discounts, discountTier);
        if (0 < index) {
            TieredDiscount storage discount = fee.discounts[index - 1];
            return fee.nominal.mul(PARTS_PER.sub(discount.value)).div(PARTS_PER);
        } else
            return fee.nominal;
    }

    function setStaticFee(StaticFee storage fee, uint256[] storage feeBlockNumbers, uint256 blockNumber, int256 nominal) internal onlyDeployer {
        feeBlockNumbers.push(blockNumber);

        fee.blockNumber = blockNumber;
        fee.nominal = nominal;
    }

    function getIndexOfLower(uint256[] arr, uint256 num) internal pure returns (uint256) {
        for (uint256 i = arr.length; i > 0; i--)
            if (num >= arr[i - 1])
                return i;
        return 0;
    }

    function getIndexOfLowerTier(TieredDiscount[] arr, int256 num) internal pure returns (uint256) {
        for (uint256 i = arr.length; i > 0; i--)
            if (num >= arr[i - 1].tier)
                return i;
        return 0;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyConfirmableBlockNumber(uint256 blockNumber) {
        require(blockNumber > block.number + confirmations);
        _;
    }
}