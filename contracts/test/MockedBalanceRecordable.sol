/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title MockedBalanceRecordable
 * @notice Mocked implementation of balance recordable
 */
contract MockedBalanceRecordable {
    using SafeMath for uint256;

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct BalanceRecord {
        uint256 n; // block number
        uint256 b; // balance
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    BalanceRecord[] public balanceRecords;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _addBalanceRecords(BalanceRecord[] memory records)
    public
    {
        for (uint256 i = 0; i < records.length; i = i.add(1))
            balanceRecords.push(records[i]);
    }

    function balanceRecordsCount(address)
    public
    view
    returns (uint256) {
        return balanceRecords.length;
    }

    function recordBalance(address, uint256 recordIndex)
    public
    view
    returns (uint256)
    {
        return balanceRecords[recordIndex].b;
    }

    function recordBlockNumber(address, uint256 recordIndex)
    public
    view
    returns (uint256)
    {
        return balanceRecords[recordIndex].n;
    }

    function recordIndexByBlockNumber(address, uint256 blockNumber)
    public
    view
    returns (int256)
    {
        for (uint256 i = balanceRecords.length; i > 0; i--)
            if (balanceRecords[i - 1].n <= blockNumber)
                return int256(i - 1);
        return - 1;
    }
}