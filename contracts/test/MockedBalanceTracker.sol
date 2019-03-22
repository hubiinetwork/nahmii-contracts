/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

/**
 * @title MockedBalanceTracker
 * @notice Mocked implementation of balance tracker contract
 */
contract MockedBalanceTracker {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public DEPOSITED_BALANCE_TYPE = "deposited";
    string constant public SETTLED_BALANCE_TYPE = "settled";
    string constant public STAGED_BALANCE_TYPE = "staged";

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct FungibleRecord {
        int256 amount;
        uint256 blockNumber;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    bytes32 public depositedBalanceType;
    bytes32 public settledBalanceType;
    bytes32 public stagedBalanceType;

    mapping(bytes32 => uint256) private _fungibleRecordsCountByType;
    bytes32[] private _fungibleRecordsCountTypes;
    mapping(bytes32 => bool) private _fungibleRecordsCountSet;

    mapping(bytes32 => FungibleRecord) private fungibleRecordByType;
    bytes32[] private _fungibleRecordTypes;
    mapping(bytes32 => bool) private _fungibleRecordTypeSet;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor()
    public
    {
        depositedBalanceType = keccak256(abi.encodePacked(DEPOSITED_BALANCE_TYPE));
        settledBalanceType = keccak256(abi.encodePacked(SETTLED_BALANCE_TYPE));
        stagedBalanceType = keccak256(abi.encodePacked(STAGED_BALANCE_TYPE));
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        uint256 i;
        for (i = 0; i < _fungibleRecordsCountTypes.length; i++)
            _fungibleRecordsCountByType[_fungibleRecordsCountTypes[i]] = 0;
        _fungibleRecordsCountTypes.length = 0;

        for (i = 0; i < _fungibleRecordTypes.length; i++)
            delete fungibleRecordByType[_fungibleRecordTypes[i]];
        _fungibleRecordTypes.length = 0;
    }

    function _setFungibleRecordsCount(bytes32 _type, uint256 size)
    public
    {
        _fungibleRecordsCountByType[_type] = size;
        if (!_fungibleRecordsCountSet[_type]) {
            _fungibleRecordsCountSet[_type] = true;
            _fungibleRecordsCountTypes.push(_type);
        }
    }

    function fungibleRecordsCount(address, bytes32 _type, address, uint256)
    public
    view
    returns (uint256)
    {
        return _fungibleRecordsCountByType[_type];
    }

    function _setFungibleRecord(bytes32 _type, int256 amount, uint256 blockNumber)
    public
    {
        fungibleRecordByType[_type].amount = amount;
        fungibleRecordByType[_type].blockNumber = blockNumber;

        if (!_fungibleRecordTypeSet[_type]) {
            _fungibleRecordTypeSet[_type] = true;
            _fungibleRecordTypes.push(_type);
        }
    }

    function fungibleRecordByBlockNumber(address, bytes32 _type, address, uint256, uint256)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        amount = fungibleRecordByType[_type].amount;
        blockNumber = fungibleRecordByType[_type].blockNumber;
    }

    function lastFungibleRecord(address wallet, bytes32 _type, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return fungibleRecordByBlockNumber(wallet, _type, currencyCt, currencyId, 0);
    }
}