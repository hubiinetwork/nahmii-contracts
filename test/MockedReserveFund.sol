/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

//import "../contracts/ReserveFund.sol";

contract MockedReserveFund /*is ReserveFund*/ {

    struct TransferInfo {
        address tokenAddress; // 0 for ethers.
        int256 amount;
    }

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
    // TODO Update to using TransferInfo parameter
    function setMaxOutboundTransfer(address currency, int256 amount) public {
        currencyAmountMap[currency] = amount;
    }

    // TODO Update to using TransferInfo parameter
    function outboundTransferSupported(address currency, int256 amount) public view returns (bool) {
        return currencyAmountMap[currency] >= amount;
    }
}