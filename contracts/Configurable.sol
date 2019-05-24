/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {Configuration} from "./Configuration.sol";

/**
 * @title Benefactor
 * @notice An ownable that has a client fund property
 */
contract Configurable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Configuration public configuration;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the configuration contract
    /// @param newConfiguration The (address of) Configuration contract instance
    function setConfiguration(Configuration newConfiguration)
    public
    onlyDeployer
    notNullAddress(address(newConfiguration))
    notSameAddresses(address(newConfiguration), address(configuration))
    {
        // Set new configuration
        Configuration oldConfiguration = configuration;
        configuration = newConfiguration;

        // Emit event
        emit SetConfigurationEvent(oldConfiguration, newConfiguration);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier configurationInitialized() {
        require(address(configuration) != address(0), "Configuration not initialized [Configurable.sol:52]");
        _;
    }
}