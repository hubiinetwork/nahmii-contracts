/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {SettlementChallengeTypesLib} from "../SettlementChallengeTypesLib.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";

/**
 * @title MockedDriipSettlementChallengeState
 * @notice Mocked implementation of driip settlement challenge state contract
 */
contract MockedDriipSettlementChallengeState {

    SettlementChallengeTypesLib.Proposal[] public _proposals;

    bool public _proposalExpired;

    function _reset()
    public
    {
        delete _proposals;
        delete _proposalExpired;
    }

    function addProposal(address wallet, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool balanceReward,
        bytes32 challengedHash, string challengedType)
    public
    {
        uint256 index = _proposals.length++;

        _proposals[index].wallet = wallet;
        _proposals[index].stageAmount = stageAmount;
        _proposals[index].targetBalanceAmount = targetBalanceAmount;
        _proposals[index].currency = currency;
        _proposals[index].blockNumber = blockNumber;
        _proposals[index].balanceReward = balanceReward;
        _proposals[index].challengedHash = challengedHash;
        _proposals[index].challengedType = challengedType;
    }

    function disqualifyProposal(address wallet, MonetaryTypesLib.Currency currency, address challengerWallet,
        uint256 blockNumber, bytes32 candidateHash, string candidateType)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = wallet;
        _proposals[index].currency = currency;
        _proposals[index].status = SettlementChallengeTypesLib.Status.Disqualified;
        _proposals[index].disqualification.challenger = challengerWallet;
        _proposals[index].disqualification.blockNumber = blockNumber;
        _proposals[index].disqualification.candidateHash = candidateHash;
        _proposals[index].disqualification.candidateType = candidateType;
    }

    function hasProposalExpired(address, MonetaryTypesLib.Currency)
    public
    view
    returns (bool)
    {
        return _proposalExpired;
    }

    function _setProposalExpired(bool proposalExpired)
    public
    {
        _proposalExpired = proposalExpired;
    }

    function proposalNonce(address, MonetaryTypesLib.Currency)
    public
    view
    returns (uint256)
    {
        return _proposals[_proposals.length - 1].nonce;
    }

    function _setProposalNonce(uint256 _proposalNonce)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].nonce = _proposalNonce;
    }

    function proposalBlockNumber(address, MonetaryTypesLib.Currency)
    public
    view
    returns (uint256)
    {
        return _proposals[_proposals.length - 1].blockNumber;
    }

    function _setProposalBlockNumber(uint256 _proposalBlockNumber)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].blockNumber = _proposalBlockNumber;
    }

    function proposalExpirationTime(address, MonetaryTypesLib.Currency)
    public
    view
    returns (uint256)
    {
        return _proposals[_proposals.length - 1].expirationTime;
    }

    function _setProposalExpirationTime(uint256 _proposalExpirationTime)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].expirationTime = _proposalExpirationTime;
    }

    function proposalStatus(address, MonetaryTypesLib.Currency)
    public
    view
    returns (SettlementChallengeTypesLib.Status)
    {
        return _proposals[_proposals.length - 1].status;
    }

    function _setProposalStatus(SettlementChallengeTypesLib.Status _proposalStatus)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].status = _proposalStatus;
    }

    function proposalStageAmount(address, MonetaryTypesLib.Currency)
    public
    view
    returns (int256)
    {
        return _proposals[_proposals.length - 1].stageAmount;
    }

    function _setProposalStageAmount(int256 _proposalStageAmount)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].stageAmount = _proposalStageAmount;
    }

    function proposalTargetBalanceAmount(address, MonetaryTypesLib.Currency)
    public
    view
    returns (int256)
    {
        return _proposals[_proposals.length - 1].targetBalanceAmount;
    }

    function _setProposalTargetBalanceAmount(int256 _proposalTargetBalanceAmount)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].targetBalanceAmount = _proposalTargetBalanceAmount;
    }

    function proposalChallengedHash(address, MonetaryTypesLib.Currency)
    public
    view
    returns (bytes32)
    {
        return _proposals[_proposals.length - 1].challengedHash;
    }

    function _setProposalChallengedHash(bytes32 _proposalChallengedHash)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].challengedHash = _proposalChallengedHash;
    }

    function proposalChallengedType(address, MonetaryTypesLib.Currency)
    public
    view
    returns (string)
    {
        return _proposals[_proposals.length - 1].challengedType;
    }

    function _setProposalChallengedType(string _proposalChallengedType)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].challengedType = _proposalChallengedType;
    }

    function proposalBalanceReward(address, MonetaryTypesLib.Currency)
    public
    view
    returns (bool)
    {
        return _proposals[_proposals.length - 1].balanceReward;
    }

    function _setProposalBalanceReward(bool _proposalBalanceReward)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].balanceReward = _proposalBalanceReward;
    }

    function proposalDisqualificationChallenger(address, MonetaryTypesLib.Currency)
    public
    view
    returns (address)
    {
        return _proposals[_proposals.length - 1].disqualification.challenger;
    }

    function _setProposalDisqualificationChallenger(address _proposalDisqualificationChallenger)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].disqualification.challenger = _proposalDisqualificationChallenger;
    }

    function proposalDisqualificationBlockNumber(address, MonetaryTypesLib.Currency)
    public
    view
    returns (uint256)
    {
        return _proposals[_proposals.length - 1].disqualification.blockNumber;
    }

    function _setProposalDisqualificationBlockNumber(uint256 _proposalDisqualificationBlockNumber)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].disqualification.blockNumber = _proposalDisqualificationBlockNumber;
    }

    function proposalDisqualificationCandidateHash(address, MonetaryTypesLib.Currency)
    public
    view
    returns (bytes32)
    {
        return _proposals[_proposals.length - 1].disqualification.candidateHash;
    }

    function _setProposalDisqualificationCandidateHash(bytes32 _proposalDisqualificationCandidateHash)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].disqualification.candidateHash = _proposalDisqualificationCandidateHash;
    }

    function proposalDisqualificationCandidateType(address, MonetaryTypesLib.Currency)
    public
    view
    returns (string)
    {
        return _proposals[_proposals.length - 1].disqualification.candidateType;
    }

    function _setProposalDisqualificationCandidateType(string _proposalDisqualificationCandidateType)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].disqualification.candidateType = _proposalDisqualificationCandidateType;
    }

    function _addProposalIfNone()
    public
    returns (uint256)
    {
        return _proposals.length > 0 ? _proposals.length - 1 : _proposals.length++;
    }
}