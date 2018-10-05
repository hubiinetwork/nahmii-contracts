/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Configuration} from "./Configuration.sol";

/**
@title Benefactor
@notice An ownable that has a client fund property
*/
contract Configurable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Configuration public configuration;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the configuration contract
    /// @param newConfiguration The (address of) Configuration contract instance
    function changeConfiguration(Configuration newConfiguration)
    public
    onlyDeployer
    notNullAddress(newConfiguration)
    notSameAddresses(newConfiguration, configuration)
    {
        //set new configuration
        Configuration oldConfiguration = configuration;
        configuration = newConfiguration;

        //emit event
        emit ChangeConfigurationEvent(oldConfiguration, newConfiguration);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier configurationInitialized() {
        require(configuration != address(0));
        _;
    }
}
