/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {NahmiiTypesLib} from "../NahmiiTypesLib.sol";
import {SettlementTypesLib} from "../SettlementTypesLib.sol";
import {DriipSettlementDispute} from "../DriipSettlementDispute.sol";

/**
@title MockedDriipSettlementChallenge
@notice Mocked implementation of driip settlement challenge contract
*/
contract MockedDriipSettlementChallenge {

    bool public _proposalExpired;
    uint256 public _proposalNonce;
    uint256 public _proposalBlockNumber;
    int256[] public _proposalStageAmounts;
    uint256 public _proposalStageAmountIndex;
    int256 public _proposalTargetBalanceAmount;
    uint256 public _proposalExpirationTime;
    SettlementTypesLib.Status public _proposalStatus;
    NahmiiTypesLib.DriipType public _proposalDriipType;
    bytes32 public _proposalDriipHash;
    bool public _proposalBalanceReward;
    SettlementTypesLib.CandidateType public _disqualificationCandidateType;
    bytes32 public _disqualificationCandidateHash;
    address public _disqualificationChallenger;
    DriipSettlementDispute public _driipSettlementDispute;
    bool _lockedWallet;
    uint256 _disqualificationsCount;

    function _reset()
    public
    {
        delete _proposalExpired;
        delete _proposalNonce;
        delete _proposalBlockNumber;
        delete _proposalTargetBalanceAmount;
        delete _proposalExpirationTime;
        delete _proposalStatus;
        delete _proposalDriipType;
        delete _proposalDriipHash;
        delete _proposalBalanceReward;
        delete _disqualificationCandidateType;
        delete _disqualificationCandidateHash;
        delete _disqualificationChallenger;
        delete _lockedWallet;
        delete _disqualificationsCount;

        _proposalStageAmounts.length = 0;
        _proposalStageAmountIndex = 0;
    }

    function _setProposalExpired(bool proposalExpired)
    public
    {
        _proposalExpired = proposalExpired;
    }

    function hasProposalExpired(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool) {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalExpired;
    }

    function _setProposalNonce(uint256 proposalNonce)
    public
    {
        _proposalNonce = proposalNonce;
    }

    function proposalNonce(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalNonce;
    }

    function _setProposalBlockNumber(uint256 proposalBlockNumber)
    public
    {
        _proposalBlockNumber = proposalBlockNumber;
    }

    function proposalBlockNumber(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalBlockNumber;
    }

    function _addProposalStageAmount(int256 proposalStageAmount)
    public
    {
        _proposalStageAmounts.push(proposalStageAmount);
    }

    function proposalStageAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    returns (int256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalStageAmounts.length == 0 ? 0 : _proposalStageAmounts[_proposalStageAmountIndex++];
    }

    function _setProposalTargetBalanceAmount(int256 proposalTargetBalanceAmount)
    public
    {
        _proposalTargetBalanceAmount = proposalTargetBalanceAmount;
    }

    function proposalTargetBalanceAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalTargetBalanceAmount;
    }

    function setProposalExpirationTime(address wallet, address currencyCt, uint256 currencyId,
        uint256 expirationTime)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        _proposalExpirationTime = expirationTime;
    }

    function proposalExpirationTime(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalExpirationTime;
    }

    function setProposalStatus(address wallet, address currencyCt, uint256 currencyId,
        SettlementTypesLib.Status status)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        _proposalStatus = status;
    }

    function proposalStatus(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (SettlementTypesLib.Status)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalStatus;
    }

    function proposalDriipType(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (NahmiiTypesLib.DriipType)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalDriipType;
    }

    function proposalDriipHash(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bytes32)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalDriipHash;
    }

    function _setProposalBalanceReward(bool balanceReward)
    public
    {
        _proposalBalanceReward = balanceReward;
    }

    function proposalBalanceReward(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _proposalBalanceReward;
    }

    function _setDisqualificationCandidateType(SettlementTypesLib.CandidateType candidateType)
    public
    {
        _disqualificationCandidateType = candidateType;
    }

    function disqualificationCandidateType(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (SettlementTypesLib.CandidateType)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _disqualificationCandidateType;
    }

    function _setDisqualificationCandidateHash(bytes32 candidateHash)
    public
    {
        _disqualificationCandidateHash = candidateHash;
    }

    function disqualificationCandidateHash(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bytes32)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _disqualificationCandidateHash;
    }

    function _setDisqualificationChallenger(address challenger)
    public
    {
        _disqualificationChallenger = challenger;
    }

    function disqualificationChallenger(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (address)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return _disqualificationChallenger;
    }

    function setDriipSettlementDispute(DriipSettlementDispute driipSettlementDispute)
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

    function challengeByPayment(address wallet, NahmiiTypesLib.Payment payment)
    public
    {
        _driipSettlementDispute.challengeByPayment(wallet, payment, msg.sender);
    }

    function disqualificationsCount()
    public
    view
    returns (uint256)
    {
        return _disqualificationsCount;
    }

    function lockWallet(address wallet)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        _lockedWallet = true;
    }

    function isLockedWallet(address wallet)
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        return _lockedWallet;
    }

    function _setDisqualificationsCount(uint256 count)
    public
    {
        _disqualificationsCount = count;
    }

    function addDisqualification(address wallet, address currencyCt, uint256 currencyId, bytes32 candidateHash,
        SettlementTypesLib.CandidateType candidateType, address challenger)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        require(candidateHash == candidateHash);
        require(candidateType == candidateType);
        require(challenger == challenger);
        _disqualificationsCount++;
    }

    function removeDisqualification(address wallet, address currencyCt, uint256 currencyId)
    public
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        _disqualificationsCount--;
    }
}