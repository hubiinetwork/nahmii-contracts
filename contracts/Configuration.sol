/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

import "./SafeMathInt.sol";

/**
@title Configuration
@notice An oracle for configurations such as fees, challenge timeouts and stakes
*/
contract Configuration {
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

    int256 constant public PARTS_PER = 1e18;
    address public owner;

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
    uint256 public dealChallengeTimeout;

    Lot public unchallengeDealSettlementOrderByTradeStake;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event SetOperationalModeExitEvent();
    event SetPartsPerEvent(int256 partsPer);
    event SetTradeMakerFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetTradeTakerFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetPaymentFeeEvent(uint256 blockNumber, int256 nominal, int256[] discountTiers, int256[] discountValues);
    event SetTradeMakerMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetTradeTakerMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetPaymentMinimumFeeEvent(uint256 blockNumber, int256 nominal);
    event SetCancelOrderChallengeTimeout(uint256 timeout);
    event SetDealChallengeTimeout(uint256 timeout);
    event SetUnchallengeDealSettlementOrderByTradeStakeEvent(address currency, int256 amount);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public notNullAddress(_owner) {
        owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------

    /// @notice Set new owner
    /// @param newOwner New owner address
    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        if (newOwner != owner) {
            // Set new owner
            address oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    /// @notice Return true if operational mode is Normal
    function isOperationalModeNormal() public view returns (bool) {
        return OperationalMode.Normal == operationalMode;
    }

    /// @notice Return true if operational mode is Exit
    function isOperationalModeExit() public view returns (bool) {
        return OperationalMode.Exit == operationalMode;
    }

    /// @notice Set operational mode to Exit
    /// @dev Once operational mode is set to Exit it may not be set back to Normal
    function setOperationalModeExit() public onlyOwner {
        operationalMode = OperationalMode.Exit;

        emit SetOperationalModeExitEvent();
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

    /// @notice Set timeout of deal challenge
    /// @param timeout Timeout duration
    function setDealChallengeTimeout(uint256 timeout) public onlyOwner {
        dealChallengeTimeout = timeout;
        emit SetDealChallengeTimeout(timeout);
    }

    /// @notice Set currency and amount that will be gained when someone successfully unchallenges deal settlement order by trade
    /// @param currency Address of currency gained (0 represents ETH)
    /// @param amount Amount gained
    function setUnchallengeDealSettlementOrderByTradeStake(address currency, int256 amount) public onlyOwner {
        unchallengeDealSettlementOrderByTradeStake = Lot({currency : currency, amount : amount});
        emit SetUnchallengeDealSettlementOrderByTradeStakeEvent(currency, amount);
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

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyLaterBlockNumber(uint256 blockNumber) {
        require(blockNumber > block.number);
        _;
    }
}