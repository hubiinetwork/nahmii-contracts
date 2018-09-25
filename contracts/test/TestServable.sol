/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "../Ownable.sol";
import {AccesorManageable} from "../AccesorManageable.sol";
import {Servable} from "../Servable.sol";

/**
@title TestServable
@notice A test contract that extends Servable
*/
contract TestServable is Ownable, AccesorManageable, Servable {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccesorManageable(accessorManager) public {
    }
}