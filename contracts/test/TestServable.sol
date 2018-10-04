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
import {AccessorManageable} from "../AccessorManageable.sol";
import {Servable} from "../Servable.sol";

/**
@title TestServable
@notice A test contract that extends Servable
*/
contract TestServable is Ownable, AccessorManageable, Servable {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccessorManageable(accessorManager) public {
    }
}