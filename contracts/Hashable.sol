/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Hasher} from "./Hasher.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title Hashable
@notice An ownable that has a hasher property
*/
contract Hashable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Hasher public hasher;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetHasherEvent(Hasher oldHasher, Hasher newHasher);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the hasher contract
    /// @param newAddress The (address of) Hasher contract instance
    function setHasher(Hasher newAddress) public onlyDeployer
        notNullAddress(newAddress)
        notSameAddresses(newAddress, hasher)
    {
        //set new hasher
        Hasher oldAddress = hasher;
        hasher = newAddress;

        // Emit event
        emit SetHasherEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier hasherInitialized() {
        require(hasher != address(0));
        _;
    }
}
