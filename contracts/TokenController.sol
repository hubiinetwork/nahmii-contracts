/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

/**
@title TokenController
@notice A base contract to handle different token types
*/
contract TokenController {
    event TokenTransferred(address from, address to, uint256 amount, address token, uint256 id);

    function isTyped() public view returns(bool);
    function isQuantifiable() public view returns(bool);

    function receive(address from, address to, uint256 amount, address token, uint256 id) public;
    function send(address to, uint256 amount, address token, uint256 id) public;
}
