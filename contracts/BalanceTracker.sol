/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {Servable} from "./Servable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {BalanceLogLib} from "./BalanceLogLib.sol";

/**
 * @title Balance tracker
 * @notice An ownable to track balances of generic types
 */
contract BalanceTracker is Ownable, Servable {
    using SafeMathIntLib for int256;
    using BalanceLib for BalanceLib.Balance;
    using BalanceLogLib for BalanceLogLib.BalanceLog;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public DEPOSITED_BALANCE_TYPE = "deposited";
    string constant public SETTLED_BALANCE_TYPE = "settled";
    string constant public STAGED_BALANCE_TYPE = "staged";

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
    bytes32 public depositedBalanceType;
    bytes32 public settledBalanceType;
    bytes32 public stagedBalanceType;
    bytes32[] public balanceTypes;
    mapping(bytes32 => bool) public balanceTypeMap;

    mapping(address => Wallet) private walletMap;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer)
    public
    {
        depositedBalanceType = keccak256(abi.encodePacked(DEPOSITED_BALANCE_TYPE));
        settledBalanceType = keccak256(abi.encodePacked(SETTLED_BALANCE_TYPE));
        stagedBalanceType = keccak256(abi.encodePacked(STAGED_BALANCE_TYPE));
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Get the balance of the given wallet, type and currency
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The stored balance
    function get(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return walletMap[wallet].balanceByType[_type].get(currencyCt, currencyId);
    }

    /// @notice Set the balance of the given wallet, type and currency to the given amount
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function set(address wallet, bytes32 _type, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyActiveService
    {
        // Update the balance
        walletMap[wallet].balanceByType[_type].set(amount, currencyCt, currencyId);

        // Update log
        _updateBalanceLog(wallet, _type, currencyCt, currencyId);

        // Update balance type hashes
        _updateBalanceTypes(_type);
    }

    /// @notice Reset all balances of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function reset(address wallet, address currencyCt, uint256 currencyId)
    public
    onlyActiveService
    {
        for (uint256 i = 0; i < balanceTypes.length; i++) {
            // Set the balance
            set(wallet, balanceTypes[i], 0, currencyCt, currencyId);
        }
    }

    /// @notice Add the given amount to the balance of the given wallet, type and currency
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function add(address wallet, bytes32 _type, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyActiveService
    {
        // Update the balance
        walletMap[wallet].balanceByType[_type].add(amount, currencyCt, currencyId);

        // Update log
        _updateBalanceLog(wallet, _type, currencyCt, currencyId);

        // Update balance type hashes
        _updateBalanceTypes(_type);
    }

    /// @notice Subtract the given amount from the balance of the given wallet, type and currency
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function sub(address wallet, bytes32 _type, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyActiveService
    {
        // Update the balance
        walletMap[wallet].balanceByType[_type].sub(amount, currencyCt, currencyId);

        // Update log
        _updateBalanceLog(wallet, _type, currencyCt, currencyId);
    }

    /// @notice Transfer the given amount from the balance of fromType to the balance toType
    /// of the given wallet, type and currency
    /// @param wallet The address of the concerned wallet
    /// @param fromType The balance from-type
    /// @param toType The balance to-type
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function transfer(address wallet, bytes32 fromType, bytes32 toType, int256 amount, address currencyCt,
        uint256 currencyId)
    public
    onlyActiveService
    {
        // Update the balances
        walletMap[wallet].balanceByType[fromType].sub(amount, currencyCt, currencyId);
        walletMap[wallet].balanceByType[toType].add(amount, currencyCt, currencyId);

        // Update logs
        _updateBalanceLog(wallet, fromType, currencyCt, currencyId);
        _updateBalanceLog(wallet, toType, currencyCt, currencyId);

        // Update balance type hashes
        _updateBalanceTypes(toType);
    }

    /// @notice Sum all balances of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The sum of balance
    function sum(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        int256 _sum = 0;
        for (uint256 i = 0; i < balanceTypes.length; i++) {
            _sum = _sum.add(get(wallet, balanceTypes[i], currencyCt, currencyId));
        }
        return _sum;
    }

    /// @notice Gauge whether this tracker has data for the given wallet, type and currency
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return true if data is stored, else false
    function hasCurrency(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return walletMap[wallet].balanceByType[_type].hasCurrency(currencyCt, currencyId);
    }

    /// @notice Get the number of balance log entries for the given wallet, type and currency
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The count of balance log entries
    function logSize(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return walletMap[wallet].balanceLogByType[_type].count(currencyCt, currencyId);
    }

    /// @notice Get the log entry for the given wallet, type and currency by the given
    /// log entry index
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param index The concerned log index
    /// @return The log entry
    function logByIndex(address wallet, bytes32 _type, address currencyCt, uint256 currencyId,
        uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return walletMap[wallet].balanceLogByType[_type].getByIndex(currencyCt, currencyId, index);
    }

    /// @notice Get the log entry for the given wallet, type and currency by the given
    /// block number
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param _blockNumber The concerned block number
    /// @return The log entry
    function logByBlockNumber(address wallet, bytes32 _type, address currencyCt, uint256 currencyId,
        uint256 _blockNumber)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return walletMap[wallet].balanceLogByType[_type].getByBlockNumber(currencyCt, currencyId, _blockNumber);
    }

    /// @notice Get the last (most recent) log entry for the given wallet, type and currency
    /// @param wallet The address of the concerned wallet
    /// @param _type The balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The last log entry
    function lastLog(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return walletMap[wallet].balanceLogByType[_type].getLast(currencyCt, currencyId);
    }

    /// @notice Get the count of balance types stored
    /// @return The count of balance types
    function balanceTypesCount()
    public
    view
    returns (uint256)
    {
        return balanceTypes.length;
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

    function _updateBalanceTypes(bytes32 _type)
    private
    {
        if (!balanceTypeMap[_type]) {
            balanceTypeMap[_type] = true;
            balanceTypes.push(_type);
        }
    }
}