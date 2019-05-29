/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

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
    bool public transactionTrackerFrozen;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetTransactionTrackerEvent(TransactionTracker oldTransactionTracker, TransactionTracker newTransactionTracker);
    event FreezeTransactionTrackerEvent();

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the transaction tracker contract
    /// @param newTransactionTracker The (address of) TransactionTracker contract instance
    function setTransactionTracker(TransactionTracker newTransactionTracker)
    public
    onlyDeployer
    notNullAddress(address(newTransactionTracker))
    notSameAddresses(address(newTransactionTracker), address(transactionTracker))
    {
        // Require that this contract has not been frozen
        require(!transactionTrackerFrozen, "Transaction tracker frozen [TransactionTrackable.sol:43]");

        // Update fields
        TransactionTracker oldTransactionTracker = transactionTracker;
        transactionTracker = newTransactionTracker;

        // Emit event
        emit SetTransactionTrackerEvent(oldTransactionTracker, newTransactionTracker);
    }

    /// @notice Freeze the transaction tracker from further updates
    /// @dev This operation can not be undone
    function freezeTransactionTracker()
    public
    onlyDeployer
    {
        transactionTrackerFrozen = true;

        // Emit event
        emit FreezeTransactionTrackerEvent();
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier transactionTrackerInitialized() {
        require(address(transactionTracker) != address(0), "Transaction track not initialized [TransactionTrackable.sol:69]");
        _;
    }
}