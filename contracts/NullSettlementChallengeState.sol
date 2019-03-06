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
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";

/**
 * @title NullSettlementChallengeState
 * @notice Where null settlements challenge state is managed
 */
contract NullSettlementChallengeState is Ownable, Servable, Configurable, BalanceTrackable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public ADD_PROPOSAL_ACTION = "add_proposal";
    string constant public CANCEL_PROPOSAL_ACTION = "cancel_proposal";
    string constant public DISQUALIFY_PROPOSAL_ACTION = "disqualify_proposal";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    SettlementChallengeTypesLib.Proposal[] public proposals;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public proposalIndexByWalletCurrency;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event AddProposalEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated);
    event RemoveProposalEvent(address challengedWallet, uint256 nonce, MonetaryTypesLib.Currency currency);
    event DisqualifyProposalEvent(address challengedWallet, uint256 challengedNonce, MonetaryTypesLib.Currency currency,
        address challengerWallet, uint256 candidateNonce, bytes32 candidateHash, string candidateType);

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
    /// @param stageAmount The proposal stage amount
    /// @param targetBalanceAmount The proposal target balance amount
    /// @param currency The concerned currency
    /// @param blockNumber The proposal block number
    /// @param walletInitiated True if reward from candidate balance
    function addProposal(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated)
    public
    onlyEnabledServiceAction(ADD_PROPOSAL_ACTION)
    {
        // Require that wallet has no overlap with active proposal
        require(hasProposalExpired(wallet, currency));

        // Add proposal
        _addProposal(
            wallet, nonce, stageAmount, targetBalanceAmount,
            currency, blockNumber, walletInitiated
        );

        // Emit event
        emit AddProposalEvent(
            wallet, nonce, stageAmount, targetBalanceAmount, currency,
            blockNumber, walletInitiated
        );
    }

    /// @notice Remove a proposal
    /// @param challengedWallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    /// @param walletTerminated True if wallet terminated
    function removeProposal(address challengedWallet, MonetaryTypesLib.Currency currency, bool walletTerminated)
    public
    onlyEnabledServiceAction(CANCEL_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[challengedWallet][currency.ct][currency.id];

        // Return gracefully if there is no proposal to cancel
        if (0 == index)
            return;

        // Require that role that initialized (wallet or operator) can only cancel its own proposal
        require(walletTerminated == proposals[index - 1].walletInitiated);

        // Emit event
        emit RemoveProposalEvent(challengedWallet, proposals[index - 1].nonce, currency);

        // Remove the proposal
        if (index < proposals.length) {
            proposals[index - 1] = proposals[proposals.length - 1];
            proposalIndexByWalletCurrency[proposals[index - 1].wallet][proposals[index - 1].currency.ct][proposals[index - 1].currency.id] = index;
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
    /// @param candidateType The candidate type
    function disqualifyProposal(address challengedWallet, MonetaryTypesLib.Currency currency, address challengerWallet,
        uint256 blockNumber, uint256 candidateNonce, bytes32 candidateHash, string candidateType)
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
        proposals[index - 1].disqualification.candidateHash = candidateHash;
        proposals[index - 1].disqualification.candidateType = candidateType;

        // Emit event
        emit DisqualifyProposalEvent(
            challengedWallet, proposals[index - 1].nonce, currency, challengerWallet,
            candidateNonce, candidateHash, candidateType
        );
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

    /// @notice Get the settlement proposal challenge nonce of the given wallet and currency
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

    /// @notice Get the settlement proposal block number of the given wallet and currency
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

    /// @notice Get the settlement proposal expiration time of the given wallet and currency
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

    /// @notice Get the settlement proposal status of the given wallet and currency
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

    /// @notice Get the settlement proposal balance reward of the given wallet and currency
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

    /// @notice Get the settlement proposal disqualification challenger of the given wallet and currency
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

    /// @notice Get the settlement proposal disqualification block number of the given wallet and currency
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

    /// @notice Get the settlement proposal disqualification nonce of the given wallet and currency
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

    /// @notice Get the settlement proposal disqualification candidate hash of the given wallet and currency
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
        return proposals[index - 1].disqualification.candidateHash;
    }

    /// @notice Get the settlement proposal disqualification candidate type of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification candidate type
    function proposalDisqualificationCandidateType(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (string)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index);
        return proposals[index - 1].disqualification.candidateType;
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _addProposal(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated)
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
        proposals[proposals.length - 1].nonce = nonce;
        proposals[proposals.length - 1].blockNumber = blockNumber;
        proposals[proposals.length - 1].expirationTime = block.timestamp.add(configuration.settlementChallengeTimeout());
        proposals[proposals.length - 1].status = SettlementChallengeTypesLib.Status.Qualified;
        proposals[proposals.length - 1].currency = currency;
        proposals[proposals.length - 1].stageAmount = stageAmount;
        proposals[proposals.length - 1].targetBalanceAmount = targetBalanceAmount;
        proposals[proposals.length - 1].walletInitiated = walletInitiated;

        // Store proposal index
        proposalIndexByWalletCurrency[wallet][currency.ct][currency.id] = proposals.length;

        return proposals[proposals.length - 1];
    }

    function _activeBalanceLogEntry(address wallet, address currencyCt, uint256 currencyId)
    private
    view
    returns (int256 amount, uint256 blockNumber)
    {
        // Get last log record of deposited and settled balances
        (int256 depositedAmount, uint256 depositedBlockNumber) = balanceTracker.lastFungibleRecord(
            wallet, balanceTracker.depositedBalanceType(), currencyCt, currencyId
        );
        (int256 settledAmount, uint256 settledBlockNumber) = balanceTracker.lastFungibleRecord(
            wallet, balanceTracker.settledBalanceType(), currencyCt, currencyId
        );

        // Set amount as the sum of deposited and settled
        amount = depositedAmount.add(settledAmount);

        // Set block number as the latest of deposited and settled
        blockNumber = depositedBlockNumber > settledBlockNumber ? depositedBlockNumber : settledBlockNumber;
    }
}
