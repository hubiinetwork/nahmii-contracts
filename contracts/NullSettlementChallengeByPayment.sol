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
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {NullSettlementDisputeByPayment} from "./NullSettlementDisputeByPayment.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {DriipSettlementState} from "./DriipSettlementState.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title NullSettlementChallengeByPayment
 * @notice Where null settlements pertaining to payments are started and disputed
 */
contract NullSettlementChallengeByPayment is Ownable, ConfigurableOperational, BalanceTrackable, WalletLockable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementDisputeByPayment public nullSettlementDisputeByPayment;
    NullSettlementChallengeState public nullSettlementChallengeState;
    DriipSettlementState public driipSettlementState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementDisputeByPaymentEvent(NullSettlementDisputeByPayment oldNullSettlementDisputeByPayment,
        NullSettlementDisputeByPayment newNullSettlementDisputeByPayment);
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event SetDriipSettlementStateEvent(DriipSettlementState oldDriipSettlementState,
        DriipSettlementState newDriipSettlementState);
    event StartChallengeEvent(address wallet, int256 amount, address currencyCt,
        uint currencyId);
    event StartChallengeByProxyEvent(address wallet, int256 amount,
        address currencyCt, uint currencyId, address proxy);
    event StopChallengeEvent(address wallet, address currencyCt, uint256 currencyId);
    event StopChallengeByProxyEvent(address wallet, address currencyCt, uint256 currencyId, address proxy);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the settlement dispute contract
    /// @param newNullSettlementDisputeByPayment The (address of) NullSettlementDisputeByPayment contract instance
    function setNullSettlementDisputeByPayment(NullSettlementDisputeByPayment newNullSettlementDisputeByPayment)
    public
    onlyDeployer
    notNullAddress(newNullSettlementDisputeByPayment)
    {
        NullSettlementDisputeByPayment oldNullSettlementDisputeByPayment = nullSettlementDisputeByPayment;
        nullSettlementDisputeByPayment = newNullSettlementDisputeByPayment;
        emit SetNullSettlementDisputeByPaymentEvent(oldNullSettlementDisputeByPayment, nullSettlementDisputeByPayment);
    }

    /// @notice Set the settlement challenge state contract
    /// @param newNullSettlementChallengeState The (address of) NullSettlementChallengeState contract instance
    function setNullSettlementChallengeState(NullSettlementChallengeState newNullSettlementChallengeState)
    public
    onlyDeployer
    notNullAddress(newNullSettlementChallengeState)
    {
        NullSettlementChallengeState oldNullSettlementChallengeState = nullSettlementChallengeState;
        nullSettlementChallengeState = newNullSettlementChallengeState;
        emit SetNullSettlementChallengeStateEvent(oldNullSettlementChallengeState, nullSettlementChallengeState);
    }

    /// @notice Set the driip settlement state contract
    /// @param newDriipSettlementState The (address of) DriipSettlementState contract instance
    function setDriipSettlementState(DriipSettlementState newDriipSettlementState)
    public
    onlyDeployer
    notNullAddress(newDriipSettlementState)
    {
        DriipSettlementState oldDriipSettlementState = driipSettlementState;
        driipSettlementState = newDriipSettlementState;
        emit SetDriipSettlementStateEvent(oldDriipSettlementState, driipSettlementState);
    }

    /// @notice Start settlement challenge
    /// @param amount The concerned amount to stage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function startChallenge(int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        // Require that wallet is not locked
        require(!walletLocker.isLocked(msg.sender));

        // Start challenge for wallet
        _startChallenge(msg.sender, amount, MonetaryTypesLib.Currency(currencyCt, currencyId), true);

        // Emit event
        emit StartChallengeEvent(msg.sender, amount, currencyCt, currencyId);
    }

    /// @notice Start settlement challenge for the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param amount The concerned amount to stage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function startChallengeByProxy(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyOperator
    {
        // Start challenge for wallet
        _startChallenge(wallet, amount, MonetaryTypesLib.Currency(currencyCt, currencyId), false);

        // Emit event
        emit StartChallengeByProxyEvent(wallet, amount, currencyCt, currencyId, msg.sender);
    }

    /// @notice Stop settlement challenge
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallenge(address currencyCt, uint256 currencyId)
    public
    {
        // Stop challenge
        _stopChallenge(msg.sender, MonetaryTypesLib.Currency(currencyCt, currencyId), true);

        // Emit event
        emit StopChallengeEvent(msg.sender, currencyCt, currencyId);
    }

    /// @notice Stop settlement challenge
    /// @param wallet The concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallengeByProxy(address wallet, address currencyCt, uint256 currencyId)
    public
    onlyOperator
    {
        // Stop challenge
        _stopChallenge(wallet, MonetaryTypesLib.Currency(currencyCt, currencyId), false);

        // Emit event
        emit StopChallengeByProxyEvent(wallet, currencyCt, currencyId, msg.sender);
    }

    /// @notice Gauge whether the proposal for the given wallet and currency has expired
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return true if proposal has expired, else false
    function hasProposalExpired(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return nullSettlementChallengeState.hasProposalExpired(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the challenge nonce of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The challenge nonce
    function proposalNonce(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return nullSettlementChallengeState.proposalNonce(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal block number of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal block number
    function proposalBlockNumber(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return nullSettlementChallengeState.proposalBlockNumber(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal end time of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal end time
    function proposalExpirationTime(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return nullSettlementChallengeState.proposalExpirationTime(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the challenge status of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The challenge status
    function proposalStatus(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (SettlementChallengeTypesLib.Status)
    {
        return nullSettlementChallengeState.proposalStatus(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal stage amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal stage amount
    function proposalStageAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return nullSettlementChallengeState.proposalStageAmount(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal target balance amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal target balance amount
    function proposalTargetBalanceAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return nullSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the balance reward of the given wallet's settlement proposal
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The balance reward of the settlement proposal
    function proposalWalletInitiated(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return nullSettlementChallengeState.proposalWalletInitiated(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the disqualification challenger of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The challenger of the settlement disqualification
    function proposalDisqualificationChallenger(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (address)
    {
        return nullSettlementChallengeState.proposalDisqualificationChallenger(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the disqualification block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The block number of the settlement disqualification
    function proposalDisqualificationBlockNumber(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return nullSettlementChallengeState.proposalDisqualificationBlockNumber(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the disqualification candidate type of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The candidate type of the settlement disqualification
    function proposalDisqualificationCandidateType(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (string)
    {
        return nullSettlementChallengeState.proposalDisqualificationCandidateType(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the disqualification candidate hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The candidate hash of the settlement disqualification
    function proposalDisqualificationCandidateHash(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bytes32)
    {
        return nullSettlementChallengeState.proposalDisqualificationCandidateHash(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Challenge the settlement by providing payment candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param payment The payment candidate that challenges the null
    function challengeByPayment(address wallet, PaymentTypesLib.Payment payment)
    public
    onlyOperationalModeNormal
    {
        nullSettlementDisputeByPayment.challengeByPayment(wallet, payment, msg.sender);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _startChallenge(address wallet, int256 stageAmount, MonetaryTypesLib.Currency currency,
        bool walletInitiated)
    private
    {
        // Require that current block number is beyond the earliest settlement challenge block number
        require(block.number >= configuration.earliestSettlementBlockNumber());

        // Get the last logged active balance amount and block number
        (int256 activeBalanceAmount, uint256 activeBalanceBlockNumber) = balanceTracker.fungibleActiveRecord(
            wallet, currency
        );

        // Obtain highest settled wallet nonce
        uint256 nonce = driipSettlementState.maxNonceByWalletAndCurrency(wallet, currency);

        // Add proposal, including assurance that there is no overlap with active proposal
        nullSettlementChallengeState.addProposal(
            wallet, nonce, stageAmount, activeBalanceAmount.sub(stageAmount), currency,
            activeBalanceBlockNumber, walletInitiated
        );
    }

    function _stopChallenge(address wallet, MonetaryTypesLib.Currency currency, bool walletTerminated)
    private
    {
        // Stop challenge
        nullSettlementChallengeState.removeProposal(wallet, currency, walletTerminated);
    }
}
