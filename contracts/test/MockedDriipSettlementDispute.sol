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
 * @title MockedDriipSettlementDispute
 * @notice Mocked implementation of driip settlement dispute contract
 */
contract MockedDriipSettlementDispute {
    uint256 public _challengeByOrderCount;
    uint256 public _unchallengeOrderCandidateByTradeCount;
    uint256 public _challengeByTradeCount;
    uint256 public _challengeByPaymentCount;

    function _reset()
    public
    {
        _challengeByOrderCount = 0;
        _unchallengeOrderCandidateByTradeCount = 0;
        _challengeByTradeCount = 0;
        _challengeByPaymentCount = 0;
    }

    function challengeByOrder(TradeTypesLib.Order, address)
    public
    {
        _challengeByOrderCount++;
    }

    function unchallengeOrderCandidateByTrade(TradeTypesLib.Order, TradeTypesLib.Trade,
        address)
    public
    {
        _unchallengeOrderCandidateByTradeCount++;
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