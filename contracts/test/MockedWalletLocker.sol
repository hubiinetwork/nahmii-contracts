/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

/**
 * @title MockedWalletLocker
 * @notice Mocked implementation of wallet locker contract
 */
contract MockedWalletLocker {
    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct FungibleLockUnlock {
        address lockedWallet;
        address lockerWallet;
        int256 amount;
        address currencyCt;
        uint256 currencyId;
    }

    struct NonFungibleLockUnlock {
        address lockedWallet;
        address lockerWallet;
        int256[] ids;
        address currencyCt;
        uint256 currencyId;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    FungibleLockUnlock[] public fungibleLocks;
    FungibleLockUnlock[] public fungibleUnlocks;
    NonFungibleLockUnlock[] public nonFungibleLocks;
    NonFungibleLockUnlock[] public nonFungibleUnlocks;

    address[] public lockedWallets;

    bool public locked;
    bool public lockedBy;
    int256 public _lockedAmount;
    uint256 public _lockedIdsCount;
    int256[] public _lockedIdsByIndices;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event LockFungibleByProxyEvent(address lockedWallet, address lockerWallet, int256 amount,
        address currencyCt, uint256 currencyId);
    event LockNonFungibleByProxyEvent(address lockedWallet, address lockerWallet, int256[] ids,
        address currencyCt, uint256 currencyId);
    event UnlockFungibleEvent(address lockedWallet, address lockerWallet, int256 amount, address currencyCt,
        uint256 currencyId);
    event UnlockFungibleByProxyEvent(address lockedWallet, address lockerWallet, int256 amount, address currencyCt,
        uint256 currencyId);
    event UnlockNonFungibleEvent(address lockedWallet, address lockerWallet, int256[] ids, address currencyCt,
        uint256 currencyId);
    event UnlockNonFungibleByProxyEvent(address lockedWallet, address lockerWallet, int256[] ids, address currencyCt,
        uint256 currencyId);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        fungibleLocks.length = 0;
        fungibleUnlocks.length = 0;
        nonFungibleLocks.length = 0;
        nonFungibleUnlocks.length = 0;
        lockedWallets.length = 0;
        locked = false;
        lockedBy = false;
        _lockedAmount = 0;
        _lockedIdsCount = 0;
        _lockedIdsByIndices.length = 0;
    }

    function lockFungibleByProxy(address lockedWallet, address lockerWallet, int256 amount,
        address currencyCt, uint256 currencyId)
    public
    {
        fungibleLocks.push(FungibleLockUnlock(lockedWallet, lockerWallet, amount, currencyCt, currencyId));
        lockedWallets.push(lockedWallet);
        emit LockFungibleByProxyEvent(lockedWallet, lockerWallet, amount, currencyCt, currencyId);
    }

    function lockNonFungibleByProxy(address lockedWallet, address lockerWallet, int256[] ids,
        address currencyCt, uint256 currencyId)
    public
    {
        nonFungibleLocks.push(NonFungibleLockUnlock(lockedWallet, lockerWallet, ids, currencyCt, currencyId));
        lockedWallets.push(lockedWallet);
        emit LockNonFungibleByProxyEvent(lockedWallet, lockerWallet, ids, currencyCt, currencyId);
    }

    function unlockFungible(address lockedWallet, address lockerWallet, int256 amount,
        address currencyCt, uint256 currencyId)
    public
    {
        fungibleUnlocks.push(FungibleLockUnlock(lockedWallet, lockerWallet, amount, currencyCt, currencyId));
        emit UnlockFungibleEvent(lockedWallet, lockerWallet, amount, currencyCt, currencyId);
    }

    function unlockFungibleByProxy(address lockedWallet, address lockerWallet, int256 amount,
        address currencyCt, uint256 currencyId)
    public
    {
        fungibleUnlocks.push(FungibleLockUnlock(lockedWallet, lockerWallet, amount, currencyCt, currencyId));
        emit UnlockFungibleByProxyEvent(lockedWallet, lockerWallet, amount, currencyCt, currencyId);
    }

    function unlockNonFungible(address lockedWallet, address lockerWallet, int256[] ids,
        address currencyCt, uint256 currencyId)
    public
    {
        nonFungibleUnlocks.push(NonFungibleLockUnlock(lockedWallet, lockerWallet, ids, currencyCt, currencyId));
        emit UnlockNonFungibleEvent(lockedWallet, lockerWallet, ids, currencyCt, currencyId);
    }

    function unlockNonFungibleByProxy(address lockedWallet, address lockerWallet, int256[] ids,
        address currencyCt, uint256 currencyId)
    public
    {
        nonFungibleUnlocks.push(NonFungibleLockUnlock(lockedWallet, lockerWallet, ids, currencyCt, currencyId));
        emit UnlockNonFungibleByProxyEvent(lockedWallet, lockerWallet, ids, currencyCt, currencyId);
    }

    function lockedWalletsCount()
    public
    view
    returns (uint256)
    {
        return lockedWallets.length;
    }

    function _fungibleLocksCount()
    public
    view
    returns (uint256)
    {
        return fungibleLocks.length;
    }

    function _fungibleUnlocksCount()
    public
    view
    returns (uint256)
    {
        return fungibleUnlocks.length;
    }

    function _nonFungibleLocksCount()
    public
    view
    returns (uint256)
    {
        return nonFungibleLocks.length;
    }

    function _nonFungibleUnlocksCount()
    public
    view
    returns (uint256)
    {
        return nonFungibleUnlocks.length;
    }

    function isLocked(address, address, uint256)
    public
    view
    returns (bool)
    {
        return locked;
    }

    function _setLocked(bool _locked)
    public
    {
        locked = _locked;
    }

    function isLockedBy(address, address, address, uint256)
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

    function lockedAmount(address, address, address, uint256)
    public
    view
    returns (int256)
    {
        return _lockedAmount;
    }

    function _setLockedAmount(int256 amount)
    public
    {
        _lockedAmount = amount;
    }

    function lockedIdsCount(address, address, address, uint256)
    public
    view
    returns (uint256)
    {
        return _lockedIdsCount;
    }

    function _setLockedIdsCount(uint256 count)
    public
    {
        _lockedIdsCount = count;
    }

    function lockedIdsByIndices(address, address, address, uint256, uint256, uint256)
    public
    view
    returns (int256[])
    {
        return _lockedIdsByIndices;
    }

    function _setLockedIdsByIndices(int256[] ids)
    public
    {
        _lockedIdsByIndices = ids;
    }
}