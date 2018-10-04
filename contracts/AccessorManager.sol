/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";

/**
@title AccessorManager
@notice A contract to control who can execute some specific actions
*/
contract AccessorManager is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping (address => bool) public signersMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterSignerEvent(address signer);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Registers a signer
    /// @param newSigner The address of the signer to register
    function registerSigner(address newSigner) public onlyDeployer notNullOrThisAddress(newSigner) {
        if (newSigner != deployer && (!signersMap[newSigner])) {
            //set new operator
            signersMap[newSigner] = true;

            //emit event
            emit RegisterSignerEvent(newSigner);
        }
    }

    function isOperator(address who) public view returns (bool) {
        return (who == operator);
    }

    function isDeployerOrOperator(address who) public view returns (bool) {
        return (who == deployer || who == operator);
    }

    function isSigner(address who) public view returns (bool) {
        return signersMap[who];
    }
}
