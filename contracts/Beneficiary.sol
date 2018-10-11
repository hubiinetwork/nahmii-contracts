/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

/**
@title Beneficiary
@notice A recipient of ethers and tokens
*/
contract Beneficiary {
    /// @notice Deposit ethers to the given wallet's deposited balance
    /// @param wallet The address of the concerned wallet
    function depositEthersTo(address wallet) public payable;

    /// @notice Deposit token to the given wallet's deposited balance
    /// @dev The wallet must approve of this ClientFund's transfer prior to calling this function
    /// @param wallet The address of the concerned wallet
    /// @param amount The amount to deposit
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("ERC20", "ERC721")
    function depositTokensTo(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard) public;
}
