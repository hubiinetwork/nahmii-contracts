/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

//import {Ownable} from "../Ownable.sol";
//import {Configurable} from "../Configurable.sol";
//import {Validatable} from "../Validatable.sol";
//import {FraudChallengable} from "../FraudChallengable.sol";
//import {CancelOrdersChallengable} from "../CancelOrdersChallengable.sol";
//import {SafeMathIntLib} from "../SafeMathIntLib.sol";
//import {SafeMathUintLib} from "../SafeMathUintLib.sol";
//import {MonetaryTypes} from "../MonetaryTypes.sol";
import {NahmiiTypes} from "../NahmiiTypes.sol";
//import {SettlementTypes} from "../SettlementTypes.sol";
//import {CancelOrdersChallenge} from "../CancelOrdersChallenge.sol";
//import {NullSettlementChallenge} from "../NullSettlementChallenge.sol";

/**
@title MockedNullSettlementDispute
@notice Mocked implementation of null settlement dispute contract
*/
contract MockedNullSettlementDispute {

    uint256 public challengeByOrderCount;
    uint256 public challengeByTradeCount;
    uint256 public challengeByPaymentCount;

    function reset()
    public
    {
        challengeByOrderCount = 0;
        challengeByTradeCount = 0;
        challengeByPaymentCount = 0;
    }

    function challengeByOrder(NahmiiTypes.Order order, address challenger)
    public
    {
        challengeByOrderCount++;
    }

    function challengeByTrade(NahmiiTypes.Trade trade, address wallet, address challenger)
    public
    {
        challengeByTradeCount++;
    }

    function challengeByPayment(NahmiiTypes.Payment payment, address wallet, address challenger)
    public
    {
        challengeByPaymentCount++;
    }
}