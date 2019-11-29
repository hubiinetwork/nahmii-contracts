/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {TokenMultiTimelock} from "./TokenMultiTimelock.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {BalanceRecordable} from "./BalanceRecordable.sol";

/**
 * @title RevenueTokenManager
 * @notice An token multi-timelock that supports the calculation of balance blocks
 * of the underlying revenue token as well as amount blocks from its own released amount
 */
contract RevenueTokenManager is TokenMultiTimelock, BalanceRecordable {
    using SafeMathUintLib for uint256;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer)
    public
    TokenMultiTimelock(deployer)
    {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Get the count of executed releases
    /// @return The count of executed releases
    function balanceRecordsCount(address)
    external
    view
    returns (uint256)
    {
        return executedReleasesCount;
    }

    /// @notice Get the total amount for the given release index
    /// @param index The concerned index
    /// @return The release total amount
    function recordBalance(address, uint256 index)
    external
    view
    returns (uint256)
    {
        return releases[index].totalAmount;
    }

    /// @notice Get the release block number for the given release index
    /// @param index The concerned index
    /// @return The release block number
    function recordBlockNumber(address, uint256 index)
    external
    view
    returns (uint256)
    {
        return releases[index].blockNumber;
    }

    /// @notice Get the index of the release containing the given block number,
    /// or -1 if the given block number is below the smallest release block number
    /// @param blockNumber The concerned block number
    /// @return The release index
    function recordIndexByBlockNumber(address, uint256 blockNumber)
    external
    view
    returns (int256)
    {
        return releaseIndexByBlockNumber(blockNumber);
    }
}