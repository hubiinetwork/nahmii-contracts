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
import {FraudChallengable} from "./FraudChallengable.sol";
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title FraudChallengeBySuccessivePayments
@notice Where driips are challenged wrt fraud by mismatch in successive payments
*/
contract FraudChallengeBySuccessivePayments is Ownable, FraudChallengable, Challenge, Validatable, ClientFundable, SelfDestructible {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeBySuccessivePaymentsEvent(StriimTypes.Payment firstPayment, StriimTypes.Payment lastPayment, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two payment candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param firstPayment Reference payment
    /// @param lastPayment Fraudulent payment candidate
    /// @param wallet Address of concerned wallet
    function challenge(
        StriimTypes.Payment firstPayment,
        StriimTypes.Payment lastPayment,
        address wallet
    )
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlySealedPayment(firstPayment)
    onlySealedPayment(lastPayment)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(StriimTypes.isPaymentParty(firstPayment, wallet));
        require(StriimTypes.isPaymentParty(lastPayment, wallet));
        require(firstPayment.currency.ct == lastPayment.currency.ct && firstPayment.currency.id == lastPayment.currency.id);

        StriimTypes.PaymentPartyRole firstPaymentPartyRole = (wallet == firstPayment.sender.wallet ? StriimTypes.PaymentPartyRole.Sender : StriimTypes.PaymentPartyRole.Recipient);
        StriimTypes.PaymentPartyRole lastPaymentPartyRole = (wallet == lastPayment.sender.wallet ? StriimTypes.PaymentPartyRole.Sender : StriimTypes.PaymentPartyRole.Recipient);

        require(validator.isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole));

        require(
            !validator.isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole) ||
        !validator.isGenuineSuccessivePaymentsNetFees(firstPayment, lastPayment)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPayment(lastPayment);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeBySuccessivePaymentsEvent(firstPayment, lastPayment, msg.sender, wallet);
    }
}