/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Modifiable} from "./Modifiable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title Ownable
@notice A contract that has an owner property
*/
contract Ownable is Modifiable, SelfDestructible {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeOwnerEvent(address oldOwner, address newOwner);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) internal {
        require(_owner != address(0));
        require(_owner != address(this));

        owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the owner of this contract
    /// @param newOwner The address of the new owner
    function changeOwner(address newOwner) public onlyOwner notNullOrThisAddress(newOwner) {
        if (newOwner != owner) {
            //set new owner
            address oldOwner = owner;
            owner = newOwner;

            //emit event
            emit ChangeOwnerEvent(oldOwner, newOwner);
        }
    }

    function isOwner() internal view returns (bool) {
        return msg.sender == owner;
    }

    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    modifier notOwner() {
        require(!isOwner());
        _;
    }
}
