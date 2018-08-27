/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Validator} from "./Validator.sol";
import {StriimTypes} from "./StriimTypes.sol";

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
    function changeValidator(Validator newAddress) public onlyOwner notNullAddress(newAddress) {
        if (newAddress != validator) {
            //set new validator
            Validator oldAddress = validator;
            validator = newAddress;

            //emit event
            emit ChangeValidatorEvent(oldAddress, newAddress);
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier validatorInitialized() {
        require(validator != address(0));
        _;
    }

    modifier onlyExchangeSealedOrder(StriimTypes.Order order) {
        require(validator.isGenuineOrderExchangeSeal(order, owner));
        _;
    }

    modifier onlySealedOrder(StriimTypes.Order order) {
        require(validator.isGenuineOrderSeals(order, owner));
        _;
    }

    modifier onlySealedTrade(StriimTypes.Trade trade) {
        require(validator.isGenuineTradeSeal(trade, owner));
        _;
    }

    modifier onlyExchangeSealedPayment(StriimTypes.Payment payment) {
        require(validator.isGenuinePaymentExchangeSeal(payment, owner));
        _;
    }

    modifier onlySealedPayment(StriimTypes.Payment payment) {
        require(validator.isGenuinePaymentSeals(payment, owner));
        _;
    }
}
