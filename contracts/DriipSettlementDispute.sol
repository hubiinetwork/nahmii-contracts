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
import {SettlementTypes} from "./SettlementTypes.sol";
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
    event ChangeDriipSettlementChallengeEvent(DriipSettlementChallenge oldDriipSettlementChallenge,
        DriipSettlementChallenge newDriipSettlementChallenge);
    event ChallengeByOrderEvent(NahmiiTypes.Order order, uint256 nonce, NahmiiTypes.DriipType driipType,
        address challenger);
    event ChallengeByTradeEvent(address wallet, NahmiiTypes.Trade trade, uint256 nonce,
        NahmiiTypes.DriipType driipType, address challenger);
    event ChallengeByPaymentEvent(NahmiiTypes.Payment payment, uint256 nonce,
        NahmiiTypes.DriipType driipType, address challenger);
    event UnchallengeOrderCandidateByTradeEvent(NahmiiTypes.Order order, NahmiiTypes.Trade trade,
        uint256 nonce, NahmiiTypes.DriipType driipType, address challenger);

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
        // Require that settlement challenge is ongoing
        require(NahmiiTypes.ChallengePhase.Dispute == driipSettlementChallenge.challengePhase(order.wallet));

        // Require that settlement has not been challenged already
        require(SettlementTypes.ProposalStatus.Disqualified != driipSettlementChallenge.proposalStatus(order.wallet));

        // Require that order candidate is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderOperatorHash(order.seals.exchange.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.exchange.hash));

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        (int256 orderAmount, MonetaryTypes.Currency memory orderCurrency) =
        (NahmiiTypes.Intention.Sell == order.placement.intention ?
        (order.placement.amount, order.placement.currencies.intended) :
        (order.placement.amount.div(order.placement.rate), order.placement.currencies.conjugate));

        // Get challenge target balance (balance - amount to be staged) and require that order
        // candidate has relevant currency
        int256 targetBalanceAmount = driipSettlementChallenge.proposalTargetBalanceAmount(order.wallet, orderCurrency);

        // Require that order amount is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(orderAmount > targetBalanceAmount);

        // Store order candidate
        driipSettlementChallenge.pushChallengeCandidateOrder(order);

        // Update challenge proposal
        driipSettlementChallenge.setProposalTimeout(order.wallet, block.timestamp.add(configuration.settlementChallengeTimeout()));
        driipSettlementChallenge.setProposalStatus(order.wallet, SettlementTypes.ProposalStatus.Disqualified);
        driipSettlementChallenge.setProposalCandidateType(order.wallet, SettlementTypes.CandidateType.Order);
        driipSettlementChallenge.setProposalCandidateIndex(order.wallet, driipSettlementChallenge.challengeCandidateOrdersCount().sub(1));
        driipSettlementChallenge.setProposalChallenger(order.wallet, challenger);

        // Raise event
        emit ChallengeByOrderEvent(order, driipSettlementChallenge.proposalNonce(order.wallet),
            driipSettlementChallenge.proposalDriipType(order.wallet), challenger);
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
    {
        // Unchallenge order by trade
        unchallengeOrderCandidateByTradePrivate(order, trade, unchallenger);

        // Raise event
        emit UnchallengeOrderCandidateByTradeEvent(order, trade, driipSettlementChallenge.proposalNonce(order.wallet),
            driipSettlementChallenge.proposalDriipType(order.wallet), unchallenger);
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param wallet The wallet whose driip settlement is being challenged
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    /// @dev If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else
    /// if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade
    function challengeByTrade(address wallet, NahmiiTypes.Trade trade, address challenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    cancelOrdersChallengeInitialized
    driipSettlementChallengeInitialized
    onlyDriipSettlementChallenge
    onlySealedTrade(trade)
    onlyTradeParty(trade, wallet)
    {
        // Challenge by trade
        challengeByTradePrivate(wallet, trade, challenger);

        // Raise event
        emit ChallengeByTradeEvent(wallet, trade, driipSettlementChallenge.proposalNonce(wallet),
            driipSettlementChallenge.proposalDriipType(wallet), challenger);
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @dev This challenges the payment sender's side of things
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    function challengeByPayment(NahmiiTypes.Payment payment, address challenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    onlyDriipSettlementChallenge
    onlySealedPayment(payment)
    {
        // Require that settlement challenge is ongoing
        require(NahmiiTypes.ChallengePhase.Dispute == driipSettlementChallenge.challengePhase(payment.sender.wallet));

        // Require that settlement has not been challenged already
        require(SettlementTypes.ProposalStatus.Disqualified != driipSettlementChallenge.proposalStatus(payment.sender.wallet));

        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentOperatorHash(payment.seals.exchange.hash));

        // Require that payment's block number is not earlier than proposal's block number
        require(payment.blockNumber >= driipSettlementChallenge.proposalBlockNumber(payment.sender.wallet));

        // Get challenge target balance (balance - amount to be staged) and require that payment
        // candidate has relevant currency
        int256 targetBalanceAmount = driipSettlementChallenge.proposalTargetBalanceAmount(payment.sender.wallet, payment.currency);

        // Require that single transfer is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(payment.transfers.single.abs() > targetBalanceAmount);

        // Store payment candidate
        driipSettlementChallenge.pushChallengeCandidatePayment(payment);

        // Update challenge proposal
        driipSettlementChallenge.setProposalStatus(payment.sender.wallet, SettlementTypes.ProposalStatus.Disqualified);
        driipSettlementChallenge.setProposalCandidateType(payment.sender.wallet, SettlementTypes.CandidateType.Payment);
        driipSettlementChallenge.setProposalCandidateIndex(payment.sender.wallet, driipSettlementChallenge.challengeCandidatePaymentsCount().sub(1));
        driipSettlementChallenge.setProposalChallenger(payment.sender.wallet, challenger);

        // Raise event
        emit ChallengeByPaymentEvent(payment, driipSettlementChallenge.proposalNonce(payment.sender.wallet),
            driipSettlementChallenge.proposalDriipType(payment.sender.wallet), challenger);
    }

    function unchallengeOrderCandidateByTradePrivate(NahmiiTypes.Order order, NahmiiTypes.Trade trade, address unchallenger)
    private
    {
        // Require that settlement challenge is ongoing
        require(NahmiiTypes.ChallengePhase.Dispute == driipSettlementChallenge.challengePhase(order.wallet));

        // Require that candidate type is order
        require(SettlementTypes.CandidateType.Order == driipSettlementChallenge.proposalCandidateType(order.wallet));

        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent
        require(!fraudChallenge.isFraudulentOrderOperatorHash(trade.buyer.wallet == order.wallet ?
            trade.buyer.order.hashes.exchange :
            trade.seller.order.hashes.exchange));

        // Get challenge and require that its operator hash matches the one of order
        NahmiiTypes.Order memory candidateOrder = driipSettlementChallenge.challengeCandidateOrder(
            driipSettlementChallenge.proposalCandidateIndex(order.wallet)
        );
        require(candidateOrder.seals.exchange.hash == order.seals.exchange.hash);

        // Order wallet is buyer -> require candidate order exchange hash to match buyer's order exchange hash
        // Order wallet is seller -> require candidate order exchange hash to match seller's order exchange hash
        require(candidateOrder.seals.exchange.hash == (
        trade.buyer.wallet == order.wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange
        ));

        // Reset the challenge outcome
        driipSettlementChallenge.setProposalStatus(order.wallet, SettlementTypes.ProposalStatus.Qualified);
        driipSettlementChallenge.setProposalCandidateType(order.wallet, SettlementTypes.CandidateType.None);
        driipSettlementChallenge.setProposalCandidateIndex(order.wallet, 0);
        driipSettlementChallenge.setProposalChallenger(order.wallet, address(0));

        // Obtain stake and stage it in SecurityBond
        (int256 stakeAmount, address stakeCurrencyCt, uint256 stakeCurrencyId) = configuration.getUnchallengeOrderCandidateByTradeStake();
        securityBond.stage(unchallenger, stakeAmount, stakeCurrencyCt, stakeCurrencyId);
    }

    function challengeByTradePrivate(address wallet, NahmiiTypes.Trade trade, address challenger)
    private
    {
        // Require that settlement challenge is ongoing
        require(NahmiiTypes.ChallengePhase.Dispute == driipSettlementChallenge.challengePhase(wallet));

        // Require that settlement has not been challenged already
        require(SettlementTypes.ProposalStatus.Disqualified != driipSettlementChallenge.proposalStatus(wallet));

        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent or cancelled
        bytes32 orderOperatorHash = (trade.buyer.wallet == wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange);
        require(!fraudChallenge.isFraudulentOrderOperatorHash(orderOperatorHash));
        require(!cancelOrdersChallenge.isOrderCancelled(wallet, orderOperatorHash));

        // Require that trade's block number is not earlier than proposal's block number
        require(trade.blockNumber >= driipSettlementChallenge.proposalBlockNumber(wallet));

        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        NahmiiTypes.TradePartyRole tradePartyRole =
        (trade.buyer.wallet == wallet ?
        NahmiiTypes.TradePartyRole.Buyer :
        NahmiiTypes.TradePartyRole.Seller);
        (int256 singleTransferAmount, MonetaryTypes.Currency memory transferCurrency) =
        (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ?
        (trade.transfers.conjugate.single.abs(), trade.currencies.conjugate) :
        (trade.transfers.intended.single.abs(), trade.currencies.intended));

        // Get challenge target balance (balance - amount to be staged) and require that trade
        // candidate has relevant currency
        int256 targetBalanceAmount = driipSettlementChallenge.proposalTargetBalanceAmount(wallet, transferCurrency);

        // Require that single transfer is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(singleTransferAmount > targetBalanceAmount);

        // Store trade candidate
        driipSettlementChallenge.pushChallengeCandidateTrade(trade);

        // Update challenge proposal
        driipSettlementChallenge.setProposalStatus(wallet, SettlementTypes.ProposalStatus.Disqualified);
        driipSettlementChallenge.setProposalCandidateType(wallet, SettlementTypes.CandidateType.Trade);
        driipSettlementChallenge.setProposalCandidateIndex(wallet, driipSettlementChallenge.challengeCandidateTradesCount().sub(1));
        driipSettlementChallenge.setProposalChallenger(wallet, challenger);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier driipSettlementChallengeInitialized() {
        require(driipSettlementChallenge != address(0));
        _;
    }

    modifier onlyDriipSettlementChallenge() {
        require(msg.sender == address(driipSettlementChallenge));
        _;
    }
}