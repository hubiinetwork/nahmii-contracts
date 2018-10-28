/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {CancelOrdersChallengable} from "./CancelOrdersChallengable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";
import {DriipSettlementTypes} from "./DriipSettlementTypes.sol";
import {DriipSettlementChallenge} from "./DriipSettlementChallenge.sol";

/**
@title DriipSettlementDispute
@notice The workhorse of driip settlement challenges, utilized by DriipSettlementChallenge
*/
contract DriipSettlementDispute is Ownable, Configurable, Validatable, SecurityBondable, FraudChallengable, CancelOrdersChallengable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementChallenge public driipSettlementChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeDriipSettlementChallengeEvent(DriipSettlementChallenge oldDriipSettlementChallenge, DriipSettlementChallenge newDriipSettlementChallenge);
    event ChallengeByOrderEvent(NahmiiTypes.Order order, uint256 nonce, NahmiiTypes.DriipType driipType, address reporter);
    event ChallengeByTradeEvent(NahmiiTypes.Trade trade, address wallet, uint256 nonce, NahmiiTypes.DriipType driipType, address reporter);
    event ChallengeByPaymentEvent(NahmiiTypes.Payment payment, address wallet, uint256 nonce, NahmiiTypes.DriipType driipType, address reporter);
    event UnchallengeOrderCandidateByTradeEvent(NahmiiTypes.Order order, NahmiiTypes.Trade trade, uint256 nonce, NahmiiTypes.DriipType driipType, address reporter);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    /// @notice Change the driip settlement challenge contract
    /// @param newDriipSettlementChallenge The (address of) DriipSettlementChallenge contract instance
    function changeDriipSettlementChallenge(DriipSettlementChallenge newDriipSettlementChallenge) public
    onlyDeployer
    notNullAddress(newDriipSettlementChallenge)
    {
        DriipSettlementChallenge oldDriipSettlementChallenge = driipSettlementChallenge;
        driipSettlementChallenge = newDriipSettlementChallenge;
        emit ChangeDriipSettlementChallengeEvent(oldDriipSettlementChallenge, driipSettlementChallenge);
    }

    /// @notice Challenge the driip settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    /// @dev If (candidate) order has buy intention consider _conjugate_ currency and amount, else
    /// if (candidate) order has sell intention consider _intended_ currency and amount
    function challengeByOrder(NahmiiTypes.Order order, address challenger) public
    validatorInitialized
    fraudChallengeInitialized
    cancelOrdersChallengeInitialized
    driipSettlementChallengeInitialized
    onlyDriipSettlementChallenge
    onlySealedOrder(order)
    {
        // Require that order candidate is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderOperatorHash(order.seals.exchange.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.exchange.hash));

        // Get challenge and require that it is ongoing
        DriipSettlementTypes.Challenge memory challenge = driipSettlementChallenge.walletChallenge(order.wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        (int256 orderAmount, MonetaryTypes.Currency memory orderCurrency) =
        (NahmiiTypes.Intention.Sell == order.placement.intention ?
        (order.placement.amount, order.placement.currencies.intended) :
        (order.placement.amount.div(order.placement.rate), order.placement.currencies.conjugate));

        // Get challenge target balance (balance - amount to be staged) and require that order
        // candidate has relevant currency
        int256 targetBalance = getChallengeTargetBalanceAmount(challenge, orderCurrency);
        require(targetBalance.isPositiveInt256());

        // Require that order amount is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(orderAmount > targetBalance);

        // Store order candidate
        driipSettlementChallenge.pushChallengeCandidateOrder(order);

        // Update challenge
        challenge.timeout = block.timestamp.add(configuration.settlementChallengeTimeout());
        challenge.status = DriipSettlementTypes.ChallengeStatus.Disqualified;
        challenge.candidateType = DriipSettlementTypes.ChallengeCandidateType.Order;
        challenge.candidateIndex = driipSettlementChallenge.challengeCandidateOrdersCount().sub(1);
        challenge.challenger = challenger;

        // Update stored challenge
        driipSettlementChallenge.setWalletChallenge(order.wallet, challenge);

        // Raise event
        emit ChallengeByOrderEvent(order, challenge.nonce, challenge.driipType, challenger);
    }

    /// @notice Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    /// @param unchallenger The address of the unchallenger
    function unchallengeOrderCandidateByTrade(NahmiiTypes.Order order, NahmiiTypes.Trade trade, address unchallenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    configurationInitialized
    securityBondInitialized
    driipSettlementChallengeInitialized
    onlyDriipSettlementChallenge
    onlySealedOrder(order)
    onlySealedTrade(trade)
    onlyTradeParty(trade, order.wallet)
    onlyTradeOrder(trade, order)
    {
        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderOperatorHash(trade.buyer.wallet == order.wallet ?
            trade.buyer.order.hashes.exchange :
            trade.seller.order.hashes.exchange));

        // Remove the order candidate from the ongoing challenge
        DriipSettlementTypes.Challenge memory challenge = unchallengeOrderCandidate(order, trade, unchallenger);

        // Raise event
        emit UnchallengeOrderCandidateByTradeEvent(order, trade, challenge.nonce, challenge.driipType, unchallenger);
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    /// @dev If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else
    /// if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade
    function challengeByTrade(NahmiiTypes.Trade trade, address wallet, address challenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    cancelOrdersChallengeInitialized
    driipSettlementChallengeInitialized
    onlyDriipSettlementChallenge
    onlySealedTrade(trade)
    onlyTradeParty(trade, wallet)
    {
        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent or cancelled
        bytes32 orderOperatorHash = (trade.buyer.wallet == wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange);
        require(!fraudChallenge.isFraudulentOrderOperatorHash(orderOperatorHash));
        require(!cancelOrdersChallenge.isOrderCancelled(wallet, orderOperatorHash));

        // Get challenge and require that it is ongoing
        DriipSettlementTypes.Challenge memory challenge = driipSettlementChallenge.walletChallenge(wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        NahmiiTypes.TradePartyRole tradePartyRole =
        (trade.buyer.wallet == wallet ?
        NahmiiTypes.TradePartyRole.Buyer :
        NahmiiTypes.TradePartyRole.Seller);
        (int256 singleTransfer, MonetaryTypes.Currency memory transferCurrency) =
        (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ?
        (trade.transfers.conjugate.single.abs(), trade.currencies.conjugate) :
        (trade.transfers.intended.single.abs(), trade.currencies.intended));

        // Get challenge target balance (balance - amount to be staged) and require that trade 
        // candidate has relevant currency
        int256 targetBalance = getChallengeTargetBalanceAmount(challenge, transferCurrency);
        require(targetBalance.isPositiveInt256());

        // Require that single transfer is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(singleTransfer.abs() > targetBalance);

        // Store trade candidate
        driipSettlementChallenge.pushChallengeCandidateTrade(trade);

        // Update challenge
        challenge.status = DriipSettlementTypes.ChallengeStatus.Disqualified;
        challenge.candidateType = DriipSettlementTypes.ChallengeCandidateType.Trade;
        challenge.candidateIndex = driipSettlementChallenge.challengeCandidateTradesCount().sub(1);
        challenge.challenger = challenger;

        // Update stored challenge
        driipSettlementChallenge.setWalletChallenge(wallet, challenge);

        // Raise event
        emit ChallengeByTradeEvent(trade, wallet, challenge.nonce, challenge.driipType, challenger);
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    /// @dev If wallet is recipient in (candidate) payment there is nothing here to challenge
    function challengeByPayment(NahmiiTypes.Payment payment, address wallet, address challenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    onlyDriipSettlementChallenge
    onlySealedPayment(payment)
    onlyPaymentSender(payment, wallet)
    {
        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentOperatorHash(payment.seals.exchange.hash));

        // Get challenge and require that it is ongoing
        DriipSettlementTypes.Challenge memory challenge = driipSettlementChallenge.walletChallenge(wallet);
        require(
            0 < challenge.nonce && block.timestamp < challenge.timeout
        );

        // Get challenge target balance (balance - amount to be staged) and require that payment 
        // candidate has relevant currency
        int256 targetBalance = getChallengeTargetBalanceAmount(challenge, payment.currency);
        require(targetBalance.isPositiveInt256());

        // Require that single transfer is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(payment.transfers.single.abs() > targetBalance);

        // Store payment candidate
        driipSettlementChallenge.pushChallengeCandidatePayment(payment);

        // Update challenge
        challenge.status = DriipSettlementTypes.ChallengeStatus.Disqualified;
        challenge.candidateType = DriipSettlementTypes.ChallengeCandidateType.Payment;
        challenge.candidateIndex = driipSettlementChallenge.challengeCandidatePaymentsCount().sub(1);
        challenge.challenger = challenger;

        // Update stored challenge
        driipSettlementChallenge.setWalletChallenge(wallet, challenge);

        // Raise event
        emit ChallengeByPaymentEvent(payment, wallet, challenge.nonce, challenge.driipType, challenger);
    }

    /// @notice Get target balance amount of challenge
    /// @dev If not found in challenge return -1
    function getChallengeTargetBalanceAmount(DriipSettlementTypes.Challenge challenge,
        MonetaryTypes.Currency currency)
    private
    pure
    returns (int256)
    {
        int256 amount = - 1;
        if (challenge.intendedTargetBalance.set &&
        currency.ct == challenge.intendedTargetBalance.figure.currency.ct &&
        currency.id == challenge.intendedTargetBalance.figure.currency.id)
            amount = challenge.intendedTargetBalance.figure.amount;
        else if (challenge.conjugateTargetBalance.set &&
        currency.ct == challenge.conjugateTargetBalance.figure.currency.ct &&
        currency.id == challenge.conjugateTargetBalance.figure.currency.id)
            amount = challenge.conjugateTargetBalance.figure.amount;
        return amount;
    }

    /// @notice Step in unchallenge of driip settlement challenge by order
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    /// @param challenger The wallet that challenges
    function unchallengeOrderCandidate(NahmiiTypes.Order order, NahmiiTypes.Trade trade, address challenger)
    private
    returns (DriipSettlementTypes.Challenge)
    {
        // Get challenge and require that it is ongoing and that its candidate type is order
        DriipSettlementTypes.Challenge memory challenge = driipSettlementChallenge.walletChallenge(order.wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );
        require(challenge.candidateType == DriipSettlementTypes.ChallengeCandidateType.Order);

        // Get challenge and require that its operator hash matches the one of order
        NahmiiTypes.Order memory challengeOrder = driipSettlementChallenge.challengeCandidateOrder(challenge.candidateIndex);
        require(challengeOrder.seals.exchange.hash == order.seals.exchange.hash);

        // Require that challenge order's operator hash matches any or the operator hash of any of the trade
        // orders for this to be a valid unchallenge call
        require(challengeOrder.seals.exchange.hash == (trade.buyer.wallet == order.wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange));

        // Reset the challenge outcome
        driipSettlementChallenge.resetWalletChallenge(order.wallet);

        // Obtain stake and stage it in SecurityBond
        (int256 stakeAmount, address stakeCurrencyCt, uint256 stakeCurrencyId) = configuration.getUnchallengeOrderCandidateByTradeStake();
        securityBond.stage(challenger, stakeAmount, stakeCurrencyCt, stakeCurrencyId);

        return challenge;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyTradeOrder(NahmiiTypes.Trade trade, NahmiiTypes.Order order) {
        require(validator.isTradeOrder(trade, order));
        _;
    }

    modifier driipSettlementChallengeInitialized() {
        require(driipSettlementChallenge != address(0));
        _;
    }

    modifier onlyDriipSettlementChallenge() {
        require(msg.sender == address(driipSettlementChallenge));
        _;
    }
}