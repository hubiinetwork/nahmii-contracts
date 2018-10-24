/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {MonetaryTypes} from "../MonetaryTypes.sol";
import {NahmiiTypes} from "../NahmiiTypes.sol";
import {DriipSettlementDispute} from "../DriipSettlementDispute.sol";
import {SettlementTypes} from "../SettlementTypes.sol";

/**
@title MockedDriipSettlementChallenge
@notice Mocked implementation of driip settlement challenge contract
*/
contract MockedDriipSettlementChallenge {

    NahmiiTypes.ChallengePhase public _challengePhase;
    uint256 public _proposalNonce;
    uint256 public _proposalBlockNumber;
    MonetaryTypes.Currency _proposalCurrency;
    int256 public _proposalStageAmount;
    int256 public _proposalTargetBalanceAmount;
    uint256 public _proposalTimeout;
    SettlementTypes.ProposalStatus public _proposalStatus;
    NahmiiTypes.DriipType public _proposalDriipType;
    uint256 public _proposalDriipIndex;
    SettlementTypes.CandidateType public _proposalCandidateType;
    uint256 public _proposalCandidateIndex;
    address public _proposalChallenger;
    uint256 public _challengeCandidateOrdersCount;
    uint256 public _challengeCandidateTradesCount;
    uint256 public _challengeCandidatePaymentsCount;
    NahmiiTypes.Order _challengeCandidateOrder;
    DriipSettlementDispute public _driipSettlementDispute;

    function _reset()
    public
    {
        delete _challengePhase;
        delete _proposalNonce;
        delete _proposalBlockNumber;
        delete _proposalTargetBalanceAmount;
        delete _proposalTimeout;
        delete _proposalStatus;
        delete _proposalDriipType;
        delete _proposalDriipIndex;
        delete _proposalCandidateType;
        delete _proposalCandidateIndex;
        delete _proposalChallenger;
        delete _challengeCandidateOrdersCount;
        delete _challengeCandidateTradesCount;
        delete _challengeCandidatePaymentsCount;
        delete _challengeCandidateOrder;
    }

    function _setChallengePhase(NahmiiTypes.ChallengePhase challengePhase)
    public
    {
        _challengePhase = challengePhase;
    }

    function challengePhase(address wallet)
    public
    view
    returns (NahmiiTypes.ChallengePhase) {
        require(wallet == wallet);
        return _challengePhase;
    }

    function _setProposalNonce(uint256 proposalNonce)
    public
    {
        _proposalNonce = proposalNonce;
    }

    function proposalNonce(address wallet)
    public
    view
    returns (uint256)
    {
        require(wallet == wallet);
        return _proposalNonce;
    }

    function _setProposalBlockNumber(uint256 proposalBlockNumber)
    public
    {
        _proposalBlockNumber = proposalBlockNumber;
    }

    function proposalBlockNumber(address wallet)
    public
    view
    returns (uint256)
    {
        require(wallet == wallet);
        return _proposalBlockNumber;
    }

    function _setProposalCurrency(MonetaryTypes.Currency proposalCurrency)
    public
    {
        _proposalCurrency = proposalCurrency;
    }

    function proposalCurrency(address wallet, uint256 index)
    public
    view
    returns (MonetaryTypes.Currency)
    {
        require(wallet == wallet);
        require(index == index);
        return _proposalCurrency;
    }

    function _setProposalStageAmount(int256 proposalStageAmount)
    public
    {
        _proposalStageAmount = proposalStageAmount;
    }

    function proposalStageAmount(address wallet, MonetaryTypes.Currency currency)
    public
    view
    returns (int256)
    {
        require(wallet == wallet);
        require(currency.ct == currency.ct);
        return _proposalStageAmount;
    }

    function _setProposalTargetBalanceAmount(int256 proposalTargetBalanceAmount)
    public
    {
        _proposalTargetBalanceAmount = proposalTargetBalanceAmount;
    }

    function proposalTargetBalanceAmount(address wallet, MonetaryTypes.Currency currency)
    public
    view
    returns (int256)
    {
        require(wallet == wallet);
        require(currency.ct == currency.ct);
        return _proposalTargetBalanceAmount;
    }

    function setProposalTimeout(address wallet, uint256 timeout)
    public
    {
        require(wallet == wallet);
        _proposalTimeout = timeout;
    }

    function proposalTimeout(address wallet)
    public
    view
    returns (uint256)
    {
        require(wallet == wallet);
        return _proposalTimeout;
    }

    function setProposalStatus(address wallet, SettlementTypes.ProposalStatus status)
    public
    {
        require(wallet == wallet);
        _proposalStatus = status;
    }

    function proposalStatus(address wallet)
    public
    view
    returns (SettlementTypes.ProposalStatus)
    {
        require(wallet == wallet);
        return _proposalStatus;
    }

    function _setProposalDriipType(address wallet, NahmiiTypes.DriipType driipType)
    public
    {
        require(wallet == wallet);
        _proposalDriipType = driipType;
    }

    function proposalDriipType(address wallet)
    public
    view
    returns (NahmiiTypes.DriipType)
    {
        require(wallet == wallet);
        return _proposalDriipType;
    }

    function _setProposalDriipIndex(address wallet, uint256 driipIndex)
    public
    {
        require(wallet == wallet);
        _proposalDriipIndex = driipIndex;
    }

    function proposalDriipIndex(address wallet)
    public
    view
    returns (uint256)
    {
        require(wallet == wallet);
        return _proposalDriipIndex;
    }

    function setProposalCandidateType(address wallet, SettlementTypes.CandidateType candidateType)
    public
    {
        require(wallet == wallet);
        _proposalCandidateType = candidateType;
    }

    function proposalCandidateType(address wallet)
    public
    view
    returns (SettlementTypes.CandidateType)
    {
        require(wallet == wallet);
        return _proposalCandidateType;
    }

    function setProposalCandidateIndex(address wallet, uint256 candidateIndex)
    public
    {
        require(wallet == wallet);
        _proposalCandidateIndex = candidateIndex;
    }

    function proposalCandidateIndex(address wallet)
    public
    view
    returns (uint256)
    {
        require(wallet == wallet);
        return _proposalCandidateIndex;
    }

    function setProposalChallenger(address wallet, address challenger)
    public
    {
        require(wallet == wallet);
        _proposalChallenger = challenger;
    }

    function proposalChallenger(address wallet)
    public
    view
    returns (address)
    {
        require(wallet == wallet);
        return _proposalChallenger;
    }

    function pushChallengeCandidateOrder(NahmiiTypes.Order order)
    public
    {
        require(order.nonce == order.nonce);
        _challengeCandidateOrdersCount++;
    }

    function challengeCandidateOrdersCount()
    public
    view
    returns (uint256)
    {
        return _challengeCandidateOrdersCount;
    }

    function _setChallengeCandidateOrder(NahmiiTypes.Order order)
    public
    {
        _challengeCandidateOrder = order;
    }

    function challengeCandidateOrder(uint256 index)
    public
    view
    returns (NahmiiTypes.Order)
    {
        require(index == index);
        return _challengeCandidateOrder;
    }

    function pushChallengeCandidateTrade(NahmiiTypes.Trade trade)
    public
    {
        require(trade.nonce == trade.nonce);
        _challengeCandidateTradesCount++;
    }

    function challengeCandidateTradesCount()
    public
    view
    returns (uint256)
    {
        return _challengeCandidateTradesCount;
    }

    function pushChallengeCandidatePayment(NahmiiTypes.Payment payment)
    public
    {
        require(payment.nonce == payment.nonce);
        _challengeCandidatePaymentsCount++;
    }

    function challengeCandidatePaymentsCount()
    public
    view
    returns (uint256)
    {
        return _challengeCandidatePaymentsCount;
    }

    function changeDriipSettlementDispute(DriipSettlementDispute driipSettlementDispute)
    public
    {
        _driipSettlementDispute = driipSettlementDispute;
    }

    function challengeByOrder(NahmiiTypes.Order order)
    public
    {
        _driipSettlementDispute.challengeByOrder(order, msg.sender);
    }

    function unchallengeOrderCandidateByTrade(NahmiiTypes.Order order, NahmiiTypes.Trade trade)
    public
    {
        _driipSettlementDispute.unchallengeOrderCandidateByTrade(order, trade, msg.sender);
    }

    function challengeByTrade(address wallet, NahmiiTypes.Trade trade)
    public
    {
        _driipSettlementDispute.challengeByTrade(wallet, trade, msg.sender);
    }

    function challengeByPayment(NahmiiTypes.Payment payment)
    public
    {
        _driipSettlementDispute.challengeByPayment(payment, msg.sender);
    }
}