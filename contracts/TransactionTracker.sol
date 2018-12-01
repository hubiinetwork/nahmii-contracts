/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";

/**
@title Transaction tracker
@notice An ownable to track transactions of generic types
*/
contract TransactionTracker is Ownable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct TxLogEntry {
        int256 amount;
        uint256 blockNumber;
        address currencyCt;
        uint256 currencyId;
    }

    struct TxLog {
        TxLogEntry[] entries;
        mapping(address => mapping(uint256 => uint256[])) entryIndicesByCurrency;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => mapping(bytes32 => TxLog)) private txLogByWalletType;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer)
    public
    {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function add(address wallet, bytes32 _type, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        txLogByWalletType[wallet][_type].entries.length++;

        uint256 index = txLogByWalletType[wallet][_type].entries.length - 1;

        txLogByWalletType[wallet][_type].entries[index].amount = amount;
        txLogByWalletType[wallet][_type].entries[index].blockNumber = block.number;
        txLogByWalletType[wallet][_type].entries[index].currencyCt = currencyCt;
        txLogByWalletType[wallet][_type].entries[index].currencyId = currencyId;

        txLogByWalletType[wallet][_type].entryIndicesByCurrency[currencyCt][currencyId].push(index);
    }

    function getByIndex(address wallet, bytes32 _type, uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        TxLogEntry storage entry = txLogByWalletType[wallet][_type].entries[index];
        amount = entry.amount;
        blockNumber = entry.blockNumber;
        currencyCt = entry.currencyCt;
        currencyId = entry.currencyId;
    }

    function count(address wallet, bytes32 _type)
    public
    view
    returns (uint256)
    {
        return txLogByWalletType[wallet][_type].entries.length;
    }

    function getByCurrencyIndex(address wallet, bytes32 _type, address currencyCt, uint256 currencyId, uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        uint256 entryIndex = txLogByWalletType[wallet][_type].entryIndicesByCurrency[currencyCt][currencyId][index];

        TxLogEntry storage entry = txLogByWalletType[wallet][_type].entries[entryIndex];
        amount = entry.amount;
        blockNumber = entry.blockNumber;
    }

    function countByCurrency(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return txLogByWalletType[wallet][_type].entryIndicesByCurrency[currencyCt][currencyId].length;
    }
}