/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Modifyable} from "./Modifyable.sol";

interface SecurityBond {
    function stage(int256 amount, address token, address wallet) external;
}

contract SecurityBondable is Ownable, Modifyable {

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
    notEqualAddresses(newSecurityBond, securityBond)
    {
        SecurityBond oldSecurityBond = securityBond;
        securityBond = newSecurityBond;
        emit ChangeSecurityBondEvent(oldSecurityBond, securityBond);
    }
}
