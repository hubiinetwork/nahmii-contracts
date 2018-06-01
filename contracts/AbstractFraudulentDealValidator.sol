/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Types.sol";
import "./Configuration.sol";
import "./AbstractHasher.sol";

contract AbstractFraudulentDealValidator {

    function isGenuineTradeMakerFee(Types.Trade trade) public view returns (bool);

    function isGenuineTradeTakerFee(Types.Trade trade) public view returns (bool);

    function isGenuineByTradeBuyer(Types.Trade trade, address owner) public view returns (bool);

    function isGenuineByTradeSeller(Types.Trade trade, address owner) public view returns (bool);

    function isGenuineTradeSeal(Types.Trade trade, address owner) public view returns (bool);

    function isGenuinePaymentSeals(Types.Payment payment, address owner) public view returns (bool);

    function isGenuinePaymentFee(Types.Payment payment) public view returns (bool);

    function isGenuineByPaymentSender(Types.Payment payment) public pure returns (bool);

    function isGenuineByPaymentRecipient(Types.Payment payment) public pure returns (bool);

    function isSuccessiveTradesPartyNonces(Types.Trade firstTrade, Types.TradePartyRole firstTradePartyRole, Types.Trade lastTrade, Types.TradePartyRole lastTradePartyRole) public pure returns (bool);

    function isSuccessivePaymentsPartyNonces(Types.Payment firstPayment, Types.PaymentPartyRole firstPaymentPartyRole, Types.Payment lastPayment, Types.PaymentPartyRole lastPaymentPartyRole) public pure returns (bool);

    function isSuccessiveTradePaymentPartyNonces(Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.Payment payment, Types.PaymentPartyRole paymentPartyRole) public pure returns (bool);

    function isSuccessivePaymentTradePartyNonces(Types.Payment payment, Types.PaymentPartyRole paymentPartyRole, Types.Trade trade, Types.TradePartyRole tradePartyRole) public pure returns (bool);

    function isGenuineSuccessiveTradesBalances(Types.Trade firstTrade, Types.TradePartyRole firstTradePartyRole, Types.CurrencyRole firstCurrencyRole, Types.Trade lastTrade, Types.TradePartyRole lastTradePartyRole, Types.CurrencyRole lastCurrencyRole) public pure returns (bool);

    function isGenuineSuccessivePaymentsBalances(Types.Payment firstPayment, Types.PaymentPartyRole firstPaymentPartyRole, Types.Payment lastPayment, Types.PaymentPartyRole lastPaymentPartyRole) public pure returns (bool);

    function isGenuineSuccessiveTradePaymentBalances(Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.CurrencyRole currencyRole, Types.Payment payment, Types.PaymentPartyRole paymentPartyRole) public pure returns (bool);

    function isGenuineSuccessivePaymentTradeBalances(Types.Payment payment, Types.PaymentPartyRole paymentPartyRole, Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.CurrencyRole currencyRole) public pure returns (bool);

    function isGenuineSuccessiveTradesNetFees(Types.Trade firstTrade, Types.TradePartyRole firstTradePartyRole, Types.CurrencyRole firstCurrencyRole, Types.Trade lastTrade, Types.TradePartyRole lastTradePartyRole, Types.CurrencyRole lastCurrencyRole) public pure returns (bool);

    function isGenuineSuccessiveTradeOrderResiduals(Types.Trade firstTrade, Types.Trade lastTrade, Types.TradePartyRole tradePartyRole) public pure returns (bool);

    function isGenuineSuccessivePaymentsNetFees(Types.Payment firstPayment, Types.PaymentPartyRole firstPaymentPartyRole, Types.Payment lastPayment, Types.PaymentPartyRole lastPaymentPartyRole) public pure returns (bool);

    function isGenuineSuccessiveTradePaymentNetFees(Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.CurrencyRole currencyRole, Types.Payment payment, Types.PaymentPartyRole paymentPartyRole) public pure returns (bool);

    function isGenuineSuccessivePaymentTradeNetFees(Types.Payment payment, Types.PaymentPartyRole paymentPartyRole, Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.CurrencyRole currencyRole) public pure returns (bool);
}