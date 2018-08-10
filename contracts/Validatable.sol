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
import {Types} from "./Types.sol";

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
    event ChangeValidatorEvent(address oldAddress, address newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the validator contract
    /// @param newValidator The (address of) Validator contract instance
    function changeValidator(address newAddress) public onlyOwner notNullAddress(newAddress) {
        if (newAddress != address(validator)) {
            //set new validator
            address oldAddress = address(validator);
            validator = Validator(newAddress);

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

    modifier onlyExchangeSealedOrder(Types.Order order) {
        require(validator.isGenuineOrderExchangeSeal(order, owner));
        _;
    }

    modifier onlySealedOrder(Types.Order order) {
        require(validator.isGenuineOrderSeals(order, owner));
        _;
    }

    modifier onlySealedTrade(Types.Trade trade) {
        require(validator.isGenuineTradeSeal(trade, owner));
        _;
    }

    modifier onlyExchangeSealedPayment(Types.Payment payment) {
        require(validator.isGenuinePaymentExchangeSeal(payment, owner));
        _;
    }

    modifier onlySealedPayment(Types.Payment payment) {
        require(validator.isGenuinePaymentSeals(payment, owner));
        _;
    }
}
