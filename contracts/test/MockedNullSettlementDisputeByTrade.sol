/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {TradeTypesLib} from "../TradeTypesLib.sol";

/**
 * @title MockedNullSettlementDisputeByTrade
 * @notice Mocked implementation of null settlement dispute by trade contract
 */
contract MockedNullSettlementDisputeByTrade {
    uint256 public _challengeByTradeCount;

    function _reset()
    public
    {
        _challengeByTradeCount = 0;
    }

    function challengeByTrade(address, TradeTypesLib.Trade memory, address)
    public
    {
        _challengeByTradeCount++;
    }
}