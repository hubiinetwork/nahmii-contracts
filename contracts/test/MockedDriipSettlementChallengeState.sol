/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {SettlementChallengeTypesLib} from "../SettlementChallengeTypesLib.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";

/**
 * @title MockedDriipSettlementChallengeState
 * @notice Mocked implementation of driip settlement challenge state contract
 */
contract MockedDriipSettlementChallengeState {

    uint256 public _initiateProposalsCount;
    uint256 public _terminateProposalsCount;
    uint256 public _removeProposalsCount;
    SettlementChallengeTypesLib.Proposal[] public _proposals;
    bool public _proposal;
    bool public _proposalTerminated;
    bool public _proposalExpired;

    function _reset()
    public
    {
        delete _initiateProposalsCount;
        delete _terminateProposalsCount;
        delete _removeProposalsCount;
        delete _proposals;
        delete _proposal;
        delete _proposalTerminated;
        delete _proposalExpired;
    }

    function initiateProposal(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency memory currency, uint256 referenceBlockNumber, bool walletInitiated,
        bytes32 challengedHash, string memory challengedKind)
    public
    {
        uint256 index = _proposals.length++;

        _proposals[index].wallet = wallet;
        _proposals[index].nonce = nonce;
        _proposals[index].amounts.cumulativeTransfer = cumulativeTransferAmount;
        _proposals[index].amounts.stage = stageAmount;
        _proposals[index].amounts.targetBalance = targetBalanceAmount;
        _proposals[index].currency = currency;
        _proposals[index].referenceBlockNumber = referenceBlockNumber;
        _proposals[index].definitionBlockNumber = block.number;
        _proposals[index].walletInitiated = walletInitiated;

        _proposals[index].challenged.hash = challengedHash;
        _proposals[index].challenged.kind = challengedKind;

        _initiateProposalsCount++;
    }

    function terminateProposal(address wallet, MonetaryTypesLib.Currency memory currency, bool)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = wallet;
        _proposals[index].currency = currency;
        _proposals[index].terminated = true;

        _terminateProposalsCount++;
    }

    function terminateProposal(address wallet, MonetaryTypesLib.Currency memory currency, bool,
        bool walletTerminated)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = wallet;
        _proposals[index].currency = currency;
        _proposals[index].walletInitiated = walletTerminated;
        _proposals[index].terminated = true;

        _terminateProposalsCount++;
    }

    function removeProposal(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = wallet;
        _proposals[index].currency = currency;

        _removeProposalsCount++;
    }

    function removeProposal(address wallet, MonetaryTypesLib.Currency memory currency, bool walletTerminated)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = wallet;
        _proposals[index].currency = currency;
        _proposals[index].walletInitiated = walletTerminated;

        _removeProposalsCount++;
    }

    function disqualifyProposal(address challengedWallet, MonetaryTypesLib.Currency memory currency, address challengerWallet,
        uint256 blockNumber, uint256 candidateNonce, bytes32 candidateHash, string memory candidateKind)
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

    function qualifyProposal(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    {
        uint256 index = _addProposalIfNone();

        _proposals[index].wallet = wallet;
        _proposals[index].currency = currency;
        _proposals[index].status = SettlementChallengeTypesLib.Status.Qualified;
        delete _proposals[index].disqualification;
    }

    function hasProposal(address, uint256, MonetaryTypesLib.Currency memory)
    public
    view
    returns (bool)
    {
        return _proposal;
    }

    function hasProposal(address, MonetaryTypesLib.Currency memory)
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

    function hasProposalTerminated(address, MonetaryTypesLib.Currency memory)
    public
    view
    returns (bool)
    {
        return _proposalTerminated;
    }

    function _setProposalTerminated(bool proposalTerminated)
    public
    {
        _proposalTerminated = proposalTerminated;
    }

    function hasProposalExpired(address, MonetaryTypesLib.Currency memory)
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

    function proposalNonce(address, MonetaryTypesLib.Currency memory)
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

    function proposalReferenceBlockNumber(address, MonetaryTypesLib.Currency memory)
    public
    view
    returns (uint256)
    {
        return _proposals[_proposals.length - 1].referenceBlockNumber;
    }

    function _setProposalReferenceBlockNumber(uint256 _proposalReferenceBlockNumber)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].referenceBlockNumber = _proposalReferenceBlockNumber;
    }

    function proposalDefinitionBlockNumber(address, MonetaryTypesLib.Currency memory)
    public
    view
    returns (uint256)
    {
        return _proposals[_proposals.length - 1].definitionBlockNumber;
    }

    function _setProposalDefinitionBlockNumber(uint256 _proposalDefinitionBlockNumber)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].definitionBlockNumber = _proposalDefinitionBlockNumber;
    }

    function proposalExpirationTime(address, MonetaryTypesLib.Currency memory)
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

    function proposalStatus(address, MonetaryTypesLib.Currency memory)
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

    function proposalCumulativeTransferAmount(address, MonetaryTypesLib.Currency memory)
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

    function proposalStageAmount(address, MonetaryTypesLib.Currency memory)
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

    function proposalTargetBalanceAmount(address, MonetaryTypesLib.Currency memory)
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

    function proposalChallengedHash(address, MonetaryTypesLib.Currency memory)
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

    function proposalChallengedKind(address, MonetaryTypesLib.Currency memory)
    public
    view
    returns (string memory)
    {
        return _proposals[_proposals.length - 1].challenged.kind;
    }

    function _setProposalChallengedKind(string memory _proposalChallengedKind)
    public
    {
        uint256 index = _addProposalIfNone();
        _proposals[index].challenged.kind = _proposalChallengedKind;
    }

    function proposalWalletInitiated(address, MonetaryTypesLib.Currency memory)
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

    function proposalDisqualificationChallenger(address, MonetaryTypesLib.Currency memory)
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

    function proposalDisqualificationNonce(address, MonetaryTypesLib.Currency memory)
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

    function proposalDisqualificationBlockNumber(address, MonetaryTypesLib.Currency memory)
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

    function proposalDisqualificationCandidateHash(address, MonetaryTypesLib.Currency memory)
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

    function proposalDisqualificationCandidateKind(address, MonetaryTypesLib.Currency memory)
    public
    view
    returns (string memory)
    {
        return _proposals[_proposals.length - 1].disqualification.candidate.kind;
    }

    function _setProposalDisqualificationCandidateKind(string memory _proposalDisqualificationCandidateKind)
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

    function _proposalsCount()
    public
    view
    returns (uint256)
    {
        return _proposals.length;
    }
}