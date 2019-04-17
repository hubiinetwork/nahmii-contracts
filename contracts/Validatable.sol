/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {Validator} from "./Validator.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";

/**
 * @title Validatable
 * @notice An ownable that has a validator property
 */
contract Validatable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Validator public validator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetValidatorEvent(Validator oldValidator, Validator newValidator);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the validator contract
    /// @param newValidator The (address of) Validator contract instance
    function setValidator(Validator newValidator)
    public
    onlyDeployer
    notNullAddress(newValidator)
    notSameAddresses(newValidator, validator)
    {
        //set new validator
        Validator oldValidator = validator;
        validator = newValidator;

        // Emit event
        emit SetValidatorEvent(oldValidator, newValidator);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier validatorInitialized() {
        require(validator != address(0));
        _;
    }

    modifier onlyOperatorSealedPayment(PaymentTypesLib.Payment payment) {
        require(validator.isGenuinePaymentOperatorSeal(payment));
        _;
    }

    modifier onlySealedPayment(PaymentTypesLib.Payment payment) {
        require(validator.isGenuinePaymentSeals(payment));
        _;
    }

    modifier onlyPaymentParty(PaymentTypesLib.Payment payment, address wallet) {
        require(validator.isPaymentParty(payment, wallet));
        _;
    }

    modifier onlyPaymentSender(PaymentTypesLib.Payment payment, address wallet) {
        require(validator.isPaymentSender(payment, wallet));
        _;
    }
}
