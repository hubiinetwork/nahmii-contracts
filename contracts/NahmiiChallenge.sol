/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Challenge} from "./Challenge.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title NahmiiChallenge
@notice A challenge with internal functions for pushing trade and payment
from memory to storage. Pushing driips without these functions is not straight
forwards as they contain dynamically sized arrays.
*/

contract NahmiiChallenge is Challenge {

    function pushMemoryTradeToStorageArray(NahmiiTypes.Trade memTrade,
        NahmiiTypes.Trade[] storage stgTradeArr)
    internal
    {
        stgTradeArr.length += 1;
        NahmiiTypes.Trade storage stgTrade = stgTradeArr[stgTradeArr.length - 1];

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

    function pushMemoryPaymentToStorageArray(NahmiiTypes.Payment memPayment,
        NahmiiTypes.Payment[] storage stgPaymentArr)
    internal
    {
        stgPaymentArr.length += 1;
        NahmiiTypes.Payment storage stgPayment = stgPaymentArr[stgPaymentArr.length - 1];

        stgPayment.nonce = memPayment.nonce;
        stgPayment.amount = memPayment.amount;
        stgPayment.currency = memPayment.currency;
        copyPaymentSenderParty(stgPayment.sender, memPayment.sender);
        copyPaymentRecipientParty(stgPayment.recipient, memPayment.recipient);
        stgPayment.transfers = memPayment.transfers;
        stgPayment.seals = memPayment.seals;
        stgPayment.blockNumber = memPayment.blockNumber;
    }

    function copyTradeParty(NahmiiTypes.TradeParty storage stgTradeParty, NahmiiTypes.TradeParty memTradeParty)
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

    function copyPaymentSenderParty(NahmiiTypes.PaymentSenderParty storage stgPaymentParty,
        NahmiiTypes.PaymentSenderParty memPaymentParty)
    private
    {
        stgPaymentParty.nonce = memPaymentParty.nonce;
        stgPaymentParty.wallet = memPaymentParty.wallet;
        stgPaymentParty.balances = memPaymentParty.balances;
        copySingleFigureTotalFigures(stgPaymentParty.fees, memPaymentParty.fees);
    }

    function copyPaymentRecipientParty(NahmiiTypes.PaymentRecipientParty storage stgPaymentParty,
        NahmiiTypes.PaymentRecipientParty memPaymentParty)
    private
    {
        stgPaymentParty.nonce = memPaymentParty.nonce;
        stgPaymentParty.wallet = memPaymentParty.wallet;
        stgPaymentParty.balances = memPaymentParty.balances;
        copyFigureArray(stgPaymentParty.fees.total, memPaymentParty.fees.total);
    }

    function copySingleFigureTotalFigures(NahmiiTypes.SingleFigureTotalFigures storage stgSingleFigureTotalFigures,
        NahmiiTypes.SingleFigureTotalFigures memSingleFigureTotalFigures)
    private
    {
        stgSingleFigureTotalFigures.single = memSingleFigureTotalFigures.single;
        copyFigureArray(stgSingleFigureTotalFigures.total, memSingleFigureTotalFigures.total);
    }

    function copyFigureArray(MonetaryTypes.Figure[] storage stgFigureArr, MonetaryTypes.Figure[] memFigureArr)
    private
    {
        for (uint256 i = 0; i < memFigureArr.length; i++)
            stgFigureArr.push(memFigureArr[i]);
    }
}