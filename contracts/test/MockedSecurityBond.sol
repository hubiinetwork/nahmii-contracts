/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

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

    struct AbsoluteReward {
        address wallet;
        int256 amount;
        MonetaryTypesLib.Currency currency;
        uint256 unlockTime;
    }

    struct AbsoluteDeprival {
        address wallet;
        MonetaryTypesLib.Currency currency;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    int256 _depositedBalance;
    int256 _depositedFractionalBalance;

    FractionalReward[] public fractionalRewards;
    AbsoluteReward[] public absoluteRewards;
    address[] public fractionalDeprivals;
    AbsoluteDeprival[] public absoluteDeprivals;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RewardFractionalEvent(address wallet, uint256 fraction, uint256 unlockTimeoutInSeconds);
    event RewardAbsoluteEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId,
        uint256 unlockTimeoutInSeconds);
    event DepriveFractionalEvent(address wallet);
    event DepriveAbsoluteEvent(address wallet, address currencyCt, uint256 currencyId);

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
        absoluteRewards.length = 0;
        fractionalDeprivals.length = 0;
        absoluteDeprivals.length = 0;
    }

    function depositedBalance(address, uint256)
    public
    view
    returns (int256)
    {
        return _depositedBalance;
    }

    function _setDepositedBalance(int256 balance)
    public
    returns (int256)
    {
        _depositedBalance = balance;
    }

    function depositedFractionalBalance(address, uint256, uint256)
    public
    view
    returns (int256)
    {
        return _depositedFractionalBalance;
    }

    function _setDepositedFractionalBalance(int256 balance)
    public
    returns (int256)
    {
        _depositedFractionalBalance = balance;
    }

    function _fractionalRewardsCount()
    public
    view
    returns (uint256)
    {
        return fractionalRewards.length;
    }

    function _absoluteRewardsCount()
    public
    view
    returns (uint256)
    {
        return absoluteRewards.length;
    }

    function _fractionalDeprivalsCount()
    public
    view
    returns (uint256)
    {
        return fractionalDeprivals.length;
    }

    function _absoluteDeprivalsCount()
    public
    view
    returns (uint256)
    {
        return absoluteDeprivals.length;
    }

    function rewardFractional(address wallet, uint256 fraction, uint256 unlockTimeoutInSeconds)
    public
    {
        fractionalRewards.push(
            FractionalReward(wallet, fraction, unlockTimeoutInSeconds)
        );
        emit RewardFractionalEvent(msg.sender, fraction, unlockTimeoutInSeconds);
    }

    function rewardAbsolute(address wallet, int256 amount, address currencyCt, uint256 currencyId,
        uint256 unlockTimeoutInSeconds)
    public
    {
        absoluteRewards.push(
            AbsoluteReward(wallet, amount, MonetaryTypesLib.Currency(currencyCt, currencyId), unlockTimeoutInSeconds)
        );
        emit RewardAbsoluteEvent(msg.sender, amount, currencyCt, currencyId, unlockTimeoutInSeconds);
    }

    function depriveFractional(address wallet)
    public
    {
        fractionalDeprivals.push(wallet);
        emit DepriveFractionalEvent(msg.sender);
    }

    function depriveAbsolute(address wallet, address currencyCt, uint256 currencyId)
    public
    {
        absoluteDeprivals.push(AbsoluteDeprival(wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)));
        emit DepriveAbsoluteEvent(msg.sender, currencyCt, currencyId);
    }
}