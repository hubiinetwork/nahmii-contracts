/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Servable} from "./Servable.sol";
import {Configurable} from "./Configurable.sol";
import {NonceManageable} from "./NonceManageable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";

/**
 * @title DriipSettlementChallengeState
 * @notice Where driip settlement challenge state is managed
 */
contract DriipSettlementChallengeState is Ownable, Servable, Configurable, NonceManageable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public ADD_PROPOSAL_ACTION = "add_proposal";
    string constant public DISQUALIFY_PROPOSAL_ACTION = "disqualify_proposal";
    string constant public QUALIFY_PROPOSAL_ACTION = "qualify_proposal";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    SettlementChallengeTypesLib.Proposal[] public proposals;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public proposalIndexByWalletCurrency;
    mapping(address => uint256[]) public proposalIndicesByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event AddProposalEvent(uint256 nonce, address wallet, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool balanceReward,
        bytes32 challengedHash, string challengedType);
    event DisqualifyProposalEvent(address challengedWallet, MonetaryTypesLib.Currency currency,
        address challengerWallet, bytes32 candidateHash, string candidateType);
    event QualifyProposalEvent(address challengedWallet, MonetaryTypesLib.Currency currency,
        address challengerWallet, bytes32 candidateHash, string candidateType);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Get the number of proposals
    /// @return The number of proposals
    function proposalsCount()
    public
    view
    returns (uint256)
    {
        return proposals.length;
    }

    /// @notice Gauge whether the proposal for the given wallet and currency has expired
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return true if proposal has expired, else false
    function hasProposalExpired(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bool)
    {
        // 1-based index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        return (
        0 == index ||
        0 == proposals[index - 1].nonce ||
        block.timestamp >= proposals[index - 1].expirationTime
        );
    }

    /// @notice Get the challenge nonce of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The challenge nonce
    function proposalNonce(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].nonce;
    }

    /// @notice Get the settlement proposal block number of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal block number
    function proposalBlockNumber(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].blockNumber;
    }

    /// @notice Get the settlement proposal end time of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal end time
    function proposalExpirationTime(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].expirationTime;
    }

    /// @notice Get the challenge status of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The challenge status
    function proposalStatus(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (SettlementChallengeTypesLib.Status)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].status;
    }

    /// @notice Get the settlement proposal stage amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal stage amount
    function proposalStageAmount(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].stageAmount;
    }

    /// @notice Get the settlement proposal target balance amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal target balance amount
    function proposalTargetBalanceAmount(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].targetBalanceAmount;
    }

    /// @notice Get the settlement proposal driip hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal driip hash
    function proposalChallengedHash(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bytes32)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].challengedHash;
    }

    /// @notice Get the settlement proposal driip type of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal driip type
    function proposalChallengedType(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (string)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].challengedType;
    }

    /// @notice Get the balance reward of the given wallet's settlement proposal
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The balance reward of the settlement proposal
    function proposalBalanceReward(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bool)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].balanceReward;
    }

    /// @notice Get the disqualification challenger of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The challenger of the settlement disqualification
    function proposalDisqualificationChallenger(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (address)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.challenger;
    }

    /// @notice Get the disqualification block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The block number of the settlement disqualification
    function proposalDisqualificationBlockNumber(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.blockNumber;
    }

    /// @notice Get the disqualification candidate type of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The candidate type of the settlement disqualification
    function proposalDisqualificationCandidateType(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (string)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.candidateType;
    }

    /// @notice Get the disqualification candidate hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The candidate hash of the settlement disqualification
    function proposalDisqualificationCandidateHash(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bytes32)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.candidateHash;
    }

    /// @notice Add proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param stageAmount The proposal stage amount
    /// @param targetBalanceAmount The proposal target balance amount
    /// @param currency The concerned currency
    /// @param blockNumber The proposal block number
    /// @param balanceReward The candidate balance reward
    /// @param challengedHash The candidate driip hash
    /// @param challengedType The candidate driip type
    function addProposal(address wallet, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool balanceReward,
        bytes32 challengedHash, string challengedType)
    public
    onlyEnabledServiceAction(ADD_PROPOSAL_ACTION)
    {
        // Require that wallet has no overlap with active proposal
        require(hasProposalExpired(wallet, currency));

        // Add proposal
        SettlementChallengeTypesLib.Proposal storage proposal = _addProposal(
            wallet, stageAmount, targetBalanceAmount,
            currency, blockNumber, balanceReward
        );

        // Update driip specifics
        proposal.challengedHash = challengedHash;
        proposal.challengedType = challengedType;

        // Emit event
        emit AddProposalEvent(
            proposal.nonce, wallet, stageAmount, targetBalanceAmount, currency,
            blockNumber, balanceReward, challengedHash, challengedType
        );
    }

    /// @notice Disqualify a proposal
    /// @dev A call to this function will intentionally override previous disqualifications if existent
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    /// @param challengerWallet The address of the concerned challenger wallet
    /// @param blockNumber The disqualification block number
    /// @param candidateHash The candidate hash
    /// @param candidateType The candidate type
    function disqualifyProposal(address wallet, MonetaryTypesLib.Currency currency, address challengerWallet,
        uint256 blockNumber, bytes32 candidateHash, string candidateType)
    public
    onlyEnabledServiceAction(DISQUALIFY_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);

        // Update proposal
        proposals[index - 1].status = SettlementChallengeTypesLib.Status.Disqualified;
        proposals[index - 1].expirationTime = block.timestamp.add(configuration.settlementChallengeTimeout());
        proposals[index - 1].disqualification.challenger = challengerWallet;
        proposals[index - 1].disqualification.blockNumber = blockNumber;
        proposals[index - 1].disqualification.candidateHash = candidateHash;
        proposals[index - 1].disqualification.candidateType = candidateType;

        // Emit event
        emit DisqualifyProposalEvent(
            wallet, currency, challengerWallet, candidateHash, candidateType
        );
    }

    /// @notice (Re)Qualify a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    function qualifyProposal(address wallet, MonetaryTypesLib.Currency currency)
    public
    onlyEnabledServiceAction(QUALIFY_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);

        // Emit event
        emit QualifyProposalEvent(
            wallet, currency,
            proposals[index - 1].disqualification.challenger,
            proposals[index - 1].disqualification.candidateHash,
            proposals[index - 1].disqualification.candidateType
        );

        // Update proposal
        proposals[index - 1].status = SettlementChallengeTypesLib.Status.Qualified;
        proposals[index - 1].expirationTime = block.timestamp.add(configuration.settlementChallengeTimeout());
        delete proposals[index - 1].disqualification;
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _addProposal(address wallet, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool balanceReward)
    private
    returns (SettlementChallengeTypesLib.Proposal storage)
    {
        // Require that stage and target balance amounts are positive
        require(stageAmount.isPositiveInt256());
        require(targetBalanceAmount.isPositiveInt256());

        // Create proposal
        proposals.length++;

        // Populate proposal
        proposals[proposals.length - 1].wallet = wallet;
        proposals[proposals.length - 1].nonce = nonceManager.incrementNonce();
        proposals[proposals.length - 1].blockNumber = blockNumber;
        proposals[proposals.length - 1].expirationTime = block.timestamp.add(configuration.settlementChallengeTimeout());
        proposals[proposals.length - 1].status = SettlementChallengeTypesLib.Status.Qualified;
        proposals[proposals.length - 1].currency = currency;
        proposals[proposals.length - 1].stageAmount = stageAmount;
        proposals[proposals.length - 1].targetBalanceAmount = targetBalanceAmount;
        proposals[proposals.length - 1].balanceReward = balanceReward;

        // Store proposal index
        proposalIndexByWalletCurrency[wallet][currency.ct][currency.id] = proposals.length;
        proposalIndicesByWallet[wallet].push(proposals.length);

        return proposals[proposals.length - 1];
    }
}
