/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {SecurityBond} from "./SecurityBond.sol";

/**
@title SecurityBondable
@notice An ownable that has a security bond property
*/
contract SecurityBondable is Ownable, Modifiable {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    SecurityBond public securityBond;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeSecurityBondEvent(SecurityBond oldSecurityBond, SecurityBond newSecurityBond);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the security bond contract
    /// @param newSecurityBond The (address of) SecurityBond contract instance
    function changeSecurityBond(SecurityBond newSecurityBond)
    public
    onlyOwner
    notNullAddress(newSecurityBond)
    {
        SecurityBond oldSecurityBond = securityBond;
        securityBond = newSecurityBond;
        emit ChangeSecurityBondEvent(oldSecurityBond, securityBond);
    }
}
