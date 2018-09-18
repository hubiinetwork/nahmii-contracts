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
@title AuthorizableServable
@notice A servable that may be authorized and unauthorized
*/
contract AuthorizableServable is Servable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => mapping(address => bool)) private serviceWalletUnauthorizedMap;
    mapping(address => mapping(bytes32 => mapping(address => bool))) private serviceActionWalletUnauthorizedMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event AuthorizeRegisteredServiceEvent(address wallet, address service);
    event AuthorizeRegisteredServiceActionEvent(address wallet, address service, string action);
    event UnauthorizeRegisteredServiceEvent(address wallet, address service);
    event UnauthorizeRegisteredServiceActionEvent(address wallet, address service, string action);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function authorizeRegisteredService(address service) public notDeployer notNullOrThisAddress(service) {
        require(msg.sender != service);

        //ensure service is registered
        require(registeredServicesMap[service].registered);

        //enable all actions for given wallet
        serviceWalletUnauthorizedMap[service][msg.sender] = false;

        //emit event
        emit AuthorizeRegisteredServiceEvent(msg.sender, service);
    }

    function authorizeRegisteredServiceAction(address service, string action) public notDeployerOrOperator notNullOrThisAddress(service) {
        require(msg.sender != service);

        bytes32 actionHash = hashString(action);

        //ensure service action is registered
        require(registeredServicesMap[service].registered && registeredServicesMap[service].actionsEnabledMap[actionHash]);

        //enable service action for given wallet
        serviceWalletUnauthorizedMap[service][msg.sender] = true;
        serviceActionWalletUnauthorizedMap[service][actionHash][msg.sender] = false;

        //emit event
        emit AuthorizeRegisteredServiceActionEvent(msg.sender, service, action);
    }

    function unauthorizeRegisteredService(address service) public notDeployer notNullOrThisAddress(service) {
        require(msg.sender != service);

        //ensure service is registered
        require(registeredServicesMap[service].registered);

        //enable all actions for given wallet
        serviceWalletUnauthorizedMap[service][msg.sender] = true;

        //emit event
        emit UnauthorizeRegisteredServiceEvent(msg.sender, service);
    }

    function unauthorizeRegisteredServiceAction(address service, string action) public notDeployerOrOperator notNullOrThisAddress(service) {
        require(msg.sender != service);

        bytes32 actionHash = hashString(action);

        //ensure service action is registered
        require(registeredServicesMap[service].registered && registeredServicesMap[service].actionsEnabledMap[actionHash]);

        //disable service action for given wallet
        serviceActionWalletUnauthorizedMap[service][actionHash][msg.sender] = true;

        //emit event
        emit UnauthorizeRegisteredServiceActionEvent(msg.sender, service, action);
    }

    function isAuthorizedServiceForWallet(address service, address wallet) public view returns (bool) {
        if (service == wallet)
            return false;

        return isRegisteredActiveService(service) && !serviceWalletUnauthorizedMap[service][wallet];
    }

    function isAuthorizedServiceActionForWallet(address service, string action, address wallet) public view returns (bool) {
        if (service == wallet)
            return false;

        bytes32 actionHash = hashString(action);

        return isEnabledServiceAction(service, action) && !serviceActionWalletUnauthorizedMap[service][actionHash][wallet];
    }
}
