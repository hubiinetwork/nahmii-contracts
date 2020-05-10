/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2020 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {RevenueTokenManager} from "./RevenueTokenManager.sol";
import {BalanceAucCalculator} from "./BalanceAucCalculator.sol";
import {BalanceRecordable} from "./BalanceRecordable.sol";

/**
 * @title ClaimableAmountCalculator
 * @notice Calculator of claimable amount for TokenHolderRevenueFund
 */
contract ClaimableAmountCalculator is Ownable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    RevenueTokenManager public revenueTokenManager;
    BalanceAucCalculator public balanceBlocksCalculator;
    BalanceAucCalculator public releasedAmountBlocksCalculator;

    address[] public nonClaimers;
    mapping(address => uint256) public nonClaimerIndicesByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetRevenueTokenManagerEvent(RevenueTokenManager manager);
    event SetBalanceBlocksCalculatorEvent(BalanceAucCalculator calculator);
    event SetReleasedAmountBlocksCalculatorEvent(BalanceAucCalculator calculator);
    event RegisterNonClaimerEvent(address wallet);
    event DeregisterNonClaimerEvent(address wallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the revenue token manager contract
    /// @param manager The (address of) RevenueTokenManager contract instance
    function setRevenueTokenManager(RevenueTokenManager manager)
    public
    onlyDeployer
    notNullAddress(address(manager))
    {
        // Set new revenue token manager
        revenueTokenManager = manager;

        // Emit event
        emit SetRevenueTokenManagerEvent(manager);
    }

    /// @notice Set the balance AUC calculator for calculation of revenue token balance blocks
    /// @param calculator The balance AUC calculator
    function setBalanceBlocksCalculator(BalanceAucCalculator calculator)
    public
    onlyDeployer
    notNullOrThisAddress(address(calculator))
    {
        // Set the calculator
        balanceBlocksCalculator = calculator;

        // Emit event
        emit SetBalanceBlocksCalculatorEvent(balanceBlocksCalculator);
    }

    /// @notice Set the balance AUC calculator for calculation of revenue token balance blocks
    /// @param calculator The balance AUC calculator
    function setReleasedAmountBlocksCalculator(BalanceAucCalculator calculator)
    public
    onlyDeployer
    notNullOrThisAddress(address(calculator))
    {
        // Set the calculator
        releasedAmountBlocksCalculator = calculator;

        // Emit event
        emit SetReleasedAmountBlocksCalculatorEvent(releasedAmountBlocksCalculator);
    }

    /// @notice Get the number of registered non-claimers
    /// @return The number of registered non-claimers
    function nonClaimersCount()
    public
    view
    returns (uint256)
    {
        return nonClaimers.length;
    }

    /// @notice Gauge whether the given wallet is a registered non-claimer, i.e. prevented from claiming
    /// @param wallet The address of the concerned wallet
    /// @return true if wallet is non-claimer
    function isNonClaimer(address wallet)
    public
    view
    returns (bool)
    {
        return 0 < nonClaimerIndicesByWallet[wallet];
    }

    /// @notice Register the given wallet as a non-claimer that is prevented from claiming
    /// @param wallet The address of the concerned wallet
    function registerNonClaimer(address wallet)
    public
    onlyDeployer
    notNullAddress(wallet)
    {
        // If non-claimer has not been added already...
        if (0 == nonClaimerIndicesByWallet[wallet]) {
            // Add non-claimer
            nonClaimers.push(wallet);
            nonClaimerIndicesByWallet[wallet] = nonClaimers.length;

            // Emit event
            emit RegisterNonClaimerEvent(wallet);
        }
    }

    /// @notice Deregister the given wallet as a non-claimer that is prevented from claiming
    /// @param wallet The address of the concerned wallet
    function deregisterNonClaimer(address wallet)
    public
    onlyDeployer
    notNullAddress(wallet)
    {
        // If non-claimer has been added previously...
        if (0 < nonClaimerIndicesByWallet[wallet]) {
            // Remove non-claimer
            if (nonClaimerIndicesByWallet[wallet] < nonClaimers.length) {
                nonClaimers[nonClaimerIndicesByWallet[wallet].sub(1)] = nonClaimers[nonClaimers.length.sub(1)];
                nonClaimerIndicesByWallet[nonClaimers[nonClaimers.length.sub(1)]] = nonClaimerIndicesByWallet[wallet];
            }
            nonClaimers.length--;
            nonClaimerIndicesByWallet[wallet] = 0;

            // Emit event
            emit DeregisterNonClaimerEvent(wallet);
        }
    }

    /// @notice Calculate the claimable amount from an entire accrual period
    /// @param wallet The concerned wallet
    /// @param accrualAmount The full amount of the accrual period
    /// @param accrualStartBlock The lower accrual period block number boundary
    /// @param accrualEndBlock The upper accrual period block number boundary
    /// @return The calculated claimable amount
    function calculate(address wallet, int256 accrualAmount,
        uint256 accrualStartBlock, uint256 accrualEndBlock)
    public
    view
    returns (int256)
    {
        // Return the claimable amount
        return this.calculate(
            wallet, accrualAmount,
            accrualStartBlock, accrualEndBlock,
            accrualStartBlock, accrualEndBlock
        );
    }

    /// @notice Calculate the claimable amount from an accrual period and a limited block number
    /// window within that accrual period
    /// @param wallet The concerned wallet
    /// @param accrualAmount The full amount of the accrual period
    /// @param accrualStartBlock The lower accrual period block number boundary
    /// @param accrualEndBlock The upper accrual period block number boundary
    /// @param windowStartBlock The lower window block number boundary
    /// @param windowEndBlock The upper window block number boundary
    /// @return The calculated claimable amount
    function calculate(address wallet, int256 accrualAmount,
        uint256 accrualStartBlock, uint256 accrualEndBlock,
        uint256 windowStartBlock, uint256 windowEndBlock)
    public
    view
    returns (int256)
    {
        // Retrieve the released amount blocks
        int256 _releasedAmountBlocks = _correctedReleasedAmountBlocks(
            accrualStartBlock, accrualEndBlock
        );

        // Return 0 if no revenue tokens were released
        if (0 == _releasedAmountBlocks)
            return 0;

        // Retrieve the balance blocks of wallet
        int256 _walletBalanceBlocks = _balanceBlocks(
            wallet, windowStartBlock, windowEndBlock
        );

        // Calculate the scaled claimable amount
        return accrualAmount
        .mul_nn(_walletBalanceBlocks)
        .div_nn(_releasedAmountBlocks);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _balanceBlocks(address wallet, uint256 startBlock, uint256 endBlock)
    private
    view
    returns (int256)
    {
        return int256(balanceBlocksCalculator.calculate(
                BalanceRecordable(address(revenueTokenManager.token())), wallet, startBlock, endBlock
            ));
    }

    function _correctedReleasedAmountBlocks(uint256 startBlock, uint256 endBlock)
    private
    view
    returns (int256)
    {
        // Obtain the released amount blocks
        int256 releasedAmountBlocks = int256(releasedAmountBlocksCalculator.calculate(
                BalanceRecordable(address(revenueTokenManager)), address(0), startBlock, endBlock
            ));

        // Return 0 if no revenue tokens were released
        if (0 == releasedAmountBlocks)
            return 0;

        // Correct the amount blocks by subtracting the contributions from contracts that may not claim
        for (uint256 i = 0; i < nonClaimers.length; i = i.add(1))
            releasedAmountBlocks = releasedAmountBlocks.sub(_balanceBlocks(nonClaimers[i], startBlock, endBlock));

        // Return corrected amount blocks
        return releasedAmountBlocks;
    }
}