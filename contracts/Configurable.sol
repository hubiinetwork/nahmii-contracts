/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SelfDestructible} from "./SelfDestructible.sol";
import {Configuration} from "./Configuration.sol";

/**
@title Benefactor
@notice An ownable that has a client fund property
*/
contract Configurable is SelfDestructible {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Configuration public configuration;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeConfigurationEvent(Configuration oldAddress, Configuration newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the configuration contract
    /// @param newAddress The (address of) Configuration contract instance
    function changeConfiguration(Configuration newAddress) public onlyOwner
        notNullAddress(newAddress)
        notSameAddresses(newAddress, configuration)
    {
        //set new configuration
        Configuration oldAddress = configuration;
        configuration = newAddress;

        //emit event
        emit ChangeConfigurationEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier configurationInitialized() {
        require(configuration != address(0));
        _;
    }
}
