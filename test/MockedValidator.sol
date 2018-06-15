/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
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
    bool orderWalletHash;
    bool orderWalletSeal;
    bool orderExchangeSeal;
    bool orderSeals;
    bool tradeMakerFee;
    bool tradeTakerFee;
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
    constructor(address owner) public Ownable(owner) /*Validator(owner)*/ {
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
        tradeMakerFee = true;
        tradeTakerFee = true;
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

    function isGenuineOrderWalletHash(Types.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderWalletHash;
    }

    function setGenuineOrderWalletSeal(bool genuine) public {
        orderWalletSeal = genuine;
    }

    function isGenuineOrderWalletSeal(Types.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderWalletSeal;
    }

    function setGenuineOrderExchangeSeal(bool genuine) public {
        orderExchangeSeal = genuine;
    }

    function isGenuineOrderExchangeSeal(Types.Order order, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        require(exchange == exchange);
        return orderExchangeSeal;
    }

    function setGenuineOrderSeals(bool genuine) public {
        orderSeals = genuine;
    }

    function isGenuineOrderSeals(Types.Order order, address exchange) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        require(exchange == exchange);
        return orderSeals;
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
        tradeSeals.push(genuine);
    }

    function isGenuineTradeSeal(Types.Trade trade, address exchange) public returns (bool) {
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
        paymentSeals.push(genuine);
    }

    function isGenuinePaymentSeals(Types.Payment payment, address exchange) public returns (bool) {
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
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole
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
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.CurrencyRole firstCurrencyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole,
        Types.CurrencyRole lastCurrencyRole
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
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.CurrencyRole firstCurrencyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole,
        Types.CurrencyRole lastCurrencyRole
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
        return successiveTradesNetFees;
    }

    function setSuccessivePaymentsPartyNonces(bool genuine) public {
        successivePaymentsPartyNonces = genuine;
    }

    function isSuccessivePaymentsPartyNonces(
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
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
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
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
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
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
        return successivePaymentsNetFees;
    }

    function setSuccessiveTradePaymentPartyNonces(bool genuine) public {
        successiveTradePaymentPartyNonces = genuine;
    }

    function isSuccessiveTradePaymentPartyNonces(
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
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
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole tradeCurrencyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
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
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole tradeCurrencyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
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
        return successiveTradePaymentNetFees;
    }

    function setSuccessivePaymentTradePartyNonces(bool genuine) public {
        successivePaymentTradePartyNonces = genuine;
    }

    function isSuccessivePaymentTradePartyNonces(
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole
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
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole tradeCurrencyRole
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
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole tradeCurrencyRole
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
        return successivePaymentTradeNetFees;
    }

    function setGenuineSuccessiveTradeOrderResiduals(bool genuine) public {
        successiveTradeOrderResiduals = genuine;
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        Types.Trade firstTrade,
        Types.Trade lastTrade,
        Types.TradePartyRole tradePartyRole
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
