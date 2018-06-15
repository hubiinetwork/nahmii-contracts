/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {Validator} from "./Validator.sol";
import {Types} from "./Types.sol";

contract Validatable is Ownable, Modifiable {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Validator public validator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeValidatorEvent(Validator oldValidator, Validator newValidator);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the validator contract
    /// @param newValidator The (address of) Validator contract instance
    function changeValidator(Validator newValidator)
    public
    onlyOwner
    notNullAddress(newValidator)
    notEqualAddresses(newValidator, validator)
    {
        Validator oldValidator = validator;
        validator = newValidator;
        emit ChangeValidatorEvent(oldValidator, validator);
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
