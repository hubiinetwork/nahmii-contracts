/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

//import {Validator} from "../contracts/Validator.sol";
import {Ownable} from "../contracts/Ownable.sol";
import {Types} from "../contracts/Types.sol";

contract MockedValidator is Ownable /*is Validator*/ {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    bool tradeMakerFee;
    bool tradeTakerFee;
    bool tradeBuyer;
    bool tradeSeller;
    bool tradeSeal;
    bool paymentFee;
    bool paymentSender;
    bool paymentRecipient;
    bool paymentWalletHash;
    bool paymentWalletSeal;
    bool paymentExchangeSeal;
    bool paymentSeals;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) public Ownable(owner) /*Validator(owner)*/ {
        reset();
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        tradeMakerFee = true;
        tradeTakerFee = true;
        tradeBuyer = true;
        tradeSeller = true;
        tradeSeal = true;
        paymentFee = true;
        paymentSender = true;
        paymentRecipient = true;
        paymentWalletHash = true;
        paymentWalletSeal = true;
        paymentExchangeSeal = true;
        paymentSeals = true;
    }

    function setGenuineTradeMakerFee(bool genuine) public {
        tradeMakerFee = genuine;
    }

    function isGenuineTradeMakerFee(Types.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        return tradeMakerFee;
    }

    function setGenuineTradeTakerFee(bool genuine) public {
        tradeTakerFee = genuine;
    }

    function isGenuineTradeTakerFee(Types.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        return tradeTakerFee;
    }

    function setGenuineTradeBuyer(bool genuine) public {
        tradeBuyer = genuine;
    }

    function isGenuineTradeBuyer(Types.Trade trade, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        require(exchange == exchange);
        return tradeBuyer;
    }

    function setGenuineTradeSeller(bool genuine) public {
        tradeSeller = genuine;
    }

    function isGenuineTradeSeller(Types.Trade trade, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        require(exchange == exchange);
        return tradeSeller;
    }

    function setGenuineTradeSeal(bool genuine) public {
        tradeSeal = genuine;
    }

    function isGenuineTradeSeal(Types.Trade trade, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        require(exchange == exchange);
        return tradeSeal;
    }

    function setGenuinePaymentFee(bool genuine) public {
        paymentFee = genuine;
    }

    function isGenuinePaymentFee(Types.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentFee;
    }

    function setGenuinePaymentSender(bool genuine) public {
        paymentSender = genuine;
    }

    function isGenuinePaymentSender(Types.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentSender;
    }

    function setGenuinePaymentRecipient(bool genuine) public {
        paymentRecipient = genuine;
    }

    function isGenuinePaymentRecipient(Types.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentRecipient;
    }

    function setGenuinePaymentWalletHash(bool genuine) public {
        paymentWalletHash = genuine;
    }

    function isGenuinePaymentWalletHash(Types.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentWalletHash;
    }

    function setGenuinePaymentWalletSeal(bool genuine) public {
        paymentWalletSeal = genuine;
    }

    function isGenuinePaymentWalletSeal(Types.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentWalletSeal;
    }

    function setGenuinePaymentExchangeSeal(bool genuine) public {
        paymentExchangeSeal = genuine;
    }

    function isGenuinePaymentExchangeSeal(Types.Payment payment, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(exchange == exchange);
        return paymentExchangeSeal;
    }

    function setGenuinePaymentSeals(bool genuine) public {
        paymentSeals = genuine;
    }

    function isGenuinePaymentSeals(Types.Payment payment, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(exchange == exchange);
        return paymentSeals;
    }
}
