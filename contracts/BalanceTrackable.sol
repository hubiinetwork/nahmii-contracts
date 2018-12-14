/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {BalanceTracker} from "./BalanceTracker.sol";

/**
 * @title BalanceTrackable
 * @notice An ownable that has a balance tracker property
 */
contract BalanceTrackable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    BalanceTracker public balanceTracker;
    bool frozen;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetBalanceTrackerEvent(BalanceTracker oldBalanceTracker, BalanceTracker newBalanceTracker,
        bool freeze);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the balance tracker contract
    /// @param newBalanceTracker The (address of) BalanceTracker contract instance
    /// @param freeze Indicator of whether later updates are allowed or not
    function setBalanceTracker(BalanceTracker newBalanceTracker, bool freeze)
    public
    onlyDeployer
    notNullAddress(newBalanceTracker)
    notSameAddresses(newBalanceTracker, balanceTracker)
    {
        // Require that this contract has not been frozen
        require(!frozen);

        // Update fields
        BalanceTracker oldBalanceTracker = balanceTracker;
        balanceTracker = newBalanceTracker;
        frozen = freeze;

        // Emit event
        emit SetBalanceTrackerEvent(oldBalanceTracker, newBalanceTracker, freeze);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier balanceTrackerInitialized() {
        require(balanceTracker != address(0));
        _;
    }
}
