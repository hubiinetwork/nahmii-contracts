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

contract FraudChallengeByDuplicateDealNonceOfTradeAndPayment is Ownable, FraudChallengable, Configurable, Hashable, SecurityBondable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDealNonceOfTradeAndPaymentEvent(Types.Trade trade, Types.Payment payment, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit one trade candidate and one payment candidate in continuous Fraud
    /// Challenge (FC) to be tested for duplicate deal nonce
    /// @param trade Trade with duplicate deal nonce
    /// @param payment Payment with duplicate deal nonce
    function challengeByDuplicateDealNonceOfTradeAndPayment(
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

        (address stakeCurrency, int256 stakeAmount) = configuration.getDuplicateDealNonceStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByDuplicateDealNonceOfTradeAndPaymentEvent(trade, payment, msg.sender);
    }
}