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
import {ClientFundable} from "./ClientFundable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {CancelOrdersChallengable} from "./CancelOrdersChallengable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";
import {DriipSettlementChallenge} from "./DriipSettlementChallenge.sol";

/**
@title DriipSettlementDispute
@notice The workhorse of driip settlement challenges, utilized by DriipSettlementChallenge
*/
contract DriipSettlementDispute is Ownable, Configurable, Validatable, SecurityBondable, ClientFundable, FraudChallengable,
CancelOrdersChallengable {
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
    event ChallengeByOrderEvent(bytes32 candidateHash, uint256 proposalNonce,
        NahmiiTypesLib.DriipType proposalDriipType, address challenger);
    event UnchallengeOrderCandidateByTradeEvent(NahmiiTypesLib.Order order, NahmiiTypesLib.Trade trade,
        uint256 nonce, NahmiiTypesLib.DriipType driipType, address challenger);
    event ChallengeByTradeEvent(address wallet, bytes32 candidateHash, uint256 proposalNonce,
        NahmiiTypesLib.DriipType proposalDriipType, address challenger);
    event ChallengeByPaymentEvent(bytes32 candidateHash, uint256 proposalNonce,
        NahmiiTypesLib.DriipType proposalDriipType, address challenger);

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
    function challengeByOrder(NahmiiTypesLib.Order order, address challenger) public
    validatorInitialized
    fraudChallengeInitialized
    cancelOrdersChallengeInitialized
    driipSettlementChallengeInitialized
    onlyDriipSettlementChallenge
    onlySealedOrder(order)
    {
        // Challenge by order
        challengeByOrderPrivate(order, challenger);

        // Emit event
        emit ChallengeByOrderEvent(order.seals.operator.hash, driipSettlementChallenge.proposalNonce(order.wallet),
            driipSettlementChallenge.proposalDriipType(order.wallet), challenger);
    }

    /// @notice Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    /// @param unchallenger The address of the unchallenger
    function unchallengeOrderCandidateByTrade(NahmiiTypesLib.Order order, NahmiiTypesLib.Trade trade, address unchallenger)
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

        // Emit event
        emit UnchallengeOrderCandidateByTradeEvent(order, trade, driipSettlementChallenge.proposalNonce(order.wallet),
            driipSettlementChallenge.proposalDriipType(order.wallet), unchallenger);
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param wallet The wallet whose driip settlement is being challenged
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    /// @dev If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else
    /// if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade
    function challengeByTrade(address wallet, NahmiiTypesLib.Trade trade, address challenger)
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

        // Emit event
        emit ChallengeByTradeEvent(wallet, trade.seal.hash, driipSettlementChallenge.proposalNonce(wallet),
            driipSettlementChallenge.proposalDriipType(wallet), challenger);
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @dev This challenges the payment sender's side of things
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    function challengeByPayment(NahmiiTypesLib.Payment payment, address challenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    onlyDriipSettlementChallenge
    onlySealedPayment(payment)
    {
        // Challenge by payment
        challengeByPaymentPrivate(payment, challenger);

        // Emit event
        emit ChallengeByPaymentEvent(payment.seals.operator.hash, driipSettlementChallenge.proposalNonce(payment.sender.wallet),
            driipSettlementChallenge.proposalDriipType(payment.sender.wallet), challenger);
    }

    function challengeByOrderPrivate(NahmiiTypesLib.Order order, address challenger)
    private
    {
        // Require that settlement challenge is ongoing
        require(NahmiiTypesLib.ChallengePhase.Dispute == driipSettlementChallenge.challengePhase(order.wallet));

        // Require that settlement has not been challenged already
        require(SettlementTypesLib.ProposalStatus.Disqualified != driipSettlementChallenge.proposalStatus(order.wallet));

        // Require that order candidate is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderHash(order.seals.operator.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.operator.hash));

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        (int256 orderAmount, MonetaryTypesLib.Currency memory orderCurrency) =
        (NahmiiTypesLib.Intention.Sell == order.placement.intention ?
        (order.placement.amount, order.placement.currencies.intended) :
        (order.placement.amount.div(order.placement.rate), order.placement.currencies.conjugate));

        // Get challenge target balance (balance - amount to be staged) and require that order
        // candidate has relevant currency
        int256 targetBalanceAmount = driipSettlementChallenge.proposalTargetBalanceAmount(order.wallet, orderCurrency);

        // Require that order amount is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(orderAmount > targetBalanceAmount);

        // Store order candidate hash
        driipSettlementChallenge.addChallengeCandidateOrderHash(order.seals.operator.hash);

        // Update challenge proposal
        driipSettlementChallenge.setProposalTimeout(order.wallet, block.timestamp.add(configuration.settlementChallengeTimeout()));
        driipSettlementChallenge.setProposalStatus(order.wallet, SettlementTypesLib.ProposalStatus.Disqualified);
        driipSettlementChallenge.setProposalCandidateType(order.wallet, SettlementTypesLib.CandidateType.Order);
        driipSettlementChallenge.setProposalCandidateIndex(order.wallet, driipSettlementChallenge.challengeCandidateOrderHashesCount().sub(1));
        driipSettlementChallenge.setProposalChallenger(order.wallet, challenger);
    }

    function unchallengeOrderCandidateByTradePrivate(NahmiiTypesLib.Order order, NahmiiTypesLib.Trade trade, address unchallenger)
    private
    {
        // Require that settlement challenge is ongoing
        require(NahmiiTypesLib.ChallengePhase.Dispute == driipSettlementChallenge.challengePhase(order.wallet));

        // Require that candidate type is order
        require(SettlementTypesLib.CandidateType.Order == driipSettlementChallenge.proposalCandidateType(order.wallet));

        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent
        require(!fraudChallenge.isFraudulentOrderHash(trade.buyer.wallet == order.wallet ?
            trade.buyer.order.hashes.operator :
            trade.seller.order.hashes.operator));

        // Get challenge and require that its operator hash matches the one of order
        bytes32 candidateOrderHash = driipSettlementChallenge.challengeCandidateOrderHashes(
            driipSettlementChallenge.proposalCandidateIndex(order.wallet)
        );
        require(candidateOrderHash == order.seals.operator.hash);

        // Order wallet is buyer -> require candidate order operator hash to match buyer's order operator hash
        // Order wallet is seller -> require candidate order operator hash to match seller's order operator hash
        require(candidateOrderHash == (
        trade.buyer.wallet == order.wallet ?
        trade.buyer.order.hashes.operator :
        trade.seller.order.hashes.operator
        ));

        // Reset the challenge outcome
        driipSettlementChallenge.setProposalStatus(order.wallet, SettlementTypesLib.ProposalStatus.Qualified);
        driipSettlementChallenge.setProposalCandidateType(order.wallet, SettlementTypesLib.CandidateType.None);
        driipSettlementChallenge.setProposalCandidateIndex(order.wallet, 0);
        driipSettlementChallenge.setProposalChallenger(order.wallet, address(0));

        // Reward stake fraction
        securityBond.reward(unchallenger, configuration.walletSettlementStakeFraction());
    }

    function challengeByTradePrivate(address wallet, NahmiiTypesLib.Trade trade, address challenger)
    private
    {
        // Require that settlement challenge is ongoing
        require(NahmiiTypesLib.ChallengePhase.Dispute == driipSettlementChallenge.challengePhase(wallet));

        // Require that settlement has not been challenged already
        require(SettlementTypesLib.ProposalStatus.Disqualified != driipSettlementChallenge.proposalStatus(wallet));

        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent or cancelled
        bytes32 orderOperatorHash = (trade.buyer.wallet == wallet ?
        trade.buyer.order.hashes.operator :
        trade.seller.order.hashes.operator);
        require(!fraudChallenge.isFraudulentOrderHash(orderOperatorHash));
        require(!cancelOrdersChallenge.isOrderCancelled(wallet, orderOperatorHash));

        // Require that trade's block number is not earlier than proposal's block number
        require(trade.blockNumber >= driipSettlementChallenge.proposalBlockNumber(wallet));

        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        NahmiiTypesLib.TradePartyRole tradePartyRole =
        (trade.buyer.wallet == wallet ?
        NahmiiTypesLib.TradePartyRole.Buyer :
        NahmiiTypesLib.TradePartyRole.Seller);
        (int256 singleTransferAmount, MonetaryTypesLib.Currency memory transferCurrency) =
        (NahmiiTypesLib.TradePartyRole.Buyer == tradePartyRole ?
        (trade.transfers.conjugate.single.abs(), trade.currencies.conjugate) :
        (trade.transfers.intended.single.abs(), trade.currencies.intended));

        // Get challenge target balance (balance - amount to be staged) and require that trade
        // candidate has relevant currency
        int256 targetBalanceAmount = driipSettlementChallenge.proposalTargetBalanceAmount(wallet, transferCurrency);

        // Require that single transfer is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(singleTransferAmount > targetBalanceAmount);

        // Store trade candidate hash
        driipSettlementChallenge.addChallengeCandidateTradeHash(trade.seal.hash);

        // Update challenge proposal
        driipSettlementChallenge.setProposalStatus(wallet, SettlementTypesLib.ProposalStatus.Disqualified);
        driipSettlementChallenge.setProposalCandidateType(wallet, SettlementTypesLib.CandidateType.Trade);
        driipSettlementChallenge.setProposalCandidateIndex(wallet, driipSettlementChallenge.challengeCandidateTradeHashesCount().sub(1));
        driipSettlementChallenge.setProposalChallenger(wallet, challenger);

        // Slash wallet's funds or reward challenger by stake fraction
        if (driipSettlementChallenge.proposalBalanceReward(wallet))
            clientFund.seizeAllBalances(wallet, challenger);
        else
            securityBond.reward(challenger, configuration.operatorSettlementStakeFraction());
    }

    function challengeByPaymentPrivate(NahmiiTypesLib.Payment payment, address challenger)
    private
    {
        // Require that settlement challenge is ongoing
        require(NahmiiTypesLib.ChallengePhase.Dispute == driipSettlementChallenge.challengePhase(payment.sender.wallet));

        // Require that settlement has not been challenged already
        require(SettlementTypesLib.ProposalStatus.Disqualified != driipSettlementChallenge.proposalStatus(payment.sender.wallet));

        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentHash(payment.seals.operator.hash));

        // Require that payment's block number is not earlier than proposal's block number
        require(payment.blockNumber >= driipSettlementChallenge.proposalBlockNumber(payment.sender.wallet));

        // Get challenge target balance (balance - amount to be staged) and require that payment
        // candidate has relevant currency
        int256 targetBalanceAmount = driipSettlementChallenge.proposalTargetBalanceAmount(payment.sender.wallet, payment.currency);

        // Require that single transfer is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(payment.transfers.single.abs() > targetBalanceAmount);

        // Store payment candidate hash
        driipSettlementChallenge.addChallengeCandidatePaymentHash(payment.seals.operator.hash);

        // Update challenge proposal
        driipSettlementChallenge.setProposalStatus(payment.sender.wallet, SettlementTypesLib.ProposalStatus.Disqualified);
        driipSettlementChallenge.setProposalCandidateType(payment.sender.wallet, SettlementTypesLib.CandidateType.Payment);
        driipSettlementChallenge.setProposalCandidateIndex(payment.sender.wallet, driipSettlementChallenge.challengeCandidatePaymentHashesCount().sub(1));
        driipSettlementChallenge.setProposalChallenger(payment.sender.wallet, challenger);

        // Slash wallet's funds or reward challenger by stake fraction
        if (driipSettlementChallenge.proposalBalanceReward(payment.sender.wallet))
            clientFund.seizeAllBalances(payment.sender.wallet, challenger);
        else
            securityBond.reward(challenger, configuration.operatorSettlementStakeFraction());
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