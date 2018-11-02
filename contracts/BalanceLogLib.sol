/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SafeMathIntLib} from "./SafeMathIntLib.sol";

library BalanceLogLib {
    struct Entry {
        int256 amount;
        uint256 blockNumber;
    }

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct BalanceLog {
        mapping(address => mapping(uint256 => Entry[])) entries;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function get(BalanceLog storage self, address currencyCt, uint256 currencyId, uint256 index)
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
}
