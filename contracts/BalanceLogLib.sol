/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {SafeMathUintLib} from "./SafeMathUintLib.sol";

library BalanceLogLib {
    using SafeMathUintLib for uint256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Entry {
        int256 amount;
        uint256 blockNumber;
    }

    struct BalanceLog {
        mapping(address => mapping(uint256 => Entry[])) entries;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function getByIndex(BalanceLog storage self, address currencyCt, uint256 currencyId, uint256 index)
    internal
    view
    returns (int256 amount, uint256 blockNumber)
    {
        if (currencyCt == address(0))
            require(currencyId == 0);

        // Return 0s if there are no log entries
        if (0 == count(self, currencyCt, currencyId)) {
            amount = 0;
            blockNumber = 0;

        } else {
            // Clamp index to max of highest index
            index = index.clampMax(self.entries[currencyCt][currencyId].length - 1);

            amount = self.entries[currencyCt][currencyId][index].amount;
            blockNumber = self.entries[currencyCt][currencyId][index].blockNumber;
        }
    }

    function getByBlockNumber(BalanceLog storage self, address currencyCt, uint256 currencyId, uint256 _blockNumber)
    internal
    view
    returns (int256 amount, uint256 blockNumber)
    {
        if (currencyCt == address(0))
            require(currencyId == 0);

        // Return 0 values if there are no log entries
        if (0 == count(self, currencyCt, currencyId)) {
            amount = 0;
            blockNumber = 0;

        } else {
            uint256 index = indexByBlockNumber(self, currencyCt, currencyId, _blockNumber);

            if (0 == index) {
                amount = 0;
                blockNumber = 0;
            } else {
                amount = self.entries[currencyCt][currencyId][index - 1].amount;
                blockNumber = self.entries[currencyCt][currencyId][index - 1].blockNumber;
            }
        }
    }

    function getLast(BalanceLog storage self, address currencyCt, uint256 currencyId)
    internal
    view
    returns (int256 amount, uint256 blockNumber)
    {
        if (currencyCt == address(0))
            require(currencyId == 0);

        // Return 0s if there are no log entries
        if (0 == count(self, currencyCt, currencyId)) {
            amount = 0;
            blockNumber = 0;

        } else {
            uint256 index = self.entries[currencyCt][currencyId].length - 1;

            amount = self.entries[currencyCt][currencyId][index].amount;
            blockNumber = self.entries[currencyCt][currencyId][index].blockNumber;
        }
    }

    function add(BalanceLog storage self, int256 amount, address currencyCt, uint256 currencyId)
    internal
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.entries[currencyCt][currencyId].push(Entry(amount, block.number));
    }

    function count(BalanceLog storage self, address currencyCt, uint256 currencyId)
    internal
    view
    returns (uint256)
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        return self.entries[currencyCt][currencyId].length;
    }

    function indexByBlockNumber(BalanceLog storage self, address currencyCt, uint256 currencyId, uint256 blockNumber)
    internal
    view
    returns (uint256)
    {
        if (0 == self.entries[currencyCt][currencyId].length)
            return 0;

        for (uint256 i = self.entries[currencyCt][currencyId].length; i > 0; i--)
            if (blockNumber >= self.entries[currencyCt][currencyId][i - 1].blockNumber)
                return i;

        return 0;
    }
}
