/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

pragma experimental ABIEncoderV2;

import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";

/**
 * @title MockedSecurityBond
 * @notice Mocked implementation of security bond contract
 */
contract MockedSecurityBond {
    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct FractionalReward {
        address wallet;
        uint256 fraction;
        uint256 unlockTime;
    }

    struct AmountedReward {
        address wallet;
        int256 amount;
        MonetaryTypesLib.Currency currency;
        uint256 unlockTime;
    }

    struct Deprival {
        address wallet;
        MonetaryTypesLib.Currency currency;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    int256 _depositedBalance;
    int256 _depositedFractionalBalance;

    FractionalReward[] public fractionalRewards;
    AmountedReward[] public amountedRewards;
    Deprival[] public deprivals;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RewardByFractionEvent(address wallet, uint256 fraction, uint256 unlockTimeoutInSeconds);
    event RewardByAmountEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId,
        uint256 unlockTimeoutInSeconds);
    event DepriveEvent(address wallet, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        _depositedBalance = 0;
        _depositedFractionalBalance = 0;
        fractionalRewards.length = 0;
        amountedRewards.length = 0;
        deprivals.length = 0;
    }

    function depositedBalance(address, uint256)
    public
    view
    returns (int256)
    {
        return _depositedBalance;
    }

    function _setDepositedBalance(int256 depositedBalance)
    public
    returns (int256)
    {
        _depositedBalance = depositedBalance;
    }

    function depositedFractionalBalance(address, uint256, uint256)
    public
    view
    returns (int256)
    {
        return _depositedFractionalBalance;
    }

    function _setDepositedFractionalBalance(int256 depositedFractionalBalance)
    public
    returns (int256)
    {
        _depositedFractionalBalance = depositedFractionalBalance;
    }

    function _fractionalRewardsCount()
    public
    view
    returns (uint256)
    {
        return fractionalRewards.length;
    }

    function _amountedRewardsCount()
    public
    view
    returns (uint256)
    {
        return amountedRewards.length;
    }

    function _deprivalsCount()
    public
    view
    returns (uint256)
    {
        return deprivals.length;
    }

    function rewardByFraction(address wallet, uint256 fraction, uint256 unlockTimeoutInSeconds)
    public
    {
        fractionalRewards.push(FractionalReward(wallet, fraction, unlockTimeoutInSeconds));
        emit RewardByFractionEvent(msg.sender, fraction, unlockTimeoutInSeconds);
    }

    function rewardByAmount(address wallet, int256 amount, address currencyCt, uint256 currencyId, uint256 unlockTimeoutInSeconds)
    public
    {
        amountedRewards.push(AmountedReward(wallet, amount, MonetaryTypesLib.Currency(currencyCt, currencyId), unlockTimeoutInSeconds));
        emit RewardByAmountEvent(msg.sender, amount, currencyCt, currencyId, unlockTimeoutInSeconds);
    }

    function deprive(address wallet, address currencyCt, uint256 currencyId)
    public
    {
        deprivals.push(Deprival(wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)));
        emit DepriveEvent(msg.sender, currencyCt, currencyId);
    }
}