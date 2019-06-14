/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {PaymentHasher} from "./PaymentHasher.sol";

/**
 * @title PaymentHashable
 * @notice An ownable that has a payment hasher property
 */
contract PaymentHashable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    PaymentHasher public paymentHasher;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetPaymentHasherEvent(PaymentHasher oldPaymentHasher, PaymentHasher newPaymentHasher);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the payment hasher contract
    /// @param newPaymentHasher The (address of) PaymentHasher contract instance
    function setPaymentHasher(PaymentHasher newPaymentHasher)
    public
    onlyDeployer
    notNullAddress(address(newPaymentHasher))
    notSameAddresses(address(newPaymentHasher), address(paymentHasher))
    {
        // Set new payment hasher
        PaymentHasher oldPaymentHasher = paymentHasher;
        paymentHasher = newPaymentHasher;

        // Emit event
        emit SetPaymentHasherEvent(oldPaymentHasher, newPaymentHasher);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier paymentHasherInitialized() {
        require(address(paymentHasher) != address(0), "Payment hasher not initialized [PaymentHashable.sol:52]");
        _;
    }
}