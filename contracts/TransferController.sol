/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
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
    // Constants (not used because of compiler issue)
    // -----------------------------------------------------------------------------------------------------------------
    //bytes4 public constant APPROVE_SIGNATURE = bytes4(keccak256("approve(address,uint256,address,uint256)"));
    //bytes4 public constant SEND_SIGNATURE = bytes4(keccak256("send(address,uint256,address,uint256)"));
    //bytes4 public constant RECEIVE_SIGNATURE = bytes4(keccak256("receive(address,address,uint256,address,uint256)"));

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

    /// @notice KEEP as `view` because `pure` raises revert
    function getApproveSignature() public view returns (bytes4) {
        return bytes4(keccak256("approve(address,uint256,address,uint256)"));
    }

    /// @notice KEEP as `view` because `pure` raises revert
    function getSendSignature() public view returns (bytes4) {
        return bytes4(keccak256("send(address,address,uint256,address,uint256)"));
    }

    /// @notice KEEP as `view` because `pure` raises revert
    function getReceiveSignature() public view returns (bytes4) {
        return bytes4(keccak256("receive(address,address,uint256,address,uint256)"));
    }
}
