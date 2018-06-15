/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {Configuration} from "./Configuration.sol";

contract Configurable is Ownable, Modifiable {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Configuration public configuration;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);

    /// @notice Change the configuration contract
    /// @param newConfiguration The (address of) Configuration contract instance
    function changeConfiguration(Configuration newConfiguration)
    public
    onlyOwner
    notNullAddress(newConfiguration)
    notEqualAddresses(newConfiguration, configuration)
    {
        Configuration oldConfiguration = configuration;
        configuration = newConfiguration;
        emit ChangeConfigurationEvent(oldConfiguration, configuration);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier configurationInitialized() {
        require(configuration != address(0));
        _;
    }
}
