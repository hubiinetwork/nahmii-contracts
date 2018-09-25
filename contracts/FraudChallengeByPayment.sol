/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {AccesorManageable} from "./AccesorManageable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title FraudChallengeByPayment
@notice Where driips are challenged wrt fraud by mismatch in single trade property values
*/
contract FraudChallengeByPayment is Ownable, AccesorManageable, FraudChallengable, Challenge, Validatable, SecurityBondable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentEvent(StriimTypes.Payment payment, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccesorManageable(accessorManager) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit a payment candidate in continuous Fraud Challenge (FC)
    /// @param payment Fraudulent payment candidate
    function challenge(StriimTypes.Payment payment)
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlyExchangeSealedPayment(payment)
    {
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(securityBond != address(0));
        require(clientFund != address(0));

        require(validator.isGenuinePaymentWalletHash(payment));

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = StriimTypes.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);

        // Genuineness affected by sender
        bool genuineSenderAndFee = validator.isGenuinePaymentSender(payment) &&
        validator.isGenuinePaymentFee(payment);

        // Genuineness affected by recipient
        bool genuineRecipient = validator.isGenuinePaymentRecipient(payment);

        require(!genuineWalletSignature || !genuineSenderAndFee || !genuineRecipient);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPayment(payment);

        if (!genuineWalletSignature) {
            (int256 stakeAmount, address stakeCurrencyCt, uint256 stakeCurrencyId) = configuration.getFalseWalletSignatureStake();
            securityBond.stage(msg.sender, stakeAmount, stakeCurrencyCt, stakeCurrencyId);
        } else {
            address seizedWallet;
            if (!genuineSenderAndFee)
                seizedWallet = payment.sender.wallet;
            if (!genuineRecipient)
                seizedWallet = payment.recipient.wallet;
            if (address(0) != seizedWallet) {
                clientFund.seizeAllBalances(seizedWallet, msg.sender);
                fraudChallenge.addSeizedWallet(seizedWallet);
            }
        }

        emit ChallengeByPaymentEvent(payment, msg.sender, seizedWallet);
    }
}