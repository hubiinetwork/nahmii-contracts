/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SelfDestructible} from "../SelfDestructible.sol";
import {Servable} from "../Servable.sol";

/**
@title TestServable
@notice A test contract that extends Servable
*/
contract TestServable is SelfDestructible, Servable {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) SelfDestructible(owner) public {
    }
}