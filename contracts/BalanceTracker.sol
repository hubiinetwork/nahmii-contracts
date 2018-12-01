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
import {BalanceLib} from "./BalanceLib.sol";
import {BalanceLogLib} from "./BalanceLogLib.sol";

/**
@title Balance tracker
@notice An ownable to track balances of generic types
*/
contract BalanceTracker is Ownable {
    using SafeMathIntLib for int256;
    using BalanceLib for BalanceLib.Balance;
    using BalanceLogLib for BalanceLogLib.BalanceLog;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Wallet {
        mapping(bytes32 => BalanceLib.Balance) balanceByType;
        mapping(bytes32 => BalanceLogLib.BalanceLog) balanceLogByType;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;

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
    function get(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return walletMap[wallet].balanceByType[_type].get(currencyCt, currencyId);
    }

    function sum(address wallet, bytes32[] _types, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        int256 _sum = 0;
        for (uint256 i = 0; i < _types.length; i++) {
            _sum = _sum.add(get(wallet, _types[i], currencyCt, currencyId));
        }
        return _sum;
    }

    function set(address wallet, bytes32 _type, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyClient
    {
        // Update the balance
        walletMap[wallet].balanceByType[_type].set(amount, currencyCt, currencyId);

        // Update log
        _updateBalanceLog(wallet, _type, currencyCt, currencyId);
    }

    function reset(address wallet, bytes32[] _types, address currencyCt, uint256 currencyId)
    public
    onlyClient
    {
        for (uint256 i = 0; i < _types.length; i++) {
            // Update the balance
            set(wallet, _types[i], 0, currencyCt, currencyId);

            // Update log
            _updateBalanceLog(wallet, _types[i], currencyCt, currencyId);
        }
    }

    function add(address wallet, bytes32 _type, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyClient
    {
        // Update the balance
        walletMap[wallet].balanceByType[_type].add(amount, currencyCt, currencyId);

        // Update log
        _updateBalanceLog(wallet, _type, currencyCt, currencyId);
    }

    function sub(address wallet, bytes32 _type, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyClient
    {
        // Update the balance
        walletMap[wallet].balanceByType[_type].sub(amount, currencyCt, currencyId);

        // Update log
        _updateBalanceLog(wallet, _type, currencyCt, currencyId);
    }

    function transfer(address wallet, bytes32 fromType, bytes32 toType, int256 amount, address currencyCt,
        uint256 currencyId)
    public
    onlyClient
    {
        // Update the balances
        walletMap[wallet].balanceByType[fromType].sub(amount, currencyCt, currencyId);
        walletMap[wallet].balanceByType[toType].add(amount, currencyCt, currencyId);

        // Update logs
        _updateBalanceLog(wallet, fromType, currencyCt, currencyId);
        _updateBalanceLog(wallet, toType, currencyCt, currencyId);
    }

    function hasCurrency(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return walletMap[wallet].balanceByType[_type].hasCurrency(currencyCt, currencyId);
    }

    function logSize(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return walletMap[wallet].balanceLogByType[_type].count(currencyCt, currencyId);
    }

    function logByIndex(address wallet, bytes32 _type, address currencyCt, uint256 currencyId,
        uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return walletMap[wallet].balanceLogByType[_type].getByIndex(currencyCt, currencyId, index);
    }

    function logByBlockNumber(address wallet, bytes32 _type, address currencyCt, uint256 currencyId,
        uint256 _blockNumber)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return walletMap[wallet].balanceLogByType[_type].getByBlockNumber(currencyCt, currencyId, _blockNumber);
    }

    function lastLog(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return walletMap[wallet].balanceLogByType[_type].getLast(currencyCt, currencyId);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _updateBalanceLog(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    private
    {
        // Add a new log entry
        walletMap[wallet].balanceLogByType[_type].add(
            get(wallet, _type, currencyCt, currencyId), currencyCt, currencyId
        );
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyClient() {
        //        require(msg.sender == client); // TODO Implement fully
        _;
    }
}