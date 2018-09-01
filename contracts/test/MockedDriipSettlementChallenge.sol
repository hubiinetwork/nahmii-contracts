/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {DriipSettlementChallenge} from "../DriipSettlementChallenge.sol";
import {StriimTypes} from "../StriimTypes.sol";

/**
@title MockedDriipSettlementChallenge
@notice Mocked implementation of driip settlement challenge contract
*/
contract MockedDriipSettlementChallenge /*is DriipSettlementChallenge*/ {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => DriipSettlementChallenge.Challenge) walletChallengeMap;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*DriipSettlementChallenge(owner)*/{
    }

    function setDriipSettlementChallengeResult(address wallet, uint256 nonce, StriimTypes.ChallengeStatus status, address challenger) public {
        walletChallengeMap[wallet].nonce = nonce;
        walletChallengeMap[wallet].status = status;
        walletChallengeMap[wallet].challenger = challenger;
    }

    function driipSettlementChallengeResult(address wallet, uint256 nonce) public view returns (StriimTypes.ChallengeStatus, address) {
        if ((0 == walletChallengeMap[wallet].nonce) ||
            (nonce != walletChallengeMap[wallet].nonce))
            return (StriimTypes.ChallengeStatus.Unknown, address(0));
        else
            return (walletChallengeMap[wallet].status, walletChallengeMap[wallet].challenger);
    }
}