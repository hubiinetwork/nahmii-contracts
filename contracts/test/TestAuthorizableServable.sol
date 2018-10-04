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
import {AccessorManageable} from "../AccessorManageable.sol";
import {AuthorizableServable} from "../AuthorizableServable.sol";

/**
@title TestAuthorizableServable
@notice A test contract that extends AuthorizableServable
*/
contract TestAuthorizableServable is Ownable, AccessorManageable, AuthorizableServable {

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccessorManageable(accessorManager) public {
    }
}