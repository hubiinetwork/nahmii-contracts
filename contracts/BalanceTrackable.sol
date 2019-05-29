/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

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
    bool public balanceTrackerFrozen;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetBalanceTrackerEvent(BalanceTracker oldBalanceTracker, BalanceTracker newBalanceTracker);
    event FreezeBalanceTrackerEvent();

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the balance tracker contract
    /// @param newBalanceTracker The (address of) BalanceTracker contract instance
    function setBalanceTracker(BalanceTracker newBalanceTracker)
    public
    onlyDeployer
    notNullAddress(address(newBalanceTracker))
    notSameAddresses(address(newBalanceTracker), address(balanceTracker))
    {
        // Require that this contract has not been frozen
        require(!balanceTrackerFrozen, "Balance tracker frozen [BalanceTrackable.sol:43]");

        // Update fields
        BalanceTracker oldBalanceTracker = balanceTracker;
        balanceTracker = newBalanceTracker;

        // Emit event
        emit SetBalanceTrackerEvent(oldBalanceTracker, newBalanceTracker);
    }

    /// @notice Freeze the balance tracker from further updates
    /// @dev This operation can not be undone
    function freezeBalanceTracker()
    public
    onlyDeployer
    {
        balanceTrackerFrozen = true;

        // Emit event
        emit FreezeBalanceTrackerEvent();
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier balanceTrackerInitialized() {
        require(address(balanceTracker) != address(0), "Balance tracker not initialized [BalanceTrackable.sol:69]");
        _;
    }
}