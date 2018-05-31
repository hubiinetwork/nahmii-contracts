/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "../contracts/Types.sol";
import "../contracts/DealSettlementChallenge.sol";
pragma experimental ABIEncoderV2;

contract MockedDealSettlementChallenge /*is DealSettlementChallenge*/ {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => DealSettlementChallenge.ChallengeInfo) walletChallengeInfoMap;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*DealSettlementChallenge(owner)*/{
    }

    function setDealSettlementChallengeStatus(address wallet, uint256 nonce, Types.ChallengeResult result, address challenger) public {
        walletChallengeInfoMap[wallet].nonce = nonce;
        walletChallengeInfoMap[wallet].result = result;
        walletChallengeInfoMap[wallet].challenger = challenger;
    }

    function dealSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeResult, address) {
        return (walletChallengeInfoMap[wallet].result, walletChallengeInfoMap[wallet].challenger);
    }
}