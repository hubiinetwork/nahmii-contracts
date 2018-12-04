/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

library BalanceLogLib {
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
        require(index < self.entries[currencyCt][currencyId].length);

        amount = self.entries[currencyCt][currencyId][index].amount;
        blockNumber = self.entries[currencyCt][currencyId][index].blockNumber;
    }

    function getByBlockNumber(BalanceLog storage self, address currencyCt, uint256 currencyId, uint256 _blockNumber)
    internal
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return getByIndex(self, currencyCt, currencyId, indexByBlockNumber(self, currencyCt, currencyId, _blockNumber));
    }

    function getLast(BalanceLog storage self, address currencyCt, uint256 currencyId)
    internal
    view
    returns (int256 amount, uint256 blockNumber)
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        require(0 < self.entries[currencyCt][currencyId].length);

        uint256 index = self.entries[currencyCt][currencyId].length - 1;

        amount = self.entries[currencyCt][currencyId][index].amount;
        blockNumber = self.entries[currencyCt][currencyId][index].blockNumber;
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
        require(0 < self.entries[currencyCt][currencyId].length);
        for (uint256 i = self.entries[currencyCt][currencyId].length - 1; i >= 0; i--)
            if (blockNumber >= self.entries[currencyCt][currencyId][i].blockNumber)
                return i;
        revert();
    }
}
