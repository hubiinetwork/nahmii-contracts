/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SelfDestructible} from "./SelfDestructible.sol";
import {Hasher} from "./Hasher.sol";
import {Types} from "./Types.sol";

/**
@title Hashable
@notice An ownable that has a hasher property
*/
contract Hashable is SelfDestructible {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Hasher public hasher;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeHasherEvent(Hasher oldHasher, Hasher newHasher);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the hasher contract
    /// @param newAddress The (address of) Hasher contract instance
    function changeHasher(Hasher newAddress) public onlyOwner
        notNullAddress(newAddress)
        notSameAddresses(newAddress, hasher)
    {
        //set new hasher
        Hasher oldAddress = hasher;
        hasher = newAddress;

        //emit event
        emit ChangeHasherEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier hasherInitialized() {
        require(hasher != address(0));
        _;
    }
}
