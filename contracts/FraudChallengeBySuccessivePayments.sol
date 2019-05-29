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
import {FraudChallengable} from "./FraudChallengable.sol";
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title FraudChallengeBySuccessivePayments
 * @notice Where driips are challenged wrt fraud by mismatch in successive payments
 */
contract FraudChallengeBySuccessivePayments is Ownable, FraudChallengable, ConfigurableOperational, Validatable,
SecurityBondable, WalletLockable, BalanceTrackable {
    using SafeMathIntLib for int256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeBySuccessivePaymentsEvent(bytes32 firstPaymentHash,
        bytes32 lastPaymentHash, address challenger, address lockedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two payment candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param firstPayment Reference payment
    /// @param lastPayment Fraudulent payment candidate
    /// @param wallet The address of the concerned wallet
    function challenge(
        PaymentTypesLib.Payment memory firstPayment,
        PaymentTypesLib.Payment memory lastPayment,
        address wallet
    )
    public
    onlyOperationalModeNormal
    onlySealedPayment(firstPayment)
    onlySealedPayment(lastPayment)
    {
        require(validator.isPaymentParty(firstPayment, wallet), "Wallet not party in first payment [FraudChallengeBySuccessivePayments.sol:64]");
        require(validator.isPaymentParty(lastPayment, wallet), "Wallet not party in last payment [FraudChallengeBySuccessivePayments.sol:65]");

        require(validator.isPaymentCurrency(firstPayment, lastPayment.currency), "Differing payment currencies found [FraudChallengeBySuccessivePayments.sol:67]");

        PaymentTypesLib.PaymentPartyRole firstPaymentPartyRole = _paymentPartyRole(firstPayment, wallet);
        PaymentTypesLib.PaymentPartyRole lastPaymentPartyRole = _paymentPartyRole(lastPayment, wallet);

        require(
            validator.isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole),
            "Non-successive payment party nonces found [FraudChallengeBySuccessivePayments.sol:72]"
        );

        int256 deltaActiveBalance = balanceTracker.fungibleActiveDeltaBalanceAmountByBlockNumbers(
            wallet, firstPayment.currency, firstPayment.blockNumber, lastPayment.blockNumber
        );

        // Require existence of fraud signal
        require(
            !(validator.isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole, deltaActiveBalance) &&
        validator.isGenuineSuccessivePaymentsTotalFees(firstPayment, lastPayment)),
            "Fraud signal not found [FraudChallengeBySuccessivePayments.sol:82]"
        );

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag payment (hash) as fraudulent
        fraudChallenge.addFraudulentPaymentHash(lastPayment.seals.operator.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // Lock amount of size equivalent to payment balance
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            PaymentTypesLib.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.balances.current : lastPayment.recipient.balances.current,
            lastPayment.currency.ct, lastPayment.currency.id, 0
        );

        emit ChallengeBySuccessivePaymentsEvent(
            firstPayment.seals.operator.hash, lastPayment.seals.operator.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _paymentPartyRole(PaymentTypesLib.Payment memory payment, address wallet)
    private
    view
    returns (PaymentTypesLib.PaymentPartyRole)
    {
        return validator.isPaymentSender(payment, wallet) ?
        PaymentTypesLib.PaymentPartyRole.Sender :
        PaymentTypesLib.PaymentPartyRole.Recipient;
    }
}