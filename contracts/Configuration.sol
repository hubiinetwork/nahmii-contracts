/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import "./Ownable.sol";

contract AbstractConfiguration {

    function isRegisteredService(address service, string action) public returns (bool);

    function registerService(address service, string action) public;

    function deregisterService(address service, string action) public;

    function setOperationalModeExit() public;

    function isOperationalModeNormal() public view returns (bool);

    function isOperationalModeExit() public view returns (bool);

    function getPartsPer() public view returns (int256);

    function getTradeMakerFee(uint256 blockNumber, int256 discountTier) public view returns (int256);

    function setTradeMakerFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) public;

    function getTradeMakerFeesCount() public view returns (uint256);

    function getTradeTakerFee(uint256 blockNumber, int256 discountTier) public view returns (int256);

    function setTradeTakerFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) public;

    function getTradeTakerFeesCount() public view returns (uint256);

    function getPaymentFee(uint256 blockNumber, int256 discountTier) public view returns (int256);

    function setPaymentFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) public;

    function getPaymentFeesCount() public view returns (uint256);

    function getTradeMakerMinimumFee(uint256 blockNumber) public view returns (int256);

    function setTradeMakerMinimumFee(uint256 blockNumber, int256 nominal) public;

    function getTradeMakerMinimumFeesCount() public view returns (uint256);

    function getTradeTakerMinimumFee(uint256 blockNumber) public view returns (int256);

    function setTradeTakerMinimumFee(uint256 blockNumber, int256 nominal) public;

    function getTradeTakerMinimumFeesCount() public view returns (uint256);

    function getPaymentMinimumFee(uint256 blockNumber) public view returns (int256);

    function setPaymentMinimumFee(uint256 blockNumber, int256 nominal) public;

    function getPaymentMinimumFeesCount() public view returns (uint256);

    function setCancelOrderChallengeTimeout(uint256 timeout) public;

    function getCancelOrderChallengeTimeout() public view returns (uint256);

    function setDealSettlementChallengeTimeout(uint256 timeout) public;

    function getDealSettlementChallengeTimeout() public view returns (uint256);

    function setUnchallengeOrderCandidateByTradeStake(address currency, int256 amount) public;

    function getUnchallengeOrderCandidateByTradeStakeCurrency() public view returns (address);

    function getUnchallengeOrderCandidateByTradeStakeAmount() public view returns (int256);

    function setFalseWalletSignatureStake(address currency, int256 amount) public;

    function getFalseWalletSignatureStake() public view returns (address, int256);
}

