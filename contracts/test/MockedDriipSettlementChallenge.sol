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
import {Types} from "../Types.sol";

/**
@title Mocked driip settlement challenge
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

    function setDriipSettlementChallengeStatus(address wallet, uint256 nonce, Types.ChallengeResult result, address challenger) public {
        walletChallengeMap[wallet].nonce = nonce;
        walletChallengeMap[wallet].result = result;
        walletChallengeMap[wallet].challenger = challenger;
    }

    function driipSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeResult, address) {
        if ((0 == walletChallengeMap[wallet].nonce) ||
            (nonce != walletChallengeMap[wallet].nonce))
            return (Types.ChallengeResult.Unknown, address(0));
        else
            return (walletChallengeMap[wallet].result, walletChallengeMap[wallet].challenger);
    }
}