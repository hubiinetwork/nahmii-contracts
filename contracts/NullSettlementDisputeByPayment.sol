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
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Servable} from "./Servable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title NullSettlementDisputeByPayment
 * @notice The where payment related disputes of null settlement challenge happens
 */
contract NullSettlementDisputeByPayment is Ownable, Configurable, Validatable, SecurityBondable, WalletLockable,
BalanceTrackable, FraudChallengable, Servable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CHALLENGE_BY_PAYMENT_ACTION = "challenge_by_payment";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallengeState public nullSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event ChallengeByPaymentEvent(address wallet, uint256 nonce, PaymentTypesLib.Payment payment,
        address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    /// @notice Set the settlement challenge state contract
    /// @param newNullSettlementChallengeState The (address of) NullSettlementChallengeState contract instance
    function setNullSettlementChallengeState(NullSettlementChallengeState newNullSettlementChallengeState) public
    onlyDeployer
    notNullAddress(address(newNullSettlementChallengeState))
    {
        NullSettlementChallengeState oldNullSettlementChallengeState = nullSettlementChallengeState;
        nullSettlementChallengeState = newNullSettlementChallengeState;
        emit SetNullSettlementChallengeStateEvent(oldNullSettlementChallengeState, nullSettlementChallengeState);
    }

    /// @notice Challenge the settlement by providing payment candidate
    /// @dev This challenges the payment sender's side of things
    /// @param wallet The wallet whose settlement is being challenged
    /// @param payment The payment candidate that challenges
    /// @param challenger The address of the challenger
    function challengeByPayment(address wallet, PaymentTypesLib.Payment memory payment, address challenger)
    public
    onlyEnabledServiceAction(CHALLENGE_BY_PAYMENT_ACTION)
    onlySealedPayment(payment)
    onlyPaymentSender(payment, wallet)
    {
        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentHash(payment.seals.operator.hash), "Payment deemed fraudulent [NullSettlementDisputeByPayment.sol:86]");

        // Require that proposal has been initiated
        require(nullSettlementChallengeState.hasProposal(wallet, payment.currency), "No proposal found [NullSettlementDisputeByPayment.sol:89]");

        // Require that proposal has not expired
        require(!nullSettlementChallengeState.hasProposalExpired(wallet, payment.currency), "Proposal found expired [NullSettlementDisputeByPayment.sol:92]");

        // Require that payment party's nonce is strictly greater than proposal's nonce and its current
        // disqualification nonce
        require(payment.sender.nonce > nullSettlementChallengeState.proposalNonce(
            wallet, payment.currency
        ), "Payment nonce not strictly greater than proposal nonce [NullSettlementDisputeByPayment.sol:96]");
        require(payment.sender.nonce > nullSettlementChallengeState.proposalDisqualificationNonce(
            wallet, payment.currency
        ), "Payment nonce not strictly greater than proposal disqualification nonce [NullSettlementDisputeByPayment.sol:99]");

        // Require overrun for this payment to be a valid challenge candidate
        require(_overrun(wallet, payment), "No overrun found [NullSettlementDisputeByPayment.sol:104]");

        // Reward challenger
        _settleRewards(wallet, payment.sender.balances.current, payment.currency, challenger);

        // Disqualify proposal, effectively overriding any previous disqualification
        nullSettlementChallengeState.disqualifyProposal(
            wallet, payment.currency, challenger, payment.blockNumber,
            payment.sender.nonce, payment.seals.operator.hash, PaymentTypesLib.PAYMENT_KIND()
        );

        // Emit event
        emit ChallengeByPaymentEvent(
            wallet, nullSettlementChallengeState.proposalNonce(wallet, payment.currency), payment, challenger
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _overrun(address wallet, PaymentTypesLib.Payment memory payment)
    private
    view
    returns (bool)
    {
        // Get the target balance amount from the proposal
        int targetBalanceAmount = nullSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, payment.currency
        );

        // Get the change in active balance since the start of the challenge
        int256 deltaBalanceSinceStart = balanceTracker.fungibleActiveBalanceAmount(
            wallet, payment.currency
        ).sub(
            balanceTracker.fungibleActiveBalanceAmountByBlockNumber(
                wallet, payment.currency,
                nullSettlementChallengeState.proposalReferenceBlockNumber(wallet, payment.currency)
            )
        );

        // Get the cumulative transfer of the payment
        int256 cumulativeTransfer = balanceTracker.fungibleActiveBalanceAmountByBlockNumber(
            wallet, payment.currency, payment.blockNumber
        ).sub(payment.sender.balances.current);

        return targetBalanceAmount.add(deltaBalanceSinceStart) < cumulativeTransfer;
    }

    // Lock wallet's balances or reward challenger by stake fraction
    function _settleRewards(address wallet, int256 walletAmount, MonetaryTypesLib.Currency memory currency,
        address challenger)
    private
    {
        if (nullSettlementChallengeState.proposalWalletInitiated(wallet, currency))
            _settleBalanceReward(wallet, walletAmount, currency, challenger);

        else
            _settleSecurityBondReward(wallet, walletAmount, currency, challenger);
    }

    function _settleBalanceReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency memory currency,
        address challenger)
    private
    {
        // Unlock wallet/currency for existing challenger if previously locked
        if (SettlementChallengeTypesLib.Status.Disqualified == nullSettlementChallengeState.proposalStatus(
            wallet, currency
        ))
            walletLocker.unlockFungibleByProxy(
                wallet,
                nullSettlementChallengeState.proposalDisqualificationChallenger(
                    wallet, currency
                ),
                currency.ct, currency.id
            );

        // Lock wallet for new challenger
        walletLocker.lockFungibleByProxy(
            wallet, challenger, walletAmount, currency.ct, currency.id, configuration.settlementChallengeTimeout()
        );
    }

    // Settle the two-component reward from security bond.
    // The first component is flat figure as obtained from Configuration
    // The second component is progressive and calculated as
    //    min(walletAmount, fraction of SecurityBond's deposited balance)
    // both amounts for the given currency
    function _settleSecurityBondReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency memory currency,
        address challenger)
    private
    {
        // Deprive existing challenger of reward if previously locked
        if (SettlementChallengeTypesLib.Status.Disqualified == nullSettlementChallengeState.proposalStatus(
            wallet, currency
        ))
            securityBond.depriveAbsolute(
                nullSettlementChallengeState.proposalDisqualificationChallenger(
                    wallet, currency
                ),
                currency.ct, currency.id
            );

        // Reward the flat component
        MonetaryTypesLib.Figure memory flatReward = _flatReward();
        securityBond.rewardAbsolute(
            challenger, flatReward.amount, flatReward.currency.ct, flatReward.currency.id, 0
        );

        // Reward the progressive component
        int256 progressiveRewardAmount = walletAmount.clampMax(
            securityBond.depositedFractionalBalance(
                currency.ct, currency.id, configuration.operatorSettlementStakeFraction()
            )
        );
        securityBond.rewardAbsolute(
            challenger, progressiveRewardAmount, currency.ct, currency.id, 0
        );
    }

    function _flatReward()
    private
    view
    returns (MonetaryTypesLib.Figure memory)
    {
        (int256 amount, address currencyCt, uint256 currencyId) = configuration.operatorSettlementStake();
        return MonetaryTypesLib.Figure(amount, MonetaryTypesLib.Currency(currencyCt, currencyId));
    }
}