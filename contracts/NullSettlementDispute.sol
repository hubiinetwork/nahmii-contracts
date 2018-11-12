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
import {CancelOrdersChallenge} from "./CancelOrdersChallenge.sol";
import {NullSettlementChallenge} from "./NullSettlementChallenge.sol";

/**
@title NullSettlementDispute
@notice The workhorse of null settlement challenges, utilized by NullSettlementChallenge
*/
contract NullSettlementDispute is Ownable, Configurable, Validatable, SecurityBondable, ClientFundable,
FraudChallengable, CancelOrdersChallengable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallenge public nullSettlementChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementChallengeEvent(NullSettlementChallenge oldNullSettlementChallenge,
        NullSettlementChallenge newNullSettlementChallenge);
    event ChallengeByOrderEvent(bytes32 candidateHash, uint256 proposalNonce, address challenger);
    event ChallengeByTradeEvent(address wallet, bytes32 candidateHash, uint256 proposalNonce,
        address challenger);
    event ChallengeByPaymentEvent(bytes32 candidateHash, uint256 proposalNonce, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    /// @notice Set the settlement challenge contract
    /// @param newNullSettlementChallenge The (address of) NullSettlementChallenge contract instance
    function setNullSettlementChallenge(NullSettlementChallenge newNullSettlementChallenge) public
    onlyDeployer
    notNullAddress(newNullSettlementChallenge)
    {
        NullSettlementChallenge oldNullSettlementChallenge = nullSettlementChallenge;
        nullSettlementChallenge = newNullSettlementChallenge;
        emit SetNullSettlementChallengeEvent(oldNullSettlementChallenge, nullSettlementChallenge);
    }

    /// @notice Challenge the settlement by providing order candidate
    /// @param order The order candidate that challenges
    /// @param challenger The address of the challenger
    /// @dev If (candidate) order has buy intention consider _conjugate_ currency and amount, else
    /// if (candidate) order has sell intention consider _intended_ currency and amount
    function challengeByOrder(NahmiiTypesLib.Order order, address challenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    cancelOrdersChallengeInitialized
    nullSettlementChallengeInitialized
    onlyNullSettlementChallenge
    onlySealedOrder(order)
    {
        // Require that order candidate is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderHash(order.seals.operator.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.operator.hash));

        // Require that settlement challenge is ongoing
        require(NahmiiTypesLib.ChallengePhase.Dispute == nullSettlementChallenge.challengePhase(order.wallet));

        // Require that order's block number is not earlier than proposal's block number
        require(order.blockNumber >= nullSettlementChallenge.proposalBlockNumber(order.wallet));

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        (int256 orderAmount, MonetaryTypesLib.Currency memory orderCurrency) =
        (NahmiiTypesLib.Intention.Sell == order.placement.intention ?
        (order.placement.amount, order.placement.currencies.intended) :
        (order.placement.amount.div(order.placement.rate), order.placement.currencies.conjugate));

        // Get challenge target balance (balance - amount to be staged) and require that order
        // candidate has relevant currency
        int256 targetBalanceAmount = nullSettlementChallenge.proposalTargetBalanceAmount(order.wallet, orderCurrency);

        // Require that order amount is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(orderAmount > targetBalanceAmount);

        // Store order candidate
        nullSettlementChallenge.addChallengeCandidateOrderHash(order.seals.operator.hash);

        // Update settlement proposal
        nullSettlementChallenge.setProposalStatus(order.wallet, SettlementTypesLib.ProposalStatus.Disqualified);
        nullSettlementChallenge.setProposalCandidateType(order.wallet, SettlementTypesLib.CandidateType.Order);
        nullSettlementChallenge.setProposalCandidateIndex(order.wallet, nullSettlementChallenge.challengeCandidateOrderHashesCount().sub(1));
        nullSettlementChallenge.setProposalChallenger(order.wallet, challenger);

        // Slash wallet's funds or reward challenger by stake fraction
        if (nullSettlementChallenge.proposalBalanceReward(order.wallet))
            clientFund.seizeAllBalances(order.wallet, challenger);
        else
            securityBond.reward(challenger, configuration.operatorSettlementStakeFraction());

        // Emit event
        emit ChallengeByOrderEvent(order.seals.operator.hash, nullSettlementChallenge.proposalNonce(order.wallet), challenger);
    }

    /// @notice Challenge the settlement by providing trade candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param trade The trade candidate that challenges
    /// @param challenger The address of the challenger
    /// @dev If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else
    /// if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade
    function challengeByTrade(address wallet, NahmiiTypesLib.Trade trade, address challenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    cancelOrdersChallengeInitialized
    nullSettlementChallengeInitialized
    onlyNullSettlementChallenge
    onlySealedTrade(trade)
    onlyTradeParty(trade, wallet)
    {
        // Require that trade candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that trade candidate's order is not labelled fraudulent or cancelled
        bytes32 orderOperatorHash = (trade.buyer.wallet == wallet ?
        trade.buyer.order.hashes.operator :
        trade.seller.order.hashes.operator);
        require(!fraudChallenge.isFraudulentOrderHash(orderOperatorHash));
        require(!cancelOrdersChallenge.isOrderCancelled(wallet, orderOperatorHash));

        // Require that settlement challenge is ongoing
        require(NahmiiTypesLib.ChallengePhase.Dispute == nullSettlementChallenge.challengePhase(wallet));

        // Require that trade's block number is not earlier than proposal's block number
        require(trade.blockNumber >= nullSettlementChallenge.proposalBlockNumber(wallet));

        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        NahmiiTypesLib.TradePartyRole tradePartyRole =
        (trade.buyer.wallet == wallet ?
        NahmiiTypesLib.TradePartyRole.Buyer :
        NahmiiTypesLib.TradePartyRole.Seller);
        (int256 singleTransfer, MonetaryTypesLib.Currency memory transferCurrency) =
        (NahmiiTypesLib.TradePartyRole.Buyer == tradePartyRole ?
        (trade.transfers.conjugate.single.abs(), trade.currencies.conjugate) :
        (trade.transfers.intended.single.abs(), trade.currencies.intended));

        // Get challenge target balance (balance - amount to be staged) and require that trade
        // candidate has relevant currency
        int256 targetBalanceAmount = nullSettlementChallenge.proposalTargetBalanceAmount(wallet, transferCurrency);

        // Require that single transfer is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(singleTransfer > targetBalanceAmount);

        // Store trade candidate
        nullSettlementChallenge.addChallengeCandidateTradeHash(trade.seal.hash);

        // Update settlement proposal
        nullSettlementChallenge.setProposalStatus(wallet, SettlementTypesLib.ProposalStatus.Disqualified);
        nullSettlementChallenge.setProposalCandidateType(wallet, SettlementTypesLib.CandidateType.Trade);
        nullSettlementChallenge.setProposalCandidateIndex(wallet, nullSettlementChallenge.challengeCandidateTradeHashesCount().sub(1));
        nullSettlementChallenge.setProposalChallenger(wallet, challenger);

        // Slash wallet's funds or reward challenger by stake fraction
        if (nullSettlementChallenge.proposalBalanceReward(wallet))
            clientFund.seizeAllBalances(wallet, challenger);
        else
            securityBond.reward(challenger, configuration.operatorSettlementStakeFraction());

        // Emit event
        emit ChallengeByTradeEvent(wallet, trade.seal.hash, nullSettlementChallenge.proposalNonce(wallet), challenger);
    }

    /// @notice Challenge the settlement by providing payment candidate
    /// @dev This challenges the payment sender's side of things
    /// @param payment The payment candidate that challenges
    /// @param challenger The address of the challenger
    function challengeByPayment(NahmiiTypesLib.Payment payment, address challenger)
    public
    validatorInitialized
    fraudChallengeInitialized
    nullSettlementChallengeInitialized
    onlyNullSettlementChallenge
    onlySealedPayment(payment)
    {
        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentHash(payment.seals.operator.hash));

        // Require that settlement challenge is ongoing
        require(NahmiiTypesLib.ChallengePhase.Dispute == nullSettlementChallenge.challengePhase(payment.sender.wallet));

        // Require that trade's block number is not earlier than proposal's block number
        require(payment.blockNumber >= nullSettlementChallenge.proposalBlockNumber(payment.sender.wallet));

        // Get challenge target balance (balance - amount to be staged) and require that trade
        // candidate has relevant currency
        int256 targetBalanceAmount = nullSettlementChallenge.proposalTargetBalanceAmount(payment.sender.wallet, payment.currency);

        // Require that single transfer is strictly greater than target balance amount for this to be a
        // valid challenge call
        require(payment.transfers.single.abs() > targetBalanceAmount);

        // Store payment candidate
        nullSettlementChallenge.addChallengeCandidatePaymentHash(payment.seals.operator.hash);

        // Update settlement proposal
        nullSettlementChallenge.setProposalStatus(payment.sender.wallet, SettlementTypesLib.ProposalStatus.Disqualified);
        nullSettlementChallenge.setProposalCandidateType(payment.sender.wallet, SettlementTypesLib.CandidateType.Payment);
        nullSettlementChallenge.setProposalCandidateIndex(payment.sender.wallet, nullSettlementChallenge.challengeCandidatePaymentHashesCount().sub(1));
        nullSettlementChallenge.setProposalChallenger(payment.sender.wallet, challenger);

        // Slash wallet's funds or reward challenger by stake fraction
        if (nullSettlementChallenge.proposalBalanceReward(payment.sender.wallet))
            clientFund.seizeAllBalances(payment.sender.wallet, challenger);
        else
            securityBond.reward(challenger, configuration.operatorSettlementStakeFraction());

        // Emit event
        emit ChallengeByPaymentEvent(payment.seals.operator.hash, nullSettlementChallenge.proposalNonce(payment.sender.wallet), challenger);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier nullSettlementChallengeInitialized() {
        require(nullSettlementChallenge != address(0));
        _;
    }

    modifier onlyNullSettlementChallenge() {
        require(msg.sender == address(nullSettlementChallenge));
        _;
    }
}