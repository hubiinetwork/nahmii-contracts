/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Modifiable} from "./Modifiable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title Ownable
@notice A contract that has an owner property
*/
contract Ownable is Modifiable, SelfDestructible {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public deployer;
    address public operator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeDeployerEvent(address oldDeployer, address newDeployer);
    event ChangeOperatorEvent(address oldOperator, address newOperator);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _deployer) internal notNullOrThisAddress(_deployer) {
        deployer = _deployer;
        operator = _deployer;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Return the address that is able to initiate self-destruction
    function destructor() public view returns (address) {
        return deployer;
    }

    /// @notice Change the deployer of this contract
    /// @param newDeployer The address of the new deployer
    function changeDeployer(address newDeployer) public onlyDeployer notNullOrThisAddress(newDeployer) {
        if (newDeployer != deployer) {
            //set new deployer
            address oldDeployer = deployer;
            deployer = newDeployer;

            //emit event
            emit ChangeDeployerEvent(oldDeployer, newDeployer);
        }
    }

    /// @notice Change the operator of this contract
    /// @param newOperator The address of the new operator
    function changeOperator(address newOperator) public onlyDeployer notNullOrThisAddress(newOperator) {
        if (newOperator != deployer) {
            //set new operator
            address oldOperator = operator;
            operator = newOperator;

            //emit event
            emit ChangeOperatorEvent(oldOperator, newOperator);
        }
    }

    function isDeployer() internal view returns (bool) {
        return msg.sender == deployer;
    }

    function isOperator() internal view returns (bool) {
        return msg.sender == operator;
    }

    function isDeployerOrOperator() internal view returns (bool) {
        return isDeployer() || isOperator();
    }

    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyDeployer() {
        require(isDeployer());
        _;
    }

    modifier notDeployer() {
        require(!isDeployer());
        _;
    }

    modifier onlyOperator() {
        require(isOperator());
        _;
    }

    modifier notOperator() {
        require(!isOperator());
        _;
    }

    modifier onlyDeployerOrOperator() {
        require(isDeployerOrOperator());
        _;
    }

    modifier notDeployerOrOperator() {
        require(!isDeployerOrOperator());
        _;
    }
}
