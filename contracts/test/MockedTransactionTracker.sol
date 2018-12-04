/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

/**
@title MockedTransactionTracker
@notice Mocked implementation of transaction tracker contract
*/
contract MockedTransactionTracker {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public DEPOSIT_TRANSACTION_TYPE = "deposit";
    string constant public WITHDRAWAL_TRANSACTION_TYPE = "withdrawal";

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct TransactionLogEntry {
        int256 amount;
        uint256 blockNumber;
        address currencyCt;
        uint256 currencyId;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    bytes32 public depositTransactionType;
    bytes32 public withdrawalTransactionType;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor()
    public
    {
        depositTransactionType = keccak256(abi.encodePacked(DEPOSIT_TRANSACTION_TYPE));
        withdrawalTransactionType = keccak256(abi.encodePacked(WITHDRAWAL_TRANSACTION_TYPE));
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
    }
}