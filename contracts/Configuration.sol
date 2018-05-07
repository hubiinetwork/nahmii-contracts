/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

/**
@title Configuration
@notice An oracle for configurations such as fees, challenge timeouts and stakes
*/
contract Configuration {

    //
    // Custom types
    // -----------------------------------------------------------------------------------------------------------------
    struct TieredDiscount {
        uint tier;
        uint value;
    }

    struct DiscountableFee {
        uint blockNumber;
        uint nominal;
        TieredDiscount[] discounts;
    }

    struct StaticFee {
        uint blockNumber;
        uint nominal;
    }

    struct Lot {
        address currency;
        uint amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint constant public PARTS_PER = 1e18;
    address public owner;

    mapping(uint => DiscountableFee) tradeMakerFees;
    mapping(uint => DiscountableFee) tradeTakerFees;
    mapping(uint => DiscountableFee) paymentFees;
    uint[] public tradeMakerFeeBlockNumbers;
    uint[] public tradeTakerFeeBlockNumbers;
    uint[] public paymentFeeBlockNumbers;

    mapping(uint => StaticFee) tradeMakerMinimumFees;
    mapping(uint => StaticFee) tradeTakerMinimumFees;
    mapping(uint => StaticFee) paymentMinimumFees;
    uint[] public tradeMakerMinimumFeeBlockNumbers;
    uint[] public tradeTakerMinimumFeeBlockNumbers;
    uint[] public paymentMinimumFeeBlockNumbers;

    uint public cancelOrderChallengeTimeout;
    uint public dealChallengeTimeout;

    Lot public unchallengeDealSettlementOrderByTradeStake;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event SetPartsPerEvent(uint partsPer);
    event SetTradeMakerFeeEvent(uint blockNumber, uint nominal, uint[] discountTiers, uint[] discountValues);
    event SetTradeTakerFeeEvent(uint blockNumber, uint nominal, uint[] discountTiers, uint[] discountValues);
    event SetPaymentFeeEvent(uint blockNumber, uint nominal, uint[] discountTiers, uint[] discountValues);
    event SetTradeMakerMinimumFeeEvent(uint blockNumber, uint nominal);
    event SetTradeTakerMinimumFeeEvent(uint blockNumber, uint nominal);
    event SetPaymentMinimumFeeEvent(uint blockNumber, uint nominal);
    event SetCancelOrderChallengeTimeout(uint timeout);
    event SetDealChallengeTimeout(uint timeout);
    event SetUnchallengeDealSettlementOrderByTradeStakeEvent(address currency, uint amount);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function Configuration(address _owner) public notNullAddress(_owner) {
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

    /// @notice Get trade maker relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getTradeMakerFee(uint blockNumber, uint discountTier) public view returns (uint) {
        require(0 < tradeMakerFeeBlockNumbers.length);
        uint index = getIndexOfLower(tradeMakerFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint setBlockNumber = tradeMakerFeeBlockNumbers[index - 1];
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
    function setTradeMakerFee(uint blockNumber, uint nominal, uint[] discountTiers, uint[] discountValues) public onlyOwner {
        DiscountableFee storage fee = tradeMakerFees[blockNumber];
        setDiscountableFee(fee, tradeMakerFeeBlockNumbers, blockNumber, nominal, discountTiers, discountValues);
        emit SetTradeMakerFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of trade maker fee tiers
    function getTradeMakerFeesCount() public view returns (uint) {
        return tradeMakerFeeBlockNumbers.length;
    }

    /// @notice Get trade taker relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getTradeTakerFee(uint blockNumber, uint discountTier) public view returns (uint) {
        require(0 < tradeTakerFeeBlockNumbers.length);
        uint index = getIndexOfLower(tradeTakerFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint setBlockNumber = tradeTakerFeeBlockNumbers[index - 1];
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
    function setTradeTakerFee(uint blockNumber, uint nominal, uint[] discountTiers, uint[] discountValues) public onlyOwner {
        DiscountableFee storage fee = tradeTakerFees[blockNumber];
        setDiscountableFee(fee, tradeTakerFeeBlockNumbers, blockNumber, nominal, discountTiers, discountValues);
        emit SetTradeTakerFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of trade taker fee tiers
    function getTradeTakerFeesCount() public view returns (uint) {
        return tradeTakerFeeBlockNumbers.length;
    }

    /// @notice Get payment relative fee at given block number, possibly discounted by discount tier value
    /// @param blockNumber Lower block number for the tier
    /// @param discountTier Tiered value that determines discount
    function getPaymentFee(uint blockNumber, uint discountTier) public view returns (uint) {
        require(0 < paymentFeeBlockNumbers.length);
        uint index = getIndexOfLower(paymentFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint setBlockNumber = paymentFeeBlockNumbers[index - 1];
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
    function setPaymentFee(uint blockNumber, uint nominal, uint[] discountTiers, uint[] discountValues) public onlyOwner {
        DiscountableFee storage fee = paymentFees[blockNumber];
        setDiscountableFee(fee, paymentFeeBlockNumbers, blockNumber, nominal, discountTiers, discountValues);
        emit SetPaymentFeeEvent(blockNumber, nominal, discountTiers, discountValues);
    }

    /// @notice Get number of payment fee tiers
    function getPaymentFeesCount() public view returns (uint) {
        return paymentFeeBlockNumbers.length;
    }

    /// @notice Get trade maker minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getTradeMakerMinimumFee(uint blockNumber) public view returns (uint) {
        require(0 < tradeMakerMinimumFeeBlockNumbers.length);
        uint index = getIndexOfLower(tradeMakerMinimumFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint setBlockNumber = tradeMakerMinimumFeeBlockNumbers[index - 1];
            StaticFee storage fee = tradeMakerMinimumFees[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set trade maker minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setTradeMakerMinimumFee(uint blockNumber, uint nominal) public {
        StaticFee storage fee = tradeMakerMinimumFees[blockNumber];
        setStaticFee(fee, tradeMakerMinimumFeeBlockNumbers, blockNumber, nominal);
        emit SetTradeMakerMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum trade maker fee tiers
    function getTradeMakerMinimumFeesCount() public view returns (uint) {
        return tradeMakerMinimumFeeBlockNumbers.length;
    }

    /// @notice Get trade taker minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getTradeTakerMinimumFee(uint blockNumber) public view returns (uint) {
        require(0 < tradeTakerMinimumFeeBlockNumbers.length);
        uint index = getIndexOfLower(tradeTakerMinimumFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint setBlockNumber = tradeTakerMinimumFeeBlockNumbers[index - 1];
            StaticFee storage fee = tradeTakerMinimumFees[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set trade taker minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setTradeTakerMinimumFee(uint blockNumber, uint nominal) public {
        StaticFee storage fee = tradeTakerMinimumFees[blockNumber];
        setStaticFee(fee, tradeTakerMinimumFeeBlockNumbers, blockNumber, nominal);
        emit SetTradeTakerMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum trade taker fee tiers
    function getTradeTakerMinimumFeesCount() public view returns (uint) {
        return tradeTakerMinimumFeeBlockNumbers.length;
    }

    /// @notice Get payment minimum relative fee at given block number
    /// @param blockNumber Lower block number for the tier
    function getPaymentMinimumFee(uint blockNumber) public view returns (uint) {
        require(0 < paymentMinimumFeeBlockNumbers.length);
        uint index = getIndexOfLower(paymentMinimumFeeBlockNumbers, blockNumber);
        if (0 < index) {
            uint setBlockNumber = paymentMinimumFeeBlockNumbers[index - 1];
            StaticFee storage fee = paymentMinimumFees[setBlockNumber];
            return fee.nominal;
        } else
            return 0;
    }

    /// @notice Set payment minimum relative fee at given block number tier
    /// @param blockNumber Lower block number tier
    /// @param nominal Minimum relative fee
    function setPaymentMinimumFee(uint blockNumber, uint nominal) public {
        StaticFee storage fee = paymentMinimumFees[blockNumber];
        setStaticFee(fee, paymentMinimumFeeBlockNumbers, blockNumber, nominal);
        emit SetPaymentMinimumFeeEvent(blockNumber, nominal);
    }

    /// @notice Get number of minimum payment fee tiers
    function getPaymentMinimumFeesCount() public view returns (uint) {
        return paymentMinimumFeeBlockNumbers.length;
    }

    /// @notice Set timeout of cancel order challenge
    /// @param timeout Timeout duration
    function setCancelOrderChallengeTimeout(uint timeout) public onlyOwner {
        cancelOrderChallengeTimeout = timeout;
        emit SetCancelOrderChallengeTimeout(timeout);
    }

    /// @notice Set timeout of deal challenge
    /// @param timeout Timeout duration
    function setDealChallengeTimeout(uint timeout) public onlyOwner {
        dealChallengeTimeout = timeout;
        emit SetDealChallengeTimeout(timeout);
    }

    /// @notice Set currency and amount that will be gained when someone successfully unchallenges deal settlement order by trade
    /// @param currency Address of currency gained (0 represents ETH)
    /// @param amount Amount gained
    function setUnchallengeDealSettlementOrderByTradeStake(address currency, uint amount) public onlyOwner {
        unchallengeDealSettlementOrderByTradeStake = Lot({currency : currency, amount : amount});
        emit SetUnchallengeDealSettlementOrderByTradeStakeEvent(currency, amount);
    }

    function setDiscountableFee(DiscountableFee storage fee, uint[] storage feeBlockNumbers,
        uint blockNumber, uint nominal, uint[] discountTiers, uint[] discountValues) internal onlyOwner {
        require(discountTiers.length == discountValues.length);

        if (0 == feeBlockNumbers.length || blockNumber != fee.blockNumber)
            addOrdered(feeBlockNumbers, blockNumber);

        fee.blockNumber = blockNumber;
        fee.nominal = nominal;

        fee.discounts.length = 0;
        for (uint i = 0; i < discountTiers.length; i++)
            fee.discounts.push(TieredDiscount({tier : discountTiers[i], value : discountValues[i]}));
    }

    function getDiscountableFee(DiscountableFee storage fee, uint discountTier) internal view returns (uint) {
        uint index = getIndexOfLowerTier(fee.discounts, discountTier);
        if (0 < index) {
            TieredDiscount storage discount = fee.discounts[index - 1];
            return fee.nominal * (PARTS_PER - discount.value) / PARTS_PER;
        } else
            return fee.nominal;
    }

    function setStaticFee(StaticFee storage fee, uint[] storage feeBlockNumbers,
        uint blockNumber, uint nominal) internal onlyOwner {

        if (0 == feeBlockNumbers.length || blockNumber != fee.blockNumber)
            addOrdered(feeBlockNumbers, blockNumber);

        fee.blockNumber = blockNumber;
        fee.nominal = nominal;
    }

    function addOrdered(uint[] storage arr, uint num) internal {
        uint i = 0;
        while (i < arr.length && arr[i] < num)
            i++;

        if (i < arr.length) {
            arr.push(arr[arr.length - 1]);

            for (uint j = arr.length - 2; j > i; j--)
                arr[j] = arr[j - 1];

            arr[i] = num;
        } else
            arr.push(num);
    }

    function getIndexOfLower(uint[] arr, uint num) internal pure returns (uint) {
        for (uint i = arr.length; i > 0; i--)
            if (num >= arr[i - 1])
                return i;
        return 0;
    }

    function getIndexOfLowerTier(TieredDiscount[] arr, uint num) internal pure returns (uint) {
        for (uint i = arr.length; i > 0; i--)
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
}