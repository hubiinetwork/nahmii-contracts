/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

//import {Ownable} from "../Ownable.sol";
//import {DriipChallenge} from "../DriipChallenge.sol";
//import {ClientFundable} from "../ClientFundable.sol";
//import {SafeMathIntLib} from "../SafeMathIntLib.sol";
//import {SafeMathUintLib} from "../SafeMathUintLib.sol";
//import {NullSettlementDispute} from "../NullSettlementDispute.sol";
//import {MonetaryTypes} from "../MonetaryTypes.sol";
import {NahmiiTypes} from "../NahmiiTypes.sol";
import {SettlementTypes} from "../SettlementTypes.sol";

/**
@title MockedNullSettlementChallenge
@notice Mocked implementation of null settlement challenge
*/
contract MockedNullSettlementChallenge {

    NahmiiTypes.ChallengePhase public _challengePhase;
    uint256 public _proposalNonce;
    uint256 public _proposalBlockNumber;
    int256 public _proposalTargetBalanceAmount;
    SettlementTypes.ChallengeStatus public _proposalStatus;
    SettlementTypes.ChallengeCandidateType public _proposalCandidateType;
    uint256 public _proposalCandidateIndex;
    address public _proposalChallenger;

    NahmiiTypes.Order[] public challengeCandidateOrders;
    NahmiiTypes.Trade[] public challengeCandidateTrades;
    NahmiiTypes.Payment[] public challengeCandidatePayments;

    function _reset()
    public
    {
        delete _challengePhase;
        delete _proposalNonce;
        delete _proposalBlockNumber;
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
        return _proposalNonce;
    }

    function proposalBlockNumber(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].blockNumber;
    }

    function proposalTargetBalanceAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        uint256 index = proposalCurrencyIndex(wallet, currencyCt, currencyId);
        return walletProposalMap[wallet].targetBalanceAmounts[index];
    }

    function setProposalStatus(address wallet, SettlementTypes.ChallengeStatus status)
    public
    {
        walletProposalMap[wallet].status = status;
    }

    function setProposalCandidateType(address wallet, SettlementTypes.ChallengeCandidateType candidateType)
    public
    {
        walletProposalMap[wallet].candidateType = candidateType;
    }

    function setProposalCandidateIndex(address wallet, uint256 candidateIndex)
    public
    {
        walletProposalMap[wallet].candidateIndex = candidateIndex;
    }

    function setProposalChallenger(address wallet, address challenger)
    public
    {
        walletProposalMap[wallet].challenger = challenger;
    }

    function pushChallengeCandidateOrder(NahmiiTypes.Order order)
    public
    {
        challengeCandidateOrders.push(order);
    }

    function challengeCandidateOrdersCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidateOrders.length;
    }

    function pushChallengeCandidateTrade(NahmiiTypes.Trade trade)
    public
    {
        pushMemoryTradeToStorageArray(trade, challengeCandidateTrades);
    }

    function challengeCandidateTradesCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidateTrades.length;
    }

    function pushChallengeCandidatePayment(NahmiiTypes.Payment payment)
    public
    {
        pushMemoryPaymentToStorageArray(payment, challengeCandidatePayments);
    }

    function challengeCandidatePaymentsCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidatePayments.length;
    }
}
