/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {NahmiiTypes} from "../NahmiiTypes.sol";

/**
@title MockedNullSettlementDispute
@notice Mocked implementation of null settlement dispute contract
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

    function challengeByOrder(NahmiiTypes.Order order, address challenger)
    public
    {
        _challengeByOrderCount++;
    }

    function challengeByTrade(NahmiiTypes.Trade trade, address wallet, address challenger)
    public
    {
        _challengeByTradeCount++;
    }

    function challengeByPayment(NahmiiTypes.Payment payment, address wallet, address challenger)
    public
    {
        _challengeByPaymentCount++;
    }
}