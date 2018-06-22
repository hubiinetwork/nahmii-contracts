/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

//import {ReserveFund} from "../ReserveFund.sol";

/**
@title Mocked reserve fund
@notice Mocked implementation of reserve fund contract
*/
contract MockedReserveFund /*is ReserveFund*/ {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Transfer {
        address wallet;
        address currency;
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => int256) public currencyAmountMap;
    Transfer[] public transfers;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event TwoWayTransferEvent(address wallet, address currency, int256 amount);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*ReserveFund(owner)*/ {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        transfers.length = 0;
    }

    function setMaxOutboundTransfer(address currency, int256 amount) public {
        currencyAmountMap[currency] = amount;
    }

    function outboundTransferSupported(address currency, int256 amount) public view returns (bool) {
        return currencyAmountMap[currency] >= amount;
    }

    function twoWayTransfer(address wallet, address currency, int256 amount) public {
        transfers.push(Transfer(wallet, currency, amount));
        emit TwoWayTransferEvent(wallet, currency, amount);
    }
}