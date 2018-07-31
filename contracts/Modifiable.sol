/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

/**
@title Modifiable
@notice A contract with basic modifiers
*/
contract Modifiable {

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier notThisAddress(address _address) {
        require(_address != address(this));
        _;
    }

    modifier notNullOrThisAddress(address _address) {
        require(_address != address(0));
        require(_address != address(this));
        _;
    }
}
