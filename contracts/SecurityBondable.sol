/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
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
    event ChangeSecurityBondEvent(SecurityBond oldAddress, SecurityBond newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the security bond contract
    /// @param newAddress The (address of) SecurityBond contract instance
    function changeSecurityBond(SecurityBond newAddress) public onlyDeployer
        notNullAddress(newAddress)
        notSameAddresses(newAddress, securityBond)
    {
        //set new security bond
        SecurityBond oldAddress = securityBond;
        securityBond = newAddress;

        // Emit event
        emit ChangeSecurityBondEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier securityBondInitialized() {
        require(securityBond != address(0));
        _;
    }
}
