/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SafeMathInt} from "./SafeMathInt.sol";

library BalanceLib {
    using SafeMathInt for int256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Balance {
        mapping(address => mapping(uint256 => int256)) figures;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function get(Balance storage self, address currencyCt, uint256 currencyId) internal view returns (int256) {
        if (currencyCt == address(0))
            require(currencyId == 0);
        return self.figures[currencyCt][currencyId];
    }

    function set(Balance storage self, int256 amount, address currencyCt, uint256 currencyId) internal {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = amount;
    }

    //----

    function add(Balance storage self, int256 amount, address currencyCt, uint256 currencyId) internal {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = self.figures[currencyCt][currencyId].add_nn(amount);
    }

    function sub(Balance storage self, int256 amount, address currencyCt, uint256 currencyId) internal {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = self.figures[currencyCt][currencyId].sub_nn(amount);
    }

    function transfer(Balance storage _from, Balance storage _to, int256 amount, address currencyCt, uint256 currencyId) internal {
        sub(_from, amount, currencyCt, currencyId);
        add(_to, amount, currencyCt, currencyId);
    }

    //----

    function add_allow_neg(Balance storage self, int256 amount, address currencyCt, uint256 currencyId) internal {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = self.figures[currencyCt][currencyId].add(amount);
    }

    function sub_allow_neg(Balance storage self, int256 amount, address currencyCt, uint256 currencyId) internal {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = self.figures[currencyCt][currencyId].sub(amount);
    }

    function transfer_allow_neg(Balance storage _from, Balance storage _to, int256 amount, address currencyCt, uint256 currencyId) internal {
        sub_allow_neg(_from, amount, currencyCt, currencyId);
        add_allow_neg(_to, amount, currencyCt, currencyId);
    }
}
