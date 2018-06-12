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

contract FraudChallengeByDuplicateDealNonceOfTrades is Ownable, FraudChallengable, Configurable, Hashable, SecurityBondable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDealNonceOfTradesEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate deal nonce
    /// @param trade1 First trade with duplicate deal nonce
    /// @param trade2 Second trade with duplicate deal nonce
    function challengeByDuplicateDealNonceOfTrades(
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

        (address stakeCurrency, int256 stakeAmount) = configuration.getDuplicateDealNonceStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByDuplicateDealNonceOfTradesEvent(trade1, trade2, msg.sender);
    }
}