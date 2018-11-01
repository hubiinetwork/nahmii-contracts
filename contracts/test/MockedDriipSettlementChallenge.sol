/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "../NahmiiTypesLib.sol";
import {DriipSettlementDispute} from "../DriipSettlementDispute.sol";
import {SettlementTypesLib} from "../SettlementTypesLib.sol";

/**
@title MockedDriipSettlementChallenge
@notice Mocked implementation of driip settlement challenge contract
*/
contract MockedDriipSettlementChallenge {

    NahmiiTypesLib.ChallengePhase public _challengePhase;
    uint256 public _proposalNonce;
    uint256 public _proposalBlockNumber;
    MonetaryTypesLib.Currency _proposalCurrency;
    int256[] public _proposalStageAmounts;
    uint256 public _proposalStageAmountIndex;
    int256 public _proposalTargetBalanceAmount;
    uint256 public _proposalTimeout;
    SettlementTypesLib.ProposalStatus public _proposalStatus;
    NahmiiTypesLib.DriipType public _proposalDriipType;
    uint256 public _proposalDriipIndex;
    SettlementTypesLib.CandidateType public _proposalCandidateType;
    uint256 public _proposalCandidateIndex;
    address public _proposalChallenger;
    uint256 public _challengeCandidateOrdersCount;
    uint256 public _challengeCandidateTradesCount;
    uint256 public _challengeCandidatePaymentsCount;
    NahmiiTypesLib.Order _challengeCandidateOrder;
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

        _proposalStageAmounts.length = 0;
        _proposalStageAmountIndex = 0;
    }

    function _setChallengePhase(NahmiiTypesLib.ChallengePhase challengePhase)
    public
    {
        _challengePhase = challengePhase;
    }

    function challengePhase(address wallet)
    public
    view
    returns (NahmiiTypesLib.ChallengePhase) {
        // To silence unused function parameter compiler warning
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
        // To silence unused function parameter compiler warning
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
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _proposalBlockNumber;
    }

    function _setProposalCurrency(MonetaryTypesLib.Currency proposalCurrency)
    public
    {
        _proposalCurrency = proposalCurrency;
    }

    function proposalCurrency(address wallet, uint256 index)
    public
    view
    returns (MonetaryTypesLib.Currency)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(index == index);
        return _proposalCurrency;
    }

    function _addProposalStageAmount(int256 proposalStageAmount)
    public
    {
        _proposalStageAmounts.push(proposalStageAmount);
    }

    function proposalStageAmount(address wallet, MonetaryTypesLib.Currency currency)
    public
    returns (int256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currency.ct == currency.ct);
        return _proposalStageAmounts.length == 0 ? 0 : _proposalStageAmounts[_proposalStageAmountIndex++];
    }

    function _setProposalTargetBalanceAmount(int256 proposalTargetBalanceAmount)
    public
    {
        _proposalTargetBalanceAmount = proposalTargetBalanceAmount;
    }

    function proposalTargetBalanceAmount(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (int256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currency.ct == currency.ct);
        return _proposalTargetBalanceAmount;
    }

    function setProposalTimeout(address wallet, uint256 timeout)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        _proposalTimeout = timeout;
    }

    function proposalTimeout(address wallet)
    public
    view
    returns (uint256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _proposalTimeout;
    }

    function setProposalStatus(address wallet, SettlementTypesLib.ProposalStatus status)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        _proposalStatus = status;
    }

    function proposalStatus(address wallet)
    public
    view
    returns (SettlementTypesLib.ProposalStatus)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _proposalStatus;
    }

    function _setProposalDriipType(address wallet, NahmiiTypesLib.DriipType driipType)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        _proposalDriipType = driipType;
    }

    function proposalDriipType(address wallet)
    public
    view
    returns (NahmiiTypesLib.DriipType)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _proposalDriipType;
    }

    function _setProposalDriipIndex(address wallet, uint256 driipIndex)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        _proposalDriipIndex = driipIndex;
    }

    function proposalDriipIndex(address wallet)
    public
    view
    returns (uint256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _proposalDriipIndex;
    }

    function setProposalCandidateType(address wallet, SettlementTypesLib.CandidateType candidateType)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        _proposalCandidateType = candidateType;
    }

    function proposalCandidateType(address wallet)
    public
    view
    returns (SettlementTypesLib.CandidateType)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _proposalCandidateType;
    }

    function setProposalCandidateIndex(address wallet, uint256 candidateIndex)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        _proposalCandidateIndex = candidateIndex;
    }

    function proposalCandidateIndex(address wallet)
    public
    view
    returns (uint256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _proposalCandidateIndex;
    }

    function setProposalChallenger(address wallet, address challenger)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        _proposalChallenger = challenger;
    }

    function proposalChallenger(address wallet)
    public
    view
    returns (address)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _proposalChallenger;
    }

    function pushChallengeCandidateOrder(NahmiiTypesLib.Order order)
    public
    {
        // To silence unused function parameter compiler warning
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

    function _setChallengeCandidateOrder(NahmiiTypesLib.Order order)
    public
    {
        _challengeCandidateOrder = order;
    }

    function challengeCandidateOrder(uint256 index)
    public
    view
    returns (NahmiiTypesLib.Order)
    {
        // To silence unused function parameter compiler warning
        require(index == index);
        return _challengeCandidateOrder;
    }

    function pushChallengeCandidateTrade(NahmiiTypesLib.Trade trade)
    public
    {
        // To silence unused function parameter compiler warning
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

    function pushChallengeCandidatePayment(NahmiiTypesLib.Payment payment)
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

    function challengeByOrder(NahmiiTypesLib.Order order)
    public
    {
        _driipSettlementDispute.challengeByOrder(order, msg.sender);
    }

    function unchallengeOrderCandidateByTrade(NahmiiTypesLib.Order order, NahmiiTypesLib.Trade trade)
    public
    {
        _driipSettlementDispute.unchallengeOrderCandidateByTrade(order, trade, msg.sender);
    }

    function challengeByTrade(address wallet, NahmiiTypesLib.Trade trade)
    public
    {
        _driipSettlementDispute.challengeByTrade(wallet, trade, msg.sender);
    }

    function challengeByPayment(NahmiiTypesLib.Payment payment)
    public
    {
        _driipSettlementDispute.challengeByPayment(payment, msg.sender);
    }
}