/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {StriimChallenge} from "./StriimChallenge.sol";
//import {Modifiable} from "./Modifiable.sol";
//import {Challengable} from "./Challengable.sol";
import {Validatable} from "./Validatable.sol";
import {DriipSettlementChallenger} from "./DriipSettlementChallenger.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import {SafeMathInt} from "./SafeMathInt.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title DriipSettlementChallenge
@notice Where driip settlements are challenged
*/
contract DriipSettlementChallenge is Ownable, StriimChallenge, Validatable, SelfDestructible {
    using SafeMathInt for int256;

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    enum ChallengeCandidateType {None, Order, Trade, Payment}

    struct Challenge {
        uint256 nonce;
        StriimTypes.DriipType driipType;
        uint256 timeout;
        StriimTypes.ChallengeResult result;
        uint256 driipIndex;
        ChallengeCandidateType candidateType;
        uint256 candidateIndex;
        address challenger;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementChallenger public driipSettlementChallenger;

    mapping(address => Challenge) public walletChallengeMap;

    mapping(address => StriimTypes.Trade[]) public walletChallengedTradesMap;
    mapping(address => StriimTypes.Payment[]) public walletChallengedPaymentsMap;

    StriimTypes.Order[] public challengeCandidateOrders;
    StriimTypes.Trade[] public challengeCandidateTrades;
    StriimTypes.Payment[] public challengeCandidatePayments;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeDriipSettlementChallengerEvent(DriipSettlementChallenger oldDriipSettlementChallenger, DriipSettlementChallenger newDriipSettlementChallenger);
    event StartChallengeFromTradeEvent(StriimTypes.Trade trade, address wallet);
    event StartChallengeFromPaymentEvent(StriimTypes.Payment payment, address wallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the driip settlement challenger contract
    /// @param newDriipSettlementChallenger The (address of) DriipSettlementChallenger contract instance
    function changeDriipSettlementChallenger(DriipSettlementChallenger newDriipSettlementChallenger)
    public
    onlyOwner
    notNullAddress(newDriipSettlementChallenger)
    {
        DriipSettlementChallenger oldDriipSettlementChallenger = driipSettlementChallenger;
        driipSettlementChallenger = newDriipSettlementChallenger;
        emit ChangeDriipSettlementChallengerEvent(oldDriipSettlementChallenger, driipSettlementChallenger);
    }

    /// @notice Get the number of current and past driip settlement challenges from trade for given wallet
    /// @param wallet The wallet for which to return count
    function walletChallengedTradesCount(address wallet) public view returns (uint256) {
        return walletChallengedTradesMap[wallet].length;
    }

    /// @notice Get the number of current and past driip settlement challenges from payment for given wallet
    /// @param wallet The wallet for which to return count
    function walletChallengedPaymentsCount(address wallet) public view returns (uint256) {
        return walletChallengedPaymentsMap[wallet].length;
    }

    /// @notice Return the number of (challenge) candidate orders
    function challengeCandidateOrdersCount() public view returns (uint256) {
        return challengeCandidateOrders.length;
    }

    /// @notice Return the challenge candidate order at the given index
    /// @dev This acts as a double of challengeCandidateOrders() which rather then returning StriimTypes.Order
    /// returns (uint256, address, StriimTypes.OrderPlacement, StriimTypes.WalletExchangeSeal, uint256)
    /// @param index The index of challenge order candidate
    function getChallengeCandidateOrder(uint256 index) public view returns (StriimTypes.Order) {
        return challengeCandidateOrders[index];
    }

    /// @notice Return the number of (challenge) candidate trades
    function challengeCandidateTradesCount() public view returns (uint256) {
        return challengeCandidateTrades.length;
    }

    /// @notice Return the number of (challenge) candidate payments
    function challengeCandidatePaymentsCount() public view returns (uint256) {
        return challengeCandidatePayments.length;
    }

    /// @notice Start driip settlement challenge on driip of trade type
    /// @param trade The challenged driip
    /// @param wallet The relevant driip party
    function startChallengeFromTrade(StriimTypes.Trade trade, address wallet)
    public
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(configuration != address(0));

        if (msg.sender != owner)
            wallet = msg.sender;

        require(isOwner() || StriimTypes.isTradeParty(trade, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        // TODO Uncomment/solve
//        walletChallengedTradesMap[wallet].push(trade);
        pushMemoryTradeToStorageArray(trade, walletChallengedTradesMap[wallet]);

        Challenge memory challenge = Challenge(
            trade.nonce,
            StriimTypes.DriipType.Trade,
            block.timestamp + configuration.getDriipSettlementChallengeTimeout(),
            StriimTypes.ChallengeResult.Qualified,
            walletChallengedTradesMap[wallet].length - 1,
            ChallengeCandidateType.None,
            0,
            address(0)
        );
        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromTradeEvent(trade, wallet);
    }

    /// @notice Start driip settlement challenge on driip of payment type
    /// @param payment The challenged driip
    /// @param wallet The relevant driip party
    function startChallengeFromPayment(StriimTypes.Payment payment, address wallet)
    public
    validatorInitialized
    onlySealedPayment(payment)
    {
        require(configuration != address(0));

        if (msg.sender != owner)
            wallet = msg.sender;

        require(isOwner() || StriimTypes.isPaymentParty(payment, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        // TODO Uncomment/solve
//        walletChallengedPaymentsMap[wallet].push(payment);
        pushMemoryPaymentToStorageArray(payment, walletChallengedPaymentsMap[wallet]);

        Challenge memory challenge = Challenge(
            payment.nonce,
            StriimTypes.DriipType.Payment,
            block.timestamp + configuration.getDriipSettlementChallengeTimeout(),
            StriimTypes.ChallengeResult.Qualified,
            walletChallengedPaymentsMap[wallet].length - 1,
            ChallengeCandidateType.None,
            0,
            address(0)
        );
        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromPaymentEvent(payment, wallet);
    }

    /// @notice Get driip settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    function driipSettlementChallengePhase(address wallet) public view returns (uint, StriimTypes.ChallengePhase) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if (0 == walletChallengeMap[wallet].nonce)
            return (0, StriimTypes.ChallengePhase.Closed);
        else if (block.timestamp < walletChallengeMap[wallet].timeout)
            return (walletChallengeMap[wallet].nonce, StriimTypes.ChallengePhase.Dispute);
        else
            return (walletChallengeMap[wallet].nonce, StriimTypes.ChallengePhase.Closed);
    }

    /// @notice Get driip settlement challenge result and challenger (wallet) of given (challenge) wallet
    /// @param wallet The wallet whose challenge status will be returned
    /// @param nonce The nonce of the challenged driip
    function driipSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (StriimTypes.ChallengeResult, address) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if ((0 == walletChallengeMap[wallet].nonce) ||
            (nonce != walletChallengeMap[wallet].nonce))
            return (StriimTypes.ChallengeResult.Unknown, address(0));
        else
            return (walletChallengeMap[wallet].result, walletChallengeMap[wallet].challenger);
    }

    //
    // Functions implemented in DriipSettlementChallenger
    // -----------------------------------------------------------------------------------------------------------------

    /// @notice Challenge the driip settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    function challengeByOrder(StriimTypes.Order order)
    public
    onlyOperationalModeNormal
    {
        driipSettlementChallenger.challengeByOrder(order, msg.sender);
    }

    /// @notice Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(StriimTypes.Order order, StriimTypes.Trade trade)
    public
    onlyOperationalModeNormal
    {
        driipSettlementChallenger.unchallengeOrderCandidateByTrade(order, trade, msg.sender);
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    function challengeByTrade(StriimTypes.Trade trade, address wallet)
    public
    onlyOperationalModeNormal
    {
        driipSettlementChallenger.challengeByTrade(trade, wallet, msg.sender);
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    function challengeByPayment(StriimTypes.Payment payment, address wallet)
    public
    onlyOperationalModeNormal
    {
        driipSettlementChallenger.challengeByPayment(payment, wallet, msg.sender);
    }

    //
    // Helpers for DriipSettlementChallenger
    // -----------------------------------------------------------------------------------------------------------------
    function getWalletChallenge(address wallet) public view onlyDriipSettlementChallenger returns (Challenge) {
        return walletChallengeMap[wallet];
    }

    function setWalletChallenge(address wallet, Challenge challenge) public onlyDriipSettlementChallenger {
        walletChallengeMap[wallet] = challenge;
    }

    function resetWalletChallenge(address wallet) public onlyDriipSettlementChallenger {
        walletChallengeMap[wallet].result = StriimTypes.ChallengeResult.Qualified;
        walletChallengeMap[wallet].candidateType = DriipSettlementChallenge.ChallengeCandidateType.None;
        walletChallengeMap[wallet].candidateIndex = 0;
        walletChallengeMap[wallet].challenger = address(0);
    }

    function getWalletChallengeTrade(address wallet, uint256 driipIndex) public view onlyDriipSettlementChallenger returns (StriimTypes.Trade) {
        return walletChallengedTradesMap[wallet][driipIndex];
    }

    function getWalletChallengePayment(address wallet, uint256 driipIndex) public view onlyDriipSettlementChallenger returns (StriimTypes.Payment) {
        return walletChallengedPaymentsMap[wallet][driipIndex];
    }

    function pushChallengeCandidateOrder(StriimTypes.Order order) public onlyDriipSettlementChallenger {
        challengeCandidateOrders.push(order);
    }

    function getChallengeCandidateOrdersLength() public view onlyDriipSettlementChallenger returns (uint256) {
        return challengeCandidateOrders.length;
    }

    function pushChallengeCandidateTrade(StriimTypes.Trade trade) public onlyDriipSettlementChallenger {
        // TODO Uncomment/solve
//        challengeCandidateTrades.push(trade);
        pushMemoryTradeToStorageArray(trade, challengeCandidateTrades);
    }

    function getChallengeCandidateTradesLength() public view onlyDriipSettlementChallenger returns (uint256) {
        return challengeCandidateTrades.length;
    }

    function pushChallengeCandidatePayment(StriimTypes.Payment payment) public onlyDriipSettlementChallenger {
        // TODO Uncomment/solve
//        challengeCandidatePayments.push(payment);
        pushMemoryPaymentToStorageArray(payment, challengeCandidatePayments);
    }

    function getChallengeCandidatePaymentsLength() public view onlyDriipSettlementChallenger returns (uint256) {
        return challengeCandidatePayments.length;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyDriipSettlementChallenger() {
        require(msg.sender == address(driipSettlementChallenger));
        _;
    }
}
