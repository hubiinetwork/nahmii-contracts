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
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title FraudChallengeByDuplicateDriipNonceOfTradeAndPayment
@notice Where driips are challenged wrt fraud by duplicate drip nonce of trade and payment
*/
contract FraudChallengeByDuplicateDriipNonceOfTradeAndPayment is Ownable, FraudChallengable, Challenge, Validatable, SecurityBondable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDriipNonceOfTradeAndPaymentEvent(NahmiiTypes.Trade trade, NahmiiTypes.Payment payment, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit one trade candidate and one payment candidate in continuous Fraud
    /// Challenge (FC) to be tested for duplicate driip nonce
    /// @param trade Trade with duplicate driip nonce
    /// @param payment Payment with duplicate driip nonce
    function challenge(
        NahmiiTypes.Trade trade,
        NahmiiTypes.Payment payment
    )
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlySealedTrade(trade)
    onlySealedPayment(payment)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(securityBond != address(0));

        require(trade.nonce == payment.nonce);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(trade);
        fraudChallenge.addFraudulentPayment(payment);

        (int256 stakeAmount, address stakeCurrencyCt, uint256 stakeCurrencyId) = configuration.getDuplicateDriipNonceStake();
        securityBond.stage(msg.sender, stakeAmount, stakeCurrencyCt, stakeCurrencyId);

        emit ChallengeByDuplicateDriipNonceOfTradeAndPaymentEvent(trade, payment, msg.sender);
    }
}