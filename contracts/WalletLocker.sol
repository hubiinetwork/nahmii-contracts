/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {Configurable} from "./Configurable.sol";
import {AuthorizableServable} from "./AuthorizableServable.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";

/**
@title Wallet locker
@notice An ownable to lock and unlock wallets
*/
contract WalletLocker is Ownable, Configurable, AuthorizableServable {
    using SafeMathUintLib for uint256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Wallet {
        address locker;
        uint256 unlockTime;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;

    address[] public lockedWallets;
    mapping(address => uint256) public lockedWalletIndexByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event LockByProxyEvent(address lockedWallet, address lockerWallet);
    event UnlockEvent(address lockedWallet, address lockerWallet);
    event UnlockByProxyEvent(address lockedWallet, address lockerWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer)
    public
    {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Lock the given locked wallet on behalf of the given locker wallet
    /// @param lockedWallet The address of wallet that will be locked
    /// @param lockerWallet The address of wallet that locks
    function lockByProxy(address lockedWallet, address lockerWallet)
    public
    notNullAddress(lockerWallet)
    onlyAuthorizedService(lockedWallet)
    {
        // Require that locked and locker wallets are not identical
        require(lockedWallet != lockerWallet);

        // Require that the wallet to be locked is not locked by other wallet
        require(
            address(0) == walletMap[lockedWallet].locker ||
            lockerWallet == walletMap[lockedWallet].locker ||
            block.timestamp >= walletMap[lockedWallet].unlockTime
        );

        // Lock and set release time
        walletMap[lockedWallet].locker = lockerWallet;
        walletMap[lockedWallet].unlockTime = block.timestamp.add(configuration.walletLockTimeout());

        // Add to the store of locked wallets
        _addToLockedWallets(lockedWallet);

        // Emit event
        emit LockByProxyEvent(lockedWallet, lockerWallet);
    }

    /// @notice Unlock of msg.sender if release timeout has expired
    function unlock()
    public
    {
        // Require that release timeout has expired
        require(
            address(0) != walletMap[msg.sender].locker &&
            block.timestamp >= walletMap[msg.sender].unlockTime
        );

        // Store locker
        address locker = walletMap[msg.sender].locker;

        // Unlock balances
        _unlock(msg.sender);

        // Emit event
        emit UnlockEvent(msg.sender, locker);
    }

    /// @notice Unlock balances of the given wallet
    /// @param wallet The address of the concerned wallet whose balances will be unlocked
    function unlockByProxy(address wallet)
    public
    onlyAuthorizedService(wallet)
    {
        // Store locker
        address locker = walletMap[msg.sender].locker;

        // Unlock balances
        _unlock(wallet);

        // Emit event
        emit UnlockByProxyEvent(msg.sender, locker);
    }

    /// @notice Get the count of locked wallets
    /// @return The count of locked wallets
    function lockedWalletsCount()
    public
    view
    returns (uint256)
    {
        return lockedWallets.length;
    }

    function isLocked(address wallet)
    public
    view
    returns (bool)
    {
        return (
        address(0) != walletMap[wallet].locker &&
        block.timestamp < walletMap[wallet].unlockTime
        );
    }

    function isLockedBy(address lockedWallet, address lockerWallet)
    public
    view
    returns (bool)
    {
        return (
        lockerWallet == walletMap[lockedWallet].locker &&
        block.timestamp < walletMap[lockedWallet].unlockTime
        );
    }

    //
    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _unlock(address wallet)
    private
    {
        // Unlock and release
        walletMap[wallet].locker = address(0);
        walletMap[wallet].unlockTime = 0;

        // Remove from the store of locked wallets
        if (0 != lockedWalletIndexByWallet[wallet]) {
            if (lockedWalletIndexByWallet[wallet] < lockedWallets.length) {
                lockedWalletIndexByWallet[lockedWallets[lockedWallets.length - 1]] = lockedWalletIndexByWallet[wallet];
                lockedWallets[lockedWalletIndexByWallet[wallet] - 1] = lockedWallets[lockedWallets.length - 1];
            }
            lockedWallets.length--;
            lockedWalletIndexByWallet[wallet] = 0;
        }
    }

    function _addToLockedWallets(address wallet)
    private
    {
        if (0 == lockedWalletIndexByWallet[wallet]) {
            lockedWallets.push(wallet);
            lockedWalletIndexByWallet[wallet] = lockedWallets.length;
        }
    }
}