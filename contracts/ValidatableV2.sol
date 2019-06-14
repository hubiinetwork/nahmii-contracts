/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

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
    notNullAddress(address(newValidator))
    notSameAddresses(address(newValidator), address(validator))
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
        require(address(validator) != address(0), "Validator not initialized [ValidatableV2.sol:55]");
        _;
    }

    modifier onlySealedOrder(TradeTypesLib.Order memory order) {
        require(validator.isGenuineOrderSeals(order), "Order seals not genuine [ValidatableV2.sol:60]");
        _;
    }

    modifier onlyOperatorSealedOrder(TradeTypesLib.Order memory order) {
        require(validator.isGenuineOrderOperatorSeal(order), "Order operator seal not genuine [ValidatableV2.sol:65]");
        _;
    }

    modifier onlySealedTrade(TradeTypesLib.Trade memory trade) {
        require(validator.isGenuineTradeSeal(trade), "Trade seal not genuine [ValidatableV2.sol:70]");
        _;
    }

    modifier onlyOperatorSealedPayment(PaymentTypesLib.Payment memory payment) {
        require(validator.isGenuinePaymentOperatorSeal(payment), "Paymet operator seal not genuine [ValidatableV2.sol:75]");
        _;
    }

    modifier onlySealedPayment(PaymentTypesLib.Payment memory payment) {
        require(validator.isGenuinePaymentSeals(payment), "Paymet seals not genuine [ValidatableV2.sol:80]");
        _;
    }

    modifier onlyTradeParty(TradeTypesLib.Trade memory trade, address wallet) {
        require(validator.isTradeParty(trade, wallet), "Wallet not trade party [ValidatableV2.sol:85]");
        _;
    }

    modifier onlyPaymentParty(PaymentTypesLib.Payment memory payment, address wallet) {
        require(validator.isPaymentParty(payment, wallet), "Wallet not payment party [ValidatableV2.sol:90]");
        _;
    }

    modifier onlyPaymentSender(PaymentTypesLib.Payment memory payment, address wallet) {
        require(validator.isPaymentSender(payment, wallet), "Wallet not payment sender [ValidatableV2.sol:95]");
        _;
    }
}