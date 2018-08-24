/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Configurable} from "./Configurable.sol";

/**
@title Challengable
@notice A configurable with extra for challenges
*/
contract Challengable is Configurable {

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyOperationalModeNormal() {
        require(configuration.isOperationalModeNormal());
        _;
    }
}
