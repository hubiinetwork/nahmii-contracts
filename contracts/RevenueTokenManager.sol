/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {TokenMultiTimelock} from "./TokenMultiTimelock.sol";
import {RevenueToken} from "./RevenueToken.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {BalanceAucCalculator} from "./BalanceAucCalculator.sol";
import {BalanceRecordable} from "./BalanceRecordable.sol";

/**
 * @title RevenueTokenManager
 * @notice An token multi-timelock that supports the calculation of balance blocks
 * of the underlying revenue token as well as amount blocks from its own released amount
 */
contract RevenueTokenManager is TokenMultiTimelock, BalanceRecordable {
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    BalanceAucCalculator public balanceBlocksCalculator;
    BalanceAucCalculator public releasedAmountBlocksCalculator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetBalanceBlocksCalculatorEvent(BalanceAucCalculator calculator);
    event SetReleasedAmountBlocksCalculatorEvent(BalanceAucCalculator calculator);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer)
    public
    TokenMultiTimelock(deployer)
    {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
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

    /// @notice Calculate the wallet's balance blocks, i.e. the area under the curve (AUC) of
    /// wallet's balance as function of block number, in the given range of block numbers
    /// @param wallet The concerned wallet
    /// @param startBlock The start block number considered
    /// @param endBlock The end block number considered
    /// @return The calculated AUC
    function balanceBlocksIn(address wallet, uint256 startBlock, uint256 endBlock)
    public
    view
    returns (uint256)
    {
        return balanceBlocksCalculator.calculate(
            BalanceRecordable(address(token)), wallet, startBlock, endBlock
        );
    }

    /// @notice Calculate the released amount blocks, i.e. the area under the curve (AUC) of
    /// released amount as function of block number
    /// @param startBlock The start block number considered
    /// @param endBlock The end block number considered
    /// @return The calculated AUC
    function releasedAmountBlocksIn(uint256 startBlock, uint256 endBlock)
    public
    view
    returns (uint256)
    {
        return releasedAmountBlocksCalculator.calculate(
            BalanceRecordable(address(this)), address(0), startBlock, endBlock
        );
    }

    /// @notice Get the count of executed releases
    /// @return The count of executed releases
    function balanceRecordsCount(address)
    external
    view
    returns (uint256)
    {
        return executedReleasesCount;
    }

    /// @notice Get the total amount for the given release index
    /// @param index The concerned index
    /// @return The release total amount
    function recordBalance(address, uint256 index)
    external
    view
    returns (uint256)
    {
        return releases[index].totalAmount;
    }

    /// @notice Get the release block number for the given release index
    /// @param index The concerned index
    /// @return The release block number
    function recordBlockNumber(address, uint256 index)
    external
    view
    returns (uint256)
    {
        return releases[index].blockNumber;
    }

    /// @notice Get the index of the release containing the given block number,
    /// or -1 if the given block number is below the smallest release block number
    /// @param blockNumber The concerned block number
    /// @return The release index
    function recordIndexByBlockNumber(address, uint256 blockNumber)
    external
    view
    returns (int256)
    {
        return releaseIndexByBlockNumber(blockNumber);
    }
}