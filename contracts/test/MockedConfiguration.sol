/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Configuration} from "../Configuration.sol";

/**
 * @title MockedConfiguration
 * @notice Mocked implementation of configuration contract
 */
contract MockedConfiguration is Configuration {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) public Configuration(owner) {
        _reset();
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        operationalMode = OperationalMode.Normal;
    }
}
