/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
 * @title     SettlementTypes
 * @dev       Types for settlements
 */
library SettlementTypes {
    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    enum ChallengeStatus {Unknown, Qualified, Disqualified}
    enum ChallengeCandidateType {None, Order, Trade, Payment}
    enum SettlementRole {Origin, Target}

    struct Proposal {
        uint256 nonce; // TODO Consider removal of nonce in place of operato's hash
        uint256 blockNumber;
        uint256 timeout;

        // Status
        ChallengeStatus status;

        // Currencies
        MonetaryTypes.Currency[] currencies;

        // Stage info
        int256[] stageAmounts;

        // Balances after amounts have been staged
        int256[] targetBalanceAmounts;

        // Driip info
        //        bytes32 driipOperatorHash; // TODO Add operator hash
        NahmiiTypes.DriipType driipType;
        uint256 driipIndex;

        // Candidate info updated when calling any of the challenge functions
        ChallengeCandidateType candidateType;
        uint256 candidateIndex;

        // Address of wallet that successfully challenged
        address challenger;
    }

    struct NullSettlement {
        uint256 nonce;
        address wallet;
    }
}