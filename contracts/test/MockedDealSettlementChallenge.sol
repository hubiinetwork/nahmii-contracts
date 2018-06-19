/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../Types.sol";
import "../DealSettlementChallenge.sol";

contract MockedDealSettlementChallenge /*is DealSettlementChallenge*/ {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => DealSettlementChallenge.Challenge) walletChallengeMap;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*DealSettlementChallenge(owner)*/{
    }

    function setDealSettlementChallengeStatus(address wallet, uint256 nonce, Types.ChallengeResult result, address challenger) public {
        walletChallengeMap[wallet].nonce = nonce;
        walletChallengeMap[wallet].result = result;
        walletChallengeMap[wallet].challenger = challenger;
    }

    function dealSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeResult, address) {
        if ((0 == walletChallengeMap[wallet].nonce) ||
            (nonce != walletChallengeMap[wallet].nonce))
            return (Types.ChallengeResult.Unknown, address(0));
        else
            return (walletChallengeMap[wallet].result, walletChallengeMap[wallet].challenger);
    }
}