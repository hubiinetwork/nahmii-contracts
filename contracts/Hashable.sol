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
import {NahmiiTypes} from "./NahmiiTypes.sol";

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
    event ChangeHasherEvent(Hasher oldHasher, Hasher newHasher);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the hasher contract
    /// @param newAddress The (address of) Hasher contract instance
    function changeHasher(Hasher newAddress) public onlyDeployer
        notNullAddress(newAddress)
        notSameAddresses(newAddress, hasher)
    {
        //set new hasher
        Hasher oldAddress = hasher;
        hasher = newAddress;

        // Emit event
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
