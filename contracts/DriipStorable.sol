/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title DriipStorable
@notice A contract with internal functions for pushing trade and payment
from memory to storage. Pushing driips without these functions is not straight
forwards as they contain dynamically sized arrays.
*/

contract DriipStorable {

    function pushMemoryTradeToStorageArray(NahmiiTypesLib.Trade memTrade,
        NahmiiTypesLib.Trade[] storage stgTradeArr)
    internal
    {
        stgTradeArr.length += 1;
        NahmiiTypesLib.Trade storage stgTrade = stgTradeArr[stgTradeArr.length - 1];

        stgTrade.nonce = memTrade.nonce;
        stgTrade.amount = memTrade.amount;
        stgTrade.currencies = memTrade.currencies;
        stgTrade.rate = memTrade.rate;
        copyTradeParty(stgTrade.buyer, memTrade.buyer);
        copyTradeParty(stgTrade.seller, memTrade.seller);
        stgTrade.transfers = memTrade.transfers;
        stgTrade.seal = memTrade.seal;
        stgTrade.blockNumber = memTrade.blockNumber;
    }

    function pushMemoryPaymentToStorageArray(NahmiiTypesLib.Payment memPayment,
        NahmiiTypesLib.Payment[] storage stgPaymentArr)
    internal
    {
        stgPaymentArr.length += 1;
        NahmiiTypesLib.Payment storage stgPayment = stgPaymentArr[stgPaymentArr.length - 1];

        stgPayment.nonce = memPayment.nonce;
        stgPayment.amount = memPayment.amount;
        stgPayment.currency = memPayment.currency;
        copyPaymentSenderParty(stgPayment.sender, memPayment.sender);
        copyPaymentRecipientParty(stgPayment.recipient, memPayment.recipient);
        stgPayment.transfers = memPayment.transfers;
        stgPayment.seals = memPayment.seals;
        stgPayment.blockNumber = memPayment.blockNumber;
    }

    function copyTradeParty(NahmiiTypesLib.TradeParty storage stgTradeParty, NahmiiTypesLib.TradeParty memTradeParty)
    private
    {
        stgTradeParty.nonce = memTradeParty.nonce;
        stgTradeParty.wallet = memTradeParty.wallet;
        stgTradeParty.rollingVolume = memTradeParty.rollingVolume;
        stgTradeParty.liquidityRole = memTradeParty.liquidityRole;
        stgTradeParty.order = memTradeParty.order;
        stgTradeParty.balances = memTradeParty.balances;
        copySingleFigureTotalFigures(stgTradeParty.fees, memTradeParty.fees);
    }

    function copyPaymentSenderParty(NahmiiTypesLib.PaymentSenderParty storage stgPaymentParty,
        NahmiiTypesLib.PaymentSenderParty memPaymentParty)
    private
    {
        stgPaymentParty.nonce = memPaymentParty.nonce;
        stgPaymentParty.wallet = memPaymentParty.wallet;
        stgPaymentParty.balances = memPaymentParty.balances;
        copySingleFigureTotalFigures(stgPaymentParty.fees, memPaymentParty.fees);
    }

    function copyPaymentRecipientParty(NahmiiTypesLib.PaymentRecipientParty storage stgPaymentParty,
        NahmiiTypesLib.PaymentRecipientParty memPaymentParty)
    private
    {
        stgPaymentParty.nonce = memPaymentParty.nonce;
        stgPaymentParty.wallet = memPaymentParty.wallet;
        stgPaymentParty.balances = memPaymentParty.balances;
        copyFigureArray(stgPaymentParty.fees.total, memPaymentParty.fees.total);
    }

    function copySingleFigureTotalFigures(NahmiiTypesLib.SingleFigureTotalFigures storage stgSingleFigureTotalFigures,
        NahmiiTypesLib.SingleFigureTotalFigures memSingleFigureTotalFigures)
    private
    {
        stgSingleFigureTotalFigures.single = memSingleFigureTotalFigures.single;
        copyFigureArray(stgSingleFigureTotalFigures.total, memSingleFigureTotalFigures.total);
    }

    function copyFigureArray(MonetaryTypesLib.Figure[] storage stgFigureArr, MonetaryTypesLib.Figure[] memFigureArr)
    private
    {
        for (uint256 i = 0; i < memFigureArr.length; i++)
            stgFigureArr.push(memFigureArr[i]);
    }
}