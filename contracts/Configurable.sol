/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
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
    event ChangeConfigurationEvent(address oldAddress, address newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the configuration contract
    /// @param newAddress The (address of) Configuration contract instance
    function changeConfiguration(address newAddress) public onlyOwner notNullAddress(newAddress) {
        if (newAddress != address(configuration)) {
            //set new configuration
            address oldAddress = address(configuration);
            configuration = Configuration(newAddress);

            //emit event
            emit ChangeConfigurationEvent(oldAddress, newAddress);
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier configurationInitialized() {
        require(configuration != address(0));
        _;
    }
}
