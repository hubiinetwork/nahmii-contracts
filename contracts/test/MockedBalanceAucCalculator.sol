/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2020 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

pragma experimental ABIEncoderV2;

import {BalanceRecordable} from "../BalanceRecordable.sol";

/**
 * @title MockedBalanceAucCalculator
 * @notice Mocked implementation of balance AUC calculator
 */
contract MockedBalanceAucCalculator {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => mapping(address => uint256)) public _valuesByBalanceRecordableWallet;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public _valuesByBalanceRecordableWalletStartBlock;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function calculate(address balanceRecordable, address wallet, uint256 startBlock, uint256)
    public
    view
    returns (uint256)
    {
        if (0 < _valuesByBalanceRecordableWalletStartBlock[balanceRecordable][wallet][startBlock])
            return _valuesByBalanceRecordableWalletStartBlock[balanceRecordable][wallet][startBlock];
        else
            return _valuesByBalanceRecordableWallet[balanceRecordable][wallet];
    }

    function _setCalculate(address balanceRecordable, address wallet, uint256 value)
    public
    {
        _valuesByBalanceRecordableWallet[balanceRecordable][wallet] = value;
    }

    function _setCalculate(address balanceRecordable, address wallet, uint256 startBlock, uint256 value)
    public
    {
        _valuesByBalanceRecordableWalletStartBlock[balanceRecordable][wallet][startBlock] = value;
    }
}