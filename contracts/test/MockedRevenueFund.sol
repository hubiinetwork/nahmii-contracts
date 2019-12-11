/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {AccrualBeneficiary} from "../AccrualBeneficiary.sol";

/**
 * @title MockedRevenueFund
 * @notice Mocked implementation of RevenueFund
 */
contract MockedRevenueFund {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => mapping(uint256 => int256)) public _periodAccrualBalancesByCurrency;
    mapping(address => int256) public _beneficiaryFractionsByBeneficiary;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function periodAccrualBalance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return _periodAccrualBalancesByCurrency[currencyCt][currencyId];
    }

    function _setPeriodAccrualBalance(address currencyCt, uint256 currencyId,
        int256 _periodAccrualBalance)
    public
    {
        _periodAccrualBalancesByCurrency[currencyCt][currencyId] = _periodAccrualBalance;
    }

    function beneficiaryFraction(address beneficiary)
    public
    view
    returns (int256)
    {
        return _beneficiaryFractionsByBeneficiary[beneficiary];
    }

    function _setBeneficiaryFraction(address beneficiary, int256 _beneficiaryFraction)
    public
    {
        _beneficiaryFractionsByBeneficiary[beneficiary] = _beneficiaryFraction;
    }
}