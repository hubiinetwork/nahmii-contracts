/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {NahmiiTypesLib} from "../NahmiiTypesLib.sol";

/**
@title MockedDriipSettlementDispute
@notice Mocked implementation of driip settlement dispute contract
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

    function challengeByOrder(NahmiiTypesLib.Order order, address challenger)
    public
    {
        _challengeByOrderCount++;
    }

    function unchallengeOrderCandidateByTrade(NahmiiTypesLib.Order order, NahmiiTypesLib.Trade trade, address challenger)
    public
    {
        _unchallengeOrderCandidateByTradeCount++;
    }

    function challengeByTrade(address wallet, NahmiiTypesLib.Trade trade, address challenger)
    public
    {
        _challengeByTradeCount++;
    }

    function challengeByPayment(NahmiiTypesLib.Payment payment, address challenger)
    public
    {
        _challengeByPaymentCount++;
    }
}