/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "../Ownable.sol";
import {SecurityBondable} from "../SecurityBondable.sol";
import {Beneficiary} from "../Beneficiary.sol";

/**
 * @title MockedSecurityBondService
 * @notice Mocked implementation of service contract that interacts with SecurityBond
 */
contract MockedSecurityBondService is Ownable, SecurityBondable {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function rewardFractional(address wallet, uint256 fraction, uint256 unlockTimeoutInSeconds)
    public
    {
        securityBond.rewardFractional(wallet, fraction, unlockTimeoutInSeconds);
    }

    function rewardAbsolute(address wallet, int256 amount, address currencyCt, uint256 currencyId,
        uint256 unlockTimeoutInSeconds)
    public
    {
        securityBond.rewardAbsolute(wallet, amount, currencyCt, currencyId, unlockTimeoutInSeconds);
    }

    function depriveFractional(address wallet)
    public
    {
        securityBond.depriveFractional(wallet);
    }

    function depriveAbsolute(address wallet, address currencyCt, uint256 currencyId)
    public
    {
        securityBond.depriveAbsolute(wallet, currencyCt, currencyId);
    }
}