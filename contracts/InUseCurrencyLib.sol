/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";

library InUseCurrencyLib {
    uint256 public constant INVALID_INDEX = 2**256 - 1;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct InUseCurrency {
        MonetaryTypesLib.Currency[] list;
        mapping(address => mapping(uint256 => InUseCurrencyItem)) map;
        uint256 mapVersion;
    }

    struct InUseCurrencyItem {
        uint256 listIndex;
        uint256 version;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function clear(InUseCurrency storage inUseCurrency) public {
        MonetaryTypesLib.Currency[] storage _list = inUseCurrency.list;
        assembly {
            mstore(_list_slot, 0)
        }
        inUseCurrency.mapVersion++;
    }

    /// NOTE: Does not like "add" because we use assembly
    function addItem(InUseCurrency storage inUseCurrency, address currencyCt, uint256 currencyId) public {
        InUseCurrencyItem storage item = inUseCurrency.map[currencyCt][currencyId];
        if (item.listIndex == 0 || item.version != inUseCurrency.mapVersion) {
            inUseCurrency.list.push(MonetaryTypesLib.Currency(currencyCt, currencyId));
            item.listIndex = inUseCurrency.list.length;
            item.version = inUseCurrency.mapVersion;
        }
    }

    function removeItem(InUseCurrency storage inUseCurrency, address currencyCt, uint256 currencyId) public {
        uint256 idx = getPos(inUseCurrency, currencyCt, currencyId);
        require(idx != INVALID_INDEX);
        removeItemAt(inUseCurrency, idx);
    }

    function removeItemAt(InUseCurrency storage inUseCurrency, uint256 idx) public {
        require(idx < inUseCurrency.list.length);

        address currencyCt = inUseCurrency.list[idx].ct;
        uint256 currencyId = inUseCurrency.list[idx].id;

        if (idx < inUseCurrency.list.length - 1) {
            //remap the last item in the array to this index
            inUseCurrency.list[idx] = inUseCurrency.list[inUseCurrency.list.length - 1];

            inUseCurrency.map[inUseCurrency.list[idx].ct][inUseCurrency.list[idx].id].listIndex = idx + 1;

            //delete the last item in the array
            delete inUseCurrency.list[inUseCurrency.list.length - 1];
        }
        else {
            //it is the last item in the array
            delete inUseCurrency.list[idx];
        }
        inUseCurrency.list.length--;
        inUseCurrency.map[currencyCt][currencyId].listIndex = 0; //clean mapping
    }

    function getLength(InUseCurrency storage inUseCurrency) public view returns (uint256) {
        return inUseCurrency.list.length;
    }

    function getAt(InUseCurrency storage inUseCurrency, uint256 idx) public view returns (MonetaryTypesLib.Currency) {
        require(idx < inUseCurrency.list.length);
        return inUseCurrency.list[idx];
    }

    function getPos(InUseCurrency storage inUseCurrency, address currencyCt, uint256 currencyId) public view returns (uint256) {
        InUseCurrencyItem storage item = inUseCurrency.map[currencyCt][currencyId];
        if (item.listIndex == 0 || item.version != inUseCurrency.mapVersion) {
            return INVALID_INDEX;
        }
        return item.listIndex - 1;
    }
}
