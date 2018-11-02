/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {FraudChallenge} from "../FraudChallenge.sol";
import {NahmiiTypesLib} from "../NahmiiTypesLib.sol";

/**
@title MockedFraudChallenge
@notice Mocked implementation of fraud challenge contract
*/
contract MockedFraudChallenge is FraudChallenge {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    bool public fraudulentOrderOperatorHash;
    bool public fraudulentTradeHash;
    bool public fraudulentPaymentOperatorHash;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) public FraudChallenge(owner) {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        fraudulentOrders.length = 0;
        fraudulentTrades.length = 0;
        fraudulentPayments.length = 0;
        seizedWallets.length = 0;
        doubleSpenderWallets.length = 0;
        fraudulentOrderOperatorHash = false;
        fraudulentTradeHash = false;
        fraudulentPaymentOperatorHash = false;
    }

    function addFraudulentOrder(NahmiiTypesLib.Order order) public {
        fraudulentOrders.push(order);
        emit AddFraudulentOrderEvent(order);
    }

    function addFraudulentTrade(NahmiiTypesLib.Trade trade) public {
        pushMemoryTradeToStorageArray(trade, fraudulentTrades);
        emit AddFraudulentTradeEvent(trade);
    }

    function addFraudulentPayment(NahmiiTypesLib.Payment payment) public {
        pushMemoryPaymentToStorageArray(payment, fraudulentPayments);
        emit AddFraudulentPaymentEvent(payment);
    }

    function addSeizedWallet(address wallet) public {
        seizedWallets.push(wallet);
        emit AddSeizedWalletEvent(wallet);
    }

    function addDoubleSpenderWallet(address wallet) public {
        doubleSpenderWallets.push(wallet);
        emit AddDoubleSpenderWalletEvent(wallet);
    }

    function setFraudulentOrderOperatorHash(bool _fraudulentOrderOperatorHash) public {
        fraudulentOrderOperatorHash = _fraudulentOrderOperatorHash;
    }

    function isFraudulentOrderOperatorHash(bytes32 hash) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(hash == hash);
        return fraudulentOrderOperatorHash;
    }

    function setFraudulentTradeHash(bool _fraudulentTradeHash) public {
        fraudulentTradeHash = _fraudulentTradeHash;
    }

    function isFraudulentTradeHash(bytes32 hash) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(hash == hash);
        return fraudulentTradeHash;
    }

    function setFraudulentPaymentOperatorHash(bool _fraudulentPaymentOperatorHash) public {
        fraudulentPaymentOperatorHash = _fraudulentPaymentOperatorHash;
    }

    function isFraudulentPaymentOperatorHash(bytes32 hash) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(hash == hash);
        return fraudulentPaymentOperatorHash;
    }
}
