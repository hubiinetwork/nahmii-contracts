/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

pragma experimental ABIEncoderV2;

import {BalanceRecordable} from "../BalanceRecordable.sol";

/**
 * @title MockedAucCalculator
 * @notice Mocked implementation of balance AUC calculator
 */
contract MockedAucCalculator {
    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function calculate(BalanceRecordable balanceRecordable, address wallet, uint256 startBlock, uint256 endBlock)
    public
    view
    returns (uint256)
    {
        // Test that contract implementing the BalanceRecordable interface has been called
        balanceRecordable.balanceRecordsCount(wallet);
        //        balanceRecordable.recordBalance(wallet, 0);
        //        balanceRecordable.recordBlockNumber(wallet, 0);
        balanceRecordable.recordIndexByBlockNumber(wallet, startBlock);

        return endBlock - startBlock;
    }
}