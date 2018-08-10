/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {SecurityBond} from "./SecurityBond.sol";

/**
@title SecurityBondable
@notice An ownable that has a security bond property
*/
contract SecurityBondable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    SecurityBond public securityBond;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SecurityBondChangedEvent(address oldAddress, address newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the security bond contract
    /// @param newAddress The (address of) SecurityBond contract instance
    function changeSecurityBond(address newAddress) public onlyOwner notNullAddress(newAddress) {
        if (newAddress != address(securityBond)) {
            //set new security bond
            address oldAddress = address(securityBond);
            securityBond = SecurityBond(newAddress);

            //emit event
            emit SecurityBondChangedEvent(oldAddress, newAddress);
        }
    }
}
