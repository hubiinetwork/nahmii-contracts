/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../contracts/ReserveFund.sol";

contract MockedReserveFund /*is ReserveFund*/ {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => int256) public currencyAmountMap;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*ReserveFund(owner)*/ {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function setMaxOutboundTransfer(address currency, int256 amount) public {
        currencyAmountMap[currency] = amount;
    }

    function outboundTransferSupported(address currency, int256 amount) public view returns (bool) {
        return currencyAmountMap[currency] >= amount;
    }
}