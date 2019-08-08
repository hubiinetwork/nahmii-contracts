/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

/**
 * @title     DriipSettlementTypesLib
 * @dev       Types for driip settlements
 */
library DriipSettlementTypesLib {
    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    enum SettlementRole {Origin, Target}

    struct SettlementParty {
        uint256 nonce;
        address wallet;
        uint256 doneBlockNumber;
    }

    struct Settlement {
        string settledKind;
        bytes32 settledHash;
        SettlementParty origin;
        SettlementParty target;
    }
}