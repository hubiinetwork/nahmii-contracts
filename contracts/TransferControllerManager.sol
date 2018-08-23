/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {TransferController} from "./TransferController.sol";

/**
@title TransferControllerManager
@notice Handles the management of transfer controllers
*/
contract TransferControllerManager is Ownable {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    struct CurrencyInfo {
        bytes32 standard;
        bool blacklisted;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(bytes32 => address) registeredTransferControllers;
    mapping(address => CurrencyInfo) registeredCurrencies;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterTransferControllerEvent(string standard, address controller);
    event ReassociateTransferControllerEvent(string oldStandard, string newStandard, address controller);

    event RegisterCurrencyEvent(address currencyCt, string standard);
    event DeregisterCurrencyEvent(address currencyCt);
    event BlacklistCurrencyEvent(address currencyCt);
    event WhitelistCurrencyEvent(address currencyCt);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerTransferController(string standard, address controller) external onlyOwner
        notNullAddress(controller)
    {
        require(bytes(standard).length > 0);
        bytes32 standardHash = keccak256(abi.encodePacked(standard));

        require(registeredTransferControllers[standardHash] == address(0));

        registeredTransferControllers[standardHash] = controller;

        //raise event
        emit RegisterTransferControllerEvent(standard, controller);
    }

    function reassociateTransferController(string oldStandard, string newStandard, address controller) external onlyOwner
        notNullAddress(controller)
    {
        require(bytes(newStandard).length > 0);
        bytes32 oldStandardHash = keccak256(abi.encodePacked(oldStandard));
        bytes32 newStandardHash = keccak256(abi.encodePacked(newStandard));

        require(registeredTransferControllers[oldStandardHash] != address(0));
        require(registeredTransferControllers[newStandardHash] == address(0));

        registeredTransferControllers[newStandardHash] = registeredTransferControllers[oldStandardHash];
        registeredTransferControllers[oldStandardHash] = address(0);

        //raise event
        emit ReassociateTransferControllerEvent(oldStandard, newStandard, controller);
    }

    function registerCurrency(address currencyCt, string standard) external onlyOwner notNullAddress(currencyCt) {
        require(bytes(standard).length > 0);
        bytes32 standardHash = keccak256(abi.encodePacked(standard));

        require(registeredCurrencies[currencyCt].standard == bytes32(0));

        registeredCurrencies[currencyCt].standard = standardHash;

        //raise event
        emit RegisterCurrencyEvent(currencyCt, standard);
    }

    function deregisterCurrency(address currencyCt) external onlyOwner {
        require(registeredCurrencies[currencyCt].standard != 0);

        registeredCurrencies[currencyCt].standard = bytes32(0);
        registeredCurrencies[currencyCt].blacklisted = false;

        //raise event
        emit DeregisterCurrencyEvent(currencyCt);
    }

    function blacklistCurrency(address currencyCt) external onlyOwner {
        require(registeredCurrencies[currencyCt].standard != bytes32(0));

        registeredCurrencies[currencyCt].blacklisted = true;

        //raise event
        emit BlacklistCurrencyEvent(currencyCt);
    }

    function whitelistCurrency(address currencyCt) external onlyOwner {
        require(registeredCurrencies[currencyCt].standard != bytes32(0));

        registeredCurrencies[currencyCt].blacklisted = false;

        //raise event
        emit WhitelistCurrencyEvent(currencyCt);
    }

    /**
    @notice The provided standard takes priority over assigned interface to currency
    */
    function getTransferController(address currencyCt, string standard) public view returns (TransferController) {
        if (bytes(standard).length > 0) {
            bytes32 standardHash = keccak256(abi.encodePacked(standard));

            require(registeredTransferControllers[standardHash] != address(0));
            return TransferController(registeredTransferControllers[standardHash]);
        }

        require(registeredCurrencies[currencyCt].standard != bytes32(0));
        require(!registeredCurrencies[currencyCt].blacklisted);

        address controllerAddress = registeredTransferControllers[registeredCurrencies[currencyCt].standard];
        require(controllerAddress != address(0));

        return TransferController(controllerAddress);
    }
}
