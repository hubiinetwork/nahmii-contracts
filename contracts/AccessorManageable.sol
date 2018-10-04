/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {AccessorManager} from "./AccessorManager.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title AccessorManageable
@notice A contract to interface ACL
*/
contract AccessorManageable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    AccessorManager public accessorManager;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeAccessorManagerEvent(address oldAccesor, address newAccesor);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address manager) public {
        require(manager != address(0));
        accessorManager = AccessorManager(manager);
    }


    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the accesor manager of this contract
    /// @param newAccesor The address of the new accesor
    function changeAccessorManager(address newAccesor) public onlyDeployer notNullOrThisAddress(newAccesor) {
        if (newAccesor != address(accessorManager)) {
            //set new accessor
            address oldAccesor = address(accessorManager);
            accessorManager = AccessorManager(newAccesor);

            //emit event
            emit ChangeAccessorManagerEvent(oldAccesor, newAccesor);
        }
    }

    function isSignedByRegisteredSigner(bytes32 hash, NahmiiTypes.Signature signature) public view returns (bool) {
        require(accessorManager != address(0));
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        return accessorManager.isSigner(ecrecover(prefixedHash, signature.v, signature.r, signature.s));
    }

    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier accessorManagerInitialized() {
        require(accessorManager != address(0));
        _;
    }

    // TODO Figure out why these modifiers act differently than the ones in Ownable
    //    modifier onlyOperator() {
    //        require(accessorManager != address(0));
    //        require(accessorManager.isOperator(msg.sender));
    //        _;
    //    }
    //
    //    modifier notOperator() {
    //        require(accessorManager != address(0));
    //        require(!accessorManager.isOperator(msg.sender));
    //        _;
    //    }
    //
    //    modifier onlyDeployerOrOperator() {
    //        require(accessorManager != address(0));
    //        require(accessorManager.isDeployerOrOperator(msg.sender));
    //        _;
    //    }
    //
    //    modifier notOwnerOrOperator() {
    //        require(accessorManager != address(0));
    //        require(!accessorManager.isDeployerOrOperator(msg.sender));
    //        _;
    //    }
}
