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
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";
import {SettlementTypes} from "./SettlementTypes.sol";
import {FraudChallenge} from "./FraudChallenge.sol";
import {CancelOrdersChallenge} from "./CancelOrdersChallenge.sol";
import {NullSettlementChallenge} from "./NullSettlementChallenge.sol";

/**
@title NullSettlementDispute
@notice The workhorse of null settlement challenges, utilized by NullSettlementChallenge
*/
contract NullSettlementDispute is Ownable, Configurable, Validatable, SecurityBondable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallenge public nullSettlementChallenge;
    FraudChallenge public fraudChallenge;
    CancelOrdersChallenge public cancelOrdersChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeNullSettlementChallengeEvent(NullSettlementChallenge oldNullSettlementChallenge, NullSettlementChallenge newNullSettlementChallenge);
    event ChangeFraudChallengeEvent(FraudChallenge oldFraudChallenge, FraudChallenge newFraudChallenge);
    event ChangeCancelOrdersChallengeEvent(CancelOrdersChallenge oldCancelOrdersChallenge, CancelOrdersChallenge newCancelOrdersChallenge);
    event ChallengeByOrderEvent(NahmiiTypes.Order order, uint256 nonce, NahmiiTypes.DriipType driipType, address reporter);
    //    event ChallengeByTradeEvent(NahmiiTypes.Trade trade, address wallet, uint256 nonce, NahmiiTypes.DriipType driipType, address reporter);
    //    event ChallengeByPaymentEvent(NahmiiTypes.Payment payment, address wallet, uint256 nonce, NahmiiTypes.DriipType driipType, address reporter);
    //    event UnchallengeOrderCandidateByTradeEvent(NahmiiTypes.Order order, NahmiiTypes.Trade trade, uint256 nonce, NahmiiTypes.DriipType driipType, address reporter);
    //
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    /// @notice Change the null settlement challenge contract
    /// @param newNullSettlementChallenge The (address of) NullSettlementChallenge contract instance
    function changeNullSettlementChallenge(NullSettlementChallenge newNullSettlementChallenge) public
    onlyDeployer
    notNullAddress(newNullSettlementChallenge)
    {
        NullSettlementChallenge oldNullSettlementChallenge = nullSettlementChallenge;
        nullSettlementChallenge = newNullSettlementChallenge;
        emit ChangeNullSettlementChallengeEvent(oldNullSettlementChallenge, nullSettlementChallenge);
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
    function challengeByOrder(NahmiiTypes.Order order, address challenger) public
    validatorInitialized
    onlyNullSettlementChallenge
    onlySealedOrder(order)
    {
        require(nullSettlementChallenge != address(0));
        require(fraudChallenge != address(0));
        require(cancelOrdersChallenge != address(0));

        // Require that order candidate is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderExchangeHash(order.seals.exchange.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.exchange.hash));

        // Get settlement proposal nonce and timeout and require that it is ongoing
        require(
            0 < nullSettlementChallenge.proposalNonce(order.wallet) &&
            block.timestamp < nullSettlementChallenge.proposalTimeout(order.wallet)
        );

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        (int256 orderAmount, MonetaryTypes.Currency memory orderCurrency) =
        (NahmiiTypes.Intention.Sell == order.placement.intention ?
        (order.placement.amount, order.placement.currencies.intended) :
        (order.placement.amount.div(order.placement.rate), order.placement.currencies.conjugate));

        // Get challenge target balance (balance - amount to be staged) and require that order
        // candidate has relevant currency
        int256 targetBalanceAmount = nullSettlementChallenge.proposalTargetBalanceAmount(order.wallet, orderCurrency.ct, orderCurrency.id);
        require(targetBalanceAmount.isPositiveInt256());

        // Require that order amount is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(orderAmount > targetBalanceAmount);

        // Store order candidate
        nullSettlementChallenge.pushChallengeCandidateOrder(order);

        // Update settlement proposal
        nullSettlementChallenge.setProposalTimeout(order.wallet, block.timestamp.add(configuration.settlementChallengeTimeout()));
        nullSettlementChallenge.setProposalStatus(order.wallet, SettlementTypes.ChallengeStatus.Disqualified);
        nullSettlementChallenge.setProposalCandidateType(order.wallet, SettlementTypes.ChallengeCandidateType.Order);
        nullSettlementChallenge.setProposalCandidateIndex(order.wallet, nullSettlementChallenge.challengeCandidateOrdersCount() - 1);
        nullSettlementChallenge.setProposalChallenger(order.wallet, challenger);

        // Raise event
        emit ChallengeByOrderEvent(
            order, nullSettlementChallenge.proposalNonce(order.wallet), nullSettlementChallenge.proposalDriipType(order.wallet), challenger
        );
    }

    /// @notice Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    /// @param unchallenger The address of the unchallenger
    function unchallengeOrderCandidateByTrade(NahmiiTypes.Order order, NahmiiTypes.Trade trade, address unchallenger)
    public
        //    validatorInitialized
        //    onlyNullSettlementChallenge
        //    onlySealedOrder(order)
        //    onlySealedTrade(trade)
        //    onlyTradeParty(trade, order.wallet)
        //    onlyTradeOrder(trade, order)
    {
        //        require(nullSettlementChallenge != address(0));
        //        require(fraudChallenge != address(0));
        //        require(configuration != address(0));
        //        require(securityBond != address(0));
        //
        //        // Require that trade candidate is not labelled fraudulent
        //        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));
        //
        //        // Require that trade candidate's order is not labelled fraudulent or cancelled
        //        require(!fraudChallenge.isFraudulentOrderExchangeHash(trade.buyer.wallet == order.wallet ?
        //            trade.buyer.order.hashes.exchange :
        //            trade.seller.order.hashes.exchange));
        //
        //        // Remove the order candidate from the ongoing challenge
        //        SettlementTypes.Proposal memory challenge = unchallengeOrderCandidate(order, trade, unchallenger);
        //
        //        // Raise event
        //        emit UnchallengeOrderCandidateByTradeEvent(order, trade, challenge.nonce, challenge.driipType, unchallenger);
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    /// @dev If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else
    /// if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade
    function challengeByTrade(NahmiiTypes.Trade trade, address wallet, address challenger)
    public
        //    validatorInitialized
        //    onlyNullSettlementChallenge
        //    onlySealedTrade(trade)
        //    onlyTradeParty(trade, wallet)
    {
        //        require(nullSettlementChallenge != address(0));
        //        require(fraudChallenge != address(0));
        //        require(cancelOrdersChallenge != address(0));
        //
        //        // Require that trade candidate is not labelled fraudulent
        //        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));
        //
        //        // Require that trade candidate's order is not labelled fraudulent or cancelled
        //        bytes32 orderExchangeHash = (trade.buyer.wallet == wallet ?
        //        trade.buyer.order.hashes.exchange :
        //        trade.seller.order.hashes.exchange);
        //        require(!fraudChallenge.isFraudulentOrderExchangeHash(orderExchangeHash));
        //        require(!cancelOrdersChallenge.isOrderCancelled(wallet, orderExchangeHash));
        //
        //        // Get challenge and require that it is ongoing
        //        SettlementTypes.Proposal memory challenge = nullSettlementChallenge.walletChallenge(wallet);
        //        require(
        //            0 < challenge.nonce
        //            && block.timestamp < challenge.timeout
        //        );
        //
        //        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        //        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        //        NahmiiTypes.TradePartyRole tradePartyRole =
        //        (trade.buyer.wallet == wallet ?
        //        NahmiiTypes.TradePartyRole.Buyer :
        //        NahmiiTypes.TradePartyRole.Seller);
        //        (int256 singleTransfer, MonetaryTypes.Currency memory transferCurrency) =
        //        (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ?
        //        (trade.transfers.conjugate.single.abs(), trade.currencies.conjugate) :
        //        (trade.transfers.intended.single.abs(), trade.currencies.intended));
        //
        //        // Get challenge target balance (balance - amount to be staged) and require that trade
        //        // candidate has relevant currency
        //        int256 targetBalance = getProposalTargetBalanceAmount(challenge, transferCurrency);
        //        require(targetBalance.isPositiveInt256());
        //
        //        // Require that single transfer is strictly greater than target balance amount for this to be a
        //        // valid challenge call
        //        require(singleTransfer.abs() > targetBalance);
        //
        //        // Store trade candidate
        //        nullSettlementChallenge.pushChallengeCandidateTrade(trade);
        //
        //        // Update challenge
        //        challenge.status = DriipSettlementTypes.ChallengeStatus.Disqualified;
        //        challenge.candidateType = DriipSettlementTypes.ChallengeCandidateType.Trade;
        //        challenge.candidateIndex = nullSettlementChallenge.challengeCandidateTradesCount() - 1;
        //        challenge.challenger = challenger;
        //
        //        // Update stored challenge
        //        nullSettlementChallenge.setWalletChallenge(wallet, challenge);
        //
        //        // Raise event
        //        emit ChallengeByTradeEvent(trade, wallet, challenge.nonce, challenge.driipType, challenger);
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    /// @dev If wallet is recipient in (candidate) payment there is nothing here to challenge
    function challengeByPayment(NahmiiTypes.Payment payment, address wallet, address challenger)
    public
        //    validatorInitialized
        //    onlyNullSettlementChallenge
        //    onlySealedPayment(payment)
        //    onlyPaymentSender(payment, wallet)
    {
        //        require(nullSettlementChallenge != address(0));
        //        require(fraudChallenge != address(0));
        //
        //        // Require that payment candidate is not labelled fraudulent
        //        require(!fraudChallenge.isFraudulentPaymentExchangeHash(payment.seals.exchange.hash));
        //
        //        // Get challenge and require that it is ongoing
        //        SettlementTypes.Proposal memory challenge = nullSettlementChallenge.walletChallenge(wallet);
        //        require(
        //            0 < challenge.nonce && block.timestamp < challenge.timeout
        //        );
        //
        //        // Get challenge target balance (balance - amount to be staged) and require that payment
        //        // candidate has relevant currency
        //        int256 targetBalance = getProposalTargetBalanceAmount(challenge, payment.currency);
        //        require(targetBalance.isPositiveInt256());
        //
        //        // Require that single transfer is strictly greater than target balance amount for this to be a
        //        // valid challenge call
        //        require(payment.transfers.single.abs() > targetBalance);
        //
        //        // Store payment candidate
        //        nullSettlementChallenge.pushChallengeCandidatePayment(payment);
        //
        //        // Update challenge
        //        challenge.status = DriipSettlementTypes.ChallengeStatus.Disqualified;
        //        challenge.candidateType = DriipSettlementTypes.ChallengeCandidateType.Payment;
        //        challenge.candidateIndex = nullSettlementChallenge.challengeCandidatePaymentsCount() - 1;
        //        challenge.challenger = challenger;
        //
        //        // Update stored challenge
        //        nullSettlementChallenge.setWalletChallenge(wallet, challenge);
        //
        //        // Raise event
        //        emit ChallengeByPaymentEvent(payment, wallet, challenge.nonce, challenge.driipType, challenger);
    }

    /// @notice Get target balance amount of challenge
    /// @dev If not found in challenge return -1
    //    function getProposalTargetBalanceAmount(SettlementTypes.Proposal proposal,
    //        MonetaryTypes.Currency currency)
    //    private
    //    pure
    //    returns (int256)
    //    {
    //        int256 amount = - 1;
    //        if (proposal.intendedTargetBalance.set &&
    //        currency.ct == proposal.intendedTargetBalance.figure.currency.ct &&
    //        currency.id == proposal.intendedTargetBalance.figure.currency.id)
    //            amount = proposal.intendedTargetBalance.figure.amount;
    //        else if (proposal.conjugateTargetBalance.set &&
    //        currency.ct == proposal.conjugateTargetBalance.figure.currency.ct &&
    //        currency.id == proposal.conjugateTargetBalance.figure.currency.id)
    //            amount = proposal.conjugateTargetBalance.figure.amount;
    //        return amount;
    //    }

    //    /// @notice Step in unchallenge of driip settlement challenge by order
    //    /// @param order The order candidate that challenged driip
    //    /// @param trade The trade in which order has been filled
    //    /// @param challenger The wallet that challenges
    //    function unchallengeOrderCandidate(NahmiiTypes.Order order, NahmiiTypes.Trade trade, address challenger)
    //    private
    //    returns (SettlementTypes.Proposal)
    //    {
    //        // Get challenge and require that it is ongoing and that its candidate type is order
    //        SettlementTypes.Proposal memory challenge = nullSettlementChallenge.walletChallenge(order.wallet);
    //        require(
    //            0 < challenge.nonce
    //            && block.timestamp < challenge.timeout
    //        );
    //        require(challenge.candidateType == DriipSettlementTypes.ChallengeCandidateType.Order);
    //
    //        // Get challenge and require that its exchange has matches the one of order
    //        NahmiiTypes.Order memory challengeOrder = nullSettlementChallenge.challengeCandidateOrders(challenge.candidateIndex);
    //        require(challengeOrder.seals.exchange.hash == order.seals.exchange.hash);
    //
    //        // Require that challenge order's exchange hash matches any or the exchange hash of any of the trade
    //        // orders for this to be a valid unchallenge call
    //        require(challengeOrder.seals.exchange.hash == (trade.buyer.wallet == order.wallet ?
    //        trade.buyer.order.hashes.exchange :
    //        trade.seller.order.hashes.exchange));
    //
    //        // Reset the challenge outcome
    //        nullSettlementChallenge.resetWalletChallenge(order.wallet);
    //
    //        // Obtain stake and stage it in SecurityBond
    //        (int256 stakeAmount, address stakeCurrencyCt, uint256 stakeCurrencyId) = configuration.getUnchallengeOrderCandidateByTradeStake();
    //        securityBond.stage(challenger, stakeAmount, stakeCurrencyCt, stakeCurrencyId);
    //
    //        return challenge;
    //    }
    //
    //    //
    //    // Modifiers
    //    // -----------------------------------------------------------------------------------------------------------------
    //    modifier onlyTradeParty(NahmiiTypes.Trade trade, address wallet) {
    //        require(NahmiiTypes.isTradeParty(trade, wallet));
    //        _;
    //    }
    //
    //    modifier onlyTradeOrder(NahmiiTypes.Trade trade, NahmiiTypes.Order order) {
    //        require(NahmiiTypes.isTradeOrder(trade, order));
    //        _;
    //    }
    //
    //    modifier onlyPaymentSender(NahmiiTypes.Payment payment, address wallet) {
    //        require(NahmiiTypes.isPaymentSender(payment, wallet));
    //        _;
    //    }

    modifier onlyNullSettlementChallenge() {
        require(msg.sender == address(nullSettlementChallenge));
        _;
    }
}