/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";
import {Beneficiary} from "../Beneficiary.sol";

/**
@title MockedClientFund
@notice Mocked implementation of client fund contract
*/
contract MockedClientFund {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Seizure {
        address source;
        address target;
    }

    struct Update {
        address sourceWallet;
        address targetWallet;
        MonetaryTypesLib.Figure figure;
        string standard;
    }

    struct BalanceLogEntry {
        int256 amount;
        uint256 blockNumber;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Seizure[] public seizures;
    address[] public seizedWallets;
    mapping(address => bool) public seizuresByWallet;

    Update[] public settledBalanceUpdates;
    Update[] public stages;
    Update[] public beneficiaryTransfers;
    BalanceLogEntry[] public activeBalanceLogEntries;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SeizeAllBalancesEvent(address sourceWallet, address targetWallet);
    event UpdateSettledBalanceEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event StageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset() public {
        seizures.length = 0;
        for (uint256 i = 0; i < seizedWallets.length; i++)
            seizuresByWallet[seizedWallets[i]] = false;
        seizedWallets.length = 0;

        settledBalanceUpdates.length = 0;
        stages.length = 0;
        beneficiaryTransfers.length = 0;
        activeBalanceLogEntries.length = 0;
    }

    function seizeAllBalances(address sourceWallet, address targetWallet)
    public
    {
        seizures.push(Seizure(sourceWallet, targetWallet));

        if (!seizuresByWallet[sourceWallet]) {
            seizuresByWallet[sourceWallet] = true;
            seizedWallets.push(sourceWallet);
        }

        emit SeizeAllBalancesEvent(sourceWallet, targetWallet);
    }

    function seizedWalletsCount()
    public
    view
    returns (uint256)
    {
        return seizedWallets.length;
    }

    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        settledBalanceUpdates.push(
            Update(
                wallet,
                address(0),
                MonetaryTypesLib.Figure(
                    amount,
                    MonetaryTypesLib.Currency(currencyCt, currencyId)
                ),
                ""
            )
        );
        emit UpdateSettledBalanceEvent(wallet, amount, currencyCt, currencyId);
    }

    function _settledBalanceUpdatesCount()
    public
    view
    returns (uint256)
    {
        return settledBalanceUpdates.length;
    }

    function _settledBalanceUpdates(uint256 index)
    public
    view
    returns (address, int256, address, uint256) {
        return (
        settledBalanceUpdates[index].sourceWallet,
        settledBalanceUpdates[index].figure.amount,
        settledBalanceUpdates[index].figure.currency.ct,
        settledBalanceUpdates[index].figure.currency.id
        );
    }

    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        stages.push(
            Update(
                wallet,
                address(0),
                MonetaryTypesLib.Figure(
                    amount,
                    MonetaryTypesLib.Currency(currencyCt, currencyId)
                ),
                ""
            )
        );
        emit StageEvent(wallet, amount, currencyCt, currencyId);
    }

    function _stagesCount()
    public
    view
    returns (uint256)
    {
        return stages.length;
    }

    function _stages(uint256 index)
    public
    view
    returns (address, address, int256, address, uint256)
    {
        return (
        stages[index].sourceWallet,
        stages[index].targetWallet,
        stages[index].figure.amount,
        stages[index].figure.currency.ct,
        stages[index].figure.currency.id
        );
    }

    function transferToBeneficiary(Beneficiary beneficiary, int256 amount,
        address currencyCt, uint256 currencyId, string standard)
    public
    {
        beneficiaryTransfers.push(
            Update(
                address(0),
                address(beneficiary),
                MonetaryTypesLib.Figure(
                    amount,
                    MonetaryTypesLib.Currency(currencyCt, currencyId)
                ),
                standard
            )
        );
    }

    function _beneficiaryTransfersCount()
    public
    view
    returns (uint256)
    {
        return beneficiaryTransfers.length;
    }

    function _beneficiaryTransfers(uint256 index)
    public
    view
    returns (address, address, int256, address, uint256, string)
    {
        return (
        beneficiaryTransfers[index].sourceWallet,
        beneficiaryTransfers[index].targetWallet,
        beneficiaryTransfers[index].figure.amount,
        beneficiaryTransfers[index].figure.currency.ct,
        beneficiaryTransfers[index].figure.currency.id,
        beneficiaryTransfers[index].standard
        );
    }

    function activeBalanceLogEntriesCount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        return activeBalanceLogEntries.length;
    }

    function activeBalanceLogEntry(address wallet, address currencyCt, uint256 currencyId, uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        // To silence unused function parameter compiler warning
        require(wallet == wallet);
        require(currencyCt == currencyCt);
        require(currencyId == currencyId);
        require(index == index);
        amount = activeBalanceLogEntries[activeBalanceLogEntries.length - 1].amount;
        blockNumber = activeBalanceLogEntries[activeBalanceLogEntries.length - 1].blockNumber;
    }

    function _addActiveBalanceLogEntry(int256 amount, uint256 blockNumber)
    public
    {
        activeBalanceLogEntries.push(BalanceLogEntry(amount, blockNumber));
    }
}