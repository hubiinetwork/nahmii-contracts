/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Servable} from "./Servable.sol";
import {Configurable} from "./Configurable.sol";
import {Upgradable} from "./Upgradable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";

/**
 * @title DriipSettlementChallengeState
 * @notice Where driip settlement challenge state is managed
 */
contract DriipSettlementChallengeState is Ownable, Servable, Configurable, Upgradable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public INITIATE_PROPOSAL_ACTION = "initiate_proposal";
    string constant public TERMINATE_PROPOSAL_ACTION = "terminate_proposal";
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
    event InitiateProposalEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated,
        bytes32 challengedHash, string challengedKind);
    event TerminateProposalEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated,
        bytes32 challengedHash, string challengedKind);
    event RemoveProposalEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated,
        bytes32 challengedHash, string challengedKind);
    event DisqualifyProposalEvent(address challengedWallet, uint256 challengedNonce, int256 cumulativeTransferAmount,
        int256 stageAmount, int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber,
        bool walletInitiated, address challengerWallet, uint256 candidateNonce, bytes32 candidateHash,
        string candidateKind);
    event QualifyProposalEvent(address challengedWallet, uint256 challengedNonce, int256 cumulativeTransferAmount,
        int256 stageAmount, int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber,
        bool walletInitiated, address challengerWallet, uint256 candidateNonce, bytes32 candidateHash,
        string candidateKind);
    event UpgradeProposalEvent(SettlementChallengeTypesLib.Proposal proposal);

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

    /// @notice Initiate proposal
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
    function initiateProposal(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency memory currency, uint256 blockNumber, bool walletInitiated,
        bytes32 challengedHash, string memory challengedKind)
    public
    onlyEnabledServiceAction(INITIATE_PROPOSAL_ACTION)
    {
        // Initiate proposal
        _initiateProposal(
            wallet, nonce, cumulativeTransferAmount, stageAmount, targetBalanceAmount,
            currency, blockNumber, walletInitiated, challengedHash, challengedKind
        );

        // Emit event
        emit InitiateProposalEvent(
            wallet, nonce, cumulativeTransferAmount, stageAmount, targetBalanceAmount, currency,
            blockNumber, walletInitiated, challengedHash, challengedKind
        );
    }

    /// @notice Terminate a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    function terminateProposal(address wallet, MonetaryTypesLib.Currency memory currency, bool clearNonce)
    public
    onlyEnabledServiceAction(TERMINATE_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];

        // Return gracefully if there is no proposal to terminate
        if (0 == index)
            return;

        // Clear wallet-nonce-currency triplet entry, which enables reinitiation of proposal for that triplet
        if (clearNonce)
            proposalIndexByWalletNonceCurrency[wallet][proposals[index - 1].nonce][currency.ct][currency.id] = 0;

        // Terminate proposal
        proposals[index - 1].terminated = true;

        // Emit event
        emit TerminateProposalEvent(
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.cumulativeTransfer,
            proposals[index - 1].amounts.stage, proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated,
            proposals[index - 1].challenged.hash, proposals[index - 1].challenged.kind
        );
    }

    /// @notice Terminate a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    /// @param clearNonce Clear wallet-nonce-currency triplet entry
    /// @param walletTerminated True if wallet terminated
    function terminateProposal(address wallet, MonetaryTypesLib.Currency memory currency, bool clearNonce,
        bool walletTerminated)
    public
    onlyEnabledServiceAction(TERMINATE_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];

        // Return gracefully if there is no proposal to terminate
        if (0 == index)
            return;

        // Require that role that initialized (wallet or operator) can only cancel its own proposal
        require(walletTerminated == proposals[index - 1].walletInitiated, "Wallet initiation and termination mismatch [DriipSettlementChallengeState.sol:165]");

        // Clear wallet-nonce-currency triplet entry, which enables reinitiation of proposal for that triplet
        if (clearNonce)
            proposalIndexByWalletNonceCurrency[wallet][proposals[index - 1].nonce][currency.ct][currency.id] = 0;

        // Terminate proposal
        proposals[index - 1].terminated = true;

        // Emit event
        emit TerminateProposalEvent(
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.cumulativeTransfer,
            proposals[index - 1].amounts.stage, proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated,
            proposals[index - 1].challenged.hash, proposals[index - 1].challenged.kind
        );
    }

    /// @notice Remove a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    function removeProposal(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    onlyEnabledServiceAction(REMOVE_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];

        // Return gracefully if there is no proposal to remove
        if (0 == index)
            return;

        // Emit event
        emit RemoveProposalEvent(
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.cumulativeTransfer,
            proposals[index - 1].amounts.stage, proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated,
            proposals[index - 1].challenged.hash, proposals[index - 1].challenged.kind
        );

        // Remove proposal
        _removeProposal(index);
    }

    /// @notice Remove a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    /// @param walletTerminated True if wallet terminated
    function removeProposal(address wallet, MonetaryTypesLib.Currency memory currency, bool walletTerminated)
    public
    onlyEnabledServiceAction(REMOVE_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];

        // Return gracefully if there is no proposal to remove
        if (0 == index)
            return;

        // Require that role that initialized (wallet or operator) can only cancel its own proposal
        require(walletTerminated == proposals[index - 1].walletInitiated, "Wallet initiation and termination mismatch [DriipSettlementChallengeState.sol:225]");

        // Emit event
        emit RemoveProposalEvent(
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.cumulativeTransfer,
            proposals[index - 1].amounts.stage, proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated,
            proposals[index - 1].challenged.hash, proposals[index - 1].challenged.kind
        );

        // Remove proposal
        _removeProposal(index);
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
    function disqualifyProposal(address challengedWallet, MonetaryTypesLib.Currency memory currency, address challengerWallet,
        uint256 blockNumber, uint256 candidateNonce, bytes32 candidateHash, string memory candidateKind)
    public
    onlyEnabledServiceAction(DISQUALIFY_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[challengedWallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:255]");

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
            challengedWallet, proposals[index - 1].nonce, proposals[index - 1].amounts.cumulativeTransfer,
            proposals[index - 1].amounts.stage, proposals[index - 1].amounts.targetBalance,
            currency, proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated,
            challengerWallet, candidateNonce, candidateHash, candidateKind
        );
    }

    /// @notice (Re)Qualify a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    function qualifyProposal(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    onlyEnabledServiceAction(QUALIFY_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:284]");

        // Emit event
        emit QualifyProposalEvent(
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.cumulativeTransfer,
            proposals[index - 1].amounts.stage, proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated,
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
    function hasProposal(address wallet, uint256 nonce, MonetaryTypesLib.Currency memory currency)
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
    function hasProposal(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (bool)
    {
        // 1-based index
        return 0 != proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
    }

    /// @notice Gauge whether the proposal for the given wallet and currency has terminated
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return true if proposal has terminated, else false
    function hasProposalTerminated(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (bool)
    {
        // 1-based index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:342]");
        return proposals[index - 1].terminated;
    }

    /// @notice Gauge whether the proposal for the given wallet and currency has expired
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return true if proposal has expired, else false
    function hasProposalExpired(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (bool)
    {
        // 1-based index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:357]");
        return block.timestamp >= proposals[index - 1].expirationTime;
    }

    /// @notice Get the proposal nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal nonce
    function proposalNonce(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:371]");
        return proposals[index - 1].nonce;
    }

    /// @notice Get the proposal reference block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal reference block number
    function proposalReferenceBlockNumber(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:385]");
        return proposals[index - 1].referenceBlockNumber;
    }

    /// @notice Get the proposal definition block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal definition block number
    function proposalDefinitionBlockNumber(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:399]");
        return proposals[index - 1].definitionBlockNumber;
    }

    /// @notice Get the proposal expiration time of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal expiration time
    function proposalExpirationTime(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:413]");
        return proposals[index - 1].expirationTime;
    }

    /// @notice Get the proposal status of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal status
    function proposalStatus(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (SettlementChallengeTypesLib.Status)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:427]");
        return proposals[index - 1].status;
    }

    /// @notice Get the proposal cumulative transfer amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal cumulative transfer amount
    function proposalCumulativeTransferAmount(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:441]");
        return proposals[index - 1].amounts.cumulativeTransfer;
    }

    /// @notice Get the proposal stage amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal stage amount
    function proposalStageAmount(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:455]");
        return proposals[index - 1].amounts.stage;
    }

    /// @notice Get the proposal target balance amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal target balance amount
    function proposalTargetBalanceAmount(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:469]");
        return proposals[index - 1].amounts.targetBalance;
    }

    /// @notice Get the proposal challenged hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal challenged hash
    function proposalChallengedHash(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (bytes32)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:483]");
        return proposals[index - 1].challenged.hash;
    }

    /// @notice Get the proposal challenged kind of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal challenged kind
    function proposalChallengedKind(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (string memory)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:497]");
        return proposals[index - 1].challenged.kind;
    }

    /// @notice Get the proposal balance reward of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal balance reward
    function proposalWalletInitiated(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (bool)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:511]");
        return proposals[index - 1].walletInitiated;
    }

    /// @notice Get the proposal disqualification challenger of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification challenger
    function proposalDisqualificationChallenger(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (address)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:525]");
        return proposals[index - 1].disqualification.challenger;
    }

    /// @notice Get the proposal disqualification nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification nonce
    function proposalDisqualificationNonce(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:539]");
        return proposals[index - 1].disqualification.nonce;
    }

    /// @notice Get the proposal disqualification block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification block number
    function proposalDisqualificationBlockNumber(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:553]");
        return proposals[index - 1].disqualification.blockNumber;
    }

    /// @notice Get the proposal disqualification candidate hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification candidate hash
    function proposalDisqualificationCandidateHash(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (bytes32)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:567]");
        return proposals[index - 1].disqualification.candidate.hash;
    }

    /// @notice Get the proposal disqualification candidate kind of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification candidate kind
    function proposalDisqualificationCandidateKind(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (string memory)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [DriipSettlementChallengeState.sol:581]");
        return proposals[index - 1].disqualification.candidate.kind;
    }

    /// @notice Upgrade proposal
    /// @param proposal The concerned proposal
    function upgradeProposal(SettlementChallengeTypesLib.Proposal memory proposal)
    public
    onlyWhenUpgrading
    {
        // Require that proposal has not been initialized/upgraded already
        require(
            0 == proposalIndexByWalletNonceCurrency[proposal.wallet][proposal.nonce][proposal.currency.ct][proposal.currency.id],
            "Proposal exists for wallet, nonce and currency [DriipSettlementChallengeState.sol:592]"
        );

        // Push the settlement
        proposals.push(proposal);

        // Get the 1-based index
        uint256 index = proposals.length;

        // Update indices
        proposalIndexByWalletCurrency[proposal.wallet][proposal.currency.ct][proposal.currency.id] = index;
        proposalIndexByWalletNonceCurrency[proposal.wallet][proposal.nonce][proposal.currency.ct][proposal.currency.id] = index;

        // Emit event
        emit UpgradeProposalEvent(proposal);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _initiateProposal(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency memory currency, uint256 referenceBlockNumber, bool walletInitiated,
        bytes32 challengedHash, string memory challengedKind)
    private
    {
        // Require that there is no other proposal on the given wallet-nonce-currency triplet
        require(
            0 == proposalIndexByWalletNonceCurrency[wallet][nonce][currency.ct][currency.id],
            "Existing proposal found for wallet, nonce and currency [DriipSettlementChallengeState.sol:620]"
        );

        // Require that stage and target balance amounts are positive
        require(stageAmount.isPositiveInt256(), "Stage amount not positive [DriipSettlementChallengeState.sol:626]");
        require(targetBalanceAmount.isPositiveInt256(), "Target balance amount not positive [DriipSettlementChallengeState.sol:627]");

        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];

        // Create proposal if needed
        if (0 == index) {
            index = ++(proposals.length);
            proposalIndexByWalletCurrency[wallet][currency.ct][currency.id] = index;
        }

        // Populate proposal
        proposals[index - 1].wallet = wallet;
        proposals[index - 1].nonce = nonce;
        proposals[index - 1].referenceBlockNumber = referenceBlockNumber;
        proposals[index - 1].definitionBlockNumber = block.number;
        proposals[index - 1].expirationTime = block.timestamp.add(configuration.settlementChallengeTimeout());
        proposals[index - 1].status = SettlementChallengeTypesLib.Status.Qualified;
        proposals[index - 1].currency = currency;
        proposals[index - 1].amounts.cumulativeTransfer = cumulativeTransferAmount;
        proposals[index - 1].amounts.stage = stageAmount;
        proposals[index - 1].amounts.targetBalance = targetBalanceAmount;
        proposals[index - 1].walletInitiated = walletInitiated;
        proposals[index - 1].terminated = false;
        proposals[index - 1].challenged.hash = challengedHash;
        proposals[index - 1].challenged.kind = challengedKind;

        // Update index of wallet-nonce-currency triplet
        proposalIndexByWalletNonceCurrency[wallet][nonce][currency.ct][currency.id] = index;
    }

    function _removeProposal(uint256 index)
    private
    {
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
}