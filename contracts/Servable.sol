/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

import "./Ownable.sol";

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

        registeredServiceActions[service][keccak256(action)] = true;

        //raise event
        emit RegisterServiceActionEvent(service, action);
    }

    function deregisterServiceAction(address service, string action) public onlyOwner {
        require(service != address(0));
        require(service != address(this));

        registeredServiceActions[service][keccak256(action)] = false;

        //raise event
        emit DeregisterServiceActionEvent(service, action);
    }

    function isRegisteredServiceAction(address service, string action) internal view returns (bool) {
        return registeredServiceActions[service][keccak256(action)];
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
