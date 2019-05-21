/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

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
    notNullAddress(address(newValidator))
    notSameAddresses(address(newValidator), address(validator))
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
        require(address(validator) != address(0), "Validator not initialized");
        _;
    }

    modifier onlyOperatorSealedPayment(PaymentTypesLib.Payment memory payment) {
        require(validator.isGenuinePaymentOperatorSeal(payment), "Payment operator seal not genuine");
        _;
    }

    modifier onlySealedPayment(PaymentTypesLib.Payment memory payment) {
        require(validator.isGenuinePaymentSeals(payment), "Payment seals not genuine");
        _;
    }

    modifier onlyPaymentParty(PaymentTypesLib.Payment memory payment, address wallet) {
        require(validator.isPaymentParty(payment, wallet), "Wallet not payment party");
        _;
    }

    modifier onlyPaymentSender(PaymentTypesLib.Payment memory payment, address wallet) {
        require(validator.isPaymentSender(payment, wallet), "Wallet not payment sender");
        _;
    }
}
