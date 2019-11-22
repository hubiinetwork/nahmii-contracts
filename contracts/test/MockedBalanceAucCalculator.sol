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
 * @title MockedBalanceAucCalculator
 * @notice Mocked implementation of balance AUC calculator
 */
contract MockedBalanceAucCalculator {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => uint256) public _valuesByWallet;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function calculate(BalanceRecordable, address wallet, uint256, uint256)
    public
    view
    returns (uint256)
    {
        return _valuesByWallet[wallet];
    }

    function _setCalculate(address wallet, uint256 value)
    public
    {
        _valuesByWallet[wallet] = value;
    }
}