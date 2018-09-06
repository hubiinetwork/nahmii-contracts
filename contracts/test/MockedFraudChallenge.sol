/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {FraudChallenge} from "../FraudChallenge.sol";
import {StriimTypes} from "../StriimTypes.sol";

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
    bool public fraudulentOrderExchangeHash;
    bool public fraudulentTradeHash;
    bool public fraudulentPaymentExchangeHash;

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
        fraudulentOrderExchangeHash = false;
        fraudulentTradeHash = false;
        fraudulentPaymentExchangeHash = false;
    }

    function addFraudulentOrder(StriimTypes.Order order) public {
        fraudulentOrders.push(order);
        emit AddFraudulentOrderEvent(order);
    }

    function addFraudulentTrade(StriimTypes.Trade trade) public {
        pushMemoryTradeToStorageArray(trade, fraudulentTrades);
        emit AddFraudulentTradeEvent(trade);
    }

    function addFraudulentPayment(StriimTypes.Payment payment) public {
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

    function setFraudulentOrderExchangeHash(bool _fraudulentOrderExchangeHash) public {
        fraudulentOrderExchangeHash = _fraudulentOrderExchangeHash;
    }

    function isFraudulentOrderExchangeHash(bytes32 hash) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(hash == hash);
        return fraudulentOrderExchangeHash;
    }

    function setFraudulentTradeHash(bool _fraudulentTradeHash) public {
        fraudulentTradeHash = _fraudulentTradeHash;
    }

    function isFraudulentTradeHash(bytes32 hash) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(hash == hash);
        return fraudulentTradeHash;
    }

    function setFraudulentPaymentExchangeHash(bool _fraudulentPaymentExchangeHash) public {
        fraudulentPaymentExchangeHash = _fraudulentPaymentExchangeHash;
    }

    function isFraudulentPaymentExchangeHash(bytes32 hash) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(hash == hash);
        return fraudulentPaymentExchangeHash;
    }
}
