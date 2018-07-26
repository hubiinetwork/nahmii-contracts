/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Servable} from "./Servable.sol";

/**
@title TogglableServable
@notice A servable that may be enabled and disabled
*/
contract TogglableServable is Servable {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => mapping(address => bool)) private disabledServicesMap;
    mapping(address => mapping(bytes32 => mapping(address => bool))) private disabledServiceActionsMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event EnableRegisteredServiceEvent(address wallet, address service);
    event EnableRegisteredServiceActionEvent(address wallet, address service, string action);
    event DisableRegisteredServiceEvent(address wallet, address service);
    event DisableRegisteredServiceActionEvent(address wallet, address service, string action);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function enableRegisteredService(address service) public notOwner notNullOrThisAddress(service) {
        require(msg.sender != service);

        //ensure service is registered
        require(registeredServicesMap[service].registered);

        //enable all actions for given wallet
        disabledServicesMap[service][msg.sender] = false;

        //emit event
        emit EnableRegisteredServiceEvent(msg.sender, service);
    }

    function enableRegisteredServiceAction(address service, string action) public notOwner notNullOrThisAddress(service) {
        require(msg.sender != service);

        bytes32 actionHash = hashString(action);

        //ensure service action is registered
        require(registeredServicesMap[service].registered && registeredServicesMap[service].actionsMap[actionHash]);

        //enable service action for given wallet
        disabledServicesMap[service][msg.sender] = true;
        disabledServiceActionsMap[service][actionHash][msg.sender] = false;

        //emit event
        emit EnableRegisteredServiceActionEvent(msg.sender, service, action);
    }

    function disableRegisteredService(address service) public notOwner notNullOrThisAddress(service) {
        require(msg.sender != service);

        //ensure service is registered
        require(registeredServicesMap[service].registered);

        //enable all actions for given wallet
        disabledServicesMap[service][msg.sender] = true;

        //emit event
        emit DisableRegisteredServiceEvent(msg.sender, service);
    }

    function disableRegisteredServiceAction(address service, string action) public notOwner notNullOrThisAddress(service) {
        require(msg.sender != service);

        bytes32 actionHash = hashString(action);

        //ensure service action is registered
        require(registeredServicesMap[service].registered && registeredServicesMap[service].actionsMap[actionHash]);

        //disable service action for given wallet
        disabledServiceActionsMap[service][actionHash][msg.sender] = true;

        //emit event
        emit DisableRegisteredServiceActionEvent(msg.sender, service, action);
    }

    function isAcceptedServiceForWallet(address service, address wallet) internal view returns (bool) {
        if (service == wallet)
            return false;

        return isRegisteredActiveService(service) && !disabledServicesMap[service][wallet];
    }

    function isAcceptedServiceActionForWallet(address service, string action, address wallet) internal view returns (bool) {
        if (service == wallet)
            return false;

        bytes32 actionHash = hashString(action);

        return isEnabledServiceAction(service, action) && !disabledServiceActionsMap[service][actionHash][wallet];
    }
}
