/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

/**
 * @title MockedRevenueTokenManager
 * @notice Mocked implementation of RevenueTokenManager
 */
contract MockedRevenueTokenManager {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => uint256) public _balanceBlocksInByWallet;
    uint256 public _releasedAmountBlocksIn;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        _releasedAmountBlocksIn = 0;
    }

    function balanceBlocksIn(address wallet, uint256, uint256)
    public
    view
    returns (uint256)
    {
        return _balanceBlocksInByWallet[wallet];
    }

    function _setBalanceBlocksIn(address wallet, uint256 _blockIn)
    public
    {
        _balanceBlocksInByWallet[wallet] = _blockIn;
    }

    function releasedAmountBlocksIn(uint256, uint256)
    public
    view
    returns (uint256)
    {
        return _releasedAmountBlocksIn;
    }

    function _setReleasedAmountBlocksIn(uint256 _blocksIn)
    public
    {
        _releasedAmountBlocksIn = _blocksIn;
    }
}
