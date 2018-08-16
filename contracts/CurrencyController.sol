/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

/**
@title CurrencyController
@notice A base contract to handle different currency types
*/
contract CurrencyController {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    bytes4 public constant approve_signature = bytes4(keccak256("approve(address,uint256,address,uint256)"));
    bytes4 public constant send_signature = bytes4(keccak256("send(address,uint256,address,uint256)"));

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event CurrencyTransferred(address from, address to, uint256 amount, address currency, uint256 currencyId);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function isTyped() public view returns(bool);
    function isQuantifiable() public view returns(bool);

    function receive(address from, address to, uint256 amount, address currency, uint256 currencyId) public;

    /// @notice MUST be called with DELEGATECALL
    function approve(address to, uint256 amount, address currency, uint256 currencyId) public;

    /// @notice MUST be called with DELEGATECALL
    function send(address to, uint256 amount, address currency, uint256 currencyId) public;
}
