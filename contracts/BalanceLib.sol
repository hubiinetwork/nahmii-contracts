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
        mapping(address => mapping(uint256 => int256)) currencies;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function get(Balance storage self, address currency, uint256 currencyId) internal view returns (int256) {
        if (currency == address(0)) {
            require(currencyId == 0);
        }
        return self.currencies[currency][currencyId];
    }

    function set(Balance storage self, int256 amount, address currency, uint256 currencyId) internal {
        if (currency == address(0)) {
            require(currencyId == 0);
        }
        self.currencies[currency][currencyId] = amount;
    }

    //----

    function add(Balance storage self, int256 amount, address currency, uint256 currencyId) internal {
        if (currency == address(0)) {
            require(currencyId == 0);
        }
        self.currencies[currency][currencyId] = self.currencies[currency][currencyId].add_nn(amount);
    }

    function sub(Balance storage self, int256 amount, address currency, uint256 currencyId) internal {
        if (currency == address(0)) {
            require(currencyId == 0);
        }
        self.currencies[currency][currencyId] = self.currencies[currency][currencyId].sub_nn(amount);
    }

    function transfer(Balance storage _from, Balance storage _to, int256 amount, address currency, uint256 currencyId) internal {
        sub(_from, amount, currency, currencyId);
        add(_to, amount, currency, currencyId);
    }

    //----

    function add_allow_neg(Balance storage self, int256 amount, address currency, uint256 currencyId) internal {
        if (currency == address(0)) {
            require(currencyId == 0);
        }
        self.currencies[currency][currencyId] = self.currencies[currency][currencyId].add(amount);
    }

    function sub_allow_neg(Balance storage self, int256 amount, address currency, uint256 currencyId) internal {
        if (currency == address(0)) {
            require(currencyId == 0);
        }
        self.currencies[currency][currencyId] = self.currencies[currency][currencyId].sub(amount);
    }

    function transfer_allow_neg(Balance storage _from, Balance storage _to, int256 amount, address currency, uint256 currencyId) internal {
        sub_allow_neg(_from, amount, currency, currencyId);
        add_allow_neg(_to, amount, currency, currencyId);
    }
}
