/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {MonetaryTypes} from "./MonetaryTypes.sol";

library InUseCurrencyLib {
    uint256 public constant INVALID_INDEX = 2**256 - 1;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct InUseCurrency {
        MonetaryTypes.Currency[] list;
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
    function clear(InUseCurrency storage i) public {
        MonetaryTypes.Currency[] storage _list = i.list;
        assembly {
            mstore(_list_slot, 0)
        }
        i.mapVersion++;
    }

    /// NOTE: Does not like "add" because we use assembly
    function addItem(InUseCurrency storage i, address currencyCt, uint256 currencyId) public {
        InUseCurrencyItem storage item = i.map[currencyCt][currencyId];
        if (item.listIndex == 0 || item.version != i.mapVersion) {
            i.list.push(MonetaryTypes.Currency(currencyCt, currencyId));
            item.listIndex = i.list.length;
            item.version = i.mapVersion;
        }
    }

    function removeItem(InUseCurrency storage i, address currencyCt, uint256 currencyId) public {
        uint256 idx = getPos(i, currencyCt, currencyId);
        require(idx != INVALID_INDEX);
        removeItemAt(i, idx);
    }

    function removeItemAt(InUseCurrency storage i, uint256 idx) public {
        require(idx < i.list.length);

        address currencyCt = i.list[idx].ct;
        uint256 currencyId = i.list[idx].id;

        if (idx < i.list.length - 1) {
            //remap the last item in the array to this index
            i.list[idx] = i.list[i.list.length - 1];

            i.map[i.list[idx].ct][i.list[idx].id].listIndex = idx + 1;

            //delete the last item in the array
            delete i.list[i.list.length - 1];
        }
        else {
            //it is the last item in the array
            delete i.list[idx];
        }
        i.list.length--;
        i.map[currencyCt][currencyId].listIndex = 0; //clean mapping
    }

    function getLength(InUseCurrency storage i) public view returns (uint256) {
        return i.list.length;
    }

    function getAt(InUseCurrency storage i, uint256 idx) public view returns (MonetaryTypes.Currency) {
        require(idx < i.list.length);
        return i.list[idx];
    }

    function getPos(InUseCurrency storage i, address currencyCt, uint256 currencyId) public view returns (uint256) {
        InUseCurrencyItem storage item = i.map[currencyCt][currencyId];
        if (item.listIndex == 0 || item.version != i.mapVersion) {
            return INVALID_INDEX;
        }
        return item.listIndex - 1;
    }
}
