/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import "../ERC20.sol";
//import "../RevenueFund.sol";

contract MockedRevenueFund /*is RevenueFund*/ {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address from, int256 amount, address token); //token==0 for ethers
    event RecordDepositTokensEvent(address from, int256 amount, address token);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*RevenueFund(owner)*/ {
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        emit DepositEvent(msg.sender, int256(msg.value), address(0));
    }

    //NOTE: msg.sender must call ERC20.approve first
    function depositTokens(address token, int256 amount) public {
        emit DepositEvent(msg.sender, amount, token);
    }

    function recordDepositTokens(ERC20 token, int256 amount) public {
        emit RecordDepositTokensEvent(msg.sender, amount, token);
    }
}
