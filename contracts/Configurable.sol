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
    event ChangeConfigurationEvent(Configuration oldAddress, Configuration newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the configuration contract
    /// @param newAddress The (address of) Configuration contract instance
    function changeConfiguration(Configuration newAddress) public onlyDeployer
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
