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
import {SecurityBondable} from "./SecurityBondable.sol";
import {Types} from "./Types.sol";

contract FraudChallengeByDuplicateDriipNonceOfTradeAndPayment is Ownable, FraudChallengable, Configurable, Validatable, SecurityBondable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDriipNonceOfTradeAndPaymentEvent(Types.Trade trade, Types.Payment payment, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit one trade candidate and one payment candidate in continuous Fraud
    /// Challenge (FC) to be tested for duplicate driip nonce
    /// @param trade Trade with duplicate driip nonce
    /// @param payment Payment with duplicate driip nonce
    function challenge(
        Types.Trade trade,
        Types.Payment payment
    )
    public
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

        (address stakeCurrency, int256 stakeAmount) = configuration.getDuplicateDriipNonceStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByDuplicateDriipNonceOfTradeAndPaymentEvent(trade, payment, msg.sender);
    }
}