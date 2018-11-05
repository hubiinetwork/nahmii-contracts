/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "../Ownable.sol";
import {SecurityBondable} from "../SecurityBondable.sol";
import {Beneficiary} from "../Beneficiary.sol";

/**
@title MockedSecurityBondService
@notice Mocked implementation of service contract that interacts with SecurityBond
*/
contract MockedSecurityBondService is Ownable, SecurityBondable {

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reward(address wallet, uint256 fraction)
    public
    {
        securityBond.reward(wallet, fraction);
    }
}