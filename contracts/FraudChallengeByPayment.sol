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
import {Hashable} from "./Hashable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {Types} from "./Types.sol";

contract FraudChallengeByPayment is Ownable, FraudChallengable, Configurable, Hashable, SecurityBondable, Validatable, ClientFundable {

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
        require(hasher != address(0));
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));
        require(securityBond != address(0));

        require(hasher.hashPaymentAsWallet(payment) == payment.seals.wallet.hash);

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);

        // Genuineness affected by sender
        bool genuineBySender = validator.isGenuineByPaymentSender(payment) &&
        validator.isGenuinePaymentFee(payment);

        // Genuineness affected by recipient
        bool genuineByRecipient = validator.isGenuineByPaymentRecipient(payment);

        require(!genuineWalletSignature || !genuineBySender || !genuineByRecipient);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPayment(payment);

        if (!genuineWalletSignature) {
            (address stakeCurrency, int256 stakeAmount) = configuration.getFalseWalletSignatureStake();
            securityBond.stage(stakeAmount, stakeCurrency, msg.sender);
        } else {
            address seizedWallet;
            if (!genuineBySender)
                seizedWallet = payment.sender.wallet;
            if (!genuineByRecipient)
                seizedWallet = payment.recipient.wallet;
            if (address(0) != seizedWallet) {
                clientFund.seizeDepositedAndSettledBalances(seizedWallet, msg.sender);
                fraudChallenge.addSeizedWallet(seizedWallet);
            }
        }

        emit ChallengeByPaymentEvent(payment, msg.sender, seizedWallet);
    }
}