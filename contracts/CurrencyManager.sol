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
import {SelfDestructible} from "./SelfDestructible.sol";
import {CurrencyController} from "./CurrencyController.sol";

/**
@title CurrencyManager
@notice Handles registration of currencies
*/
contract CurrencyManager is Ownable, Modifiable, SelfDestructible {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    struct Currency {
        bytes32 interface_id;
        bool blacklisted;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(bytes32 => address) registeredCurrencyControllers;
    mapping(address => Currency) registeredCurrencies;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisteredCurrencyController(bytes32 interface_id, address controller);
    event DeregisteredCurrencyController(bytes32 interface_id);

    event RegisteredCurrency(address currency, bytes32 interface_id);
    event DeregisteredCurrency(address currency);
    event BlacklistedCurrency(address currency);
    event WhitelistedCurrency(address currency);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerCurrencyController(string standard, address controller) external onlyOwner notNullAddress(controller) {
        require(bytes(standard).length > 0);
        bytes32 _id = keccak256(abi.encodePacked(standard));

        require(registeredCurrencyControllers[_id] == address(0));

        registeredCurrencyControllers[_id] = controller;

        //raise event
        emit RegisteredCurrencyController(_id, controller);
    }

    function deregisterCurrencyController(string standard) external onlyOwner {
        require(bytes(standard).length > 0);
        bytes32 _id = keccak256(abi.encodePacked(standard));

        require(registeredCurrencyControllers[_id] != address(0));

        registeredCurrencyControllers[_id] = address(0);

        //raise event
        emit DeregisteredCurrencyController(_id);
    }

    function registerCurrency(address currency, string standard) external onlyOwner notNullAddress(currency) {
        require(bytes(standard).length > 0);
        bytes32 _id = keccak256(abi.encodePacked(standard));

        require(registeredCurrencies[currency].interface_id == bytes32(0));

        registeredCurrencies[currency].interface_id = _id;

        //raise event
        emit RegisteredCurrency(currency, _id);
    }

    function deregisterToken(address currency) external onlyOwner {
        require(registeredCurrencies[currency].interface_id != 0);

        registeredCurrencies[currency].interface_id = bytes32(0);
        registeredCurrencies[currency].blacklisted = false;

        //raise event
        emit DeregisteredCurrency(currency);
    }

    function blacklistToken(address currency) external onlyOwner {
        require(registeredCurrencies[currency].interface_id != bytes32(0));

        registeredCurrencies[currency].blacklisted = true;

        //raise event
        emit BlacklistedCurrency(currency);
    }

    function whitelistToken(address currency) external onlyOwner {
        require(registeredCurrencies[currency].interface_id != bytes32(0));

        registeredCurrencies[currency].blacklisted = false;

        //raise event
        emit WhitelistedCurrency(currency);
    }

    /**
    @notice standard has priority over assigned interface to currency
    */
    function getCurrencyController(address currency, string standard) public view returns (CurrencyController) {
        if (bytes(standard).length > 0) {
            bytes32 _id = keccak256(abi.encodePacked(standard));

            require(registeredCurrencyControllers[_id] != address(0));
            return CurrencyController(registeredCurrencyControllers[_id]);
        }

        require(registeredCurrencies[currency].interface_id != bytes32(0));
        require(!registeredCurrencies[currency].blacklisted);

        address interface_address = registeredCurrencyControllers[registeredCurrencies[currency].interface_id];
        require(interface_address != address(0));

        return CurrencyController(interface_address);
    }
}
