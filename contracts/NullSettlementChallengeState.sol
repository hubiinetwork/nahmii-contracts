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
    string constant public INITIATE_PROPOSAL_ACTION = "initiate_proposal";
    string constant public TERMINATE_PROPOSAL_ACTION = "terminate_proposal";
    string constant public REMOVE_PROPOSAL_ACTION = "remove_proposal";
    string constant public DISQUALIFY_PROPOSAL_ACTION = "disqualify_proposal";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    SettlementChallengeTypesLib.Proposal[] public proposals;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public proposalIndexByWalletCurrency;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event InitiateProposalEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated);
    event TerminateProposalEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated);
    event RemoveProposalEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated);
    event DisqualifyProposalEvent(address challengedWallet, uint256 challangedNonce, int256 stageAmount,
        int256 targetBalanceAmount, MonetaryTypesLib.Currency currency, uint256 blockNumber, bool walletInitiated,
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

    /// @notice Initiate a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param nonce The wallet nonce
    /// @param stageAmount The proposal stage amount
    /// @param targetBalanceAmount The proposal target balance amount
    /// @param currency The concerned currency
    /// @param blockNumber The proposal block number
    /// @param walletInitiated True if initiated by the concerned challenged wallet
    function initiateProposal(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency memory currency, uint256 blockNumber, bool walletInitiated)
    public
    onlyEnabledServiceAction(INITIATE_PROPOSAL_ACTION)
    {
        // Initiate proposal
        _initiateProposal(
            wallet, nonce, stageAmount, targetBalanceAmount,
            currency, blockNumber, walletInitiated
        );

        // Emit event
        emit InitiateProposalEvent(
            wallet, nonce, stageAmount, targetBalanceAmount, currency,
            blockNumber, walletInitiated
        );
    }

    /// @notice Terminate a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    function terminateProposal(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    onlyEnabledServiceAction(TERMINATE_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];

        // Return gracefully if there is no proposal to terminate
        if (0 == index)
            return;

        // Terminate proposal
        proposals[index - 1].terminated = true;

        // Emit event
        emit TerminateProposalEvent(
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.stage,
            proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated
        );
    }

    /// @notice Terminate a proposal
    /// @param wallet The address of the concerned challenged wallet
    /// @param currency The concerned currency
    /// @param walletTerminated True if wallet terminated
    function terminateProposal(address wallet, MonetaryTypesLib.Currency memory currency, bool walletTerminated)
    public
    onlyEnabledServiceAction(TERMINATE_PROPOSAL_ACTION)
    {
        // Get the proposal index
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];

        // Return gracefully if there is no proposal to terminate
        if (0 == index)
            return;

        // Require that role that initialized (wallet or operator) can only cancel its own proposal
        require(walletTerminated == proposals[index - 1].walletInitiated, "Wallet initiation and termination mismatch [NullSettlementChallengeState.sol:143]");

        // Terminate proposal
        proposals[index - 1].terminated = true;

        // Emit event
        emit TerminateProposalEvent(
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.stage,
            proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated
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
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.stage,
            proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated
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
        require(walletTerminated == proposals[index - 1].walletInitiated, "Wallet initiation and termination mismatch [NullSettlementChallengeState.sol:197]");

        // Emit event
        emit RemoveProposalEvent(
            wallet, proposals[index - 1].nonce, proposals[index - 1].amounts.stage,
            proposals[index - 1].amounts.targetBalance, currency,
            proposals[index - 1].referenceBlockNumber, proposals[index - 1].walletInitiated
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
        require(0 != index, "No settlement found for wallet and currency [NullSettlementChallengeState.sol:226]");

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
            challengedWallet, proposals[index - 1].nonce, proposals[index - 1].amounts.stage,
            proposals[index - 1].amounts.targetBalance, currency, proposals[index - 1].referenceBlockNumber,
            proposals[index - 1].walletInitiated, challengerWallet, candidateNonce, candidateHash, candidateKind
        );
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
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:269]");
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
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:284]");
        return block.timestamp >= proposals[index - 1].expirationTime;
    }

    /// @notice Get the settlement proposal challenge nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal nonce
    function proposalNonce(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:298]");
        return proposals[index - 1].nonce;
    }

    /// @notice Get the settlement proposal reference block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal reference block number
    function proposalReferenceBlockNumber(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:312]");
        return proposals[index - 1].referenceBlockNumber;
    }

    /// @notice Get the settlement proposal definition block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal reference block number
    function proposalDefinitionBlockNumber(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:326]");
        return proposals[index - 1].definitionBlockNumber;
    }

    /// @notice Get the settlement proposal expiration time of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal expiration time
    function proposalExpirationTime(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:340]");
        return proposals[index - 1].expirationTime;
    }

    /// @notice Get the settlement proposal status of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal status
    function proposalStatus(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (SettlementChallengeTypesLib.Status)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:354]");
        return proposals[index - 1].status;
    }

    /// @notice Get the settlement proposal stage amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal stage amount
    function proposalStageAmount(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:368]");
        return proposals[index - 1].amounts.stage;
    }

    /// @notice Get the settlement proposal target balance amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal target balance amount
    function proposalTargetBalanceAmount(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:382]");
        return proposals[index - 1].amounts.targetBalance;
    }

    /// @notice Get the settlement proposal balance reward of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal balance reward
    function proposalWalletInitiated(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (bool)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:396]");
        return proposals[index - 1].walletInitiated;
    }

    /// @notice Get the settlement proposal disqualification challenger of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification challenger
    function proposalDisqualificationChallenger(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (address)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:410]");
        return proposals[index - 1].disqualification.challenger;
    }

    /// @notice Get the settlement proposal disqualification block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification block number
    function proposalDisqualificationBlockNumber(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:424]");
        return proposals[index - 1].disqualification.blockNumber;
    }

    /// @notice Get the settlement proposal disqualification nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification nonce
    function proposalDisqualificationNonce(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:438]");
        return proposals[index - 1].disqualification.nonce;
    }

    /// @notice Get the settlement proposal disqualification candidate hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification candidate hash
    function proposalDisqualificationCandidateHash(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (bytes32)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:452]");
        return proposals[index - 1].disqualification.candidate.hash;
    }

    /// @notice Get the settlement proposal disqualification candidate kind of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal disqualification candidate kind
    function proposalDisqualificationCandidateKind(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (string memory)
    {
        uint256 index = proposalIndexByWalletCurrency[wallet][currency.ct][currency.id];
        require(0 != index, "No proposal found for wallet and currency [NullSettlementChallengeState.sol:466]");
        return proposals[index - 1].disqualification.candidate.kind;
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _initiateProposal(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        MonetaryTypesLib.Currency memory currency, uint256 referenceBlockNumber, bool walletInitiated)
    private
    {
        // Require that stage and target balance amounts are positive
        require(stageAmount.isPositiveInt256(), "Stage amount not positive [NullSettlementChallengeState.sol:478]");
        require(targetBalanceAmount.isPositiveInt256(), "Target balance amount not positive [NullSettlementChallengeState.sol:479]");

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
        proposals[index - 1].amounts.stage = stageAmount;
        proposals[index - 1].amounts.targetBalance = targetBalanceAmount;
        proposals[index - 1].walletInitiated = walletInitiated;
        proposals[index - 1].terminated = false;
    }

    function _removeProposal(uint256 index)
    private
    returns (bool)
    {
        // Remove the proposal and clear references to it
        proposalIndexByWalletCurrency[proposals[index - 1].wallet][proposals[index - 1].currency.ct][proposals[index - 1].currency.id] = 0;
        if (index < proposals.length) {
            proposals[index - 1] = proposals[proposals.length - 1];
            proposalIndexByWalletCurrency[proposals[index - 1].wallet][proposals[index - 1].currency.ct][proposals[index - 1].currency.id] = index;
        }
        proposals.length--;
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