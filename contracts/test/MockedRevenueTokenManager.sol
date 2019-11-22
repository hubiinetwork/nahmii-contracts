/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {IERC20} from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockedRevenueTokenManager
 * @notice Mocked implementation of RevenueTokenManager
 */
contract MockedRevenueTokenManager {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    IERC20 public token;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _setToken(IERC20 _token)
    public
    {
        token = _token;
    }
}
