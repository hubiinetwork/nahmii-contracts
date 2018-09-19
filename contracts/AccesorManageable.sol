/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {AccesorManager} from "./AccesorManager.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title AccesorManageable
@notice A contract to interface ACL
*/
contract AccesorManageable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    AccesorManager public accesorManager;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeAccesorManagerEvent(address oldAccesor, address newAccesor);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address manager) internal {
        require(manager != address(0));
        accesorManager = AccesorManager(manager);
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the accesor manager of this contract
    /// @param newAccesor The address of the new accesor
    function changeAccesorManager(address newAccesor) public onlyOwner notNullOrThisAddress(newAccesor) {
        if (newAccesor != address(accesorManager)) {
            //set new accessor
            address oldAccesor = address(accesorManager);
            accesorManager = AccesorManager(newAccesor);

            //emit event
            emit ChangeAccesorManagerEvent(oldAccesor, newAccesor);
        }
    }

    function validateSigner(bytes32 hash, StriimTypes.Signature signature) public view {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        require(accesorManager.isSigner(ecrecover(prefixedHash, signature.v, signature.r, signature.s)));
    }

    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyOperator() {
        require(accesorManager.isOperator(msg.sender));
        _;
    }

    modifier notOperator() {
        require(!accesorManager.isOperator(msg.sender));
        _;
    }

    modifier onlyOwnerOrOperator() {
        require(accesorManager.isOwnerOrOperator(msg.sender));
        _;
    }

    modifier notOwnerOrOperator() {
        require(!accesorManager.isOwnerOrOperator(msg.sender));
        _;
    }
}
