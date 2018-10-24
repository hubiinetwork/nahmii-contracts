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
import {SignerManageable} from "../SignerManageable.sol";
//import {Validator} from "../Validator.sol";
import {NahmiiTypes} from "../NahmiiTypes.sol";

/**
@title MockedValidator
@notice Mocked implementation of validator contract
*/
contract MockedValidator is Ownable, SignerManageable /*, Validator*/ {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    bool orderWalletHash;
    bool orderWalletSeal;
    bool orderOperatorSeal;
    bool orderSeals;
    bool tradeBuyerFee;
    bool tradeSellerFee;
    bool tradeBuyer;
    bool tradeSeller;
    bool[] tradeSeals;
    bool tradeParty;
    bool tradeOrder;
    bool paymentFee;
    bool paymentSender;
    bool paymentRecipient;
    bool paymentWalletHash;
    bool paymentWalletSeal;
    bool paymentOperatorSeal;
    bool[] paymentSeals;
    bool successiveTradesPartyNonces;
    bool successiveTradesBalances;
    bool successiveTradesTotalFees;
    bool successivePaymentsPartyNonces;
    bool successivePaymentsBalances;
    bool successivePaymentsTotalFees;
    bool successiveTradePaymentPartyNonces;
    bool successiveTradePaymentBalances;
    bool successiveTradePaymentTotalFees;
    bool successivePaymentTradePartyNonces;
    bool successivePaymentTradeBalances;
    bool successivePaymentTradeTotalFees;
    bool successiveTradeOrderResiduals;
    bool walletSignature;

    uint256 tradeSealsIndex;
    uint256 paymentSealsIndex;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address signerManager) Ownable(owner) SignerManageable(signerManager) /*Validator(owner)*/ public {
        reset();
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        orderWalletHash = true;
        orderWalletSeal = true;
        orderOperatorSeal = true;
        orderSeals = true;
        tradeBuyerFee = true;
        tradeSellerFee = true;
        tradeBuyer = true;
        tradeSeller = true;
        tradeSeals.length = 0;
        tradeSeals.push(true);
        tradeParty = true;
        tradeOrder = true;
        paymentFee = true;
        paymentSender = true;
        paymentRecipient = true;
        paymentWalletHash = true;
        paymentWalletSeal = true;
        paymentOperatorSeal = true;
        paymentSeals.length = 0;
        paymentSeals.push(true);
        successiveTradesPartyNonces = true;
        successiveTradesBalances = true;
        successiveTradesTotalFees = true;
        successivePaymentsPartyNonces = true;
        successivePaymentsBalances = true;
        successivePaymentsTotalFees = true;
        successiveTradePaymentPartyNonces = true;
        successiveTradePaymentBalances = true;
        successiveTradePaymentTotalFees = true;
        successivePaymentTradePartyNonces = true;
        successivePaymentTradeBalances = true;
        successivePaymentTradeTotalFees = true;
        successiveTradeOrderResiduals = true;
        walletSignature = true;

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

    function setGenuineOrderOperatorSeal(bool genuine) public {
        orderOperatorSeal = genuine;
    }

    function isGenuineOrderOperatorSeal(NahmiiTypes.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderOperatorSeal;
    }

    function setGenuineOrderSeals(bool genuine) public {
        orderSeals = genuine;
    }

    function isGenuineOrderSeals(NahmiiTypes.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
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

    function isGenuineTradeBuyer(NahmiiTypes.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        return tradeBuyer;
    }

    function setGenuineTradeSeller(bool genuine) public {
        tradeSeller = genuine;
    }

    function isGenuineTradeSeller(NahmiiTypes.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        return tradeSeller;
    }

    function setGenuineTradeSeal(bool genuine) public {
        tradeSeals.push(genuine);
    }

    function isGenuineTradeSeal(NahmiiTypes.Trade trade) public returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        if (tradeSeals.length == 1)
            return tradeSeals[0];
        else {
            require(tradeSealsIndex < tradeSeals.length);
            return tradeSeals[tradeSealsIndex++];
        }
    }

    function setTradeParty(bool _tradeParty) public {
        tradeParty = _tradeParty;
    }

    function isTradeParty(NahmiiTypes.Trade trade, address wallet) public view returns (bool) {
        return tradeParty;
    }

    function setTradeOrder(bool _tradeOrder) public {
        tradeOrder = _tradeOrder;
    }

    function isTradeOrder(NahmiiTypes.Trade trade, NahmiiTypes.Order order) public view returns (bool) {
        return tradeOrder;
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

    function setGenuinePaymentOperatorSeal(bool genuine) public {
        paymentOperatorSeal = genuine;
    }

    function isGenuinePaymentOperatorSeal(NahmiiTypes.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentOperatorSeal;
    }

    function setGenuinePaymentSeals(bool genuine) public {
        paymentSeals.push(genuine);
    }

    function isGenuinePaymentSeals(NahmiiTypes.Payment payment) public returns (bool) {
        // To silence unused function parameter compiler warnings
        require(payment.nonce == payment.nonce);
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

    function setGenuineSuccessiveTradesTotalFees(bool genuine) public {
        successiveTradesTotalFees = genuine;
    }

    function isGenuineSuccessiveTradesTotalFees(
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
        return successiveTradesTotalFees;
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

    function setGenuineSuccessivePaymentsTotalFees(bool genuine) public {
        successivePaymentsTotalFees = genuine;
    }

    function isGenuineSuccessivePaymentsTotalFees(
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
        return successivePaymentsTotalFees;
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

    function setGenuineSuccessiveTradePaymentTotalFees(bool genuine) public {
        successiveTradePaymentTotalFees = genuine;
    }

    function isGenuineSuccessiveTradePaymentTotalFees(
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
        return successiveTradePaymentTotalFees;
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

    function setGenuineSuccessivePaymentTradeTotalFees(bool genuine) public {
        successivePaymentTradeTotalFees = genuine;
    }

    function isGenuineSuccessivePaymentTradeTotalFees(
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
        return successivePaymentTradeTotalFees;
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

    function setGenuineWalletSignature(bool genuine) public {
        walletSignature = genuine;
    }

    function isGenuineWalletSignature(
        bytes32 hash,
        NahmiiTypes.Signature signature,
        address wallet
    )
    public
    view
    returns (bool)
    {
        // To silence unused function parameter compiler warning
        require(hash == hash);
        require(signature.v == signature.v);
        require(wallet == wallet);
        return walletSignature;
    }
}
