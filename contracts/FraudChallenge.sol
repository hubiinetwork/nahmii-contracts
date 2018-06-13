/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {Servable} from "./Servable.sol";
import {Types} from "./Types.sol";

contract FraudChallenge is Ownable, Modifiable, Servable {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    string constant ADD_SEIZED_WALLETS = "add_seized_wallets";
    string constant ADD_DOUBLE_SPENDER_WALLET = "add_double_spender_wallet";
    string constant ADD_FRAUDULENT_ORDER = "add_fraudulent_order";
    string constant ADD_FRAUDULENT_TRADE = "add_fraudulent_trade";
    string constant ADD_FRAUDULENT_PAYMENT = "add_fraudulent_payment";

    Types.Order[] public fraudulentOrders;
    mapping(bytes32 => bool) public fraudulentOrderHashMap;

    Types.Trade[] public fraudulentTrades;
    mapping(bytes32 => bool) public fraudulentTradeHashMap;

    Types.Payment[] public fraudulentPayments;
    mapping(bytes32 => bool) public fraudulentPaymentHashMap;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    address[] public doubleSpenderWallets;
    mapping(address => bool) public doubleSpenderWalletsMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event AddSeizedWalletEvent(address wallet);
    event AddDoubleSpenderWalletEvent(address wallet);
    event AddFraudulentOrderEvent(Types.Order order);
    event AddFraudulentTradeEvent(Types.Trade trade);
    event AddFraudulentPaymentEvent(Types.Payment payment);


    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Add given wallet to store of seized wallets if not already present
    /// @param wallet The seized wallet
    function addSeizedWallet(address wallet) public
    onlyOwnerOrServiceAction(ADD_SEIZED_WALLETS)
    {
        if (!seizedWalletsMap[wallet]) {
            seizedWallets.push(wallet);
            seizedWalletsMap[wallet] = true;
            emit AddSeizedWalletEvent(wallet);
        }
    }

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

    /// @notice Add given wallets to store of double spender wallets if not already present
    /// @param wallet The first wallet to add
    function addDoubleSpenderWallet(address wallet) public
    onlyOwnerOrServiceAction(ADD_DOUBLE_SPENDER_WALLET)
    {
        if (!doubleSpenderWalletsMap[wallet]) {
            doubleSpenderWallets.push(wallet);
            doubleSpenderWalletsMap[wallet] = true;
            emit AddDoubleSpenderWalletEvent(wallet);
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

    /// @notice Add given trade to store of fraudulent trades if not already present
    function addFraudulentOrder(Types.Order order) public
    onlyOwnerOrServiceAction(ADD_FRAUDULENT_ORDER)
    {
        if (!fraudulentOrderHashMap[order.seals.exchange.hash]) {
            fraudulentOrders.push(order);
            fraudulentOrderHashMap[order.seals.exchange.hash] = true;
            emit AddFraudulentOrderEvent(order);
        }
    }

    /// @notice Get the number of fraudulent orders
    function fraudulentOrdersCount() public view returns (uint256) {
        return fraudulentOrders.length;
    }

    /// @notice Add given order to store of fraudulent orders if not already present
    function addFraudulentTrade(Types.Trade trade) public
    onlyOwnerOrServiceAction(ADD_FRAUDULENT_TRADE)
    {
        if (!fraudulentTradeHashMap[trade.seal.hash]) {
            fraudulentTrades.push(trade);
            fraudulentTradeHashMap[trade.seal.hash] = true;
            emit AddFraudulentTradeEvent(trade);
        }
    }

    /// @notice Get the number of fraudulent trades
    function fraudulentTradesCount() public view returns (uint256) {
        return fraudulentTrades.length;
    }

    /// @notice Add given payment to store of fraudulent payments if not already present
    function addFraudulentPayment(Types.Payment payment) public
    onlyOwnerOrServiceAction(ADD_FRAUDULENT_PAYMENT)
    {
        if (!fraudulentPaymentHashMap[payment.seals.exchange.hash]) {
            fraudulentPayments.push(payment);
            fraudulentPaymentHashMap[payment.seals.exchange.hash] = true;
            emit AddFraudulentPaymentEvent(payment);
        }
    }

    /// @notice Get the number of fraudulent payments
    function fraudulentPaymentsCount() public view returns (uint256) {
        return fraudulentPayments.length;
    }
}