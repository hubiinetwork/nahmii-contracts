/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "../Ownable.sol";
import {AccessorManageable} from "../AccessorManageable.sol";
//import {Validator} from "../Validator.sol";
import {NahmiiTypes} from "../NahmiiTypes.sol";

/**
@title MockedValidator
@notice Mocked implementation of validator contract
*/
contract MockedValidator is Ownable, AccessorManageable /*, Validator*/ {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    bool orderWalletHash;
    bool orderWalletSeal;
    bool orderExchangeSeal;
    bool orderSeals;
    bool tradeBuyerFee;
    bool tradeSellerFee;
    bool tradeBuyer;
    bool tradeSeller;
    bool[] tradeSeals;
    bool paymentFee;
    bool paymentSender;
    bool paymentRecipient;
    bool paymentWalletHash;
    bool paymentWalletSeal;
    bool paymentExchangeSeal;
    bool[] paymentSeals;
    bool successiveTradesPartyNonces;
    bool successiveTradesBalances;
    bool successiveTradesNetFees;
    bool successivePaymentsPartyNonces;
    bool successivePaymentsBalances;
    bool successivePaymentsNetFees;
    bool successiveTradePaymentPartyNonces;
    bool successiveTradePaymentBalances;
    bool successiveTradePaymentNetFees;
    bool successivePaymentTradePartyNonces;
    bool successivePaymentTradeBalances;
    bool successivePaymentTradeNetFees;
    bool successiveTradeOrderResiduals;

    uint256 tradeSealsIndex;
    uint256 paymentSealsIndex;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccessorManageable(accessorManager) /*Validator(owner)*/ public {
        reset();
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        orderWalletHash = true;
        orderWalletSeal = true;
        orderExchangeSeal = true;
        orderSeals = true;
        tradeBuyerFee = true;
        tradeSellerFee = true;
        tradeBuyer = true;
        tradeSeller = true;
        tradeSeals.length = 0;
        tradeSeals.push(true);
        paymentFee = true;
        paymentSender = true;
        paymentRecipient = true;
        paymentWalletHash = true;
        paymentWalletSeal = true;
        paymentExchangeSeal = true;
        paymentSeals.length = 0;
        paymentSeals.push(true);
        successiveTradesPartyNonces = true;
        successiveTradesBalances = true;
        successiveTradesNetFees = true;
        successivePaymentsPartyNonces = true;
        successivePaymentsBalances = true;
        successivePaymentsNetFees = true;
        successiveTradePaymentPartyNonces = true;
        successiveTradePaymentBalances = true;
        successiveTradePaymentNetFees = true;
        successivePaymentTradePartyNonces = true;
        successivePaymentTradeBalances = true;
        successivePaymentTradeNetFees = true;
        successiveTradeOrderResiduals = true;

        tradeSealsIndex = 1;
        paymentSealsIndex = 1;
    }

    function setGenuineOrderWalletHash(bool genuine) public {
        orderWalletHash = genuine;
    }

    function isGenuineOrderWalletHash(NahmiiTypes.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderWalletHash;
    }

    function setGenuineOrderWalletSeal(bool genuine) public {
        orderWalletSeal = genuine;
    }

    function isGenuineOrderWalletSeal(NahmiiTypes.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderWalletSeal;
    }

    function setGenuineOrderExchangeSeal(bool genuine) public {
        orderExchangeSeal = genuine;
    }

    function isGenuineOrderExchangeSeal(NahmiiTypes.Order order, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        require(exchange == exchange);
        return orderExchangeSeal;
    }

    function setGenuineOrderSeals(bool genuine) public {
        orderSeals = genuine;
    }

    function isGenuineOrderSeals(NahmiiTypes.Order order, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        require(exchange == exchange);
        return orderSeals;
    }

    function setGenuineTradeBuyerFee(bool genuine) public {
        tradeBuyerFee = genuine;
    }

    function isGenuineTradeBuyerFee(NahmiiTypes.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        return tradeBuyerFee;
    }

    function setGenuineTradeSellerFee(bool genuine) public {
        tradeSellerFee = genuine;
    }

    function isGenuineTradeSellerFee(NahmiiTypes.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        return tradeSellerFee;
    }

    function setGenuineTradeBuyer(bool genuine) public {
        tradeBuyer = genuine;
    }

    function isGenuineTradeBuyer(NahmiiTypes.Trade trade, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        require(exchange == exchange);
        return tradeBuyer;
    }

    function setGenuineTradeSeller(bool genuine) public {
        tradeSeller = genuine;
    }

    function isGenuineTradeSeller(NahmiiTypes.Trade trade, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        require(exchange == exchange);
        return tradeSeller;
    }

    function setGenuineTradeSeal(bool genuine) public {
        tradeSeals.push(genuine);
    }

    function isGenuineTradeSeal(NahmiiTypes.Trade trade, address exchange) public returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        require(exchange == exchange);
        if (tradeSeals.length == 1)
            return tradeSeals[0];
        else {
            require(tradeSealsIndex < tradeSeals.length);
            return tradeSeals[tradeSealsIndex++];
        }
    }

    function setGenuinePaymentFee(bool genuine) public {
        paymentFee = genuine;
    }

    function isGenuinePaymentFee(NahmiiTypes.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentFee;
    }

    function setGenuinePaymentSender(bool genuine) public {
        paymentSender = genuine;
    }

    function isGenuinePaymentSender(NahmiiTypes.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentSender;
    }

    function setGenuinePaymentRecipient(bool genuine) public {
        paymentRecipient = genuine;
    }

    function isGenuinePaymentRecipient(NahmiiTypes.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentRecipient;
    }

    function setGenuinePaymentWalletHash(bool genuine) public {
        paymentWalletHash = genuine;
    }

    function isGenuinePaymentWalletHash(NahmiiTypes.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentWalletHash;
    }

    function setGenuinePaymentWalletSeal(bool genuine) public {
        paymentWalletSeal = genuine;
    }

    function isGenuinePaymentWalletSeal(NahmiiTypes.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentWalletSeal;
    }

    function setGenuinePaymentExchangeSeal(bool genuine) public {
        paymentExchangeSeal = genuine;
    }

    function isGenuinePaymentExchangeSeal(NahmiiTypes.Payment payment, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(exchange == exchange);
        return paymentExchangeSeal;
    }

    function setGenuinePaymentSeals(bool genuine) public {
        paymentSeals.push(genuine);
    }

    function isGenuinePaymentSeals(NahmiiTypes.Payment payment, address exchange) public returns (bool) {
        // To silence unused function parameter compiler warnings
        require(payment.nonce == payment.nonce);
        require(exchange == exchange);
        if (paymentSeals.length == 1)
            return paymentSeals[0];
        else {
            require(paymentSealsIndex < paymentSeals.length);
            return paymentSeals[paymentSealsIndex++];
        }
    }

    function setSuccessiveTradesPartyNonces(bool genuine) public {
        successiveTradesPartyNonces = genuine;
    }

    function isSuccessiveTradesPartyNonces(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.TradePartyRole firstTradePartyRole,
        NahmiiTypes.Trade lastTrade,
        NahmiiTypes.TradePartyRole lastTradePartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(firstTrade.nonce == firstTrade.nonce);
        require(firstTradePartyRole == firstTradePartyRole);
        require(lastTrade.nonce == lastTrade.nonce);
        require(lastTradePartyRole == lastTradePartyRole);
        return successiveTradesPartyNonces;
    }

    function setGenuineSuccessiveTradesBalances(bool genuine) public {
        successiveTradesBalances = genuine;
    }

    function isGenuineSuccessiveTradesBalances(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.TradePartyRole firstTradePartyRole,
        NahmiiTypes.CurrencyRole firstCurrencyRole,
        NahmiiTypes.Trade lastTrade,
        NahmiiTypes.TradePartyRole lastTradePartyRole,
        NahmiiTypes.CurrencyRole lastCurrencyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(firstTrade.nonce == firstTrade.nonce);
        require(firstTradePartyRole == firstTradePartyRole);
        require(firstCurrencyRole == firstCurrencyRole);
        require(lastTrade.nonce == lastTrade.nonce);
        require(lastTradePartyRole == lastTradePartyRole);
        require(lastCurrencyRole == lastCurrencyRole);
        return successiveTradesBalances;
    }

    function setGenuineSuccessiveTradesNetFees(bool genuine) public {
        successiveTradesNetFees = genuine;
    }

    function isGenuineSuccessiveTradesNetFees(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.TradePartyRole firstTradePartyRole,
        NahmiiTypes.Trade lastTrade,
        NahmiiTypes.TradePartyRole lastTradePartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(firstTrade.nonce == firstTrade.nonce);
        require(firstTradePartyRole == firstTradePartyRole);
        require(lastTrade.nonce == lastTrade.nonce);
        require(lastTradePartyRole == lastTradePartyRole);
        return successiveTradesNetFees;
    }

    function setSuccessivePaymentsPartyNonces(bool genuine) public {
        successivePaymentsPartyNonces = genuine;
    }

    function isSuccessivePaymentsPartyNonces(
        NahmiiTypes.Payment firstPayment,
        NahmiiTypes.PaymentPartyRole firstPaymentPartyRole,
        NahmiiTypes.Payment lastPayment,
        NahmiiTypes.PaymentPartyRole lastPaymentPartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(firstPayment.nonce == firstPayment.nonce);
        require(firstPaymentPartyRole == firstPaymentPartyRole);
        require(lastPayment.nonce == lastPayment.nonce);
        require(lastPaymentPartyRole == lastPaymentPartyRole);
        return successivePaymentsPartyNonces;
    }

    function setGenuineSuccessivePaymentsBalances(bool genuine) public {
        successivePaymentsBalances = genuine;
    }

    function isGenuineSuccessivePaymentsBalances(
        NahmiiTypes.Payment firstPayment,
        NahmiiTypes.PaymentPartyRole firstPaymentPartyRole,
        NahmiiTypes.Payment lastPayment,
        NahmiiTypes.PaymentPartyRole lastPaymentPartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(firstPayment.nonce == firstPayment.nonce);
        require(firstPaymentPartyRole == firstPaymentPartyRole);
        require(lastPayment.nonce == lastPayment.nonce);
        require(lastPaymentPartyRole == lastPaymentPartyRole);
        return successivePaymentsBalances;
    }

    function setGenuineSuccessivePaymentsNetFees(bool genuine) public {
        successivePaymentsNetFees = genuine;
    }

    function isGenuineSuccessivePaymentsNetFees(
        NahmiiTypes.Payment firstPayment,
        NahmiiTypes.Payment lastPayment
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(firstPayment.nonce == firstPayment.nonce);
        require(lastPayment.nonce == lastPayment.nonce);
        return successivePaymentsNetFees;
    }

    function setSuccessiveTradePaymentPartyNonces(bool genuine) public {
        successiveTradePaymentPartyNonces = genuine;
    }

    function isSuccessiveTradePaymentPartyNonces(
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole,
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        require(tradePartyRole == tradePartyRole);
        require(payment.nonce == payment.nonce);
        require(paymentPartyRole == paymentPartyRole);
        return successiveTradePaymentPartyNonces;
    }

    function setGenuineSuccessiveTradePaymentBalances(bool genuine) public {
        successiveTradePaymentBalances = genuine;
    }

    function isGenuineSuccessiveTradePaymentBalances(
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole,
        NahmiiTypes.CurrencyRole tradeCurrencyRole,
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        require(tradePartyRole == tradePartyRole);
        require(tradeCurrencyRole == tradeCurrencyRole);
        require(payment.nonce == payment.nonce);
        require(paymentPartyRole == paymentPartyRole);
        return successiveTradePaymentBalances;
    }

    function setGenuineSuccessiveTradePaymentNetFees(bool genuine) public {
        successiveTradePaymentNetFees = genuine;
    }

    function isGenuineSuccessiveTradePaymentNetFees(
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole,
        NahmiiTypes.Payment payment
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        require(tradePartyRole == tradePartyRole);
        require(payment.nonce == payment.nonce);
        return successiveTradePaymentNetFees;
    }

    function setSuccessivePaymentTradePartyNonces(bool genuine) public {
        successivePaymentTradePartyNonces = genuine;
    }

    function isSuccessivePaymentTradePartyNonces(
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole,
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(paymentPartyRole == paymentPartyRole);
        require(trade.nonce == trade.nonce);
        require(tradePartyRole == tradePartyRole);
        return successivePaymentTradePartyNonces;
    }

    function setGenuineSuccessivePaymentTradeBalances(bool genuine) public {
        successivePaymentTradeBalances = genuine;
    }

    function isGenuineSuccessivePaymentTradeBalances(
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole,
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole,
        NahmiiTypes.CurrencyRole tradeCurrencyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(paymentPartyRole == paymentPartyRole);
        require(trade.nonce == trade.nonce);
        require(tradePartyRole == tradePartyRole);
        require(tradeCurrencyRole == tradeCurrencyRole);
        return successivePaymentTradeBalances;
    }

    function setGenuineSuccessivePaymentTradeNetFees(bool genuine) public {
        successivePaymentTradeNetFees = genuine;
    }

    function isGenuineSuccessivePaymentTradeNetFees(
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole,
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(paymentPartyRole == paymentPartyRole);
        require(trade.nonce == trade.nonce);
        require(tradePartyRole == tradePartyRole);
        return successivePaymentTradeNetFees;
    }

    function setGenuineSuccessiveTradeOrderResiduals(bool genuine) public {
        successiveTradeOrderResiduals = genuine;
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.Trade lastTrade,
        NahmiiTypes.TradePartyRole tradePartyRole
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(firstTrade.nonce == firstTrade.nonce);
        require(lastTrade.nonce == lastTrade.nonce);
        require(tradePartyRole == tradePartyRole);
        return successiveTradeOrderResiduals;
    }
}
