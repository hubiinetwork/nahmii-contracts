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
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {NullSettlementDisputeByPayment} from "./NullSettlementDisputeByPayment.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {NullSettlementState} from "./NullSettlementState.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
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
    NullSettlementState public nullSettlementState;
    DriipSettlementChallengeState public driipSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementDisputeByPaymentEvent(NullSettlementDisputeByPayment oldNullSettlementDisputeByPayment,
        NullSettlementDisputeByPayment newNullSettlementDisputeByPayment);
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event SetNullSettlementStateEvent(NullSettlementState oldNullSettlementState,
        NullSettlementState newNullSettlementState);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event StartChallengeEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        address currencyCt, uint currencyId);
    event StartChallengeByProxyEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        address currencyCt, uint currencyId, address proxy);
    event StopChallengeEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        address currencyCt, uint256 currencyId);
    event StopChallengeByProxyEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        address currencyCt, uint256 currencyId, address proxy);
    event ChallengeByPaymentEvent(address challengedWallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        address currencyCt, uint256 currencyId, address challengerWallet);

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

    /// @notice Set the null settlement challenge state contract
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

    /// @notice Set the null settlement state contract
    /// @param newNullSettlementState The (address of) NullSettlementState contract instance
    function setNullSettlementState(NullSettlementState newNullSettlementState)
    public
    onlyDeployer
    notNullAddress(newNullSettlementState)
    {
        NullSettlementState oldNullSettlementState = nullSettlementState;
        nullSettlementState = newNullSettlementState;
        emit SetNullSettlementStateEvent(oldNullSettlementState, nullSettlementState);
    }

    /// @notice Set the driip settlement challenge state contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState)
    public
    onlyDeployer
    notNullAddress(newDriipSettlementChallengeState)
    {
        DriipSettlementChallengeState oldDriipSettlementChallengeState = driipSettlementChallengeState;
        driipSettlementChallengeState = newDriipSettlementChallengeState;
        emit SetDriipSettlementChallengeStateEvent(oldDriipSettlementChallengeState, driipSettlementChallengeState);
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

        // Define currency
        MonetaryTypesLib.Currency memory currency = MonetaryTypesLib.Currency(currencyCt, currencyId);

        // Start challenge for wallet
        _startChallenge(msg.sender, amount, currency, true);

        // Emit event
        emit StartChallengeEvent(
            msg.sender,
            nullSettlementChallengeState.proposalNonce(msg.sender, currency),
            amount,
            nullSettlementChallengeState.proposalTargetBalanceAmount(msg.sender, currency),
            currencyCt, currencyId
        );
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
        // Define currency
        MonetaryTypesLib.Currency memory currency = MonetaryTypesLib.Currency(currencyCt, currencyId);

        // Start challenge for wallet
        _startChallenge(wallet, amount, currency, false);

        // Emit event
        emit StartChallengeByProxyEvent(
            wallet,
            nullSettlementChallengeState.proposalNonce(wallet, currency),
            amount,
            nullSettlementChallengeState.proposalTargetBalanceAmount(wallet, currency),
            currencyCt, currencyId, msg.sender
        );
    }

    /// @notice Stop settlement challenge
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallenge(address currencyCt, uint256 currencyId)
    public
    {
        // Define currency
        MonetaryTypesLib.Currency memory currency = MonetaryTypesLib.Currency(currencyCt, currencyId);

        // Emit event
        emit StopChallengeEvent(
            msg.sender,
            nullSettlementChallengeState.proposalNonce(msg.sender, currency),
            nullSettlementChallengeState.proposalStageAmount(msg.sender, currency),
            nullSettlementChallengeState.proposalTargetBalanceAmount(msg.sender, currency),
            currencyCt, currencyId
        );

        // Stop challenge
        nullSettlementChallengeState.removeProposal(
            msg.sender, currency, true
        );
    }

    /// @notice Stop settlement challenge
    /// @param wallet The concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallengeByProxy(address wallet, address currencyCt, uint256 currencyId)
    public
    onlyOperator
    {
        // Define currency
        MonetaryTypesLib.Currency memory currency = MonetaryTypesLib.Currency(currencyCt, currencyId);

        // Emit event
        emit StopChallengeByProxyEvent(
            wallet,
            nullSettlementChallengeState.proposalNonce(wallet, currency),
            nullSettlementChallengeState.proposalStageAmount(wallet, currency),
            nullSettlementChallengeState.proposalTargetBalanceAmount(wallet, currency),
            currencyCt, currencyId, msg.sender
        );

        // Stop challenge
        nullSettlementChallengeState.removeProposal(
            wallet, currency, false
        );
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

    /// @notice Get the disqualification candidate kind of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The candidate kind of the settlement disqualification
    function proposalDisqualificationCandidateKind(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (string)
    {
        return nullSettlementChallengeState.proposalDisqualificationCandidateKind(
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
        // Challenge by payment
        nullSettlementDisputeByPayment.challengeByPayment(wallet, payment, msg.sender);

        // Emit event
        emit ChallengeByPaymentEvent(
            wallet,
            nullSettlementChallengeState.proposalNonce(wallet, payment.currency),
            nullSettlementChallengeState.proposalStageAmount(wallet, payment.currency),
            nullSettlementChallengeState.proposalTargetBalanceAmount(wallet, payment.currency),
            payment.currency.ct, payment.currency.id, msg.sender
        );
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

        // Require that there is no ongoing overlapping null settlement challenge
        require(nullSettlementChallengeState.hasProposalExpired(wallet, currency));

        // Get the last logged active balance amount and block number
        (
        int256 activeBalanceAmount, uint256 activeBalanceBlockNumber,
        int256 dscCumulativeTransferAmount, int256 dscStageAmount
        ) = _externalProperties(
            wallet, currency
        );

        // Obtain highest settled wallet nonce
        uint256 nonce = nullSettlementState.maxNonceByWalletAndCurrency(wallet, currency);

        // Add proposal, including assurance that there is no overlap with active proposal
        // Target balance amount is calculated as current balance - DSC cumulativeTransferAmount - DSC stage amount - NSC stageAmount
        nullSettlementChallengeState.addProposal(
            wallet, nonce.add(1), stageAmount,
            activeBalanceAmount.sub(
                dscCumulativeTransferAmount.add(dscStageAmount).add(stageAmount)
            ),
            currency,
            activeBalanceBlockNumber, walletInitiated
        );
    }

    function _externalProperties(address wallet, MonetaryTypesLib.Currency currency)
    private
    view
    returns (
        int256 activeBalanceAmount, uint256 activeBalanceBlockNumber,
        int256 dscCumulativeTransferAmount, int256 dscStageAmount
    ) {
        (activeBalanceAmount, activeBalanceBlockNumber) = balanceTracker.fungibleActiveRecord(
            wallet, currency
        );

        if (driipSettlementChallengeState.hasProposal(wallet, currency)) {
            dscCumulativeTransferAmount = driipSettlementChallengeState.proposalCumulativeTransferAmount(wallet, currency);
            dscStageAmount = driipSettlementChallengeState.proposalStageAmount(wallet, currency);
        }
    }
}
