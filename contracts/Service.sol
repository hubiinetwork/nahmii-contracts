/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "./Ownable.sol";

contract ServiceRecipient is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping (address => mapping (bytes32 => bool)) private registeredServiceProvidersMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisteredServiceProviderEvent(address service, string _class);
    event UnregisteredServiceProviderEvent(address service, string _class);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerServiceProvider(address service, string _class) public onlyOwner {
        require(service != address(0));
        require(service != address(this));

        registeredServiceProvidersMap[service][keccak256(_class)] = true;

        //raise event
        emit RegisteredServiceProviderEvent(service, _class);
    }

    function unregisterServiceProvider(address service, string _class) public onlyOwner {
        require(service != address(0));
        require(service != address(this));

        registeredServiceProvidersMap[service][keccak256(_class)] = false;

        //raise event
        emit UnregisteredServiceProviderEvent(service, _class);
    }

    function isRegisteredServiceProvider(address service, string _class) internal view returns (bool) {

        return registeredServiceProvidersMap[service][keccak256(_class)];
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyServiceProvider(string _class) {
        require(isRegisteredServiceProvider(msg.sender, _class));
        _;
    }

    modifier onlyOwnerOrServiceProvider(string _class) {
        require(msg.sender == owner || isRegisteredServiceProvider(msg.sender, _class));
        _;
    }
}
