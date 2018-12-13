/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {WalletLocker} from "./WalletLocker.sol";

/**
 * @title WalletLockable
 * @notice An ownable that has a wallet locker property
 */
contract WalletLockable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    WalletLocker public walletLocker;
    bool frozen;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetWalletLockerEvent(WalletLocker oldWalletLocker, WalletLocker newWalletLocker,
        bool freeze);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the wallet locker contract
    /// @param newWalletLocker The (address of) WalletLocker contract instance
    /// @param freeze Indicator of whether later updates are allowed or not
    function setWalletLocker(WalletLocker newWalletLocker, bool freeze)
    public
    onlyDeployer
    notNullAddress(newWalletLocker)
    notSameAddresses(newWalletLocker, walletLocker)
    {
        // Require that this contract has not been frozen
        require(!frozen);

        // Update fields
        WalletLocker oldWalletLocker = walletLocker;
        walletLocker = newWalletLocker;
        frozen = freeze;

        // Emit event
        emit SetWalletLockerEvent(oldWalletLocker, newWalletLocker, freeze);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier walletLockerInitialized() {
        require(walletLocker != address(0));
        _;
    }
}
