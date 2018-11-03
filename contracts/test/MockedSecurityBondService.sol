/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "../Ownable.sol";
import {SecurityBondable} from "../SecurityBondable.sol";
import {Beneficiary} from "../Beneficiary.sol";

/**
@title MockedSecurityBondService
@notice Mocked implementation of service contract that interacts with SecurityBond
*/
contract MockedSecurityBondService is Ownable, SecurityBondable {

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    //    function stage(address wallet, uint256 fraction)
    //    public
    //    {
    //        securityBond.stage(wallet, fraction);
    //    }

    function stageToBeneficiary(address wallet, Beneficiary beneficiary, uint256 fraction)
    public
    {
        securityBond.stageToBeneficiary(wallet, beneficiary, fraction);
    }

    //    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    //    public
    //    {
    //        securityBond.updateSettledBalance(wallet, amount, currencyCt, currencyId);
    //    }
    //
    //    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    //    public
    //    {
    //        securityBond.stage(wallet, amount, currencyCt, currencyId);
    //    }
    //
    //    function stageToBeneficiaryUntargeted(address sourceWallet, Beneficiary beneficiary, int256 amount,
    //        address currencyCt, uint256 currencyId)
    //    public
    //    {
    //        securityBond.stageToBeneficiaryUntargeted(sourceWallet, beneficiary, amount, currencyCt, currencyId);
    //    }
    //
    //    function seizeAllBalances(address sourceWallet, address targetWallet)
    //    public
    //    {
    //        securityBond.seizeAllBalances(sourceWallet, targetWallet);
    //    }
}