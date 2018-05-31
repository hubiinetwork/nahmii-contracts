/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

import "../contracts/ReserveFund.sol";
pragma experimental ABIEncoderV2;

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
        currencyAmountMap[outboundTx.tokenAddress] = outboundTx.amount;
    }

    function outboundTransferSupported(ReserveFund.TransferInfo outboundTx) public view returns (bool) {
        return currencyAmountMap[outboundTx.tokenAddress] >= outboundTx.amount;
    }
}