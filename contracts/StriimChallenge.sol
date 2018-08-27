/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Challenge} from "./Challenge.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {StriimTypes} from "./StriimTypes.sol";

contract StriimChallenge is Challenge {

    function pushMemoryTradeToStorageArray(StriimTypes.Trade memTrade,
        StriimTypes.Trade[] storage stgTradeArr)
    internal
    {
        //        StriimTypes.Trade storage stgTrade;
        //        stgTradeArr.push(stgTrade);
        stgTradeArr.length = stgTradeArr.length + 1;
        StriimTypes.Trade storage stgTrade = stgTradeArr[stgTradeArr.length];

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

    function pushMemoryPaymentToStorageArray(StriimTypes.Payment memPayment,
        StriimTypes.Payment[] storage stgPaymentArr)
    internal
    {
        //        StriimTypes.Payment storage stgPayment;
        //        stgPaymentArr.push(stgPayment);
        stgPaymentArr.length = stgPaymentArr.length + 1;
        StriimTypes.Payment storage stgPayment = stgPaymentArr[stgPaymentArr.length];

        stgPayment.nonce = memPayment.nonce;
        stgPayment.amount = memPayment.amount;
        stgPayment.currency = memPayment.currency;
        copyPaymentSenderParty(stgPayment.sender, memPayment.sender);
        copyPaymentRecipientParty(stgPayment.recipient, memPayment.recipient);
        stgPayment.transfers = memPayment.transfers;
        stgPayment.seals = memPayment.seals;
        stgPayment.blockNumber = memPayment.blockNumber;
    }

    function copyTradeParty(StriimTypes.TradeParty storage stgTradeParty, StriimTypes.TradeParty memTradeParty)
    private
    {
        stgTradeParty.nonce = memTradeParty.nonce;
        stgTradeParty.wallet = memTradeParty.wallet;
        stgTradeParty.rollingVolume = memTradeParty.rollingVolume;
        stgTradeParty.liquidityRole = memTradeParty.liquidityRole;
        stgTradeParty.order = memTradeParty.order;
        stgTradeParty.balances = memTradeParty.balances;
        copySingleFigureNetFigures(stgTradeParty.fees, memTradeParty.fees);
    }

    function copyPaymentSenderParty(StriimTypes.PaymentSenderParty storage stgPaymentParty,
        StriimTypes.PaymentSenderParty memPaymentParty)
    private
    {
        stgPaymentParty.nonce = memPaymentParty.nonce;
        stgPaymentParty.wallet = memPaymentParty.wallet;
        stgPaymentParty.balances = memPaymentParty.balances;
        copySingleFigureNetFigures(stgPaymentParty.fees, memPaymentParty.fees);
    }

    function copyPaymentRecipientParty(StriimTypes.PaymentRecipientParty storage stgPaymentParty,
        StriimTypes.PaymentRecipientParty memPaymentParty)
    private
    {
        stgPaymentParty.nonce = memPaymentParty.nonce;
        stgPaymentParty.wallet = memPaymentParty.wallet;
        stgPaymentParty.balances = memPaymentParty.balances;
        copyFigureArray(stgPaymentParty.fees.net, memPaymentParty.fees.net);
    }

    function copySingleFigureNetFigures(StriimTypes.SingleFigureNetFigures storage stgSingleFigureNetFigures,
        StriimTypes.SingleFigureNetFigures memSingleFigureNetFigures)
    private
    {
        stgSingleFigureNetFigures.single = memSingleFigureNetFigures.single;
        copyFigureArray(stgSingleFigureNetFigures.net, memSingleFigureNetFigures.net);
    }

    function copyFigureArray(MonetaryTypes.Figure[] storage stgFigureArr, MonetaryTypes.Figure[] memFigureArr)
    private
    {
        for (uint256 i = 0; i < memFigureArr.length; i++)
            stgFigureArr.push(memFigureArr[i]);
    }
}