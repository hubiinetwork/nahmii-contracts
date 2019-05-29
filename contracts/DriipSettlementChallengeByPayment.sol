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
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {Validatable} from "./Validatable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {DriipSettlementDisputeByPayment} from "./DriipSettlementDisputeByPayment.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {DriipSettlementState} from "./DriipSettlementState.sol";
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
    DriipSettlementState public driipSettlementState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetDriipSettlementDisputeByPaymentEvent(DriipSettlementDisputeByPayment oldDriipSettlementDisputeByPayment,
        DriipSettlementDisputeByPayment newDriipSettlementDisputeByPayment);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event SetDriipSettlementStateEvent(DriipSettlementState oldDriipSettlementState,
        DriipSettlementState newDriipSettlementState);
    event StartChallengeFromPaymentEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, address currencyCt, uint256 currencyId);
    event StartChallengeFromPaymentByProxyEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, address currencyCt, uint256 currencyId, address proxy);
    event StopChallengeEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, address currencyCt, uint256 currencyId);
    event StopChallengeByProxyEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, address currencyCt, uint256 currencyId, address proxy);
    event ChallengeByPaymentEvent(address challengedWallet, uint256 nonce, int256 cumulativeTransferAmount, int256 stageAmount,
        int256 targetBalanceAmount, address currencyCt, uint256 currencyId, address challengerWallet);

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
    notNullAddress(address(newDriipSettlementDisputeByPayment))
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
    notNullAddress(address(newDriipSettlementChallengeState))
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
    notNullAddress(address(newNullSettlementChallengeState))
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
    notNullAddress(address(newDriipSettlementState))
    {
        DriipSettlementState oldDriipSettlementState = driipSettlementState;
        driipSettlementState = newDriipSettlementState;
        emit SetDriipSettlementStateEvent(oldDriipSettlementState, driipSettlementState);
    }

    /// @notice Start settlement challenge on payment
    /// @param payment The challenged payment
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPayment(PaymentTypesLib.Payment memory payment, int256 stageAmount)
    public
    {
        // Require that wallet is not temporarily disqualified
        require(!walletLocker.isLocked(msg.sender), "Wallet found locked [DriipSettlementChallengeByPayment.sol:134]");

        // Start challenge for wallet
        _startChallengeFromPayment(msg.sender, payment, stageAmount, true);

        // Emit event
        emit StartChallengeFromPaymentEvent(
            msg.sender,
            driipSettlementChallengeState.proposalNonce(msg.sender, payment.currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(msg.sender, payment.currency),
            stageAmount,
            driipSettlementChallengeState.proposalTargetBalanceAmount(msg.sender, payment.currency),
            payment.currency.ct, payment.currency.id
        );
    }

    /// @notice Start settlement challenge on payment
    /// @param wallet The concerned party
    /// @param payment The challenged payment
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPaymentByProxy(address wallet, PaymentTypesLib.Payment memory payment, int256 stageAmount)
    public
    onlyOperator
    {
        // Start challenge for wallet
        _startChallengeFromPayment(wallet, payment, stageAmount, false);

        // Emit event
        emit StartChallengeFromPaymentByProxyEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, payment.currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(wallet, payment.currency),
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
        // Define currency
        MonetaryTypesLib.Currency memory currency = MonetaryTypesLib.Currency(currencyCt, currencyId);

        // Stop challenge
        _stopChallenge(msg.sender, currency, true, true);

        // Emit event
        emit StopChallengeEvent(
            msg.sender,
            driipSettlementChallengeState.proposalNonce(msg.sender, currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(msg.sender, currency),
            driipSettlementChallengeState.proposalStageAmount(msg.sender, currency),
            driipSettlementChallengeState.proposalTargetBalanceAmount(msg.sender, currency),
            currencyCt, currencyId
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

        // Terminate driip settlement challenge proposal
        _stopChallenge(wallet, currency, true, false);

        // Emit event
        emit StopChallengeByProxyEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(wallet, currency),
            driipSettlementChallengeState.proposalStageAmount(wallet, currency),
            driipSettlementChallengeState.proposalTargetBalanceAmount(wallet, currency),
            currencyCt, currencyId, msg.sender
        );
    }

    /// @notice Gauge whether the proposal for the given wallet and currency has been defined
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return true if proposal has been initiated, else false
    function hasProposal(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return driipSettlementChallengeState.hasProposal(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Gauge whether the proposal for the given wallet and currency has terminated
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return true if proposal has terminated, else false
    function hasProposalTerminated(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return driipSettlementChallengeState.hasProposalTerminated(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
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
    function proposalReferenceBlockNumber(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return driipSettlementChallengeState.proposalReferenceBlockNumber(
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
    returns (string memory)
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
    returns (string memory)
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
    function challengeByPayment(address wallet, PaymentTypesLib.Payment memory payment)
    public
    onlyOperationalModeNormal
    {
        // Challenge by payment
        driipSettlementDisputeByPayment.challengeByPayment(wallet, payment, msg.sender);

        // Emit event
        emit ChallengeByPaymentEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, payment.currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(wallet, payment.currency),
            driipSettlementChallengeState.proposalStageAmount(wallet, payment.currency),
            driipSettlementChallengeState.proposalTargetBalanceAmount(wallet, payment.currency),
            payment.currency.ct, payment.currency.id, msg.sender
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _startChallengeFromPayment(address wallet, PaymentTypesLib.Payment memory payment,
        int256 stageAmount, bool walletInitiated)
    private
    onlySealedPayment(payment)
    {
        // Require that current block number is beyond the earliest settlement challenge block number
        require(
            block.number >= configuration.earliestSettlementBlockNumber(),
            "Current block number below earliest settlement block number [DriipSettlementChallengeByPayment.sol:489]"
        );

        // Require that given wallet is a payment party
        require(validator.isPaymentParty(payment, wallet), "Wallet is not payment party [DriipSettlementChallengeByPayment.sol:495]");

        // Require that there is no ongoing overlapping driip settlement challenge
        require(
            !driipSettlementChallengeState.hasProposal(wallet, payment.currency) ||
        driipSettlementChallengeState.hasProposalTerminated(wallet, payment.currency),
            "Overlapping driip settlement challenge proposal found [DriipSettlementChallengeByPayment.sol:498]"
        );

        // Require that there is no ongoing overlapping null settlement challenge
        require(
            !nullSettlementChallengeState.hasProposal(wallet, payment.currency) ||
        nullSettlementChallengeState.hasProposalTerminated(wallet, payment.currency),
            "Overlapping null settlement challenge proposal found [DriipSettlementChallengeByPayment.sol:505]"
        );

        // Deduce the concerned nonce and cumulative relative transfer
        (uint256 nonce, int256 cumulativeTransferAmount) = _paymentPartyProperties(payment, wallet);

        // Initiate proposal, including assurance that there is no overlap with active proposal
        // Target balance amount is calculated as current balance - cumulativeTransferAmount - stageAmount
        driipSettlementChallengeState.initiateProposal(
            wallet, nonce, cumulativeTransferAmount, stageAmount,
            balanceTracker.fungibleActiveBalanceAmount(wallet, payment.currency).sub(
                cumulativeTransferAmount.add(stageAmount)
            ),
            payment.currency, payment.blockNumber,
            walletInitiated, payment.seals.operator.hash, PaymentTypesLib.PAYMENT_KIND()
        );
    }

    function _stopChallenge(address wallet, MonetaryTypesLib.Currency memory currency, bool clearNonce, bool walletTerminated)
    private
    {
        // Require that there is an unterminated driip settlement challenge proposal
        require(driipSettlementChallengeState.hasProposal(wallet, currency), "No proposal found [DriipSettlementChallengeByPayment.sol:530]");
        require(!driipSettlementChallengeState.hasProposalTerminated(wallet, currency), "Proposal found terminated [DriipSettlementChallengeByPayment.sol:531]");

        // Terminate driip settlement challenge proposal
        driipSettlementChallengeState.terminateProposal(wallet, currency, clearNonce, walletTerminated);

        // Terminate dependent null settlement challenge proposal if existent
        nullSettlementChallengeState.terminateProposal(wallet, currency);
    }

    function _paymentPartyProperties(PaymentTypesLib.Payment memory payment, address wallet)
    private
    view
    returns (uint256 nonce, int256 correctedCumulativeTransferAmount)
    {
        // Obtain unsynchronized stage amount from previous driip settlement if existent.
        int256 unsynchronizedStageAmount = 0;
        if (driipSettlementChallengeState.hasProposal(wallet, payment.currency)) {
            uint256 previousChallengeNonce = driipSettlementChallengeState.proposalNonce(wallet, payment.currency);

            // Get settlement party done block number. The function returns 0 if the settlement party has not effectuated
            // its side of the settlement.
            uint256 settlementPartyDoneBlockNumber = driipSettlementState.settlementPartyDoneBlockNumber(
                wallet, previousChallengeNonce
            );

            // If payment is not up to date wrt events affecting the wallet's balance then obtain
            // the unsynchronized stage amount from the previous driip settlement challenge.
            if (payment.blockNumber < settlementPartyDoneBlockNumber)
                unsynchronizedStageAmount = driipSettlementChallengeState.proposalStageAmount(
                    wallet, payment.currency
                );
        }

        // Obtain the active balance amount at the payment block
        int256 balanceAmountAtPaymentBlock = balanceTracker.fungibleActiveBalanceAmountByBlockNumber(
            wallet, payment.currency, payment.blockNumber
        );

        // Obtain nonce and cumulative (relative) transfer amount.
        // Correct the cumulative transfer amount for wrong value occurring from
        // race condition of off-chain wallet rebalance resulting from completed settlement
        if (validator.isPaymentSender(payment, wallet)) {
            nonce = payment.sender.nonce;
            correctedCumulativeTransferAmount = balanceAmountAtPaymentBlock
            .sub(payment.sender.balances.current)
            .add(unsynchronizedStageAmount);
        } else {
            nonce = payment.recipient.nonce;
            correctedCumulativeTransferAmount = balanceAmountAtPaymentBlock
            .sub(payment.recipient.balances.current)
            .add(unsynchronizedStageAmount);
        }
    }
}