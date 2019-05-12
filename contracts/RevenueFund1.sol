/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {RevenueFund} from "./RevenueFund.sol";

/**
 * @title RevenueFund1
 * @notice The first indexed descendant of RevenueFund
 */
contract RevenueFund1 is RevenueFund {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) RevenueFund(deployer) public {
    }
}
