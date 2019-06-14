/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
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
        uint256 referenceBlockNumber;
        uint256 definitionBlockNumber;

        uint256 expirationTime;

        // Status
        Status status;

        // Amounts
        Amounts amounts;

        // Currency
        MonetaryTypesLib.Currency currency;

        // Info on challenged driip
        Driip challenged;

        // True is equivalent to reward coming from wallet's balance
        bool walletInitiated;

        // True if proposal has been terminated
        bool terminated;

        // Disqualification
        Disqualification disqualification;
    }

    struct Amounts {
        // Cumulative (relative) transfer info
        int256 cumulativeTransfer;

        // Stage info
        int256 stage;

        // Balances after amounts have been staged
        int256 targetBalance;
    }

    struct Driip {
        // Kind ("payment", "trade", ...)
        string kind;

        // Hash (of operator)
        bytes32 hash;
    }

    struct Disqualification {
        // Challenger
        address challenger;
        uint256 nonce;
        uint256 blockNumber;

        // Info on candidate driip
        Driip candidate;
    }
}