/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
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
    mapping(address => mapping(bytes32 => mapping(address => bool))) private serviceActionWalletTouchedMap;
    mapping(address => mapping(address => bytes32[])) private serviceWalletActionList;

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
    /// @notice Authorize the given registered service by enabling all of actions
    /// @dev The service must be registered already
    /// @param service The address of the concerned registered service
    function authorizeRegisteredService(address service) public notDeployer notNullOrThisAddress(service) {
        require(msg.sender != service);

        // Ensure service is registered
        require(registeredServicesMap[service].registered);

        // Enable all actions for given wallet
        serviceWalletUnauthorizedMap[service][msg.sender] = false;

        // Emit event
        emit AuthorizeRegisteredServiceEvent(msg.sender, service);
    }

    /// @notice Authorize the given registered service action
    /// @dev The service must be registered already
    /// @param service The address of the concerned registered service
    /// @param action The concerned service action
    function authorizeRegisteredServiceAction(address service, string action) public notDeployerOrOperator notNullOrThisAddress(service) {
        require(msg.sender != service);

        bytes32 actionHash = hashString(action);

        // Ensure service action is registered
        require(registeredServicesMap[service].registered && registeredServicesMap[service].actionsEnabledMap[actionHash]);

        // Enable service action for given wallet
        serviceWalletUnauthorizedMap[service][msg.sender] = true;
        serviceActionWalletUnauthorizedMap[service][actionHash][msg.sender] = false;
        if (!serviceActionWalletTouchedMap[service][actionHash][msg.sender]) {
            serviceActionWalletTouchedMap[service][actionHash][msg.sender] = true;
            serviceWalletActionList[service][msg.sender].push(actionHash);
        }

        // Emit event
        emit AuthorizeRegisteredServiceActionEvent(msg.sender, service, action);
    }

    /// @notice Unauthorize the given registered service by enabling all of actions
    /// @dev The service must be registered already
    /// @param service The address of the concerned registered service
    function unauthorizeRegisteredService(address service) public notDeployer notNullOrThisAddress(service) {
        require(msg.sender != service);

        // Ensure service is registered
        require(registeredServicesMap[service].registered);

        // Disable all actions for given wallet
        serviceWalletUnauthorizedMap[service][msg.sender] = true;
        for (uint256 i = 0; i < serviceWalletActionList[service][msg.sender].length; i++)
            serviceActionWalletUnauthorizedMap[service][serviceWalletActionList[service][msg.sender][i]][msg.sender] = true;

        // Emit event
        emit UnauthorizeRegisteredServiceEvent(msg.sender, service);
    }

    /// @notice Unauthorize the given registered service action
    /// @dev The service must be registered already
    /// @param service The address of the concerned registered service
    /// @param action The concerned service action
    function unauthorizeRegisteredServiceAction(address service, string action) public notDeployerOrOperator notNullOrThisAddress(service) {
        require(msg.sender != service);

        bytes32 actionHash = hashString(action);

        // Ensure service is registered and action eanbled
        require(registeredServicesMap[service].registered && registeredServicesMap[service].actionsEnabledMap[actionHash]);

        // Disable service action for given wallet
        serviceActionWalletUnauthorizedMap[service][actionHash][msg.sender] = true;

        // Emit event
        emit UnauthorizeRegisteredServiceActionEvent(msg.sender, service, action);
    }

    /// @notice Gauge whether the given service is authorized for the given wallet
    /// @param service The address of the concerned registered service
    /// @param wallet The address of the concerned wallet
    /// @return true if service is authorized for the given wallet, else false
    function isAuthorizedServiceForWallet(address service, address wallet) public view returns (bool) {
        if (service == wallet)
            return false;

        return isRegisteredActiveService(service) && !serviceWalletUnauthorizedMap[service][wallet];
    }

    /// @notice Gauge whether the given service action is authorized for the given wallet
    /// @param service The address of the concerned registered service
    /// @param action The concerned service action
    /// @param wallet The address of the concerned wallet
    /// @return true if service action is authorized for the given wallet, else false
    function isAuthorizedServiceActionForWallet(address service, string action, address wallet) public view returns (bool) {
        if (service == wallet)
            return false;

        bytes32 actionHash = hashString(action);

        return isEnabledServiceAction(service, action) && !serviceActionWalletUnauthorizedMap[service][actionHash][wallet];
    }
}
