/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {Ownable} from "./Ownable.sol";
import {Types} from "./Types.sol";
import {Modifiable} from "./Modifiable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {DealSettlementChallenger} from "./DealSettlementChallenger.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title DealSettlementChallenge
@notice Where deal settlements are challenged
*/
contract DealSettlementChallenge is Ownable, Modifiable, Configurable, Validatable, SelfDestructible {
    using SafeMathInt for int256;

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    enum ChallengeCandidateType {None, Order, Trade, Payment}

    struct Challenge {
        uint256 nonce;
        Types.DealType dealType;
        uint256 timeout;
        Types.ChallengeResult result;
        uint256 dealIndex;
        ChallengeCandidateType candidateType;
        uint256 candidateIndex;
        address challenger;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DealSettlementChallenger public dealSettlementChallenger;

    mapping(address => Challenge) public walletChallengeMap;

    mapping(address => Types.Trade[]) public walletChallengedTradesMap;
    mapping(address => Types.Payment[]) public walletChallengedPaymentsMap;

    Types.Order[] public challengeCandidateOrders;
    Types.Trade[] public challengeCandidateTrades;
    Types.Payment[] public challengeCandidatePayments;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeDealSettlementChallengerEvent(DealSettlementChallenger oldDealSettlementChallenger, DealSettlementChallenger newDealSettlementChallenger);
    event StartChallengeFromTradeEvent(Types.Trade trade, address wallet);
    event StartChallengeFromPaymentEvent(Types.Payment payment, address wallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the deal settlement challenger contract
    /// @param newDealSettlementChallenger The (address of) DealSettlementChallenger contract instance
    function changeDealSettlementChallenger(DealSettlementChallenger newDealSettlementChallenger)
    public
    onlyOwner
    notNullAddress(newDealSettlementChallenger)
    {
        DealSettlementChallenger oldDealSettlementChallenger = dealSettlementChallenger;
        dealSettlementChallenger = newDealSettlementChallenger;
        emit ChangeDealSettlementChallengerEvent(oldDealSettlementChallenger, dealSettlementChallenger);
    }

    /// @notice Get the number of current and past deal settlement challenges from trade for given wallet
    /// @param wallet The wallet for which to return count
    function walletChallengedTradesCount(address wallet) public view returns (uint256) {
        return walletChallengedTradesMap[wallet].length;
    }

    /// @notice Get the number of current and past deal settlement challenges from payment for given wallet
    /// @param wallet The wallet for which to return count
    function walletChallengedPaymentsCount(address wallet) public view returns (uint256) {
        return walletChallengedPaymentsMap[wallet].length;
    }

    /// @notice Return the number of (challenge) candidate orders
    function challengeCandidateOrdersCount() public view returns (uint256) {
        return challengeCandidateOrders.length;
    }

    /// @notice Return the number of (challenge) candidate trades
    function challengeCandidateTradesCount() public view returns (uint256) {
        return challengeCandidateTrades.length;
    }

    /// @notice Return the number of (challenge) candidate payments
    function challengeCandidatePaymentsCount() public view returns (uint256) {
        return challengeCandidatePayments.length;
    }

    /// @notice Start deal settlement challenge on deal of trade type
    /// @param trade The challenged deal
    /// @param wallet The relevant deal party
    function startChallengeFromTrade(Types.Trade trade, address wallet)
    public
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(configuration != address(0));

        if (msg.sender != owner)
            wallet = msg.sender;

        require(isOwner() || Types.isTradeParty(trade, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        walletChallengedTradesMap[wallet].push(trade);

        Challenge memory challenge = Challenge(
            trade.nonce,
            Types.DealType.Trade,
            block.timestamp + configuration.getDealSettlementChallengeTimeout(),
            Types.ChallengeResult.Qualified,
            walletChallengedTradesMap[wallet].length - 1,
            ChallengeCandidateType.None,
            0,
            address(0)
        );
        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromTradeEvent(trade, wallet);
    }

    /// @notice Start deal settlement challenge on deal of payment type
    /// @param payment The challenged deal
    /// @param wallet The relevant deal party
    function startChallengeFromPayment(Types.Payment payment, address wallet)
    public
    validatorInitialized
    onlySealedPayment(payment)
    {
        require(configuration != address(0));

        if (msg.sender != owner)
            wallet = msg.sender;

        require(isOwner() || Types.isPaymentParty(payment, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        walletChallengedPaymentsMap[wallet].push(payment);

        Challenge memory challenge = Challenge(
            payment.nonce,
            Types.DealType.Payment,
            block.timestamp + configuration.getDealSettlementChallengeTimeout(),
            Types.ChallengeResult.Qualified,
            walletChallengedPaymentsMap[wallet].length - 1,
            ChallengeCandidateType.None,
            0,
            address(0)
        );
        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromPaymentEvent(payment, wallet);
    }

    /// @notice Get deal settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    function dealSettlementChallengePhase(address wallet) public view returns (uint, Types.ChallengePhase) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if (0 == walletChallengeMap[wallet].nonce)
            return (0, Types.ChallengePhase.Closed);
        else if (block.timestamp < walletChallengeMap[wallet].timeout)
            return (walletChallengeMap[wallet].nonce, Types.ChallengePhase.Dispute);
        else
            return (walletChallengeMap[wallet].nonce, Types.ChallengePhase.Closed);
    }

    /// @notice Get deal settlement challenge result and challenger (wallet) of given (challenge) wallet
    /// @param wallet The wallet whose challenge status will be returned
    /// @param nonce The nonce of the challenged deal
    function dealSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeResult, address) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if ((0 == walletChallengeMap[wallet].nonce) ||
            (nonce != walletChallengeMap[wallet].nonce))
            return (Types.ChallengeResult.Unknown, address(0));
        else
            return (walletChallengeMap[wallet].result, walletChallengeMap[wallet].challenger);
    }

    //
    // Functions implemented in DealSettlementChallenger
    // -----------------------------------------------------------------------------------------------------------------

    /// @notice Challenge the deal settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged deal
    function challengeByOrder(Types.Order order) public {
        dealSettlementChallenger.challengeByOrder(order, msg.sender);
    }

    /// @notice Unchallenge deal settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged deal
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(Types.Order order, Types.Trade trade) public {
        dealSettlementChallenger.unchallengeOrderCandidateByTrade(order, trade, msg.sender);
    }

    /// @notice Challenge the deal settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged deal
    /// @param wallet The wallet whose deal settlement is being challenged
    function challengeByTrade(Types.Trade trade, address wallet) public {
        dealSettlementChallenger.challengeByTrade(trade, wallet, msg.sender);
    }

    /// @notice Challenge the deal settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged deal
    /// @param wallet The wallet whose deal settlement is being challenged
    function challengeByPayment(Types.Payment payment, address wallet) public {
        dealSettlementChallenger.challengeByPayment(payment, wallet, msg.sender);
    }

    //
    // Helpers for DealSettlementChallenger
    // -----------------------------------------------------------------------------------------------------------------
    function getWalletChallenge(address wallet) public view onlyDealSettlementChallenger returns (Challenge) {
        return walletChallengeMap[wallet];
    }

    function setWalletChallenge(address wallet, Challenge challenge) public onlyDealSettlementChallenger {
        walletChallengeMap[wallet] = challenge;
    }

    function getWalletChallengeTrade(address wallet, uint256 dealIndex) public view onlyDealSettlementChallenger returns (Types.Trade) {
        return walletChallengedTradesMap[wallet][dealIndex];
    }

    function getWalletChallengePayment(address wallet, uint256 dealIndex) public view onlyDealSettlementChallenger returns (Types.Payment) {
        return walletChallengedPaymentsMap[wallet][dealIndex];
    }

    function pushChallengeCandidateOrder(Types.Order order) public onlyDealSettlementChallenger {
        challengeCandidateOrders.push(order);
    }

    function getChallengeCandidateOrdersLength() public view onlyDealSettlementChallenger returns (uint256) {
        return challengeCandidateOrders.length;
    }

    function pushChallengeCandidateTrade(Types.Trade trade) public onlyDealSettlementChallenger {
        challengeCandidateTrades.push(trade);
    }

    function getChallengeCandidateTradesLength() public view onlyDealSettlementChallenger returns (uint256) {
        return challengeCandidateTrades.length;
    }

    function pushChallengeCandidatePayment(Types.Payment payment) public onlyDealSettlementChallenger {
        challengeCandidatePayments.push(payment);
    }

    function getChallengeCandidatePaymentsLength() public view onlyDealSettlementChallenger returns (uint256) {
        return challengeCandidatePayments.length;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyDealSettlementChallenger() {
        require(msg.sender == address(dealSettlementChallenger));
        _;
    }
}
