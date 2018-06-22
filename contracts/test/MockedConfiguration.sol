/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Configuration} from "../Configuration.sol";

/**
@title MockedConfiguration
@notice Mocked implementation of configuration contract
*/
contract MockedConfiguration is Configuration {

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) public Configuration(owner) {
        reset();
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        operationalMode = OperationalMode.Normal;
    }
}
