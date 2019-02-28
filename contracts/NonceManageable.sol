/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {NonceManager} from "./NonceManager.sol";

/**
 * @title NonceManageable
 * @notice An ownable that has a nonce manager property
 */
contract NonceManageable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NonceManager public nonceManager;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNonceManagerEvent(NonceManager oldNonceManager, NonceManager newNonceManager);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the client fund contract
    /// @param newNonceManager The (address of) NonceManager contract instance
    function setNonceManager(NonceManager newNonceManager) public
    onlyDeployer
    notNullAddress(newNonceManager)
    {
        // Update field
        NonceManager oldNonceManager = nonceManager;
        nonceManager = newNonceManager;

        // Emit event
        emit SetNonceManagerEvent(oldNonceManager, newNonceManager);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier nonceManagerInitialized() {
        require(nonceManager != address(0));
        _;
    }
}