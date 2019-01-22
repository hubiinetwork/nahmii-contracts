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
import {NullSettlementDispute} from "../NullSettlementDispute.sol";

/**
 * @title MockedNullSettlementChallenge
 * @notice Mocked implementation of null settlement challenge
 */
contract MockedNullSettlementChallenge {
    bool public _proposalExpired;
    uint256 public _proposalNonce;
    uint256 public _proposalBlockNumber;
    int256[] public _proposalStageAmounts;
    uint256 public _proposalStageAmountIndex;
    int256 public _proposalTargetBalanceAmount;
    uint256 public _proposalExpirationTime;
    SettlementTypesLib.Status public _proposalStatus;
    bool public _proposalBalanceReward;
    address public _proposalDisqualificationChallenger;
    SettlementTypesLib.CandidateType public _proposalDisqualificationCandidateType;
    bytes32 public _proposalDisqualificationCandidateHash;
    NullSettlementDispute public _nullSettlementDispute;

    function _reset()
    public
    {
        delete _proposalExpired;
        delete _proposalNonce;
        delete _proposalBlockNumber;
        delete _proposalTargetBalanceAmount;
        delete _proposalExpirationTime;
        delete _proposalStatus;
        delete _proposalBalanceReward;
        delete _proposalDisqualificationChallenger;
    delete _proposalDisqualificationCandidateType;
    delete _proposalDisqualificationCandidateHash;

        _proposalStageAmounts.length = 0;
        _proposalStageAmountIndex = 0;
    }

    function _setProposalExpired(bool proposalExpired)
    public
    {
        _proposalExpired = proposalExpired;
    }

    function hasProposalExpired(address, address, uint256)
    public
    view
    returns (bool) {
        return _proposalExpired;
    }

    function _setProposalNonce(uint256 proposalNonce)
    public
    {
        _proposalNonce = proposalNonce;
    }

    function proposalNonce(address, address, uint256)
    public
    view
    returns (uint256)
    {
        return _proposalNonce;
    }

    function _setProposalBlockNumber(uint256 proposalBlockNumber)
    public
    {
        _proposalBlockNumber = proposalBlockNumber;
    }

    function proposalBlockNumber(address, address, uint256)
    public
    view
    returns (uint256)
    {
        return _proposalBlockNumber;
    }

    function _addProposalStageAmount(int256 proposalStageAmount)
    public
    {
        _proposalStageAmounts.push(proposalStageAmount);
    }

    function proposalStageAmount(address, address, uint256)
    public
    returns (int256)
    {
        return _proposalStageAmounts.length == 0 ? 0 : _proposalStageAmounts[_proposalStageAmountIndex++];
    }

    function _setProposalTargetBalanceAmount(int256 proposalTargetBalanceAmount)
    public
    {
        _proposalTargetBalanceAmount = proposalTargetBalanceAmount;
    }

    function proposalTargetBalanceAmount(address, address, uint256)
    public
    view
    returns (int256)
    {
        return _proposalTargetBalanceAmount;
    }

    function setProposalExpirationTime(address, address, uint256,
        uint256 expirationTime)
    public
    {
        _proposalExpirationTime = expirationTime;
    }

    function proposalExpirationTime(address, address, uint256)
    public
    view
    returns (uint256)
    {
        return _proposalExpirationTime;
    }

    function setProposalStatus(address, address, uint256,
        SettlementTypesLib.Status status)
    public
    {
        _proposalStatus = status;
    }

    function proposalStatus(address, address, uint256)
    public
    view
    returns (SettlementTypesLib.Status)
    {
        return _proposalStatus;
    }

    function _setProposalBalanceReward(bool balanceReward)
    public
    {
        _proposalBalanceReward = balanceReward;
    }

    function proposalBalanceReward(address, address, uint256)
    public
    view
    returns (bool)
    {
        return _proposalBalanceReward;
    }

    function _setProposalDisqualificationChallenger(address challenger)
    public
    {
        _proposalDisqualificationChallenger = challenger;
    }

    function proposalDisqualificationChallenger(address, address, uint256)
    public
    view
    returns (address)
    {
        return _proposalDisqualificationChallenger;
    }

    function _setProposalDisqualificationCandidateType(SettlementTypesLib.CandidateType candidateType)
    public
    {
        _proposalDisqualificationCandidateType = candidateType;
    }

    function proposalDisqualificationCandidateType(address, address, uint256)
    public
    view
    returns (SettlementTypesLib.CandidateType)
    {
        return _proposalDisqualificationCandidateType;
    }

    function _setProposalDisqualificationCandidateHash(bytes32 candidateHash)
    public
    {
        _proposalDisqualificationCandidateHash = candidateHash;
    }

    function proposalDisqualificationCandidateHash(address, address, uint256)
    public
    view
    returns (bytes32)
    {
        return _proposalDisqualificationCandidateHash;
    }

    function setNullSettlementDispute(NullSettlementDispute nullSettlementDispute)
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

    function challengeByPayment(address wallet, NahmiiTypesLib.Payment payment)
    public
    {
        _nullSettlementDispute.challengeByPayment(wallet, payment, msg.sender);
    }
}