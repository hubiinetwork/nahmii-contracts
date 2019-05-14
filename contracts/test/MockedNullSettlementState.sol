/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";
pragma experimental ABIEncoderV2;

/**
 * @title MockedNullSettlementState
 * @notice Mocked implementation of null settlement state contract
 */
contract MockedNullSettlementState {

    uint256 public _maxNonceByWalletAndCurrency;
    uint256 public maxNullNonce;

    function _reset()
    public
    {
        delete _maxNonceByWalletAndCurrency;
        delete maxNullNonce;
    }

    function maxNonceByWalletAndCurrency(address, MonetaryTypesLib.Currency memory)
    public
    view
    returns (uint256)
    {
        return _maxNonceByWalletAndCurrency;
    }

    function setMaxNonceByWalletAndCurrency(address, MonetaryTypesLib.Currency memory,
        uint256 maxNonce)
    public
    {
        _maxNonceByWalletAndCurrency = maxNonce;
    }

    function setMaxNullNonce(uint256 _maxNullNonce)
    public
    {
        maxNullNonce = _maxNullNonce;
    }
}