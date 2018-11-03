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
@title FraudChallengeByDuplicateDriipNonceOfPayments
@notice Where driips are challenged wrt fraud by duplicate drip nonce of payments
*/
contract FraudChallengeByDuplicateDriipNonceOfPayments is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDriipNonceOfPaymentsEvent(NahmiiTypesLib.Payment payment1,
        NahmiiTypesLib.Payment payment2, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two payment candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate driip nonce
    /// @param payment1 First payment with duplicate driip nonce
    /// @param payment2 Second payment with duplicate driip nonce
    function challenge(
        NahmiiTypesLib.Payment payment1,
        NahmiiTypesLib.Payment payment2
    )
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlySealedPayment(payment1)
    onlySealedPayment(payment2)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(securityBond != address(0));

        require(payment1.seals.wallet.hash != payment2.seals.wallet.hash);
        require(payment1.nonce == payment2.nonce);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPaymentHash(payment1.seals.operator.hash);
        fraudChallenge.addFraudulentPaymentHash(payment2.seals.operator.hash);

        // Obtain stake fraction and stage
        securityBond.stageToBeneficiary(msg.sender, clientFund, configuration.fraudStakeFraction());

        emit ChallengeByDuplicateDriipNonceOfPaymentsEvent(payment1, payment2, msg.sender);
    }
}