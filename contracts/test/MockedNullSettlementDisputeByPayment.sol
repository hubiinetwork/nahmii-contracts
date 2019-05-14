/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {PaymentTypesLib} from "../PaymentTypesLib.sol";

/**
 * @title MockedNullSettlementDisputeByPayment
 * @notice Mocked implementation of null settlement dispute by payment contract
 */
contract MockedNullSettlementDisputeByPayment {
    uint256 public _challengeByPaymentCount;

    function _reset()
    public
    {
        _challengeByPaymentCount = 0;
    }

    function challengeByPayment(address, PaymentTypesLib.Payment memory, address)
    public
    {
        _challengeByPaymentCount++;
    }
}