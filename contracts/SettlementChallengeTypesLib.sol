/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";

/**
 * @title     SettlementChallengeTypesLib
 * @dev       Types for settlement challenges
 */
library SettlementChallengeTypesLib {
    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    enum Status {Qualified, Disqualified}

    struct Proposal {
        address wallet;
        uint256 nonce;
        uint256 blockNumber;

        uint256 expirationTime;

        // Status
        Status status;

        // Currency
        MonetaryTypesLib.Currency currency;

        // Stage info
        int256 stageAmount;

        // Balances after amounts have been staged
        int256 targetBalanceAmount;

        // Challenged info
        string challengedType;
        bytes32 challengedHash;

        // True if reward is from wallet balance
        bool balanceReward;

        // Disqualification
        Disqualification disqualification;
    }

    struct Disqualification {
        // Challenger
        address challenger;
        uint256 nonce;
        uint256 blockNumber;

        // Candidate info
        string candidateType;
        bytes32 candidateHash;
    }
}