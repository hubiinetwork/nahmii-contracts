/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Hasher} from "./Hasher.sol";
import {Types} from "./Types.sol";

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
    event ChangeHasherEvent(address oldHasher, address newHasher);

    /// @notice Change the hasher contract
    /// @param newHasher The (address of) Hasher contract instance
    function changeHasher(address newAddress) public onlyOwner notNullAddress(newAddress) {
        if (newAddress != address(hasher)) {
            //set new hasher
            address oldAddress = address(hasher);
            hasher = Hasher(newAddress);

            //emit event
            emit ChangeHasherEvent(oldAddress, newAddress);
        }
    }
}
