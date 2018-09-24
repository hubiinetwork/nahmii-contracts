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
import {AccesorManageable} from "./AccesorManageable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {SafeMathInt} from "./SafeMathInt.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {StriimTypes} from "./StriimTypes.sol";
import {DriipSettlementTypes} from "./DriipSettlementTypes.sol";
import {FraudChallenge} from "./FraudChallenge.sol";
import {CancelOrdersChallenge} from "./CancelOrdersChallenge.sol";
import {DriipSettlementChallenge} from "./DriipSettlementChallenge.sol";

/**
@title DriipSettlementDispute
@notice The workhorse of driip settlement challenges, utilized by DriipSettlementChallenge
*/
contract DriipSettlementDispute is Ownable, AccesorManageable, Configurable, Validatable, SecurityBondable {
    using SafeMathInt for int256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementChallenge public driipSettlementChallenge;
    FraudChallenge public fraudChallenge;
    CancelOrdersChallenge public cancelOrdersChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeDriipSettlementChallengeEvent(DriipSettlementChallenge oldDriipSettlementChallenge, DriipSettlementChallenge newDriipSettlementChallenge);
    event ChangeFraudChallengeEvent(FraudChallenge oldFraudChallenge, FraudChallenge newFraudChallenge);
    event ChangeCancelOrdersChallengeEvent(CancelOrdersChallenge oldCancelOrdersChallenge, CancelOrdersChallenge newCancelOrdersChallenge);
    event ChallengeByOrderEvent(StriimTypes.Order order, uint256 nonce, StriimTypes.DriipType driipType, address reporter);
    event ChallengeByTradeEvent(StriimTypes.Trade trade, address wallet, uint256 nonce, StriimTypes.DriipType driipType, address reporter);
    event ChallengeByPaymentEvent(StriimTypes.Payment payment, address wallet, uint256 nonce, StriimTypes.DriipType driipType, address reporter);
    event UnchallengeOrderCandidateByTradeEvent(StriimTypes.Order order, StriimTypes.Trade trade, uint256 nonce, StriimTypes.DriipType driipType, address reporter);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccesorManageable(accessorManager) public {
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

    /// @notice Change the fraud challenge contract
    /// @param newFraudChallenge The (address of) FraudChallenge contract instance
    function changeFraudChallenge(FraudChallenge newFraudChallenge) public
        onlyDeployer
        notNullAddress(newFraudChallenge)
    {
        FraudChallenge oldFraudChallenge = fraudChallenge;
        fraudChallenge = newFraudChallenge;
        emit ChangeFraudChallengeEvent(oldFraudChallenge, fraudChallenge);
    }

    /// @notice Change the cancel orders challenge contract
    /// @param newCancelOrdersChallenge The (address of) CancelOrdersChallenge contract instance
    function changeCancelOrdersChallenge(CancelOrdersChallenge newCancelOrdersChallenge) public
        onlyDeployer
        notNullAddress(newCancelOrdersChallenge)
    {
        CancelOrdersChallenge oldCancelOrdersChallenge = cancelOrdersChallenge;
        cancelOrdersChallenge = newCancelOrdersChallenge;
        emit ChangeCancelOrdersChallengeEvent(oldCancelOrdersChallenge, cancelOrdersChallenge);
    }

    /// @notice Challenge the driip settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    /// @dev If (candidate) order has buy intention consider _conjugate_ currency and amount, else
    /// if (candidate) order has sell intention consider _intended_ currency and amount
    function challengeByOrder(StriimTypes.Order order, address challenger) public
        validatorInitialized
        onlyDriipSettlementChallenge
        onlySealedOrder(order)
    {
        require(driipSettlementChallenge != address(0));
        require(fraudChallenge != address(0));
        require(cancelOrdersChallenge != address(0));

        // Require that order candidate is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderExchangeHash(order.seals.exchange.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.exchange.hash));

        // Get challenge and require that it is ongoing
        DriipSettlementTypes.Challenge memory challenge = driipSettlementChallenge.getWalletChallenge(order.wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        (int256 orderAmount, MonetaryTypes.Currency memory orderCurrency) =
        (StriimTypes.Intention.Sell == order.placement.intention ?
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
        challenge.timeout = block.timestamp + configuration.getDriipSettlementChallengeTimeout();
        challenge.status = DriipSettlementTypes.ChallengeStatus.Disqualified;
        challenge.candidateType = DriipSettlementTypes.ChallengeCandidateType.Order;
        challenge.candidateIndex = driipSettlementChallenge.getChallengeCandidateOrdersLength() - 1;
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
    function unchallengeOrderCandidateByTrade(StriimTypes.Order order, StriimTypes.Trade trade, address unchallenger)
    public
    validatorInitialized
    onlyDriipSettlementChallenge
    onlySealedOrder(order)
    onlySealedTrade(trade)
    onlyTradeParty(trade, order.wallet)
    onlyTradeOrder(trade, order)
    {
        require(driipSettlementChallenge != address(0));
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(securityBond != address(0));

        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderExchangeHash(trade.buyer.wallet == order.wallet ?
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
    function challengeByTrade(StriimTypes.Trade trade, address wallet, address challenger)
    public
    validatorInitialized
    onlyDriipSettlementChallenge
    onlySealedTrade(trade)
    onlyTradeParty(trade, wallet)
    {
        require(driipSettlementChallenge != address(0));
        require(fraudChallenge != address(0));
        require(cancelOrdersChallenge != address(0));

        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent or cancelled
        bytes32 orderExchangeHash = (trade.buyer.wallet == wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange);
        require(!fraudChallenge.isFraudulentOrderExchangeHash(orderExchangeHash));
        require(!cancelOrdersChallenge.isOrderCancelled(wallet, orderExchangeHash));

        // Get challenge and require that it is ongoing
        DriipSettlementTypes.Challenge memory challenge = driipSettlementChallenge.getWalletChallenge(wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        StriimTypes.TradePartyRole tradePartyRole =
        (trade.buyer.wallet == wallet ?
        StriimTypes.TradePartyRole.Buyer :
        StriimTypes.TradePartyRole.Seller);
        (int256 singleTransfer, MonetaryTypes.Currency memory transferCurrency) =
        (StriimTypes.TradePartyRole.Buyer == tradePartyRole ?
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
        challenge.candidateIndex = driipSettlementChallenge.getChallengeCandidateTradesLength() - 1;
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
    function challengeByPayment(StriimTypes.Payment payment, address wallet, address challenger)
    public
    validatorInitialized
    onlyDriipSettlementChallenge
    onlySealedPayment(payment)
    onlyPaymentSender(payment, wallet)
    {
        require(driipSettlementChallenge != address(0));
        require(fraudChallenge != address(0));

        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentExchangeHash(payment.seals.exchange.hash));

        // Get challenge and require that it is ongoing
        DriipSettlementTypes.Challenge memory challenge = driipSettlementChallenge.getWalletChallenge(wallet);
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
        challenge.candidateIndex = driipSettlementChallenge.getChallengeCandidatePaymentsLength() - 1;
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
        currency.ct == challenge.intendedTargetBalance.currency.ct &&
        currency.id == challenge.intendedTargetBalance.currency.id)
            amount = challenge.intendedTargetBalance.amount;
        else if (challenge.conjugateTargetBalance.set &&
        currency.ct == challenge.conjugateTargetBalance.currency.ct &&
        currency.id == challenge.conjugateTargetBalance.currency.id)
            amount = challenge.conjugateTargetBalance.amount;
        return amount;
    }

    /// @notice Step in unchallenge of driip settlement challenge by order
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    /// @param challenger The wallet that challenges
    function unchallengeOrderCandidate(StriimTypes.Order order, StriimTypes.Trade trade, address challenger)
    private
    returns (DriipSettlementTypes.Challenge)
    {
        // Get challenge and require that it is ongoing and that its candidate type is order
        DriipSettlementTypes.Challenge memory challenge = driipSettlementChallenge.getWalletChallenge(order.wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );
        require(challenge.candidateType == DriipSettlementTypes.ChallengeCandidateType.Order);

        // Get challenge and require that its exchange has matches the one of order
        StriimTypes.Order memory challengeOrder = driipSettlementChallenge.getChallengeCandidateOrder(challenge.candidateIndex);
        require(challengeOrder.seals.exchange.hash == order.seals.exchange.hash);

        // Require that challenge order's exchange hash matches any or the exchange hash of any of the trade
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
    modifier onlyTradeParty(StriimTypes.Trade trade, address wallet) {
        require(StriimTypes.isTradeParty(trade, wallet));
        _;
    }

    modifier onlyTradeOrder(StriimTypes.Trade trade, StriimTypes.Order order) {
        require(StriimTypes.isTradeOrder(trade, order));
        _;
    }

    modifier onlyPaymentSender(StriimTypes.Payment payment, address wallet) {
        require(StriimTypes.isPaymentSender(payment, wallet));
        _;
    }

    modifier signedBy(bytes32 hash, StriimTypes.Signature signature, address signer) {
        require(StriimTypes.isGenuineSignature(hash, signature, signer));
        _;
    }

    modifier onlyDriipSettlementChallenge() {
        require(msg.sender == address(driipSettlementChallenge));
        _;
    }
}