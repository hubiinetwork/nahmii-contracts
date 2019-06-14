/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Configurable} from "./Configurable.sol";

/**
 * @title ConfigurableOperational
 * @notice A configurable with modifiers for operational mode state validation
 */
contract ConfigurableOperational is Configurable {
    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyOperationalModeNormal() {
        require(configuration.isOperationalModeNormal(), "Operational mode is not normal [ConfigurableOperational.sol:22]");
        _;
    }
}