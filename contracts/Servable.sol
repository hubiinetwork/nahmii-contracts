/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";

/**
@title Servable
@notice An ownable that contains registered services and their actions
*/
contract Servable is Ownable {
    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct ServiceInfo {
        bool registered;
        uint256 activationTimestamp;
        mapping(bytes32 => bool) actionsEnabledMap;
        bytes32[] actionsList;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => ServiceInfo) internal registeredServicesMap;
    uint256 public serviceActivationTimeout;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ServiceActivationTimeoutEvent(uint256 timeoutInSeconds);
    event RegisterServiceEvent(address service);
    event RegisterServiceDeferredEvent(address service, uint256 timeout);
    event DeregisterServiceEvent(address service);
    event EnableServiceActionEvent(address service, string action);
    event DisableServiceActionEvent(address service, string action);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the service activation timeout
    /// @param timeoutInSeconds The set timeout in unit of seconds
    function setServiceActivationTimeout(uint256 timeoutInSeconds) public onlyOwner {
        serviceActivationTimeout = timeoutInSeconds;

        //emit event
        emit ServiceActivationTimeoutEvent(timeoutInSeconds);
    }

    /// @notice Register a service contract whose activation is immediate
    /// @param service The address of the registered service contract
    function registerService(address service) public onlyOwner notNullOrThisAddress(service) {
        registerServicePrivate(service, 0);

        //emit event
        emit RegisterServiceEvent(service);
    }

    /// @notice Register a service contract whose activation is deferred by the service activation timeout
    /// @param service The address of the registered service contract
    function registerServiceDeferred(address service) public onlyOwner notNullOrThisAddress(service) {
        registerServicePrivate(service, serviceActivationTimeout);

        //emit event
        emit RegisterServiceDeferredEvent(service, serviceActivationTimeout);
    }

    /// @notice Deregister a service contract
    /// @param service The address of the deregistered service contract
    function deregisterService(address service) public onlyOwner notNullOrThisAddress(service) {
        require(registeredServicesMap[service].registered);

        registeredServicesMap[service].registered = false;

        //emit event
        emit DeregisterServiceEvent(service);
    }

    /// @notice Enable a named action in an already registered service contract
    /// @param service The address of the registered service contract
    /// @param action The name of the enabled action
    function enableServiceAction(address service, string action) public onlyOwner notNullOrThisAddress(service) {
        require(registeredServicesMap[service].registered);
    
        bytes32 actionHash = hashString(action);

        require(!registeredServicesMap[service].actionsEnabledMap[actionHash]);

        registeredServicesMap[service].actionsEnabledMap[actionHash] = true;
        registeredServicesMap[service].actionsList.push(actionHash);

        //emit event
        emit EnableServiceActionEvent(service, action);
    }

    /// @notice Enable a named action in a service contract
    /// @param service The address of the service contract
    /// @param action The name of the disabled action
    function disableServiceAction(address service, string action) public onlyOwner notNullOrThisAddress(service) {
        bytes32 actionHash = hashString(action);

        require(registeredServicesMap[service].actionsEnabledMap[actionHash]);

        registeredServicesMap[service].actionsEnabledMap[actionHash] = false;

        //emit event
        emit DisableServiceActionEvent(service, action);
    }

    /// @notice Gauge whether a service contract is registered
    /// @param service The address of the service contract
    function isRegisteredService(address service) public view returns (bool) {
        return registeredServicesMap[service].registered;
    }

    /// @notice Gauge whether a service contract is registered and activated
    /// @param service The address of the service contract
    function isRegisteredActiveService(address service) public view returns (bool) {
        return isRegisteredService(service) && block.timestamp >= registeredServicesMap[service].activationTimestamp;
    }

    /// @notice Gauge whether a service contract action is enabled which implies also registered and activated
    /// @param service The address of the service contract
    /// @param action The name of action
    function isEnabledServiceAction(address service, string action) public view returns (bool) {
        bytes32 actionHash = hashString(action);
        return isRegisteredActiveService(service) && registeredServicesMap[service].actionsEnabledMap[actionHash];
    }

    //
    // Internal functions
    // -----------------------------------------------------------------------------------------------------------------
    function hashString(string _string) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_string));
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerServicePrivate(address service, uint256 timeout) private {
        if (!registeredServicesMap[service].registered) {
            registeredServicesMap[service].registered = true;
            registeredServicesMap[service].activationTimestamp = block.timestamp + timeout;
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyRegisteredActiveService() {
        require(isRegisteredActiveService(msg.sender));
        _;
    }

    modifier onlyEnabledServiceAction(string action) {
        require(isEnabledServiceAction(msg.sender, action));
        _;
    }

    modifier onlyOwnerOrEnabledServiceAction(string action) {
        require(msg.sender == owner || isEnabledServiceAction(msg.sender, action));
        _;
    }
}
