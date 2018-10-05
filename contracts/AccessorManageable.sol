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
    event ChangeAccessorManagerEvent(address oldAccessor, address newAccessor);

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
    /// @notice Change the accessor manager of this contract
    /// @param newAccessor The address of the new accessor
    function changeAccessorManager(address newAccessor) public onlyDeployer notNullOrThisAddress(newAccessor) {
        if (newAccessor != address(accessorManager)) {
            //set new accessor
            address oldAccessor = address(accessorManager);
            accessorManager = AccessorManager(newAccessor);

            //emit event
            emit ChangeAccessorManagerEvent(oldAccessor, newAccessor);
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
}
