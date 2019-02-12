/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {ValidatorV2} from "./ValidatorV2.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";

/**
 * @title ValidatableV2
 * @notice An ownable that has a validator (V2) property
 */
contract ValidatableV2 is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    ValidatorV2 public validator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetValidatorEvent(ValidatorV2 oldValidator, ValidatorV2 newValidator);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the validator contract
    /// @param newValidator The (address of) Validator contract instance
    function setValidator(ValidatorV2 newValidator)
    public
    onlyDeployer
    notNullAddress(newValidator)
    notSameAddresses(newValidator, validator)
    {
        //set new validator
        ValidatorV2 oldValidator = validator;
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

    modifier onlySealedOrder(TradeTypesLib.Order order) {
        require(validator.isGenuineOrderSeals(order));
        _;
    }

    modifier onlyOperatorSealedOrder(TradeTypesLib.Order order) {
        require(validator.isGenuineOrderOperatorSeal(order));
        _;
    }

    modifier onlySealedTrade(TradeTypesLib.Trade trade) {
        require(validator.isGenuineTradeSeal(trade));
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

    modifier onlyTradeParty(TradeTypesLib.Trade trade, address wallet) {
        require(validator.isTradeParty(trade, wallet));
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