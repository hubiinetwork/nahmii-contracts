/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {BalanceTracker} from "./BalanceTracker.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";

library BalanceTrackerLib {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    function fungibleActiveRecordByBlockNumber(BalanceTracker self, address wallet,
        MonetaryTypesLib.Currency memory currency, uint256 _blockNumber)
    internal
    view
    returns (int256 amount, uint256 blockNumber)
    {
        // Get log records of deposited and settled balances
        (int256 depositedAmount, uint256 depositedBlockNumber) = self.fungibleRecordByBlockNumber(
            wallet, self.depositedBalanceType(), currency.ct, currency.id, _blockNumber
        );
        (int256 settledAmount, uint256 settledBlockNumber) = self.fungibleRecordByBlockNumber(
            wallet, self.settledBalanceType(), currency.ct, currency.id, _blockNumber
        );

        // Return the sum of amounts and highest of block numbers
        amount = depositedAmount.add(settledAmount);
        blockNumber = depositedBlockNumber.clampMin(settledBlockNumber);
    }

    function fungibleActiveBalanceAmountByBlockNumber(BalanceTracker self, address wallet,
        MonetaryTypesLib.Currency memory currency, uint256 blockNumber)
    internal
    view
    returns (int256)
    {
        (int256 amount,) = fungibleActiveRecordByBlockNumber(self, wallet, currency, blockNumber);
        return amount;
    }

    function fungibleActiveDeltaBalanceAmountByBlockNumbers(BalanceTracker self, address wallet,
        MonetaryTypesLib.Currency memory currency, uint256 fromBlockNumber, uint256 toBlockNumber)
    internal
    view
    returns (int256)
    {
        return fungibleActiveBalanceAmountByBlockNumber(self, wallet, currency, toBlockNumber) -
        fungibleActiveBalanceAmountByBlockNumber(self, wallet, currency, fromBlockNumber);
    }

    // TODO Rename?
    function fungibleActiveRecord(BalanceTracker self, address wallet,
        MonetaryTypesLib.Currency memory currency)
    internal
    view
    returns (int256 amount, uint256 blockNumber)
    {
        // Get last log records of deposited and settled balances
        (int256 depositedAmount, uint256 depositedBlockNumber) = self.lastFungibleRecord(
            wallet, self.depositedBalanceType(), currency.ct, currency.id
        );
        (int256 settledAmount, uint256 settledBlockNumber) = self.lastFungibleRecord(
            wallet, self.settledBalanceType(), currency.ct, currency.id
        );

        // Return the sum of amounts and highest of block numbers
        amount = depositedAmount.add(settledAmount);
        blockNumber = depositedBlockNumber.clampMin(settledBlockNumber);
    }

    // TODO Rename?
    function fungibleActiveBalanceAmount(BalanceTracker self, address wallet, MonetaryTypesLib.Currency memory currency)
    internal
    view
    returns (int256)
    {
        return self.get(wallet, self.depositedBalanceType(), currency.ct, currency.id).add(
            self.get(wallet, self.settledBalanceType(), currency.ct, currency.id)
        );
    }
}