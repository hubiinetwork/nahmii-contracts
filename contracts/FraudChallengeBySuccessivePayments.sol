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
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {Types} from "./Types.sol";

/**
@title FraudChallengeBySuccessivePayments
@notice Where driips are challenged wrt fraud by mismatch in successive payments
*/
contract FraudChallengeBySuccessivePayments is Ownable, FraudChallengable, Configurable, Validatable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeBySuccessivePaymentsEvent(Types.Payment firstPayment, Types.Payment lastPayment, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
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
        Types.Payment firstPayment,
        Types.Payment lastPayment,
        address wallet
    )
    public
    validatorInitialized
    onlySealedPayment(firstPayment)
    onlySealedPayment(lastPayment)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(Types.isPaymentParty(firstPayment, wallet));
        require(Types.isPaymentParty(lastPayment, wallet));
        require(firstPayment.currency == lastPayment.currency);

        Types.PaymentPartyRole firstPaymentPartyRole = (wallet == firstPayment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);
        Types.PaymentPartyRole lastPaymentPartyRole = (wallet == lastPayment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);

        require(validator.isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole));

        require(
            !validator.isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole) ||
        !validator.isGenuineSuccessivePaymentsNetFees(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPayment(lastPayment);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeBySuccessivePaymentsEvent(firstPayment, lastPayment, msg.sender, wallet);
    }
}