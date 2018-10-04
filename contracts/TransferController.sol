/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

/**
@title TransferController
@notice A base contract to handle transfers of different currency types
*/
contract TransferController {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event CurrencyTransferred(address from, address to, uint256 amount, address currencyCt, uint256 currencyId);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function isTyped() public view returns(bool);
    function isQuantifiable() public view returns(bool);

    /// @notice MUST be called with DELEGATECALL
    function receive(address from, address to, uint256 amount, address currencyCt, uint256 currencyId) public;

    /// @notice MUST be called with DELEGATECALL
    function approve(address to, uint256 amount, address currencyCt, uint256 currencyId) public;

    /// @notice MUST be called with DELEGATECALL
    function send(address from, address to, uint256 amount, address currencyCt, uint256 currencyId) public;

    //----------------------------------------

    function getApproveSignature() public pure returns (bytes4) {
        return bytes4(keccak256("approve(address,uint256,address,uint256)"));
    }

    function getSendSignature() public pure returns (bytes4) {
        return bytes4(keccak256("send(address,address,uint256,address,uint256)"));
    }

    function getReceiveSignature() public pure returns (bytes4) {
        return bytes4(keccak256("receive(address,address,uint256,address,uint256)"));
    }
}
