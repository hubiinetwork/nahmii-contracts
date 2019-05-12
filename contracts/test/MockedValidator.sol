/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "../Ownable.sol";
import {SignerManageable} from "../SignerManageable.sol";
import {NahmiiTypesLib} from "../NahmiiTypesLib.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";
import {PaymentTypesLib} from "../PaymentTypesLib.sol";
import {TradeTypesLib} from "../TradeTypesLib.sol";

/**
 * @title MockedValidator
 * @notice Mocked implementation of validator contract
 */
contract MockedValidator is Ownable, SignerManageable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    bool orderWalletHash;
    bool orderWalletSeal;
    bool orderOperatorSeal;
    bool orderSeals;
    bool tradeBuyerFeeOfFungible;
    bool tradeSellerFeeOfFungible;
    bool tradeBuyerGenuine;
    bool tradeSellerGenuine;
    bool[] tradeSeals;
    bool tradeParty;
    bool tradeBuyer;
    bool tradeSeller;
    bool tradeOrder;
    bool tradeCurrency;
    bool tradeIntendedCurrency;
    bool tradeConjugateCurrency;
    bool tradeIntendedCurrencyNonFungible;
    bool tradeConjugateCurrencyNonFungible;
    bool paymentFeeOfFungible;
    bool paymentSenderGenuine;
    bool paymentRecipientGenuine;
    bool paymentWalletHash;
    bool paymentWalletSeal;
    bool paymentOperatorSeal;
    bool[] paymentSeals;
    bool paymentParty;
    bool paymentSender;
    bool paymentRecipient;
    bool paymentCurrency;
    bool paymentCurrencyNonFungible;
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
    function _reset()
    public
    {
        orderWalletHash = true;
        orderWalletSeal = true;
        orderOperatorSeal = true;
        orderSeals = true;
        tradeBuyerFeeOfFungible = true;
        tradeSellerFeeOfFungible = true;
        tradeBuyerGenuine = true;
        tradeSellerGenuine = true;
        tradeSeals.length = 0;
        tradeSeals.push(true);
        tradeParty = true;
        tradeBuyer = true;
        tradeSeller = true;
        tradeOrder = true;
        tradeCurrency = true;
        tradeIntendedCurrency = true;
        tradeConjugateCurrency = true;
        tradeIntendedCurrencyNonFungible = false;
        tradeConjugateCurrencyNonFungible = false;
        paymentFeeOfFungible = true;
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
        paymentCurrency = true;
        paymentCurrencyNonFungible = false;
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

    function setGenuineOrderWalletHash(bool genuine)
    public
    {
        orderWalletHash = genuine;
    }

    function isGenuineOrderWalletHash(TradeTypesLib.Order memory)
    public
    view
    returns (bool)
    {
        return orderWalletHash;
    }

    function setGenuineOrderWalletSeal(bool genuine)
    public
    {
        orderWalletSeal = genuine;
    }

    function isGenuineOrderWalletSeal(TradeTypesLib.Order memory)
    public
    view
    returns (bool)
    {
        return orderWalletSeal;
    }

    function setGenuineOrderOperatorSeal(bool genuine)
    public
    {
        orderOperatorSeal = genuine;
    }

    function isGenuineOrderOperatorSeal(TradeTypesLib.Order memory)
    public
    view
    returns (bool)
    {
        return orderOperatorSeal;
    }

    function setGenuineOrderSeals(bool genuine)
    public
    {
        orderSeals = genuine;
    }

    function isGenuineOrderSeals(TradeTypesLib.Order memory)
    public
    view
    returns (bool)
    {
        return orderSeals;
    }

    function setGenuineTradeBuyerFeeOfFungible(bool genuine)
    public
    {
        tradeBuyerFeeOfFungible = genuine;
    }

    function isGenuineTradeBuyerFeeOfFungible(TradeTypesLib.Trade memory)
    public
    view
    returns (bool)
    {
        return tradeBuyerFeeOfFungible;
    }

    function setGenuineTradeSellerFeeOfFungible(bool genuine)
    public
    {
        tradeSellerFeeOfFungible = genuine;
    }

    function isGenuineTradeSellerFeeOfFungible(TradeTypesLib.Trade memory)
    public
    view
    returns (bool)
    {
        return tradeSellerFeeOfFungible;
    }

    function setGenuineTradeBuyer(bool genuine)
    public
    {
        tradeBuyerGenuine = genuine;
    }

    function isGenuineTradeBuyerOfFungible(TradeTypesLib.Trade memory)
    public
    view
    returns (bool)
    {
        return tradeBuyerGenuine;
    }

    function setGenuineTradeSeller(bool genuine)
    public
    {
        tradeSellerGenuine = genuine;
    }

    function isGenuineTradeSellerOfFungible(TradeTypesLib.Trade memory)
    public
    view
    returns (bool)
    {
        return tradeSellerGenuine;
    }

    function setGenuineTradeSeal(bool genuine)
    public
    {
        tradeSeals.push(genuine);
    }

    // TODO Redo trade seal management to prevent the need for the following pattern
    // taken from DriipSettlementDisputeByTrade.js:
    //   await ethersValidator.isGenuineTradeSeal(trade, {gasLimit: 1e6});
    //   await ethersValidator.setGenuineTradeSeal(false);
    function isGenuineTradeSeal(TradeTypesLib.Trade memory)
    public
    view
    returns (bool)
    {
        if (tradeSeals.length == 1)
            return tradeSeals[0];
        else {
            require(tradeSealsIndex < tradeSeals.length);
            // TODO Update
            return tradeSeals[tradeSealsIndex/*++*/];
        }
    }

    function setTradeParty(bool _tradeParty)
    public
    {
        tradeParty = _tradeParty;
    }

    function isTradeParty(TradeTypesLib.Trade memory, address)
    public
    view
    returns (bool)
    {
        return tradeParty;
    }

    function setTradeBuyer(bool _tradeBuyer)
    public
    {
        tradeBuyer = _tradeBuyer;
    }

    function isTradeBuyer(TradeTypesLib.Trade memory, address)
    public
    view
    returns (bool)
    {
        return tradeBuyer;
    }

    function setTradeSeller(bool _tradeSeller)
    public
    {
        tradeSeller = _tradeSeller;
    }

    function isTradeSeller(TradeTypesLib.Trade memory, address)
    public
    view
    returns (bool)
    {
        return tradeSeller;
    }

    function setTradeOrder(bool _tradeOrder)
    public
    {
        tradeOrder = _tradeOrder;
    }

    function isTradeOrder(TradeTypesLib.Trade memory, TradeTypesLib.Order memory)
    public
    view
    returns (bool)
    {
        return tradeOrder;
    }

    function isTradeCurrency(TradeTypesLib.Trade memory, MonetaryTypesLib.Currency memory)
    public
    view
    returns (bool)
    {
        return tradeCurrency;
    }

    function setTradeCurrency(bool _tradeCurrency)
    public
    {
        tradeCurrency = _tradeCurrency;
    }

    function isTradeIntendedCurrency(TradeTypesLib.Trade memory, MonetaryTypesLib.Currency memory)
    public
    view
    returns (bool)
    {
        return tradeIntendedCurrency;
    }

    function setTradeIntendedCurrency(bool _tradeIntendedCurrency)
    public
    {
        tradeIntendedCurrency = _tradeIntendedCurrency;
    }

    function isTradeConjugateCurrency(TradeTypesLib.Trade memory, MonetaryTypesLib.Currency memory)
    public
    view
    returns (bool)
    {
        return tradeConjugateCurrency;
    }

    function setTradeConjugateCurrency(bool _tradeConjugateCurrency)
    public
    {
        tradeConjugateCurrency = _tradeConjugateCurrency;
    }

    function isTradeIntendedCurrencyNonFungible(TradeTypesLib.Trade memory)
    public
    view
    returns (bool)
    {
        return tradeIntendedCurrencyNonFungible;
    }

    function setTradeIntendedCurrencyNonFungible(bool nonFungible)
    public
    {
        tradeIntendedCurrencyNonFungible = nonFungible;
    }

    function isTradeConjugateCurrencyNonFungible(TradeTypesLib.Trade memory)
    public
    view
    returns (bool)
    {
        return tradeConjugateCurrencyNonFungible;
    }

    function setTradeConjugateCurrencyNonFungible(bool nonFungible)
    public
    {
        tradeConjugateCurrencyNonFungible = nonFungible;
    }

    function setGenuinePaymentFeeOfFungible(bool genuine)
    public
    {
        paymentFeeOfFungible = genuine;
    }

    function isGenuinePaymentFeeOfFungible(PaymentTypesLib.Payment memory)
    public
    view
    returns (bool)
    {
        return paymentFeeOfFungible;
    }

    function setGenuinePaymentSender(bool genuine)
    public
    {
        paymentSenderGenuine = genuine;
    }

    function isGenuinePaymentSenderOfFungible(PaymentTypesLib.Payment memory)
    public
    view
    returns (bool)
    {
        return paymentSenderGenuine;
    }

    function setGenuinePaymentRecipient(bool genuine)
    public
    {
        paymentRecipientGenuine = genuine;
    }

    function isGenuinePaymentRecipientOfFungible(PaymentTypesLib.Payment memory)
    public
    view
    returns (bool)
    {
        return paymentRecipientGenuine;
    }

    function setGenuinePaymentWalletHash(bool genuine)
    public
    {
        paymentWalletHash = genuine;
    }

    function isGenuinePaymentWalletHash(PaymentTypesLib.Payment memory)
    public
    view
    returns (bool)
    {
        return paymentWalletHash;
    }

    function setGenuinePaymentWalletSeal(bool genuine)
    public
    {
        paymentWalletSeal = genuine;
    }

    function isGenuinePaymentWalletSeal(PaymentTypesLib.Payment memory)
    public
    view
    returns (bool)
    {
        return paymentWalletSeal;
    }

    function setGenuinePaymentOperatorSeal(bool genuine)
    public
    {
        paymentOperatorSeal = genuine;
    }

    function isGenuinePaymentOperatorSeal(PaymentTypesLib.Payment memory)
    public
    view
    returns (bool)
    {
        return paymentOperatorSeal;
    }

    function setGenuinePaymentSeals(bool genuine)
    public
    {
        paymentSeals.push(genuine);
    }

    function isGenuinePaymentSeals(PaymentTypesLib.Payment memory)
    public
    view
    returns (bool)
    {
        if (paymentSeals.length == 1)
            return paymentSeals[0];
        else {
            require(paymentSealsIndex < paymentSeals.length);
            // TODO Update
            return paymentSeals[paymentSealsIndex/*++*/];
        }
    }

    function setPaymentParty(bool _paymentParty)
    public
    {
        paymentParty = _paymentParty;
    }

    function isPaymentParty(PaymentTypesLib.Payment memory, address)
    public
    view
    returns (bool)
    {
        return paymentParty;
    }

    function setPaymentSender(bool _paymentSender)
    public
    {
        paymentSender = _paymentSender;
    }

    function isPaymentSender(PaymentTypesLib.Payment memory, address)
    public
    view
    returns (bool)
    {
        return paymentSender;
    }

    function setPaymentRecipient(bool _paymentRecipient)
    public
    {
        paymentRecipient = _paymentRecipient;
    }

    function isPaymentRecipient(PaymentTypesLib.Payment memory, address)
    public
    view
    returns (bool)
    {
        return paymentRecipient;
    }

    function isPaymentCurrency(PaymentTypesLib.Payment memory, MonetaryTypesLib.Currency memory)
    public
    view
    returns (bool)
    {
        return paymentCurrency;
    }

    function setPaymentCurrency(bool _paymentCurrency)
    public
    {
        paymentCurrency = _paymentCurrency;
    }

    function isPaymentCurrencyNonFungible(PaymentTypesLib.Payment memory)
    public
    view
    returns (bool)
    {
        return paymentCurrencyNonFungible;
    }

    function setPaymentCurrencyNonFungible(bool nonFungible)
    public
    {
        paymentCurrencyNonFungible = nonFungible;
    }

    function setSuccessiveTradesPartyNonces(bool genuine)
    public
    {
        successiveTradesPartyNonces = genuine;
    }

    function isSuccessiveTradesPartyNonces(
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole,
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole
    )
    public
    view
    returns (bool)
    {
        return successiveTradesPartyNonces;
    }

    function setGenuineSuccessiveTradesBalances(bool genuine)
    public
    {
        successiveTradesBalances = genuine;
    }

    function isGenuineSuccessiveTradesBalances(
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole,
        TradeTypesLib.CurrencyRole,
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole,
        TradeTypesLib.CurrencyRole,
        int256
    )
    public
    view
    returns (bool)
    {
        return successiveTradesBalances;
    }

    function setGenuineSuccessiveTradesTotalFees(bool genuine)
    public
    {
        successiveTradesTotalFees = genuine;
    }

    function isGenuineSuccessiveTradesTotalFees(
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole,
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole
    )
    public
    view
    returns (bool)
    {
        return successiveTradesTotalFees;
    }

    function setSuccessivePaymentsPartyNonces(bool genuine)
    public
    {
        successivePaymentsPartyNonces = genuine;
    }

    function isSuccessivePaymentsPartyNonces(
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole,
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole
    )
    public
    view
    returns (bool)
    {
        return successivePaymentsPartyNonces;
    }

    function setGenuineSuccessivePaymentsBalances(bool genuine)
    public
    {
        successivePaymentsBalances = genuine;
    }

    function isGenuineSuccessivePaymentsBalances(
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole,
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole,
        int256
    )
    public
    view
    returns (bool)
    {
        return successivePaymentsBalances;
    }

    function setGenuineSuccessivePaymentsTotalFees(bool genuine)
    public
    {
        successivePaymentsTotalFees = genuine;
    }

    function isGenuineSuccessivePaymentsTotalFees(
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.Payment memory
    )
    public
    view
    returns (bool)
    {
        return successivePaymentsTotalFees;
    }

    function setSuccessiveTradePaymentPartyNonces(bool genuine)
    public
    {
        successiveTradePaymentPartyNonces = genuine;
    }

    function isSuccessiveTradePaymentPartyNonces(
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole,
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole
    )
    public
    view
    returns (bool)
    {
        return successiveTradePaymentPartyNonces;
    }

    function setGenuineSuccessiveTradePaymentBalances(bool genuine)
    public
    {
        successiveTradePaymentBalances = genuine;
    }

    function isGenuineSuccessiveTradePaymentBalances(
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole,
        TradeTypesLib.CurrencyRole,
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole,
        int256
    )
    public
    view
    returns (bool)
    {
        return successiveTradePaymentBalances;
    }

    function setGenuineSuccessiveTradePaymentTotalFees(bool genuine)
    public
    {
        successiveTradePaymentTotalFees = genuine;
    }

    function isGenuineSuccessiveTradePaymentTotalFees(
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole,
        PaymentTypesLib.Payment memory
    )
    public
    view
    returns (bool)
    {
        return successiveTradePaymentTotalFees;
    }

    function setSuccessivePaymentTradePartyNonces(bool genuine)
    public
    {
        successivePaymentTradePartyNonces = genuine;
    }

    function isSuccessivePaymentTradePartyNonces(
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole,
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole
    )
    public
    view
    returns (bool)
    {
        return successivePaymentTradePartyNonces;
    }

    function setGenuineSuccessivePaymentTradeBalances(bool genuine)
    public
    {
        successivePaymentTradeBalances = genuine;
    }

    function isGenuineSuccessivePaymentTradeBalances(
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole,
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole,
        TradeTypesLib.CurrencyRole,
        int256
    )
    public
    view
    returns (bool)
    {
        return successivePaymentTradeBalances;
    }

    function setGenuineSuccessivePaymentTradeTotalFees(bool genuine)
    public
    {
        successivePaymentTradeTotalFees = genuine;
    }

    function isGenuineSuccessivePaymentTradeTotalFees(
        PaymentTypesLib.Payment memory,
        PaymentTypesLib.PaymentPartyRole,
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole
    )
    public
    view
    returns (bool)
    {
        return successivePaymentTradeTotalFees;
    }

    function setGenuineSuccessiveTradeOrderResiduals(bool genuine)
    public
    {
        successiveTradeOrderResiduals = genuine;
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        TradeTypesLib.Trade memory,
        TradeTypesLib.Trade memory,
        TradeTypesLib.TradePartyRole
    )
    public
    view
    returns (bool)
    {
        return successiveTradeOrderResiduals;
    }

    function setGenuineWalletSignature(bool genuine)
    public
    {
        walletSignature = genuine;
    }

    function isGenuineWalletSignature(
        bytes32,
        NahmiiTypesLib.Signature memory,
        address
    )
    public
    view
    returns (bool)
    {
        return walletSignature;
    }
}
