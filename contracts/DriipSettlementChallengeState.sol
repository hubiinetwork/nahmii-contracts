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
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";

/**
 * @title DriipSettlementChallengeState
 * @notice Where driip settlement challenge state is managed
 */
contract DriipSettlementChallengeState is Ownable, Servable, Configurable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public ADD_PROPOSAL_ACTION = "add_proposal";
    string constant public REMOVE_PROPOSAL_ACTION = "remove_proposal";
    string constant public DISQUALIFY_PROPOSAL_ACTION = "disqualify_proposal";
    string constant public QUALIFY_PROPOSAL_ACTION = "qualify_proposal";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    SettlementChallengeTypesLib.Proposal[] public proposals;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public proposalIndexByWalletCurrency;
    mapping(address => mapping(uint256 => mapping(address => mapping(uint256 => uint256)))) public proposalIndexByWalletNonceCurrency;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event AddProposalEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated,
        bytes32 challengedHash, string challengedKind);
    event RemoveProposalEvent(address wallet, uint256 nonce, MonetaryTypesLib.Currency currency);
    event DisqualifyProposalEvent(address challengedWallet, uint256 challengedNonce, MonetaryTypesLib.Currency currency,
        address challengerWallet, uint256 candidateNonce, bytes32 candidateHash, string candidateKind);
    event QualifyProposalEvent(address challengedWallet, uint256 challengedNonce, MonetaryTypesLib.Currency currency,
        address challengerWallet, uint256 candidateNonce, bytes32 candidateHash, string candidateKind);

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

    /// @notice Add proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param nonce The wallet nonce
    /// @param cumulativeTransferAmount The proposal cumulative transfer amount
    /// @param stageAmount The proposal stage amount
    /// @param targetBalanceAmount The proposal target balance amount
    /// @param currency The concerned currency
    /// @param blockNumber The proposal block number
    /// @param walletInitiated True if reward from candidate balance
    /// @param challengedHash The candidate driip hash
    /// @param challengedKind The candidate driip kind
    function addProposal(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated,
        bytes32 challengedHash, string challengedKind)
    public
    onlyEnabledServiceAction(ADD_PROPOSAL_ACTION)
    {
        // Add proposal
        _addProposal(
            wallet, nonce, cumulativeTransferAmount, stageAmount, targetBalanceAmount,
            currency, blockNumber, walletInitiated, challengedHash, challengedKind
        );

        // Emit event
        emit AddProposalEvent(
            wallet, nonce, stageAmount, targetBalanceAmount, currency,
            blockNumber, walletInitiated, challengedHash, challengedKind
        );
    }

    /// @notice Remove a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    /// @param walletTerminated True if wallet terminated
    function removeProposal(address wallet, MonetaryTypesLib.Currency currency, bool walletTerminated)
    public
    onlyEnabledServiceAction(REMOVE_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];

        // Return gracefully if there is no proposal to cancel
        if (0 == index)
            return;

        // Require that role that initialized (wallet or operator) can only cancel its own proposal
        require(walletTerminated == proposals[index - 1].walletInitiated);

        // Emit event
        emit RemoveProposalEvent(wallet, proposals[index - 1].nonce, currency);

        // Remove the proposal and clear references to it
        proposalIndexByWalletCurrency[proposals[index - 1].wallet][proposals[index - 1].currency.ct][proposals[index - 1].currency.id] = 0;
        proposalIndexByWalletNonceCurrency[proposals[index - 1].wallet][proposals[index - 1].nonce][proposals[index - 1].currency.ct][proposals[index - 1].currency.id] = 0;
        if (index < proposals.length) {
            proposals[index - 1] = proposals[proposals.length - 1];
            proposalIndexByWalletCurrency[proposals[index - 1].wallet][proposals[index - 1].currency.ct][proposals[index - 1].currency.id] = index;
            proposalIndexByWalletNonceCurrency[proposals[index - 1].wallet][proposals[index - 1].nonce][proposals[index - 1].currency.ct][proposals[index - 1].currency.id] = index;
        }
        proposals.length--;
    }

    /// @notice Disqualify a proposal
    /// @dev A call to this function will intentionally override previous disqualifications if existent
    /// @param challengedWallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    /// @param challengerWallet The address of the concerned challenger wallet
    /// @param blockNumber The disqualification block number
    /// @param candidateNonce The candidate nonce
    /// @param candidateHash The candidate hash
    /// @param candidateKind The candidate kind
    function disqualifyProposal(address challengedWallet, MonetaryTypesLib.Currency currency, address challengerWallet,
        uint256 blockNumber, uint256 candidateNonce, bytes32 candidateHash, string candidateKind)
    public
    onlyEnabledServiceAction(DISQUALIFY_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[challengedWallet][currency.ct][currency.id];
        require(0 != index);

        // Update proposal
        proposals[index - 1].status = SettlementChallengeTypesLib.Status.Disqualified;
        proposals[index - 1].expirationTime = block.timestamp.add(configuration.settlementChallengeTimeout());
        proposals[index - 1].disqualification.challenger = challengerWallet;
        proposals[index - 1].disqualification.nonce = candidateNonce;
        proposals[index - 1].disqualification.blockNumber = blockNumber;
        proposals[index - 1].disqualification.candidate.hash = candidateHash;
        proposals[index - 1].disqualification.candidate.kind = candidateKind;

        // Emit event
        emit DisqualifyProposalEvent(
            challengedWallet, proposals[index - 1].nonce, currency, challengerWallet,
            candidateNonce, candidateHash, candidateKind
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
            wallet, proposals[index - 1].nonce, currency,
            proposals[index - 1].disqualification.challenger,
            proposals[index - 1].disqualification.nonce,
            proposals[index - 1].disqualification.candidate.hash,
            proposals[index - 1].disqualification.candidate.kind
        );

        // Update proposal
        proposals[index - 1].status = SettlementChallengeTypesLib.Status.Qualified;
        proposals[index - 1].expirationTime = block.timestamp.add(configuration.settlementChallengeTimeout());
        delete proposals[index - 1].disqualification;
    }

    /// @notice Gauge whether a driip settlement challenge for the given wallet-nonce-currency
    /// triplet has been proposed and not later removed
    /// @param wallet The address of the concerned wallet
    /// @param nonce The wallet nonce
    /// @param currency The concerned currency
    /// @return true if driip settlement challenge has been, else false
    function hasProposal(address wallet, uint256 nonce, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bool)
    {
        // 1-based index
        return 0 != proposalIndexByWalletNonceCurrency[wallet][nonce][currency.ct][currency.id];
    }

    /// @notice Gauge whether the proposal for the given wallet and currency has expired
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return true if proposal has expired, else false
    function hasProposal(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bool)
    {
        // 1-based index
        return 0 != proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
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

    /// @notice Get the proposal nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal nonce
    function proposalNonce(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].nonce;
    }

    /// @notice Get the proposal block number of the given wallet and currency
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

    /// @notice Get the proposal expiration time of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal expiration time
    function proposalExpirationTime(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].expirationTime;
    }

    /// @notice Get the proposal status of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal status
    function proposalStatus(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (SettlementChallengeTypesLib.Status)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].status;
    }

    /// @notice Get the proposal cumulative transfer amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal cumulative transfer amount
    function proposalCumulativeTransferAmount(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].amounts.cumulativeTransfer;
    }

    /// @notice Get the proposal stage amount of the given wallet and currency
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
        return proposals[index - 1].amounts.stage;
    }

    /// @notice Get the proposal target balance amount of the given wallet and currency
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
        return proposals[index - 1].amounts.targetBalance;
    }

    /// @notice Get the proposal challenged hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal challenged hash
    function proposalChallengedHash(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bytes32)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].challenged.hash;
    }

    /// @notice Get the proposal challenged kind of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal challenged kind
    function proposalChallengedKind(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (string)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].challenged.kind;
    }

    /// @notice Get the proposal balance reward of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal balance reward
    function proposalWalletInitiated(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bool)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].walletInitiated;
    }

    /// @notice Get the proposal disqualification challenger of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification challenger
    function proposalDisqualificationChallenger(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (address)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.challenger;
    }

    /// @notice Get the proposal disqualification nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification nonce
    function proposalDisqualificationNonce(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.nonce;
    }

    /// @notice Get the proposal disqualification block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification block number
    function proposalDisqualificationBlockNumber(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.blockNumber;
    }

    /// @notice Get the proposal disqualification candidate hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification candidate hash
    function proposalDisqualificationCandidateHash(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (bytes32)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.candidate.hash;
    }

    /// @notice Get the proposal disqualification candidate kind of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification candidate kind
    function proposalDisqualificationCandidateKind(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (string)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.candidate.kind;
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _addProposal(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated,
        bytes32 challengedHash, string challengedKind)
    private
    {
        // Require that there is no other proposal on the given wallet-nonce-currency triplet
        require(0 == proposalIndexByWalletNonceCurrency[wallet][nonce][currency.ct][currency.id]);

        // Require that stage and target balance amounts are positive
        require(stageAmount.isPositiveInt256());
        require(targetBalanceAmount.isPositiveInt256());

        // Create proposal
        proposals.length++;

        // Populate proposal
        proposals[proposals.length - 1].wallet = wallet;
        proposals[proposals.length - 1].nonce = nonce;
        proposals[proposals.length - 1].blockNumber = blockNumber;
        proposals[proposals.length - 1].expirationTime = block.timestamp.add(configuration.settlementChallengeTimeout());
        proposals[proposals.length - 1].status = SettlementChallengeTypesLib.Status.Qualified;
        proposals[proposals.length - 1].currency = currency;
        proposals[proposals.length - 1].amounts.cumulativeTransfer = cumulativeTransferAmount;
        proposals[proposals.length - 1].amounts.stage = stageAmount;
        proposals[proposals.length - 1].amounts.targetBalance = targetBalanceAmount;
        proposals[proposals.length - 1].walletInitiated = walletInitiated;
        proposals[proposals.length - 1].challenged.hash = challengedHash;
        proposals[proposals.length - 1].challenged.kind = challengedKind;

        // Store proposal index
        proposalIndexByWalletCurrency[wallet][currency.ct][currency.id] = proposals.length;
        proposalIndexByWalletNonceCurrency[wallet][nonce][currency.ct][currency.id] = proposals.length;
    }
}
