/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

contract Beneficiary {
    function storeEthers(address wallet) public payable;

    //NOTE: 'wallet' must call ERC20.approve first
    function storeTokens(address wallet, int256 amount, address token) public;
}
