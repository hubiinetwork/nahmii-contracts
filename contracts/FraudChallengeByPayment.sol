/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {Types} from "./Types.sol";

contract FraudChallengeByPayment is Ownable, FraudChallengable, Configurable, Validatable, SecurityBondable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentEvent(Types.Payment payment, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit a payment candidate in continuous Fraud Challenge (FC)
    /// @param payment Fraudulent payment candidate
    function challengeByPayment(Types.Payment payment)
    public
    validatorInitialized
    onlyExchangeSealedPayment(payment)
    {
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(securityBond != address(0));
        require(clientFund != address(0));

        require(validator.isGenuinePaymentWalletHash(payment));

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);

        // Genuineness affected by sender
        bool genuineSenderAndFee = validator.isGenuinePaymentSender(payment) &&
        validator.isGenuinePaymentFee(payment);

        // Genuineness affected by recipient
        bool genuineRecipient = validator.isGenuinePaymentRecipient(payment);

        require(!genuineWalletSignature || !genuineSenderAndFee || !genuineRecipient);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPayment(payment);

        if (!genuineWalletSignature) {
            (address stakeCurrency, int256 stakeAmount) = configuration.getFalseWalletSignatureStake();
            securityBond.stage(stakeAmount, stakeCurrency, msg.sender);
        } else {
            address seizedWallet;
            if (!genuineSenderAndFee)
                seizedWallet = payment.sender.wallet;
            if (!genuineRecipient)
                seizedWallet = payment.recipient.wallet;
            if (address(0) != seizedWallet) {
                clientFund.seizeDepositedAndSettledBalances(seizedWallet, msg.sender);
                fraudChallenge.addSeizedWallet(seizedWallet);
            }
        }

        emit ChallengeByPaymentEvent(payment, msg.sender, seizedWallet);
    }
}