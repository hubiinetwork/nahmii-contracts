/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

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
    bool public walletLockerFrozen;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetWalletLockerEvent(WalletLocker oldWalletLocker, WalletLocker newWalletLocker);
    event FreezeWalletLockerEvent();

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the wallet locker contract
    /// @param newWalletLocker The (address of) WalletLocker contract instance
    function setWalletLocker(WalletLocker newWalletLocker)
    public
    onlyDeployer
    notNullAddress(address(newWalletLocker))
    notSameAddresses(address(newWalletLocker), address(walletLocker))
    {
        // Require that this contract has not been frozen
        require(!walletLockerFrozen, "Wallet locker frozen [WalletLockable.sol:43]");

        // Update fields
        WalletLocker oldWalletLocker = walletLocker;
        walletLocker = newWalletLocker;

        // Emit event
        emit SetWalletLockerEvent(oldWalletLocker, newWalletLocker);
    }

    /// @notice Freeze the balance tracker from further updates
    /// @dev This operation can not be undone
    function freezeWalletLocker()
    public
    onlyDeployer
    {
        walletLockerFrozen = true;

        // Emit event
        emit FreezeWalletLockerEvent();
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier walletLockerInitialized() {
        require(address(walletLocker) != address(0), "Wallet locker not initialized [WalletLockable.sol:69]");
        _;
    }
}