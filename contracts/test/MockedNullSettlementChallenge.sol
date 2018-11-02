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
import {SettlementTypesLib} from "../SettlementTypesLib.sol";
import {NullSettlementDispute} from "../NullSettlementDispute.sol";

/**
@title MockedNullSettlementChallenge
@notice Mocked implementation of null settlement challenge
*/
contract MockedNullSettlementChallenge {

    NahmiiTypesLib.ChallengePhase public _challengePhase;
    uint256 public _proposalNonce;
    uint256 public _proposalBlockNumber;
    MonetaryTypesLib.Currency _proposalCurrency;
    int256 public _proposalStageAmount;
    int256 public _proposalTargetBalanceAmount;
    SettlementTypesLib.ProposalStatus public _proposalStatus;
    SettlementTypesLib.CandidateType public _proposalCandidateType;
    uint256 public _proposalCandidateIndex;
    address public _proposalChallenger;
    uint256 public _challengeCandidateOrdersCount;
    uint256 public _challengeCandidateTradesCount;
    uint256 public _challengeCandidatePaymentsCount;
    NullSettlementDispute public _nullSettlementDispute;

    function _reset()
    public
    {
        delete _challengePhase;
        delete _proposalNonce;
        delete _proposalBlockNumber;
        delete _proposalTargetBalanceAmount;
        delete _proposalStatus;
        delete _proposalCandidateType;
        delete _proposalCandidateIndex;
        delete _proposalChallenger;
        delete _challengeCandidateOrdersCount;
        delete _challengeCandidateTradesCount;
        delete _challengeCandidatePaymentsCount;
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
        require(wallet == wallet);
        require(index == index);
        return _proposalCurrency;
    }

    function _setProposalStageAmount(int256 proposalStageAmount)
    public
    {
        _proposalStageAmount = proposalStageAmount;
    }

    function proposalStageAmount(address wallet, MonetaryTypesLib.Currency currency)
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

    function proposalTargetBalanceAmount(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (int256)
    {
        require(wallet == wallet);
        require(currency.ct == currency.ct);
        return _proposalTargetBalanceAmount;
    }

    function setProposalStatus(address wallet, SettlementTypesLib.ProposalStatus status)
    public
    {
        require(wallet == wallet);
        _proposalStatus = status;
    }

    function proposalStatus(address wallet)
    public
    view
    returns (SettlementTypesLib.ProposalStatus)
    {
        require(wallet == wallet);
        return _proposalStatus;
    }

    function setProposalCandidateType(address wallet, SettlementTypesLib.CandidateType candidateType)
    public
    {
        require(wallet == wallet);
        _proposalCandidateType = candidateType;
    }

    function proposalCandidateType(address wallet)
    public
    view
    returns (SettlementTypesLib.CandidateType)
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

    function pushChallengeCandidateOrder(NahmiiTypesLib.Order order)
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

    function pushChallengeCandidateTrade(NahmiiTypesLib.Trade trade)
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

    function changeNullSettlementDispute(NullSettlementDispute nullSettlementDispute)
    public
    {
        _nullSettlementDispute = nullSettlementDispute;
    }

    function challengeByOrder(NahmiiTypesLib.Order order)
    public
    {
        _nullSettlementDispute.challengeByOrder(order, msg.sender);
    }

    function challengeByTrade(address wallet, NahmiiTypesLib.Trade trade)
    public
    {
        _nullSettlementDispute.challengeByTrade(wallet, trade, msg.sender);
    }

    function challengeByPayment(NahmiiTypesLib.Payment payment)
    public
    {
        _nullSettlementDispute.challengeByPayment(payment, msg.sender);
    }
}
