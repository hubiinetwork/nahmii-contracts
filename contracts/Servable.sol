/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";

contract Servable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping (address => mapping (bytes32 => bool)) private registeredServiceActions;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterServiceActionEvent(address service, string action);
    event DeregisterServiceActionEvent(address service, string action);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerServiceAction(address service, string action) public onlyOwner {
        require(service != address(0));
        require(service != address(this));

        bytes32 _hash = keccak256(abi.encodePacked(action));

        require(!registeredServiceActions[service][_hash]);
        registeredServiceActions[service][_hash] = true;

        //raise event
        emit RegisterServiceActionEvent(service, action);
    }

    function deregisterServiceAction(address service, string action) public onlyOwner {
        require(service != address(0));
        require(service != address(this));

        bytes32 _hash = keccak256(abi.encodePacked(action));

        require(registeredServiceActions[service][_hash]);
        registeredServiceActions[service][_hash] = false;

        //raise event
        emit DeregisterServiceActionEvent(service, action);
    }

    function isRegisteredServiceAction(address service, string action) public view returns (bool) {
        return registeredServiceActions[service][keccak256(abi.encodePacked(action))];
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyServiceAction(string action) {
        require(isRegisteredServiceAction(msg.sender, action));
        _;
    }

    modifier onlyOwnerOrServiceAction(string action) {
        require(msg.sender == owner || isRegisteredServiceAction(msg.sender, action));
        _;
    }
}
