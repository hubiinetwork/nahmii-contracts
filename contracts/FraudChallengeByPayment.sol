/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title FraudChallengeByPayment
@notice Where driips are challenged wrt fraud by mismatch in single trade property values
*/
contract FraudChallengeByPayment is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentEvent(bytes32 paymentHash, address challenger,
        address lockedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit a payment candidate in continuous Fraud Challenge (FC)
    /// @param payment Fraudulent payment candidate
    function challenge(NahmiiTypesLib.Payment payment)
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlyOperatorSealedPayment(payment)
    {
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(securityBond != address(0));
        require(clientFund != address(0));

        require(validator.isGenuinePaymentWalletHash(payment));

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = validator.isGenuineWalletSignature(
            payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet
        );

        // Genuineness affected by sender
        bool genuineSenderAndFee = validator.isGenuinePaymentSender(payment) &&
        validator.isGenuinePaymentFee(payment);

        // Genuineness affected by recipient
        bool genuineRecipient = validator.isGenuinePaymentRecipient(payment);

        require(!genuineWalletSignature || !genuineSenderAndFee || !genuineRecipient);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPaymentHash(payment.seals.operator.hash);

        // Reward stake fraction
        securityBond.reward(msg.sender, configuration.fraudStakeFraction(), 0);

        address lockedWallet;
        if (!genuineSenderAndFee)
            lockedWallet = payment.sender.wallet;
        if (!genuineRecipient)
            lockedWallet = payment.recipient.wallet;
        if (address(0) != lockedWallet)
            clientFund.lockBalancesByProxy(lockedWallet, msg.sender);

        emit ChallengeByPaymentEvent(payment.seals.operator.hash, msg.sender, lockedWallet);
    }
}