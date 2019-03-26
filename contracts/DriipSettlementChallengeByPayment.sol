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
import {Validatable} from "./Validatable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {DriipSettlementDisputeByPayment} from "./DriipSettlementDisputeByPayment.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title DriipSettlementChallengeByPayment
 * @notice Where driip settlements pertaining to payments are started and disputed
 */
contract DriipSettlementChallengeByPayment is Ownable, ConfigurableOperational, Validatable, WalletLockable,
BalanceTrackable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementDisputeByPayment public driipSettlementDisputeByPayment;
    DriipSettlementChallengeState public driipSettlementChallengeState;
    NullSettlementChallengeState public nullSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetDriipSettlementDisputeByPaymentEvent(DriipSettlementDisputeByPayment oldDriipSettlementDisputeByPayment,
        DriipSettlementDisputeByPayment newDriipSettlementDisputeByPayment);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event StartChallengeFromPaymentEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        address currencyCt, uint256 currencyId);
    event StartChallengeFromPaymentByProxyEvent(address wallet, uint256 nonce, int256 stageAmount, int256 targetBalanceAmount,
        address currencyCt, uint256 currencyId, address proxy);
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
    /// @param newDriipSettlementDisputeByPayment The (address of) DriipSettlementDisputeByPayment contract instance
    function setDriipSettlementDisputeByPayment(DriipSettlementDisputeByPayment newDriipSettlementDisputeByPayment)
    public
    onlyDeployer
    notNullAddress(newDriipSettlementDisputeByPayment)
    {
        DriipSettlementDisputeByPayment oldDriipSettlementDisputeByPayment = driipSettlementDisputeByPayment;
        driipSettlementDisputeByPayment = newDriipSettlementDisputeByPayment;
        emit SetDriipSettlementDisputeByPaymentEvent(oldDriipSettlementDisputeByPayment, driipSettlementDisputeByPayment);
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

    /// @notice Start settlement challenge on payment
    /// @param payment The challenged payment
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPayment(PaymentTypesLib.Payment payment, int256 stageAmount)
    public
    {
        // Require that wallet is not temporarily disqualified
        require(!walletLocker.isLocked(msg.sender));

        // Start challenge for wallet
        _startChallengeFromPayment(msg.sender, payment, stageAmount, true);

        // Emit event
        emit StartChallengeFromPaymentEvent(
            msg.sender,
            driipSettlementChallengeState.proposalNonce(msg.sender, payment.currency),
            stageAmount,
            driipSettlementChallengeState.proposalTargetBalanceAmount(msg.sender, payment.currency),
            payment.currency.ct, payment.currency.id
        );
    }

    /// @notice Start settlement challenge on payment
    /// @param wallet The concerned party
    /// @param payment The challenged payment
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPaymentByProxy(address wallet, PaymentTypesLib.Payment payment, int256 stageAmount)
    public
    onlyOperator
    {
        // Start challenge for wallet
        _startChallengeFromPayment(wallet, payment, stageAmount, false);

        // Emit event
        emit StartChallengeFromPaymentByProxyEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, payment.currency),
            stageAmount,
            driipSettlementChallengeState.proposalTargetBalanceAmount(wallet, payment.currency),
            payment.currency.ct, payment.currency.id, msg.sender
        );
    }

    /// @notice Stop settlement challenge
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallenge(address currencyCt, uint256 currencyId)
    public
    {
        // Stop challenge
        driipSettlementChallengeState.removeProposal(
            msg.sender, MonetaryTypesLib.Currency(currencyCt, currencyId), true
        );

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
        driipSettlementChallengeState.removeProposal(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId), false
        );

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
        return driipSettlementChallengeState.hasProposalExpired(
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
        return driipSettlementChallengeState.proposalNonce(
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
        return driipSettlementChallengeState.proposalBlockNumber(
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
        return driipSettlementChallengeState.proposalExpirationTime(
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
        return driipSettlementChallengeState.proposalStatus(
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
        return driipSettlementChallengeState.proposalStageAmount(
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
        return driipSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal driip hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal driip hash
    function proposalChallengedHash(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bytes32)
    {
        return driipSettlementChallengeState.proposalChallengedHash(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal driip type of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal driip type
    function proposalChallengedKind(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (string)
    {
        return driipSettlementChallengeState.proposalChallengedKind(
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
        return driipSettlementChallengeState.proposalWalletInitiated(
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
        return driipSettlementChallengeState.proposalDisqualificationChallenger(
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
        return driipSettlementChallengeState.proposalDisqualificationBlockNumber(
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
        return driipSettlementChallengeState.proposalDisqualificationCandidateKind(
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
        return driipSettlementChallengeState.proposalDisqualificationCandidateHash(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Challenge the settlement by providing payment candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param payment The payment candidate that challenges the challenged driip
    function challengeByPayment(address wallet, PaymentTypesLib.Payment payment)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDisputeByPayment.challengeByPayment(wallet, payment, msg.sender);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _startChallengeFromPayment(address wallet, PaymentTypesLib.Payment payment,
        int256 stageAmount, bool walletInitiated)
    private
    onlySealedPayment(payment)
    {
        // Require that current block number is beyond the earliest settlement challenge block number
        require(block.number >= configuration.earliestSettlementBlockNumber());

        // Require that given wallet is a payment party
        require(validator.isPaymentParty(payment, wallet));

        // Require that there is no ongoing overlapping driip settlement challenge
        require(driipSettlementChallengeState.hasProposalExpired(wallet, payment.currency));

        // Require that there is no ongoing overlapping null settlement challenge
        require(nullSettlementChallengeState.hasProposalExpired(wallet, payment.currency));

        // TODO Determine removal of completed settlement challenges
        // Stop challenges
        //        driipSettlementChallengeState.removeProposal(wallet, payment.currency, walletInitiated);
        //        nullSettlementChallengeState.removeProposal(wallet, payment.currency, walletInitiated);

        // Deduce the concerned nonce and cumulative relative transfer
        (uint256 nonce, int256 cumulativeTransferAmount) = _paymentPartyProperties(payment, wallet);

        // Add proposal, including assurance that there is no overlap with active proposal
        // Target balance amount is calculated as current balance - cumulativeTransferAmount - stageAmount
        driipSettlementChallengeState.addProposal(
            wallet, nonce, cumulativeTransferAmount, stageAmount,
            balanceTracker.fungibleActiveBalanceAmount(wallet, payment.currency).sub(cumulativeTransferAmount.add(stageAmount)),
            payment.currency, payment.blockNumber,
            walletInitiated, payment.seals.operator.hash, PaymentTypesLib.PAYMENT_TYPE()
        );
    }

    function _paymentPartyProperties(PaymentTypesLib.Payment payment, address wallet)
    private
    view
    returns (uint256, int256)
    {
        // Obtain the active balance amount at the payment block
        int256 balanceAmountAtPaymentBlock = balanceTracker.fungibleActiveBalanceAmountByBlockNumber(wallet, payment.currency, payment.blockNumber);

        // Return wallet nonce and cumulative relative transfer
        return validator.isPaymentSender(payment, wallet) ?
        (payment.sender.nonce, balanceAmountAtPaymentBlock.sub(payment.sender.balances.current)) :
    (payment.recipient.nonce, balanceAmountAtPaymentBlock.sub(payment.recipient.balances.current));
    }
}
