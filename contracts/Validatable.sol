/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Validator} from "./Validator.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title Validatable
@notice An ownable that has a validator property
*/
contract Validatable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Validator public validator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeValidatorEvent(Validator oldAddress, Validator newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the validator contract
    /// @param newAddress The (address of) Validator contract instance
    function changeValidator(Validator newAddress) public onlyDeployer
    notNullAddress(newAddress)
    notSameAddresses(newAddress, validator)
    {
        //set new validator
        Validator oldAddress = validator;
        validator = newAddress;

        // Emit event
        emit ChangeValidatorEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier validatorInitialized() {
        require(validator != address(0));
        _;
    }

    modifier onlyOperatorSealedOrder(NahmiiTypes.Order order) {
        require(validator.isGenuineOrderOperatorSeal(order));
        _;
    }

    modifier onlySealedOrder(NahmiiTypes.Order order) {
        require(validator.isGenuineOrderSeals(order));
        _;
    }

    modifier onlySealedTrade(NahmiiTypes.Trade trade) {
        require(validator.isGenuineTradeSeal(trade));
        _;
    }

    modifier onlyOperatorSealedPayment(NahmiiTypes.Payment payment) {
        require(validator.isGenuinePaymentOperatorSeal(payment));
        _;
    }

    modifier onlySealedPayment(NahmiiTypes.Payment payment) {
        require(validator.isGenuinePaymentSeals(payment));
        _;
    }
}
