/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {DriipStorable} from "./DriipStorable.sol";
import {Servable} from "./Servable.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title FraudChallenge
@notice Where fraud challenge results are found
*/
contract FraudChallenge is Ownable, DriipStorable, Servable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    string constant public ADD_SEIZED_WALLET_ACTION = "add_seized_wallet";
    string constant public ADD_DOUBLE_SPENDER_WALLET_ACTION = "add_double_spender_wallet";
    string constant public ADD_FRAUDULENT_ORDER_ACTION = "add_fraudulent_order";
    string constant public ADD_FRAUDULENT_TRADE_ACTION = "add_fraudulent_trade";
    string constant public ADD_FRAUDULENT_PAYMENT_ACTION = "add_fraudulent_payment";

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    address[] public doubleSpenderWallets;
    mapping(address => bool) public doubleSpenderWalletsMap;

    NahmiiTypes.Order[] public fraudulentOrders;
    mapping(bytes32 => bool) public fraudulentOrderExchangeHashMap;

    NahmiiTypes.Trade[] public fraudulentTrades;
    mapping(bytes32 => bool) public fraudulentTradeHashMap;

    NahmiiTypes.Payment[] public fraudulentPayments;
    mapping(bytes32 => bool) public fraudulentPaymentExchangeHashMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event AddSeizedWalletEvent(address wallet);
    event AddDoubleSpenderWalletEvent(address wallet);
    event AddFraudulentOrderEvent(NahmiiTypes.Order order);
    event AddFraudulentTradeEvent(NahmiiTypes.Trade trade);
    event AddFraudulentPaymentEvent(NahmiiTypes.Payment payment);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Get the seized status of given wallet
    /// @param wallet The wallet address for which to check seized status
    /// @return true if wallet is seized, false otherwise
    function isSeizedWallet(address wallet) public view returns (bool) {
        return seizedWalletsMap[wallet];
    }

    /// @notice Get the number of wallets whose funds have be seized
    /// @return Number of seized wallets
    function seizedWalletsCount() public view returns (uint256) {
        return seizedWallets.length;
    }

    /// @notice Add given wallet to store of seized wallets if not already present
    /// @param wallet The seized wallet
    function addSeizedWallet(address wallet) public onlyDeployerOrEnabledServiceAction(ADD_SEIZED_WALLET_ACTION) {
        if (!seizedWalletsMap[wallet]) {
            seizedWallets.push(wallet);
            seizedWalletsMap[wallet] = true;
            emit AddSeizedWalletEvent(wallet);
        }
    }

    /// @notice Get the double spender status of given wallet
    /// @param wallet The wallet address for which to check double spender status
    /// @return true if wallet is double spender, false otherwise
    function isDoubleSpenderWallet(address wallet) public view returns (bool) {
        return doubleSpenderWalletsMap[wallet];
    }

    /// @notice Get the number of wallets tagged as double spenders
    /// @return Number of double spender wallets
    function doubleSpenderWalletsCount() public view returns (uint256) {
        return doubleSpenderWallets.length;
    }

    /// @notice Add given wallets to store of double spender wallets if not already present
    /// @param wallet The first wallet to add
    function addDoubleSpenderWallet(address wallet) public onlyDeployerOrEnabledServiceAction(ADD_DOUBLE_SPENDER_WALLET_ACTION) {
        if (!doubleSpenderWalletsMap[wallet]) {
            doubleSpenderWallets.push(wallet);
            doubleSpenderWalletsMap[wallet] = true;
            emit AddDoubleSpenderWalletEvent(wallet);
        }
    }

    /// @notice Get the number of fraudulent orders
    function fraudulentOrdersCount() public view returns (uint256) {
        return fraudulentOrders.length;
    }

    /// @notice Get the state about whether the given hash equals the exchange' hash of a fraudulent order
    /// @param hash The hash to be tested
    function isFraudulentOrderExchangeHash(bytes32 hash) public view returns (bool) {
        return fraudulentOrderExchangeHashMap[hash];
    }

    /// @notice Add given trade to store of fraudulent trades if not already present
    function addFraudulentOrder(NahmiiTypes.Order order) public onlyDeployerOrEnabledServiceAction(ADD_FRAUDULENT_ORDER_ACTION) {
        if (!fraudulentOrderExchangeHashMap[order.seals.exchange.hash]) {
            fraudulentOrders.push(order);
            fraudulentOrderExchangeHashMap[order.seals.exchange.hash] = true;
            emit AddFraudulentOrderEvent(order);
        }
    }

    /// @notice Get the number of fraudulent trades
    function fraudulentTradesCount() public view returns (uint256) {
        return fraudulentTrades.length;
    }

    /// @notice Get the state about whether the given hash equals the hash of a fraudulent trade
    /// @param hash The hash to be tested
    function isFraudulentTradeHash(bytes32 hash) public view returns (bool) {
        return fraudulentTradeHashMap[hash];
    }

    /// @notice Add given order to store of fraudulent orders if not already present
    function addFraudulentTrade(NahmiiTypes.Trade trade) public onlyDeployerOrEnabledServiceAction(ADD_FRAUDULENT_TRADE_ACTION) {
        if (!fraudulentTradeHashMap[trade.seal.hash]) {
            pushMemoryTradeToStorageArray(trade, fraudulentTrades);
            fraudulentTradeHashMap[trade.seal.hash] = true;
            emit AddFraudulentTradeEvent(trade);
        }
    }

    /// @notice Get the number of fraudulent payments
    function fraudulentPaymentsCount() public view returns (uint256) {
        return fraudulentPayments.length;
    }

    /// @notice Get the state about whether the given hash equals the exchange' hash of a fraudulent payment
    /// @param hash The hash to be tested
    function isFraudulentPaymentExchangeHash(bytes32 hash) public view returns (bool) {
        return fraudulentPaymentExchangeHashMap[hash];
    }

    /// @notice Add given payment to store of fraudulent payments if not already present
    function addFraudulentPayment(NahmiiTypes.Payment payment) public onlyDeployerOrEnabledServiceAction(ADD_FRAUDULENT_PAYMENT_ACTION) {
        if (!fraudulentPaymentExchangeHashMap[payment.seals.exchange.hash]) {
            pushMemoryPaymentToStorageArray(payment, fraudulentPayments);
            fraudulentPaymentExchangeHashMap[payment.seals.exchange.hash] = true;
            emit AddFraudulentPaymentEvent(payment);
        }
    }
}