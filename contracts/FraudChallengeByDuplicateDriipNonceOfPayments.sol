/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SelfDestructible} from "./SelfDestructible.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {Types} from "./Types.sol";

/**
@title FraudChallengeByDuplicateDriipNonceOfPayments
@notice Where driips are challenged wrt fraud by duplicate drip nonce of payments
*/
contract FraudChallengeByDuplicateDriipNonceOfPayments is SelfDestructible, FraudChallengable, Configurable, Validatable, SecurityBondable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDriipNonceOfPaymentsEvent(Types.Payment payment1, Types.Payment payment2, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) SelfDestructible(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two payment candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate driip nonce
    /// @param payment1 First payment with duplicate driip nonce
    /// @param payment2 Second payment with duplicate driip nonce
    function challenge(
        Types.Payment payment1,
        Types.Payment payment2
    )
    public
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
        fraudChallenge.addFraudulentPayment(payment1);
        fraudChallenge.addFraudulentPayment(payment2);

        (int256 stakeAmount, address stakeCurrencyCt, /*uint256 stakeCurrencyId*/) = configuration.getDuplicateDriipNonceStake();
        // TODO Update call with stageCurrencyId argument
        securityBond.stage(stakeAmount, stakeCurrencyCt, msg.sender);

        emit ChallengeByDuplicateDriipNonceOfPaymentsEvent(payment1, payment2, msg.sender);
    }
}