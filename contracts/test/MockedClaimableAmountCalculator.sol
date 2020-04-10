/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2020 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

pragma experimental ABIEncoderV2;

/**
 * @title MockedClaimableAmountCalculator
 * @notice Mocked implementation of claimable amount calculator
 */
contract MockedClaimableAmountCalculator {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address[] public nonClaimers;
    mapping(address => uint256) public nonClaimerIndicesByWallet;

    mapping(address => mapping(int256 => mapping(uint256 => mapping(uint256 => int256)))) calculateByWalletAmountWindowBlocks;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function nonClaimersCount()
    public
    view
    returns (uint256)
    {
        return nonClaimers.length;
    }

    function isNonClaimer(address wallet)
    public
    view
    returns (bool)
    {
        return 0 < nonClaimerIndicesByWallet[wallet];
    }

    function registerNonClaimer(address wallet)
    public
    {
        if (0 == nonClaimerIndicesByWallet[wallet]) {
            nonClaimers.push(wallet);
            nonClaimerIndicesByWallet[wallet] = nonClaimers.length;
        }
    }

    function _setCalculate(address wallet, int256 accrualAmount,
        uint256 windowStartBlock, uint256 windowEndBlock, int256 _calculate)
    public
    {
        calculateByWalletAmountWindowBlocks[wallet][accrualAmount][windowStartBlock][windowEndBlock] = _calculate;
    }

    function calculate(address wallet, int256 accrualAmount,
        uint256 /*accrualStartBlock*/, uint256 /*accrualEndBlock*/,
        uint256 windowStartBlock, uint256 windowEndBlock)
    public
    view
    returns (int256)
    {
        return calculateByWalletAmountWindowBlocks[wallet][accrualAmount][windowStartBlock][windowEndBlock];
    }
}