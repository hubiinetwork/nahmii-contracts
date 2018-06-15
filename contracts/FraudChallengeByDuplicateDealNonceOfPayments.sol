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

contract FraudChallengeByDuplicateDealNonceOfPayments is Ownable, FraudChallengable, Configurable, Hashable, SecurityBondable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDealNonceOfPaymentsEvent(Types.Payment payment1, Types.Payment payment2, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two payment candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate deal nonce
    /// @param payment1 First payment with duplicate deal nonce
    /// @param payment2 Second payment with duplicate deal nonce
    function challengeByDuplicateDealNonceOfPayments(
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

        (address stakeCurrency, int256 stakeAmount) = configuration.getDuplicateDealNonceStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByDuplicateDealNonceOfPaymentsEvent(payment1, payment2, msg.sender);
    }
}