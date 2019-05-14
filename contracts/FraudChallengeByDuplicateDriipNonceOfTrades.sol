/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {ValidatableV2} from "./ValidatableV2.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";

/**
 * @title FraudChallengeByDuplicateDriipNonceOfTrades
 * @notice Where driips are challenged wrt fraud by duplicate drip nonce of trades
 */
contract FraudChallengeByDuplicateDriipNonceOfTrades is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
SecurityBondable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDriipNonceOfTradesEvent(bytes32 tradeHash1,
        bytes32 tradeHash2, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate driip nonce
    /// @param trade1 First trade with duplicate driip nonce
    /// @param trade2 Second trade with duplicate driip nonce
    function challenge(
        TradeTypesLib.Trade memory trade1,
        TradeTypesLib.Trade memory trade2
    )
    public
    onlyOperationalModeNormal
    onlySealedTrade(trade1)
    onlySealedTrade(trade2)
    {
        // Require existence of fraud signal
        require(
            trade1.seal.hash != trade2.seal.hash &&
            trade1.nonce == trade2.nonce
        );

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag trades (hashes) as fraudulent
        fraudChallenge.addFraudulentTradeHash(trade1.seal.hash);
        fraudChallenge.addFraudulentTradeHash(trade2.seal.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // Emit event
        emit ChallengeByDuplicateDriipNonceOfTradesEvent(
            trade1.seal.hash, trade2.seal.hash, msg.sender
        );
    }
}