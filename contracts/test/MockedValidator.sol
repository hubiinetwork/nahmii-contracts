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
import {NahmiiTypesLib} from "../NahmiiTypesLib.sol";

/**
@title MockedValidator
@notice Mocked implementation of validator contract
*/
contract MockedValidator is Ownable, SignerManageable {

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
    bool tradeBuyerGenuine;
    bool tradeSellerGenuine;
    bool[] tradeSeals;
    bool tradeParty;
    bool tradeBuyer;
    bool tradeSeller;
    bool tradeOrder;
    bool paymentFee;
    bool paymentSenderGenuine;
    bool paymentRecipientGenuine;
    bool paymentWalletHash;
    bool paymentWalletSeal;
    bool paymentOperatorSeal;
    bool[] paymentSeals;
    bool paymentParty;
    bool paymentSender;
    bool paymentRecipient;
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
    constructor(address deployer, address signerManager) Ownable(deployer) SignerManageable(signerManager) public {
        _reset();
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset() public {
        orderWalletHash = true;
        orderWalletSeal = true;
        orderOperatorSeal = true;
        orderSeals = true;
        tradeBuyerFee = true;
        tradeSellerFee = true;
        tradeBuyerGenuine = true;
        tradeSellerGenuine = true;
        tradeSeals.length = 0;
        tradeSeals.push(true);
        tradeParty = true;
        tradeBuyer = true;
        tradeSeller = true;
        tradeOrder = true;
        paymentFee = true;
        paymentSenderGenuine = true;
        paymentRecipientGenuine = true;
        paymentWalletHash = true;
        paymentWalletSeal = true;
        paymentOperatorSeal = true;
        paymentSeals.length = 0;
        paymentSeals.push(true);
        paymentParty = true;
        paymentSender = true;
        paymentRecipient = true;
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

    function isGenuineOrderWalletHash(NahmiiTypesLib.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderWalletHash;
    }

    function setGenuineOrderWalletSeal(bool genuine) public {
        orderWalletSeal = genuine;
    }

    function isGenuineOrderWalletSeal(NahmiiTypesLib.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderWalletSeal;
    }

    function setGenuineOrderOperatorSeal(bool genuine) public {
        orderOperatorSeal = genuine;
    }

    function isGenuineOrderOperatorSeal(NahmiiTypesLib.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderOperatorSeal;
    }

    function setGenuineOrderSeals(bool genuine) public {
        orderSeals = genuine;
    }

    function isGenuineOrderSeals(NahmiiTypesLib.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(order.nonce == order.nonce);
        return orderSeals;
    }

    function setGenuineTradeBuyerFee(bool genuine) public {
        tradeBuyerFee = genuine;
    }

    function isGenuineTradeBuyerFee(NahmiiTypesLib.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        return tradeBuyerFee;
    }

    function setGenuineTradeSellerFee(bool genuine) public {
        tradeSellerFee = genuine;
    }

    function isGenuineTradeSellerFee(NahmiiTypesLib.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        return tradeSellerFee;
    }

    function setGenuineTradeBuyer(bool genuine) public {
        tradeBuyerGenuine = genuine;
    }

    function isGenuineTradeBuyer(NahmiiTypesLib.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        return tradeBuyerGenuine;
    }

    function setGenuineTradeSeller(bool genuine) public {
        tradeSellerGenuine = genuine;
    }

    function isGenuineTradeSeller(NahmiiTypesLib.Trade trade) public view returns (bool) {
        // To silence unused function parameter compiler warnings
        require(trade.nonce == trade.nonce);
        return tradeSellerGenuine;
    }

    function setGenuineTradeSeal(bool genuine) public {
        tradeSeals.push(genuine);
    }

    // TODO Redo trade seal management to prevent the need for the following pattern
    // taken from DriipSettlementDispute.js:
    //   await ethersValidator.isGenuineTradeSeal(trade, {gasLimit: 1e6});
    //   await web3Validator.setGenuineTradeSeal(false);
    function isGenuineTradeSeal(NahmiiTypesLib.Trade trade) public returns (bool) {
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

    function isTradeParty(NahmiiTypesLib.Trade trade, address wallet) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        require(wallet == wallet);
        return tradeParty;
    }

    function setTradeBuyer(bool _tradeBuyer) public {
        tradeBuyer = _tradeBuyer;
    }

    function isTradeBuyer(NahmiiTypesLib.Trade trade, address wallet) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        require(wallet == wallet);
        return tradeBuyer;
    }

    function setTradeSeller(bool _tradeSeller) public {
        tradeSeller = _tradeSeller;
    }

    function isTradeSeller(NahmiiTypesLib.Trade trade, address wallet) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        require(wallet == wallet);
        return tradeSeller;
    }

    function setTradeOrder(bool _tradeOrder) public {
        tradeOrder = _tradeOrder;
    }

    function isTradeOrder(NahmiiTypesLib.Trade trade, NahmiiTypesLib.Order order) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(trade.nonce == trade.nonce);
        require(order.nonce == order.nonce);
        return tradeOrder;
    }

    function setGenuinePaymentFee(bool genuine) public {
        paymentFee = genuine;
    }

    function isGenuinePaymentFee(NahmiiTypesLib.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentFee;
    }

    function setGenuinePaymentSender(bool genuine) public {
        paymentSenderGenuine = genuine;
    }

    function isGenuinePaymentSender(NahmiiTypesLib.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentSenderGenuine;
    }

    function setGenuinePaymentRecipient(bool genuine) public {
        paymentRecipientGenuine = genuine;
    }

    function isGenuinePaymentRecipient(NahmiiTypesLib.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentRecipientGenuine;
    }

    function setGenuinePaymentWalletHash(bool genuine) public {
        paymentWalletHash = genuine;
    }

    function isGenuinePaymentWalletHash(NahmiiTypesLib.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentWalletHash;
    }

    function setGenuinePaymentWalletSeal(bool genuine) public {
        paymentWalletSeal = genuine;
    }

    function isGenuinePaymentWalletSeal(NahmiiTypesLib.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentWalletSeal;
    }

    function setGenuinePaymentOperatorSeal(bool genuine) public {
        paymentOperatorSeal = genuine;
    }

    function isGenuinePaymentOperatorSeal(NahmiiTypesLib.Payment payment) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        return paymentOperatorSeal;
    }

    function setGenuinePaymentSeals(bool genuine) public {
        paymentSeals.push(genuine);
    }

    function isGenuinePaymentSeals(NahmiiTypesLib.Payment payment) public returns (bool) {
        // To silence unused function parameter compiler warnings
        require(payment.nonce == payment.nonce);
        if (paymentSeals.length == 1)
            return paymentSeals[0];
        else {
            require(paymentSealsIndex < paymentSeals.length);
            return paymentSeals[paymentSealsIndex++];
        }
    }

    function setPaymentParty(bool _paymentParty) public {
        paymentParty = _paymentParty;
    }

    function isPaymentParty(NahmiiTypesLib.Payment payment, address wallet) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(wallet == wallet);
        return paymentParty;
    }

    function setPaymentSender(bool _paymentSender) public {
        paymentSender = _paymentSender;
    }

    function isPaymentSender(NahmiiTypesLib.Payment payment, address wallet) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(wallet == wallet);
        return paymentSender;
    }

    function setPaymentRecipient(bool _paymentRecipient) public {
        paymentRecipient = _paymentRecipient;
    }

    function isPaymentRecipient(NahmiiTypesLib.Payment payment, address wallet) public view returns (bool) {
        // To silence unused function parameter compiler warning
        require(payment.nonce == payment.nonce);
        require(wallet == wallet);
        return paymentRecipient;
    }

    function setSuccessiveTradesPartyNonces(bool genuine) public {
        successiveTradesPartyNonces = genuine;
    }

    function isSuccessiveTradesPartyNonces(
        NahmiiTypesLib.Trade firstTrade,
        NahmiiTypesLib.TradePartyRole firstTradePartyRole,
        NahmiiTypesLib.Trade lastTrade,
        NahmiiTypesLib.TradePartyRole lastTradePartyRole
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
        NahmiiTypesLib.Trade firstTrade,
        NahmiiTypesLib.TradePartyRole firstTradePartyRole,
        NahmiiTypesLib.CurrencyRole firstCurrencyRole,
        NahmiiTypesLib.Trade lastTrade,
        NahmiiTypesLib.TradePartyRole lastTradePartyRole,
        NahmiiTypesLib.CurrencyRole lastCurrencyRole
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
        NahmiiTypesLib.Trade firstTrade,
        NahmiiTypesLib.TradePartyRole firstTradePartyRole,
        NahmiiTypesLib.Trade lastTrade,
        NahmiiTypesLib.TradePartyRole lastTradePartyRole
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
        NahmiiTypesLib.Payment firstPayment,
        NahmiiTypesLib.PaymentPartyRole firstPaymentPartyRole,
        NahmiiTypesLib.Payment lastPayment,
        NahmiiTypesLib.PaymentPartyRole lastPaymentPartyRole
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
        NahmiiTypesLib.Payment firstPayment,
        NahmiiTypesLib.PaymentPartyRole firstPaymentPartyRole,
        NahmiiTypesLib.Payment lastPayment,
        NahmiiTypesLib.PaymentPartyRole lastPaymentPartyRole
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
        NahmiiTypesLib.Payment firstPayment,
        NahmiiTypesLib.Payment lastPayment
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
        NahmiiTypesLib.Trade trade,
        NahmiiTypesLib.TradePartyRole tradePartyRole,
        NahmiiTypesLib.Payment payment,
        NahmiiTypesLib.PaymentPartyRole paymentPartyRole
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
        NahmiiTypesLib.Trade trade,
        NahmiiTypesLib.TradePartyRole tradePartyRole,
        NahmiiTypesLib.CurrencyRole tradeCurrencyRole,
        NahmiiTypesLib.Payment payment,
        NahmiiTypesLib.PaymentPartyRole paymentPartyRole
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
        NahmiiTypesLib.Trade trade,
        NahmiiTypesLib.TradePartyRole tradePartyRole,
        NahmiiTypesLib.Payment payment
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
        NahmiiTypesLib.Payment payment,
        NahmiiTypesLib.PaymentPartyRole paymentPartyRole,
        NahmiiTypesLib.Trade trade,
        NahmiiTypesLib.TradePartyRole tradePartyRole
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
        NahmiiTypesLib.Payment payment,
        NahmiiTypesLib.PaymentPartyRole paymentPartyRole,
        NahmiiTypesLib.Trade trade,
        NahmiiTypesLib.TradePartyRole tradePartyRole,
        NahmiiTypesLib.CurrencyRole tradeCurrencyRole
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
        NahmiiTypesLib.Payment payment,
        NahmiiTypesLib.PaymentPartyRole paymentPartyRole,
        NahmiiTypesLib.Trade trade,
        NahmiiTypesLib.TradePartyRole tradePartyRole
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
        NahmiiTypesLib.Trade firstTrade,
        NahmiiTypesLib.Trade lastTrade,
        NahmiiTypesLib.TradePartyRole tradePartyRole
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
        NahmiiTypesLib.Signature signature,
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
