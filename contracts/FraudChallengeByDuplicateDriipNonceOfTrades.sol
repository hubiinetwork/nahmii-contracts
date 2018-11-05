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
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title FraudChallengeByDuplicateDriipNonceOfTrades
@notice Where driips are challenged wrt fraud by duplicate drip nonce of trades
*/
contract FraudChallengeByDuplicateDriipNonceOfTrades is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDriipNonceOfTradesEvent(NahmiiTypesLib.Trade trade1,
        NahmiiTypesLib.Trade trade2, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate driip nonce
    /// @param trade1 First trade with duplicate driip nonce
    /// @param trade2 Second trade with duplicate driip nonce
    function challenge(
        NahmiiTypesLib.Trade trade1,
        NahmiiTypesLib.Trade trade2
    )
    public
    onlyOperationalModeNormal
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
        fraudChallenge.addFraudulentTradeHash(trade1.seal.hash);
        fraudChallenge.addFraudulentTradeHash(trade2.seal.hash);

        // Reward stake fraction
        securityBond.reward(msg.sender, configuration.fraudStakeFraction());

        emit ChallengeByDuplicateDriipNonceOfTradesEvent(trade1, trade2, msg.sender);
    }
}