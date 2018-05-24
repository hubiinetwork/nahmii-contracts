/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "../contracts/Types.sol";
import "../contracts/Configuration.sol";
pragma experimental ABIEncoderV2;

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract MockedDealSettlementChallenge {

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    struct DealSettlementChallengeInfo {
        uint256 nonce;
        Types.DealType dealType;
        uint256 timeout;
        Types.ChallengeStatus status;
        uint256 dealIndex;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    mapping(address => mapping(uint256 => Types.ChallengeStatus)) walletNonceChallengeStatusMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event CancelOrdersEvent(Types.Order[] orders, address wallet);
    event ChallengeCancelledOrderEvent(Types.Order order, Types.Trade trade, address wallet);
    event StartDealSettlementChallengeFromTradeEvent(Types.Trade trade, address wallet);
    event StartDealSettlementChallengeFromPaymentEvent(Types.Payment payment, address wallet);
    event ChallengeDealSettlementByOrderEvent(Types.Order order, uint256 nonce, Types.DealType dealType, address wallet);
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public {
        owner = _owner;
    }

    //    /// @notice Change the owner of this contract
    //    /// @param newOwner The address of the new owner
    //    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
    //        emit OwnerChangedEvent(address(0), newOwner);
    //    }
    //
    //    /// @notice Get count of cancelled orders for given wallet
    //    /// @param wallet The wallet for which to return the count of cancelled orders
    //    function getCancelledOrdersCount(address wallet) public pure returns (uint256) {
    //        return 0;
    //    }
    //
    //    /// @notice Get 10 cancelled orders for given wallet starting at given start index
    //    /// @param wallet The wallet for which to return the nonces of cancelled orders
    //    /// @param startIndex The start index from which to extract order nonces, used for pagination
    //    function getCancelledOrders(address wallet, uint256 startIndex) public view returns (Types.Order[10]) {
    //        Types.Order[10] memory returnOrders;
    //        return returnOrders;
    //    }
    //
    //    /// @notice Cancel orders
    //    /// @param orders The orders to cancel
    //    function cancelOrders(Types.Order[] orders)
    //    public
    //    {
    //        emit CancelOrdersEvent(orders, msg.sender);
    //    }
    //
    //    /// @notice Challenge cancelled order
    //    /// @param trade The trade that challenges a cancelled order
    //    /// @param wallet The concerned wallet
    //    function challengeCancelledOrder(Types.Trade trade, address wallet) public
    //    signedBy(trade.seal.hash, trade.seal.signature, owner)
    //    {
    //        Types.Order memory order;
    //        emit ChallengeCancelledOrderEvent(order, trade, msg.sender);
    //    }
    //
    //    /// @notice Get current phase of a wallets cancelled order challenge
    //    /// @param wallet The address of wallet for which the cancelled order challenge phase is returned
    //    function cancelledOrdersChallengePhase(address wallet) public pure returns (Types.ChallengePhase) {
    //        return Types.ChallengePhase.Closed;
    //    }
    //
    //    /// @notice Get the number of current and past deal settlement challenges from trade for given wallet
    //    /// @param wallet The wallet for which to return count
    //    function dealSettlementChallengeFromTradeCount(address wallet) public pure returns (uint256) {
    //        return 0;
    //    }
    //
    //    /// @notice Get the number of current and past deal settlement challenges from payment for given wallet
    //    /// @param wallet The wallet for which to return count
    //    function dealSettlementChallengeFromPaymentCount(address wallet) public pure returns (uint256) {
    //        return 0;
    //    }
    //
    //    /// @notice Start deal settlement challenge on deal of trade type
    //    /// @param trade The challenged deal
    //    /// @param wallet The relevant deal party
    //    function startDealSettlementChallengeFromTrade(Types.Trade trade, address wallet)
    //    public
    //    signedBy(trade.seal.hash, trade.seal.signature, owner)
    //    {
    //        if (msg.sender != owner)
    //            wallet = msg.sender;
    //
    //        emit StartDealSettlementChallengeFromTradeEvent(trade, wallet);
    //    }
    //
    //    /// @notice Start deal settlement challenge on deal of payment type
    //    /// @param payment The challenged deal
    //    /// @param wallet The relevant deal party
    //    function startDealSettlementChallengeFromPayment(Types.Payment payment, address wallet)
    //    public
    //    signedBy(payment.seals.exchange.hash, payment.seals.exchange.signature, owner)
    //    signedBy(payment.seals.party.hash, payment.seals.party.signature, payment.source._address)
    //    {
    //        if (msg.sender != owner)
    //            wallet = msg.sender;
    //
    //        emit StartDealSettlementChallengeFromPaymentEvent(payment, wallet);
    //    }
    //
    //    /// @notice Get challenged deal that is a trade
    //    /// @param wallet The wallet whose challenged deal will be searched for
    //    function getChallengedDealAsTrade(address wallet) public view returns (Types.Trade) {
    //        Types.Trade memory trade;
    //        return trade;
    //    }
    //
    //    /// @notice Get challenged deal that is a payment
    //    /// @param wallet The wallet whose challenged deal will be searched for
    //    function getChallengedDealAsPayment(address wallet) public view returns (Types.Payment) {
    //        Types.Payment memory payment;
    //        return payment;
    //    }
    //
    //    /// @notice Get deal settlement challenge phase of given wallet
    //    /// @param wallet The wallet whose challenge phase will be returned
    //    function dealSettlementChallengePhase(address wallet) public view returns (uint, Types.ChallengePhase) {
    //        return (0, Types.ChallengePhase.Closed);
    //    }

    function setDealSettlementChallengeStatus(address wallet, uint256 nonce, Types.ChallengeStatus status) public {
        walletNonceChallengeStatusMap[wallet][nonce] = status;
    }

    /// @notice Get deal settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    /// @param nonce The nonce of the challenged deal
    function dealSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeStatus) {
        return walletNonceChallengeStatusMap[wallet][nonce];

    }

    //    /// @notice Challenge the deal settlement by providing order candidate
    //    /// @param order The order candidate that challenges the challenged deal
    //    function challengeDealSettlementByOrder(Types.Order order)
    //    public
    //    signedBy(order.seals.exchange.hash, order.seals.exchange.signature, owner)
    //    signedBy(order.seals.party.hash, order.seals.party.signature, order._address)
    //    {
    //        DealSettlementChallengeInfo memory challenge;
    //        emit ChallengeDealSettlementByOrderEvent(order, challenge.nonce, challenge.dealType, msg.sender);
    //    }
    //
    //    function isOwner() private view returns (bool) {
    //        return msg.sender == owner;
    //    }
    //
    //    /// @notice Change the configuration contract
    //    /// @param newConfiguration The (address of) Configuration contract instance
    //    function changeConfiguration(Configuration newConfiguration) public onlyOwner {
    //        emit ChangeConfigurationEvent(Configuration(0), newConfiguration);
    //    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        //        require(_address != address(0));
        _;
    }

    modifier onlyOwner() {
        //        require(isOwner());
        _;
    }

    modifier onlyTradeParty(Types.Trade trade, address wallet) {
        //        require(Types.isTradeParty(trade, wallet));
        _;
    }

    modifier onlyPaymentParty(Types.Payment payment, address wallet) {
        //        require(Types.isPaymentParty(payment, wallet));
        _;
    }

    modifier signedBy(bytes32 hash, Types.Signature signature, address signer) {
        //        require(Types.isGenuineSignature(hash, signature, signer));
        _;
    }
}