/**
@title Configuration
@notice An oracle for configurations such as fees, challenge timeouts and stakes
*/
contract Configuration is Ownable, AbstractConfiguration {
    using SafeMathInt for int256;

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

    struct Lot {
        address currency;
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    OperationalMode public operationalMode = OperationalMode.Normal;

    mapping(address => mapping(bytes32 => bool)) public registeredServiceActionMap;

    int256 constant public PARTS_PER = 1e18;

    mapping(uint256 => DiscountableFee) tradeMakerFees;
    mapping(uint256 => DiscountableFee) tradeTakerFees;
    mapping(uint256 => DiscountableFee) paymentFees;
    uint256[] public tradeMakerFeeBlockNumbers;
    uint256[] public tradeTakerFeeBlockNumbers;
    uint256[] public paymentFeeBlockNumbers;

    mapping(uint256 => StaticFee) tradeMakerMinimumFees;
    mapping(uint256 => StaticFee) tradeTakerMinimumFees;
    mapping(uint256 => StaticFee) paymentMinimumFees;
    uint256[] public tradeMakerMinimumFeeBlockNumbers;
    uint256[] public tradeTakerMinimumFeeBlockNumbers;
    uint256[] public paymentMinimumFeeBlockNumbers;

    uint256 public cancelOrderChallengeTimeout;
    uint256 public dealSettlementChallengeTimeout;

    Lot public unchallengeOrderCandidateByTradeStake;
    Lot public falseWalletSignatureStake;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterServiceEvent(address service, string action);
    event DeregisterServiceEvent(address service, string action);
    event SetOperationalModeExitEvent();
    event SetPartsPerEvent(int256 partsPer);
    event SetTradeMakerFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetTradeTakerFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetPaymentFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetTradeMakerMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetTradeTakerMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetPaymentMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetCancelOrderChallengeTimeout(uint256 timeout);
    event SetDealSettlementChallengeTimeout(uint256 timeout);
    event SetUnchallengeDealSettlementOrderByTradeStakeEvent(address currency, int256 amount);
    event SetFalseWalletSignatureStakeEvent(address currency, int256 amount);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Returns the service status of an address and an action
    /// @param service The address of contract
    /// @param action The action in question
    function isRegisteredService(address service, string action) public returns (bool) {
        return registeredServiceActionMap[service][keccak256(abi.encode(action))];
    }

    /// @notice Register a contract as a service that may carry out an action
    /// @param service The address of service contract
    /// @param action The action that the service may carry out
    function registerService(address service, string action) public onlyOwner {
        registeredServiceActionMap[service][keccak256(abi.encode(action))] = true;
        emit RegisterServiceEvent(service, action);
    }

    /// @notice Deregister a contract from the set of services that may carry out an action
    /// @param service The address of service contract
    /// @param action The action that the service may carry out
    function deregisterService(address service, string action) public onlyOwner {
        registeredServiceActionMap[service][keccak256(abi.encode(action))] = false;
        emit DeregisterServiceEvent(service, action);
    }

    /// @notice Set operational mode to Exit
    /// @dev Once operational mode is set to Exit it may not be set back to Normal
    function setOperationalModeExit() public onlyOwnerOrServiceAction('OperationalMode') {
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

    function getPartsPer() public view returns (int256) {
        return PARTS_PER;
    }

    /// @notice Get trade maker relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getTradeMakerFee(uint256 blockNumber, int256 discountTier) public view returns (int256) {
        require(0 < tradeMakerFeeBlockNumbers.length);
        uint256 index = getIndexOfLower(tradeMakerFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = tradeMakerFeeBlockNumbers[index - 1];
            DiscountableFee storage fee = tradeMakerFees[setBlockNumber];
            return getDiscountableFee(fee, discountTier);
        } else
            return 0;
    }

    /// @notice Set trade maker nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setTradeMakerFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues)
    public
    onlyOwner
    onlyLaterBlockNumber(blockNumber)
    {
        DiscountableFee storage fee = tradeMakerFees[blockNumber];
        setDiscountableFee(fee, tradeMakerFeeBlockNumbers, blockNumber, nominal, discountTiers, discountValues);
        emit SetTradeMakerFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of trade maker fee tiers
    function getTradeMakerFeesCount() public view returns (uint256) {
        return tradeMakerFeeBlockNumbers.length;
    }

    /// @notice Get trade taker relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getTradeTakerFee(uint256 blockNumber, int256 discountTier) public view returns (int256) {
        require(0 < tradeTakerFeeBlockNumbers.length);
        uint256 index = getIndexOfLower(tradeTakerFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = tradeTakerFeeBlockNumbers[index - 1];
            DiscountableFee storage fee = tradeTakerFees[setBlockNumber];
            return getDiscountableFee(fee, discountTier);
        } else
            return 0;
    }

    /// @notice Set trade taker nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setTradeTakerFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues)
    public
    onlyOwner
    onlyLaterBlockNumber(blockNumber)
    {
        DiscountableFee storage fee = tradeTakerFees[blockNumber];
        setDiscountableFee(fee, tradeTakerFeeBlockNumbers, blockNumber, nominal, discountTiers, discountValues);
        emit SetTradeTakerFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of trade taker fee tiers
    function getTradeTakerFeesCount() public view returns (uint256) {
        return tradeTakerFeeBlockNumbers.length;
    }

    /// @notice Get payment relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getPaymentFee(uint256 blockNumber, int256 discountTier) public view returns (int256) {
        require(0 < paymentFeeBlockNumbers.length);
        uint256 index = getIndexOfLower(paymentFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = paymentFeeBlockNumbers[index - 1];
            DiscountableFee storage fee = paymentFees[setBlockNumber];
            return getDiscountableFee(fee, discountTier);
        } else
            return 0;
    }

    /// @notice Set payment nominal relative fee and discount tiers and values at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Nominal relative fee
    /// @param nominal Discount tier levels
    /// @param nominal Discount values
    function setPaymentFee(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues)
    public
    onlyOwner
    onlyLaterBlockNumber(blockNumber)
    {
        DiscountableFee storage fee = paymentFees[blockNumber];
        setDiscountableFee(fee, paymentFeeBlockNumbers, blockNumber, nominal, discountTiers, discountValues);
        emit SetPaymentFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of payment fee tiers
    function getPaymentFeesCount() public view returns (uint256) {
        return paymentFeeBlockNumbers.length;
    }

    /// @notice Get trade maker minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getTradeMakerMinimumFee(uint256 blockNumber) public view returns (int256) {
        require(0 < tradeMakerMinimumFeeBlockNumbers.length);
        uint256 index = getIndexOfLower(tradeMakerMinimumFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = tradeMakerMinimumFeeBlockNumbers[index - 1];
            StaticFee storage fee = tradeMakerMinimumFees[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set trade maker minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setTradeMakerMinimumFee(uint256 blockNumber, int256 nominal)
    public
    onlyOwner
    onlyLaterBlockNumber(blockNumber)
    {
        StaticFee storage fee = tradeMakerMinimumFees[blockNumber];
        setStaticFee(fee, tradeMakerMinimumFeeBlockNumbers, blockNumber, nominal);
        emit SetTradeMakerMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum trade maker fee tiers
    function getTradeMakerMinimumFeesCount() public view returns (uint256) {
        return tradeMakerMinimumFeeBlockNumbers.length;
    }

    /// @notice Get trade taker minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getTradeTakerMinimumFee(uint256 blockNumber) public view returns (int256) {
        require(0 < tradeTakerMinimumFeeBlockNumbers.length);
        uint256 index = getIndexOfLower(tradeTakerMinimumFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = tradeTakerMinimumFeeBlockNumbers[index - 1];
            StaticFee storage fee = tradeTakerMinimumFees[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set trade taker minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setTradeTakerMinimumFee(uint256 blockNumber, int256 nominal)
    public
    onlyOwner
    onlyLaterBlockNumber(blockNumber)
    {
        StaticFee storage fee = tradeTakerMinimumFees[blockNumber];
        setStaticFee(fee, tradeTakerMinimumFeeBlockNumbers, blockNumber, nominal);
        emit SetTradeTakerMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum trade taker fee tiers
    function getTradeTakerMinimumFeesCount() public view returns (uint256) {
        return tradeTakerMinimumFeeBlockNumbers.length;
    }

    /// @notice Get payment minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getPaymentMinimumFee(uint256 blockNumber) public view returns (int256) {
        require(0 < paymentMinimumFeeBlockNumbers.length);
        uint256 index = getIndexOfLower(paymentMinimumFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint256 setBlockNumber = paymentMinimumFeeBlockNumbers[index - 1];
            StaticFee storage fee = paymentMinimumFees[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set payment minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setPaymentMinimumFee(uint256 blockNumber, int256 nominal)
    public
    onlyOwner
    onlyLaterBlockNumber(blockNumber)
    {
        StaticFee storage fee = paymentMinimumFees[blockNumber];
        setStaticFee(fee, paymentMinimumFeeBlockNumbers, blockNumber, nominal);
        emit SetPaymentMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum payment fee tiers
    function getPaymentMinimumFeesCount() public view returns (uint256) {
        return paymentMinimumFeeBlockNumbers.length;
    }

    /// @notice Set timeout of cancel order challenge
    /// @param timeout Timeout duration
    function setCancelOrderChallengeTimeout(uint256 timeout) public onlyOwner {
        cancelOrderChallengeTimeout = timeout;
        emit SetCancelOrderChallengeTimeout(timeout);
    }

    function getCancelOrderChallengeTimeout() public view returns (uint256) {
        return cancelOrderChallengeTimeout;
    }

    /// @notice Set timeout of deal challenge
    /// @param timeout Timeout duration
    function setDealSettlementChallengeTimeout(uint256 timeout) public onlyOwner {
        dealSettlementChallengeTimeout = timeout;
        emit SetDealSettlementChallengeTimeout(timeout);
    }

    function getDealSettlementChallengeTimeout() public view returns (uint256) {
        return dealSettlementChallengeTimeout;
    }

    /// @notice Set currency and amount that will be gained when someone successfully unchallenges
    /// (deal settlement) order candidate by trade
    /// @param currency Address of currency gained (0 represents ETH)
    /// @param amount Amount gained
    function setUnchallengeOrderCandidateByTradeStake(address currency, int256 amount) public onlyOwner {
        unchallengeOrderCandidateByTradeStake = Lot({currency : currency, amount : amount});
        emit SetUnchallengeDealSettlementOrderByTradeStakeEvent(currency, amount);
    }

    /// @notice Get the currency that will be gained when someone successfully
    /// unchallenges (deal settlement) order candidate by trade
    function getUnchallengeOrderCandidateByTradeStakeCurrency() public view returns (address) {
        return unchallengeOrderCandidateByTradeStake.currency;
    }

    /// @notice Get the amount that will be gained when someone successfully
    /// unchallenges (deal settlement) order candidate by trade
    function getUnchallengeOrderCandidateByTradeStakeAmount() public view returns (int256) {
        return unchallengeOrderCandidateByTradeStake.amount;
    }

    /// @notice Set currency and amount that will be gained when someone successfully challenges
    /// false wallet signature on order or payment
    /// @param currency Address of currency gained (0 represents ETH)
    /// @param amount Amount gained
    function setFalseWalletSignatureStake(address currency, int256 amount) public onlyOwner {
        falseWalletSignatureStake = Lot({currency: currency, amount: amount});
        emit SetFalseWalletSignatureStakeEvent(currency, amount);
    }

    /// @notice Get the lot currency and amount that will be gained when someone successfully challenges
    /// false wallet signature on order or payment
    function getFalseWalletSignatureStake() public view returns (address, int256) {
        return (falseWalletSignatureStake.currency, falseWalletSignatureStake.amount);
    }

    function setDiscountableFee(DiscountableFee storage fee, uint256[] storage feeBlockNumbers,
        uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues) internal onlyOwner {
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

    function setStaticFee(StaticFee storage fee, uint256[] storage feeBlockNumbers,
        uint256 blockNumber, int256 nominal) internal onlyOwner {

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

    modifier onlyLaterBlockNumber(uint256 blockNumber) {
        require(blockNumber > block.number);
        _;
    }

    modifier onlyOwnerOrServiceAction(string action) {
        require(msg.sender == owner || registeredServiceActionMap[msg.sender][keccak256(abi.encode(action))]);
        _;
    }
}