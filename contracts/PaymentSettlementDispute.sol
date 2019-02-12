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
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {CancelOrdersChallengable} from "./CancelOrdersChallengable.sol";
import {Servable} from "./Servable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";
import {DriipSettlementState} from "./DriipSettlementState.sol";

/**
 * @title PaymentSettlementDispute
 * @notice The where payment related disputes of driip settlement challenge happens
 */
contract PaymentSettlementDispute is Ownable, Configurable, Validatable, SecurityBondable, WalletLockable,
FraudChallengable, CancelOrdersChallengable, Servable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    // TODO Register PaymentSettlementChallenge as service and enable action
    string constant public CHALLENGE_BY_PAYMENT_ACTION = "challenge_by_payment";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementState public driipSettlementState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetDriipSettlementStateEvent(DriipSettlementState oldDriipSettlementState,
        DriipSettlementState newDriipSettlementState);
    event ChallengeByPaymentEvent(address wallet, PaymentTypesLib.Payment payment,
        address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    /// @notice Set the driip settlement state contract
    /// @param newDriipSettlementState The (address of) DriipSettlementState contract instance
    function setDriipSettlementState(DriipSettlementState newDriipSettlementState) public
    onlyDeployer
    notNullAddress(newDriipSettlementState)
    {
        DriipSettlementState oldDriipSettlementState = driipSettlementState;
        driipSettlementState = newDriipSettlementState;
        emit SetDriipSettlementStateEvent(oldDriipSettlementState, driipSettlementState);
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @dev This challenges the payment sender's side of things
    /// @param wallet The concerned party
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    function challengeByPayment(address wallet, PaymentTypesLib.Payment payment, address challenger)
    public
    onlyEnabledServiceAction(CHALLENGE_BY_PAYMENT_ACTION)
    onlySealedPayment(payment)
    onlyPaymentSender(payment, wallet)
    {
        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentHash(payment.seals.operator.hash));

        // Require that proposal has not expired
        require(!driipSettlementState.hasProposalExpired(wallet, payment.currency));

        // TODO Replace by wallet nonce
        // Require that payment's block number is not earlier than proposal's block number or its current
        // disqualification block number
        require(payment.blockNumber >= driipSettlementState.proposalBlockNumber(
            wallet, payment.currency
        ));
        require(payment.blockNumber >= driipSettlementState.proposalDisqualificationBlockNumber(
            wallet, payment.currency
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for the provided payment to be a valid challenge candidate.
        require(payment.transfers.single > driipSettlementState.proposalTargetBalanceAmount(
            wallet, payment.currency
        ));

        // Reward challenger
        _settleRewards(wallet, payment.sender.balances.current, payment.currency, challenger, 0);

        // Disqualify proposal, effectively overriding any previous disqualification
        driipSettlementState.disqualifyProposal(
            wallet, payment.currency, challenger, payment.blockNumber,
            payment.seals.operator.hash, SettlementTypesLib.CandidateType.Payment
        );

        // Emit event
        emit ChallengeByPaymentEvent(wallet, payment, challenger);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    // Lock wallet's balances or reward challenger by stake fraction
    function _settleRewards(address wallet, int256 walletAmount, MonetaryTypesLib.Currency currency,
        address challenger, uint256 unlockTimeoutInSeconds)
    private
    {
        if (driipSettlementState.proposalBalanceReward(wallet, currency))
            _settleBalanceReward(wallet, walletAmount, currency, challenger);

        else
            _settleSecurityBondReward(wallet, walletAmount, currency, challenger, unlockTimeoutInSeconds);
    }

    function _settleBalanceReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency currency,
        address challenger)
    private
    {
        // Unlock wallet/currency for existing challenger if previously locked
        if (SettlementTypesLib.Status.Disqualified == driipSettlementState.proposalStatus(
            wallet, currency
        ))
            walletLocker.unlockFungibleByProxy(
                wallet,
                driipSettlementState.proposalDisqualificationChallenger(
                    wallet, currency
                ),
                currency.ct, currency.id
            );

        // Lock wallet for new challenger
        walletLocker.lockFungibleByProxy(wallet, challenger, walletAmount, currency.ct, currency.id);
    }

    // Settle the two-component reward from security bond.
    // The first component is flat figure as obtained from Configuration
    // The second component is progressive and calculated as
    //    min(walletAmount, fraction of SecurityBond's deposited balance)
    // both amounts for the given currency
    function _settleSecurityBondReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency currency,
        address challenger, uint256 unlockTimeoutInSeconds)
    private
    {
        // Deprive existing challenger of reward if previously locked
        if (SettlementTypesLib.Status.Disqualified == driipSettlementState.proposalStatus(
            wallet, currency
        ))
            securityBond.depriveAbsolute(
                driipSettlementState.proposalDisqualificationChallenger(
                    wallet, currency
                ),
                currency.ct, currency.id
            );

        // Reward the flat component
        MonetaryTypesLib.Figure memory flatReward = _flatReward();
        securityBond.rewardAbsolute(
            challenger, flatReward.amount, flatReward.currency.ct, flatReward.currency.id, unlockTimeoutInSeconds
        );

        // Reward the progressive component
        int256 progressiveRewardAmount = walletAmount.clampMax(
            securityBond.depositedFractionalBalance(currency.ct, currency.id, configuration.operatorSettlementStakeFraction())
        );
        securityBond.rewardAbsolute(
            challenger, progressiveRewardAmount, currency.ct, currency.id, unlockTimeoutInSeconds
        );
    }

    function _flatReward()
    private
    view
    returns (MonetaryTypesLib.Figure)
    {
        (int256 amount, address currencyCt, uint256 currencyId) = configuration.operatorSettlementStake();
        return MonetaryTypesLib.Figure(amount, MonetaryTypesLib.Currency(currencyCt, currencyId));
    }
}