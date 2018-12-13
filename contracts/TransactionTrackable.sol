/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {TransactionTracker} from "./TransactionTracker.sol";

/**
 * @title TransactionTrackable
 * @notice An ownable that has a transaction tracker property
 */
contract TransactionTrackable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    TransactionTracker public transactionTracker;
    bool frozen;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetTransactionTrackerEvent(TransactionTracker oldTransactionTracker, TransactionTracker newTransactionTracker,
        bool freeze);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the transaction tracker contract
    /// @param newTransactionTracker The (address of) TransactionTracker contract instance
    /// @param freeze Indicator of whether later updates are allowed or not
    function setTransactionTracker(TransactionTracker newTransactionTracker, bool freeze)
    public
    onlyDeployer
    notNullAddress(newTransactionTracker)
    notSameAddresses(newTransactionTracker, transactionTracker)
    {
        // Require that this contract has not been frozen
        require(!frozen);

        // Update fields
        TransactionTracker oldTransactionTracker = transactionTracker;
        transactionTracker = newTransactionTracker;
        frozen = freeze;

        // Emit event
        emit SetTransactionTrackerEvent(oldTransactionTracker, newTransactionTracker, freeze);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier transactionTrackerInitialized() {
        require(transactionTracker != address(0));
        _;
    }
}
