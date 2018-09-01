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
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {StriimChallenge} from "./StriimChallenge.sol";
import {SafeMathInt} from "./SafeMathInt.sol";
import {DriipSettlementChallenger} from "./DriipSettlementChallenger.sol";
import {MonetaryTypes} from "./StriimTypes.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title DriipSettlementChallenge
@notice Where driip settlements are challenged
*/
contract DriipSettlementChallenge is Ownable, StriimChallenge, Validatable {
    using SafeMathInt for int256;

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    enum ChallengeCandidateType {None, Order, Trade, Payment}

    struct OptionalFigure {
        int256 amount;
        MonetaryTypes.Currency currency;
        bool set;
    }

    struct Challenge {
        uint256 nonce;
        uint256 timeout;
        StriimTypes.ChallengeStatus status;

        // Driip info
        StriimTypes.DriipType driipType;
        uint256 driipIndex;

        // Balances after amounts have been staged
        OptionalFigure intendedTargetBalance;
        OptionalFigure conjugateTargetBalance;

        // Candidate info updated when calling any of the challenge functions
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
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTrade(StriimTypes.Trade trade, address wallet, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    public
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(configuration != address(0));
        require(intendedStageAmount.isPositiveInt256());
        require(conjugateStageAmount.isPositiveInt256());

        if (msg.sender != owner)
            wallet = msg.sender;

        require(isOwner() || StriimTypes.isTradeParty(trade, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        (int256 intendedBalanceAmount, int256 conjugateBalanceAmount) =
        (StriimTypes.isTradeBuyer(trade, wallet) ?
        (trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current) :
        (trade.seller.balances.intended.current, trade.seller.balances.conjugate.current));

        require(intendedBalanceAmount >= intendedStageAmount);
        require(conjugateBalanceAmount >= conjugateStageAmount);

        pushMemoryTradeToStorageArray(trade, walletChallengedTradesMap[wallet]);

        OptionalFigure memory intendedTargetBalance = OptionalFigure(intendedBalanceAmount - intendedStageAmount, trade.currencies.intended, true);
        OptionalFigure memory conjugateTargetBalance = OptionalFigure(conjugateBalanceAmount - conjugateStageAmount, trade.currencies.conjugate, true);

        Challenge memory challenge;
        challenge.nonce = trade.nonce;
        challenge.timeout = block.timestamp + configuration.getDriipSettlementChallengeTimeout();
        challenge.status = StriimTypes.ChallengeStatus.Qualified;
        challenge.driipType = StriimTypes.DriipType.Trade;
        challenge.driipIndex = walletChallengedTradesMap[wallet].length - 1;
        challenge.intendedTargetBalance = intendedTargetBalance;
        challenge.conjugateTargetBalance = conjugateTargetBalance;

        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromTradeEvent(trade, wallet);
    }

    /// @notice Start driip settlement challenge on driip of payment type
    /// @param payment The challenged driip
    /// @param wallet The relevant driip party
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPayment(StriimTypes.Payment payment, address wallet, int256 stageAmount)
    public
    validatorInitialized
    onlySealedPayment(payment)
    {
        require(configuration != address(0));
        require(stageAmount.isPositiveInt256());

        if (msg.sender != owner)
            wallet = msg.sender;

        require(isOwner() || StriimTypes.isPaymentParty(payment, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce || block.timestamp >= walletChallengeMap[wallet].timeout
        );

        int256 balanceAmount = (StriimTypes.isPaymentSender(payment, wallet) ?
        payment.sender.balances.current :
        payment.recipient.balances.current);

        require(balanceAmount >= stageAmount);

        pushMemoryPaymentToStorageArray(payment, walletChallengedPaymentsMap[wallet]);

        OptionalFigure memory targetBalance = OptionalFigure(balanceAmount - stageAmount, payment.currency, true);

        Challenge memory challenge;
        challenge.nonce = payment.nonce;
        challenge.timeout = block.timestamp + configuration.getDriipSettlementChallengeTimeout();
        challenge.status = StriimTypes.ChallengeStatus.Qualified;
        challenge.driipType = StriimTypes.DriipType.Payment;
        challenge.driipIndex = walletChallengedPaymentsMap[wallet].length - 1;
        challenge.intendedTargetBalance = targetBalance;

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
    function driipSettlementChallengeResult(address wallet, uint256 nonce) public view returns (StriimTypes.ChallengeStatus, address) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if ((0 == walletChallengeMap[wallet].nonce) ||
            (nonce != walletChallengeMap[wallet].nonce))
            return (StriimTypes.ChallengeStatus.Unknown, address(0));
        else
            return (walletChallengeMap[wallet].status, walletChallengeMap[wallet].challenger);
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
        walletChallengeMap[wallet].status = StriimTypes.ChallengeStatus.Qualified;
        walletChallengeMap[wallet].candidateType = DriipSettlementChallenge.ChallengeCandidateType.None;
        walletChallengeMap[wallet].candidateIndex = 0;
        walletChallengeMap[wallet].challenger = address(0);
    }

    function pushChallengeCandidateOrder(StriimTypes.Order order) public onlyDriipSettlementChallenger {
        challengeCandidateOrders.push(order);
    }

    function getChallengeCandidateOrdersLength() public view onlyDriipSettlementChallenger returns (uint256) {
        return challengeCandidateOrders.length;
    }

    function pushChallengeCandidateTrade(StriimTypes.Trade trade) public onlyDriipSettlementChallenger {
        pushMemoryTradeToStorageArray(trade, challengeCandidateTrades);
    }

    function getChallengeCandidateTradesLength() public view onlyDriipSettlementChallenger returns (uint256) {
        return challengeCandidateTrades.length;
    }

    function pushChallengeCandidatePayment(StriimTypes.Payment payment) public onlyDriipSettlementChallenger {
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
