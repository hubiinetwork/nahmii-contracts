/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";

/**
@title SignerManager
@notice A contract to control who can execute some specific actions
*/
contract SignerManager is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => bool) public signersMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterSignerEvent(address signer);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
        registerSigner(deployer);
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Registers a signer
    /// @param newSigner The address of the signer to register
    function registerSigner(address newSigner) public onlyDeployer notNullOrThisAddress(newSigner) {
        if (!signersMap[newSigner]) {
            // Set new operator
            signersMap[newSigner] = true;

            // Emit event
            emit RegisterSignerEvent(newSigner);
        }
    }

    /// @notice Gauge whether an address is registered signer
    /// @param _address The concerned address
    /// @return true if address is registered signer, else false
    function isSigner(address _address) public view returns (bool) {
        return signersMap[_address];
    }
}
