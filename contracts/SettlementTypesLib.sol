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
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

// TODO Consider splitting SettlementTypesLib into part for SettlementChallengeTypesLib
/**
 * @title     SettlementTypesLib
 * @dev       Types for settlements
 */
library SettlementTypesLib {
    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    enum Status {Qualified, Disqualified}
    enum SettlementRole {Origin, Target}

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
        uint256 blockNumber;

        // Candidate info
        string candidateType;
        bytes32 candidateHash;
    }

    struct SettlementParty {
        uint256 nonce;
        address wallet;
        bool done;
    }

    struct Settlement {
        string settledType;
        bytes32 settledHash;
        SettlementParty origin;
        SettlementParty target;
    }
}