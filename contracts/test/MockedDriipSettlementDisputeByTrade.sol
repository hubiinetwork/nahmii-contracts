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
 * @title MockedDriipSettlementDisputeByTrade
 * @notice Mocked implementation of driip settlement dispute by trade contract
 */
contract MockedDriipSettlementDisputeByTrade {
    uint256 public _challengeByOrderCount;
    uint256 public _unchallengeOrderCandidateByTradeCount;
    uint256 public _challengeByTradeCount;

    function _reset()
    public
    {
        _challengeByOrderCount = 0;
        _unchallengeOrderCandidateByTradeCount = 0;
        _challengeByTradeCount = 0;
    }

    function challengeByOrder(TradeTypesLib.Order memory, address)
    public
    {
        _challengeByOrderCount++;
    }

    function unchallengeOrderCandidateByTrade(TradeTypesLib.Order memory, TradeTypesLib.Trade memory,
        address)
    public
    {
        _unchallengeOrderCandidateByTradeCount++;
    }

    function challengeByTrade(address, TradeTypesLib.Trade memory, address)
    public
    {
        _challengeByTradeCount++;
    }
}