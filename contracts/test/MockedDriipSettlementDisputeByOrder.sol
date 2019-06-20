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
 * @title MockedDriipSettlementDisputeByOrder
 * @notice Mocked implementation of driip settlement dispute by order contract
 */
contract MockedDriipSettlementDisputeByOrder {
    uint256 public _challengeByOrderCount;

    function _reset()
    public
    {
        _challengeByOrderCount = 0;
    }

    function challengeByOrder(TradeTypesLib.Order memory, address)
    public
    {
        _challengeByOrderCount++;
    }
}