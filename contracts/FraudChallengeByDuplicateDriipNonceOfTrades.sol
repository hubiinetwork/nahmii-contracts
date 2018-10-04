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
import {AccessorManageable} from "./AccessorManageable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title FraudChallengeByDuplicateDriipNonceOfTrades
@notice Where driips are challenged wrt fraud by duplicate drip nonce of trades
*/
contract FraudChallengeByDuplicateDriipNonceOfTrades is Ownable, AccessorManageable, FraudChallengable, Challenge, Validatable, SecurityBondable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDuplicateDriipNonceOfTradesEvent(StriimTypes.Trade trade1, StriimTypes.Trade trade2, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccessorManageable(accessorManager) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// duplicate driip nonce
    /// @param trade1 First trade with duplicate driip nonce
    /// @param trade2 Second trade with duplicate driip nonce
    function challenge(
        StriimTypes.Trade trade1,
        StriimTypes.Trade trade2
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
        fraudChallenge.addFraudulentTrade(trade1);
        fraudChallenge.addFraudulentTrade(trade2);

        (int256 stakeAmount, address stakeCurrencyCt, uint256 stakeCurrencyId) = configuration.getDuplicateDriipNonceStake();
        securityBond.stage(msg.sender, stakeAmount, stakeCurrencyCt, stakeCurrencyId);

        emit ChallengeByDuplicateDriipNonceOfTradesEvent(trade1, trade2, msg.sender);
    }
}