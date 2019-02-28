/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {TradeTypesLib} from "../TradeTypesLib.sol";

/**
 * @title MockedNullSettlementDisputeByTrade
 * @notice Mocked implementation of null settlement dispute by trade contract
 */
contract MockedNullSettlementDisputeByTrade {
    uint256 public _challengeByOrderCount;
    uint256 public _challengeByTradeCount;

    function _reset()
    public
    {
        _challengeByOrderCount = 0;
        _challengeByTradeCount = 0;
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
}