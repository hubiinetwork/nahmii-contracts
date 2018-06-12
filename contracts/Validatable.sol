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
import {Modifyable} from "./Modifyable.sol";
import {Types} from "./Types.sol";

interface Validator {
    function isGenuineTradeMakerFee(Types.Trade trade) external view returns (bool);

    function isGenuineTradeTakerFee(Types.Trade trade) external view returns (bool);

    function isGenuineByTradeBuyer(Types.Trade trade, address exchange) external view returns (bool);

    function isGenuineByTradeSeller(Types.Trade trade, address exchange) external view returns (bool);

    function isGenuineByPaymentSender(Types.Payment payment) external pure returns (bool);

    function isGenuineByPaymentRecipient(Types.Payment payment) external pure returns (bool);

    function isSuccessiveTradesPartyNonces(Types.Trade firstTrade, Types.TradePartyRole firstTradePartyRole, Types.Trade lastTrade, Types.TradePartyRole lastTradePartyRole) external pure returns (bool);

    function isGenuineSuccessiveTradesBalances(Types.Trade firstTrade, Types.TradePartyRole firstTradePartyRole, Types.CurrencyRole firstCurrencyRole, Types.Trade lastTrade, Types.TradePartyRole lastTradePartyRole, Types.CurrencyRole lastCurrencyRole) external pure returns (bool);

    function isGenuineSuccessiveTradesNetFees(Types.Trade firstTrade, Types.TradePartyRole firstTradePartyRole, Types.CurrencyRole firstCurrencyRole, Types.Trade lastTrade, Types.TradePartyRole lastTradePartyRole, Types.CurrencyRole lastCurrencyRole) external pure returns (bool);

    function isSuccessivePaymentsPartyNonces(Types.Payment firstPayment, Types.PaymentPartyRole firstPaymentPartyRole, Types.Payment lastPayment, Types.PaymentPartyRole lastPaymentPartyRole) external pure returns (bool);

    function isGenuineSuccessivePaymentsBalances(Types.Payment firstPayment, Types.PaymentPartyRole firstPaymentPartyRole, Types.Payment lastPayment, Types.PaymentPartyRole lastPaymentPartyRole) external pure returns (bool);

    function isGenuineSuccessivePaymentsNetFees(Types.Payment firstPayment, Types.PaymentPartyRole firstPaymentPartyRole, Types.Payment lastPayment, Types.PaymentPartyRole lastPaymentPartyRole) external pure returns (bool);

    function isSuccessiveTradePaymentPartyNonces(Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.Payment payment, Types.PaymentPartyRole paymentPartyRole) external pure returns (bool);

    function isGenuineSuccessiveTradePaymentBalances(Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.CurrencyRole currencyRole, Types.Payment payment, Types.PaymentPartyRole paymentPartyRole) external pure returns (bool);

    function isGenuineSuccessiveTradePaymentNetFees(Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.CurrencyRole currencyRole, Types.Payment payment, Types.PaymentPartyRole paymentPartyRole) external pure returns (bool);

    function isSuccessivePaymentTradePartyNonces(Types.Payment payment, Types.PaymentPartyRole paymentPartyRole, Types.Trade trade, Types.TradePartyRole tradePartyRole) external pure returns (bool);

    function isGenuineSuccessivePaymentTradeBalances(Types.Payment payment, Types.PaymentPartyRole paymentPartyRole, Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.CurrencyRole currencyRole) external pure returns (bool);

    function isGenuineSuccessivePaymentTradeNetFees(Types.Payment payment, Types.PaymentPartyRole paymentPartyRole, Types.Trade trade, Types.TradePartyRole tradePartyRole, Types.CurrencyRole currencyRole) external pure returns (bool);

    function isGenuineSuccessiveTradeOrderResiduals(Types.Trade firstTrade, Types.Trade lastTrade, Types.TradePartyRole tradePartyRole) external pure returns (bool);

    function isGenuineOrderExchangeSeal(Types.Order order, address exchange) external view returns (bool);

    function isGenuineTradeSeal(Types.Trade trade, address exchange) external view returns (bool);

    function isGenuinePaymentExchangeSeal(Types.Payment payment, address exchange) external view returns (bool);

    function isGenuinePaymentSeals(Types.Payment payment, address exchange) external view returns (bool);

    function isGenuinePaymentFee(Types.Payment payment) external view returns (bool);
}

contract Validatable is Ownable, Modifyable {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Validator public validator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeValidatorEvent(Validator oldValidator, Validator newValidator);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the validator contract
    /// @param newValidator The (address of) Validator contract instance
    function changeValidator(Validator newValidator)
    public
    onlyOwner
    notNullAddress(newValidator)
    notEqualAddresses(newValidator, validator)
    {
        Validator oldValidator = validator;
        validator = newValidator;
        emit ChangeValidatorEvent(oldValidator, validator);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier validatorInitialized() {
        require(validator != address(0));
        _;
    }

    modifier onlyExchangeSealedOrder(Types.Order order) {
        require(validator.isGenuineOrderExchangeSeal(order, owner));
        _;
    }

    modifier onlySealedTrade(Types.Trade trade) {
        require(validator.isGenuineTradeSeal(trade, owner));
        _;
    }

    modifier onlyExchangeSealedPayment(Types.Payment payment) {
        require(validator.isGenuinePaymentExchangeSeal(payment, owner));
        _;
    }

    modifier onlySealedPayment(Types.Payment payment) {
        require(validator.isGenuinePaymentSeals(payment, owner));
        _;
    }
}
