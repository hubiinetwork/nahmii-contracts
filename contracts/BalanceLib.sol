/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";

library BalanceLib {
    using SafeMathIntLib for int256;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Balance {
        mapping(address => mapping(uint256 => int256)) figures;

        InUseCurrencyLib.InUseCurrency inUseCurrencies;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function get(Balance storage self, address currencyCt, uint256 currencyId)
    internal
    view
    returns (int256)
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        return self.figures[currencyCt][currencyId];
    }

    function set(Balance storage self, int256 amount, address currencyCt, uint256 currencyId)
    internal
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = amount;

        updateInUseCurrencies(self, currencyCt, currencyId);
    }

    function add(Balance storage self, int256 amount, address currencyCt, uint256 currencyId)
    internal
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = self.figures[currencyCt][currencyId].add(amount);

        updateInUseCurrencies(self, currencyCt, currencyId);
    }

    function sub(Balance storage self, int256 amount, address currencyCt, uint256 currencyId)
    internal
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = self.figures[currencyCt][currencyId].sub(amount);

        updateInUseCurrencies(self, currencyCt, currencyId);
    }

    function transfer(Balance storage _from, Balance storage _to, int256 amount,
        address currencyCt, uint256 currencyId)
    internal
    {
        sub(_from, amount, currencyCt, currencyId);
        add(_to, amount, currencyCt, currencyId);
    }

    function add_nn(Balance storage self, int256 amount, address currencyCt, uint256 currencyId)
    internal
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = self.figures[currencyCt][currencyId].add_nn(amount);

        updateInUseCurrencies(self, currencyCt, currencyId);
    }

    function sub_nn(Balance storage self, int256 amount, address currencyCt, uint256 currencyId)
    internal
    {
        if (currencyCt == address(0))
            require(currencyId == 0);
        self.figures[currencyCt][currencyId] = self.figures[currencyCt][currencyId].sub_nn(amount);

        updateInUseCurrencies(self, currencyCt, currencyId);
    }

    function transfer_nn(Balance storage _from, Balance storage _to, int256 amount,
        address currencyCt, uint256 currencyId)
    internal
    {
        sub_nn(_from, amount, currencyCt, currencyId);
        add_nn(_to, amount, currencyCt, currencyId);
    }

    function hasCurrency(Balance storage self, address currencyCt, uint256 currencyId)
    internal
    view
    returns (bool)
    {
        return self.inUseCurrencies.has(currencyCt, currencyId);
    }

    function updateInUseCurrencies(Balance storage self, address currencyCt, uint256 currencyId)
    internal
    {
        if (0 == self.figures[currencyCt][currencyId] && self.inUseCurrencies.has(currencyCt, currencyId))
            self.inUseCurrencies.removeItem(currencyCt, currencyId);
        else if (!self.inUseCurrencies.has(currencyCt, currencyId))
            self.inUseCurrencies.addItem(currencyCt, currencyId);
    }
}
