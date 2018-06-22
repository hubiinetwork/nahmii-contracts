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

contract FraudChallengeByDuplicateDriipNonceOfTrades is Ownable, FraudChallengable, Configurable, Validatable, SecurityBondable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDriipNonceOfTradesEvent(Types.Trade trade1, Types.Trade trade2, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate driip nonce
    /// @param trade1 First trade with duplicate driip nonce
    /// @param trade2 Second trade with duplicate driip nonce
    function challenge(
        Types.Trade trade1,
        Types.Trade trade2
    )
    public
    validatorInitialized
    onlySealedTrade(trade1)
    onlySealedTrade(trade2)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(securityBond != address(0));

        require(trade1.seal.hash != trade2.seal.hash);
        require(trade1.nonce == trade2.nonce);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(trade1);
        fraudChallenge.addFraudulentTrade(trade2);

        (address stakeCurrency, int256 stakeAmount) = configuration.getDuplicateDriipNonceStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByDuplicateDriipNonceOfTradesEvent(trade1, trade2, msg.sender);
    }
}