/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

/**
@title MockedWalletLocker
@notice Mocked implementation of wallet locker contract
*/
contract MockedWalletLocker {
    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct LockUnlock {
        address lockedWallet;
        address lockerWallet;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    LockUnlock[] public locks;
    LockUnlock[] public unlocks;

    bool public lockedBy;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event LockByProxyEvent(address lockedWallet, address lockerWallet);
    event UnlockByProxyEvent(address lockedWallet, address lockerWallet);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        locks.length = 0;
        unlocks.length = 0;
        lockedBy = false;
    }

    function lockByProxy(address lockedWallet, address lockerWallet)
    public
    {
        locks.push(LockUnlock(lockedWallet, lockerWallet));
        emit LockByProxyEvent(lockedWallet, lockerWallet);
    }

    function unlockByProxy(address wallet)
    public
    {
        unlocks.push(LockUnlock(wallet, address(0)));
        emit UnlockByProxyEvent(wallet, address(0));
    }

    function lockedWalletsCount()
    public
    view
    returns (uint256)
    {
        return locks.length;
    }

    function _unlocksCount()
    public
    view
    returns (uint256)
    {
        return unlocks.length;
    }

    function isLockedBy(address, address)
    public
    view
    returns (bool)
    {
        return lockedBy;
    }

    function _setLockedBy(bool _lockedBy)
    public
    {
        lockedBy = _lockedBy;
    }
}