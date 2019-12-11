/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

/**
 * @title BalanceRecordable
 * @dev Interface of contract that records balance by block number and for which
 * the area under curve (AUC) in range of block number may be calculated
 */
interface BalanceRecordable {
    /**
     * @notice Get the count of balance records for the given account
     * @param account The concerned account
     * @return The count of balance updates
     */
    function balanceRecordsCount(address account)
    external
    view
    returns (uint256);

    /**
     * @notice Get the record balance for the given account and record index
     * @param account The concerned account
     * @param index The concerned index
     * @return The record balance
     */
    function recordBalance(address account, uint256 index)
    external
    view
    returns (uint256);

    /**
     * @notice Get the record block number for the given account and record index
     * @param account The concerned account
     * @param index The concerned index
     * @return The record block number
     */
    function recordBlockNumber(address account, uint256 index)
    external
    view
    returns (uint256);

    /**
     * @notice Get the index of the balance record containing the given block number,
     * or -1 if the given block number is below the smallest balance record block number
     * @param account The concerned account
     * @param blockNumber The concerned block number
     * @return The balance record index
     */
    function recordIndexByBlockNumber(address account, uint256 blockNumber)
    external
    view
    returns (int256);
}