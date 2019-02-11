/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {PaymentTypesLib} from "../PaymentTypesLib.sol";
import {TradeTypesLib} from "../TradeTypesLib.sol";

/**
 * @title MockedNullSettlementDispute
 * @notice Mocked implementation of null settlement dispute contract
 */
contract MockedNullSettlementDispute {
    uint256 public _challengeByOrderCount;
    uint256 public _challengeByTradeCount;
    uint256 public _challengeByPaymentCount;

    function _reset()
    public
    {
        _challengeByOrderCount = 0;
        _challengeByTradeCount = 0;
        _challengeByPaymentCount = 0;
    }

    function challengeByOrder(TradeTypesLib.Order, address)
    public
    {
        _challengeByOrderCount++;
    }

    function challengeByTrade(address, TradeTypesLib.Trade, address)
    public
    {
        _challengeByTradeCount++;
    }

    function challengeByPayment(address, PaymentTypesLib.Payment, address)
    public
    {
        _challengeByPaymentCount++;
    }
}