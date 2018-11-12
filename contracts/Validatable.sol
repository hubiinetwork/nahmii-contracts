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
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

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
    event SetValidatorEvent(Validator oldAddress, Validator newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the validator contract
    /// @param newAddress The (address of) Validator contract instance
    function setValidator(Validator newAddress) public onlyDeployer
    notNullAddress(newAddress)
    notSameAddresses(newAddress, validator)
    {
        //set new validator
        Validator oldAddress = validator;
        validator = newAddress;

        // Emit event
        emit SetValidatorEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier validatorInitialized() {
        require(validator != address(0));
        _;
    }

    modifier onlyOperatorSealedOrder(NahmiiTypesLib.Order order) {
        require(validator.isGenuineOrderOperatorSeal(order));
        _;
    }

    modifier onlySealedOrder(NahmiiTypesLib.Order order) {
        require(validator.isGenuineOrderSeals(order));
        _;
    }

    modifier onlySealedTrade(NahmiiTypesLib.Trade trade) {
        require(validator.isGenuineTradeSeal(trade));
        _;
    }

    modifier onlyOperatorSealedPayment(NahmiiTypesLib.Payment payment) {
        require(validator.isGenuinePaymentOperatorSeal(payment));
        _;
    }

    modifier onlySealedPayment(NahmiiTypesLib.Payment payment) {
        require(validator.isGenuinePaymentSeals(payment));
        _;
    }

    modifier onlyTradeParty(NahmiiTypesLib.Trade trade, address wallet) {
        require(validator.isTradeParty(trade, wallet));
        _;
    }

    modifier onlyPaymentSender(NahmiiTypesLib.Payment payment, address wallet) {
        require(validator.isPaymentParty(payment, wallet));
        _;
    }
}
