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

    uint256 public _addProposalsCount;
    uint256 public _removeProposalsCount;
    SettlementChallengeTypesLib.Proposal[] public _proposals;
    bool public _proposal;
    bool public _proposalExpired;

    function _reset()
    public
    {
        delete _addProposalsCount;
        delete _removeProposalsCount;
        delete _proposals;
        delete _proposal;
        delete _proposalExpired;
    }

    function addProposal(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated,
        bytes32 challengedHash, string challengedKind)
    public
    {
        uint256 index = _proposals.length++;

        _proposals[index].wallet = wallet;
        _proposals[index].nonce = nonce;
        _proposals[index].amounts.cumulativeTransfer = cumulativeTransferAmount;
        _proposals[index].amounts.stage = stageAmount;
        _proposals[index].amounts.targetBalance = targetBalanceAmount;
        _proposals[index].currency = currency;
        _proposals[index].blockNumber = blockNumber;
        _proposals[index].walletInitiated = walletInitiated;

        _proposals[index].challenged.hash = challengedHash;
        _proposals[index].challenged.kind = challengedKind;

        _addProposalsCount++;
    }

    function removeProposal(address challengedWallet, MonetaryTypesLib.Currency currency, bool walletTerminated)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = challengedWallet;
        _proposals[index].currency = currency;
        _proposals[index].walletInitiated = walletTerminated;

        _removeProposalsCount++;
    }

    function disqualifyProposal(address challengedWallet, MonetaryTypesLib.Currency currency, address challengerWallet,
        uint256 blockNumber, uint256 candidateNonce, bytes32 candidateHash, string candidateKind)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = challengedWallet;
        _proposals[index].currency = currency;
        _proposals[index].status = SettlementChallengeTypesLib.Status.Disqualified;
        _proposals[index].disqualification.challenger = challengerWallet;
        _proposals[index].disqualification.nonce = candidateNonce;
        _proposals[index].disqualification.blockNumber = blockNumber;
        _proposals[index].disqualification.candidate.hash = candidateHash;
        _proposals[index].disqualification.candidate.kind = candidateKind;
    }

    function qualifyProposal(address wallet, MonetaryTypesLib.Currency currency)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = wallet;
        _proposals[index].currency = currency;
        _proposals[index].status = SettlementChallengeTypesLib.Status.Qualified;
        delete _proposals[index].disqualification;
    }

    function hasProposal(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bool)
    {
        return _proposal;
    }

    function _setProposal(bool proposal)
    public
    {
        _proposal = proposal;
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

    function proposalCumulativeTransferAmount(address, MonetaryTypesLib.Currency)
    public
    view
    returns (int256)
    {
        return _proposals[_proposals.length - 1].amounts.cumulativeTransfer;
    }

    function _setProposalCumulativeTransferAmount(int256 _proposalCumulativeTransferAmount)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].amounts.cumulativeTransfer = _proposalCumulativeTransferAmount;
    }

    function proposalStageAmount(address, MonetaryTypesLib.Currency)
    public
    view
    returns (int256)
    {
        return _proposals[_proposals.length - 1].amounts.stage;
    }

    function _setProposalStageAmount(int256 _proposalStageAmount)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].amounts.stage = _proposalStageAmount;
    }

    function proposalTargetBalanceAmount(address, MonetaryTypesLib.Currency)
    public
    view
    returns (int256)
    {
        return _proposals[_proposals.length - 1].amounts.targetBalance;
    }

    function _setProposalTargetBalanceAmount(int256 _proposalTargetBalanceAmount)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].amounts.targetBalance = _proposalTargetBalanceAmount;
    }

    function proposalChallengedHash(address, MonetaryTypesLib.Currency)
    public
    view
    returns (bytes32)
    {
        return _proposals[_proposals.length - 1].challenged.hash;
    }

    function _setProposalChallengedHash(bytes32 _proposalChallengedHash)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].challenged.hash = _proposalChallengedHash;
    }

    function proposalChallengedKind(address, MonetaryTypesLib.Currency)
    public
    view
    returns (string)
    {
        return _proposals[_proposals.length - 1].challenged.kind;
    }

    function _setProposalChallengedKind(string _proposalChallengedKind)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].challenged.kind = _proposalChallengedKind;
    }

    function proposalWalletInitiated(address, MonetaryTypesLib.Currency)
    public
    view
    returns (bool)
    {
        return _proposals[_proposals.length - 1].walletInitiated;
    }

    function _setProposalWalletInitiated(bool _proposalWalletInitiated)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].walletInitiated = _proposalWalletInitiated;
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

    function proposalDisqualificationNonce(address, MonetaryTypesLib.Currency)
    public
    view
    returns (uint256)
    {
        return _proposals[_proposals.length - 1].disqualification.nonce;
    }

    function _setProposalDisqualificationNonce(uint256 _proposalDisqualificationNonce)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].disqualification.nonce = _proposalDisqualificationNonce;
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
        return _proposals[_proposals.length - 1].disqualification.candidate.hash;
    }

    function _setProposalDisqualificationCandidateHash(bytes32 _proposalDisqualificationCandidateHash)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].disqualification.candidate.hash = _proposalDisqualificationCandidateHash;
    }

    function proposalDisqualificationCandidateKind(address, MonetaryTypesLib.Currency)
    public
    view
    returns (string)
    {
        return _proposals[_proposals.length - 1].disqualification.candidate.kind;
    }

    function _setProposalDisqualificationCandidateKind(string _proposalDisqualificationCandidateKind)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].disqualification.candidate.kind = _proposalDisqualificationCandidateKind;
    }

    function _addProposalIfNone()
    public
    returns (uint256)
    {
        return _proposals.length > 0 ? _proposals.length - 1 : _proposals.length++;
    }
}