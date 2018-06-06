/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
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
    function setMaxOutboundTransfer(ReserveFund.TransferInfo outboundTx) public {
        currencyAmountMap[outboundTx.currency] = outboundTx.amount;
    }

    function outboundTransferSupported(ReserveFund.TransferInfo outboundTx) public view returns (bool) {
        return currencyAmountMap[outboundTx.currency] >= outboundTx.amount;
    }
}