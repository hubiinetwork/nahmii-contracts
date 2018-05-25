/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "../contracts/Types.sol";
//import "../contracts/DealSettlementChallenge.sol";
pragma experimental ABIEncoderV2;

contract MockedDealSettlementChallenge /*is DealSettlementChallenge*/ {

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    struct DealSettlementChallengeInfo {
        uint256 nonce;
        Types.DealType dealType;
        uint256 timeout;
        Types.ChallengeStatus status;
        uint256 dealIndex;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => mapping(uint256 => Types.ChallengeStatus)) walletNonceChallengeStatusMap;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*DealSettlementChallenge(owner)*/{
    }

    function setDealSettlementChallengeStatus(address wallet, uint256 nonce, Types.ChallengeStatus status) public {
        walletNonceChallengeStatusMap[wallet][nonce] = status;
    }

    function dealSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeStatus) {
        return walletNonceChallengeStatusMap[wallet][nonce];
    }
}