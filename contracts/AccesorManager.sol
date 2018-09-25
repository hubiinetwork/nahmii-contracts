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
@title AccesorManager
@notice A contract to control who can execute some specific actions
*/
contract AccesorManager is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public operator;
    mapping (address => bool) public signersMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeOperatorEvent(address oldOperator, address newOperator);
    event RegisterSignerEvent(address signer);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the operator of this contract
    /// @param newOperator The address of the new operator
    function changeOperator(address newOperator) public onlyOwner notNullOrThisAddress(newOperator) {
        if (newOperator != owner) {
            //set new operator
            address oldOperator = operator;
            operator = newOperator;

            //emit event
            emit ChangeOperatorEvent(oldOperator, newOperator);
        }
    }

    /// @notice Registers a signer
    /// @param newSigner The address of the signer to register
    function registerSigner(address newSigner) public onlyOwner notNullOrThisAddress(newSigner) {
        if (newSigner != owner && (!signersMap[newSigner])) {
            //set new operator
            signersMap[newSigner] = true;

            //emit event
            emit RegisterSignerEvent(newSigner);
        }
    }

    function isOperator(address who) public view returns (bool) {
        return (who == operator);
    }

    function isOwnerOrOperator(address who) public view returns (bool) {
        return (who == owner || who == operator);
    }

    function isSigner(address who) public view returns (bool) {
        return signersMap[who];
    }
}
