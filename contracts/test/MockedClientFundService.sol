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
import {ClientFundable} from "../ClientFundable.sol";
import {Beneficiary} from "../Beneficiary.sol";

/**
@title MockedClientFundService
@notice Mocked implementation of service contract that interacts with ClientFund
*/
contract MockedClientFundService is Ownable, ClientFundable {

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        clientFund.updateSettledBalance(wallet, amount, currencyCt, currencyId);
    }

    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        clientFund.stage(wallet, amount, currencyCt, currencyId);
    }

    function stageToBeneficiaryUntargeted(address sourceWallet, Beneficiary beneficiary, int256 amount,
        address currencyCt, uint256 currencyId)
    public
    {
        clientFund.stageToBeneficiaryUntargeted(sourceWallet, beneficiary, amount, currencyCt, currencyId);
    }

    function seizeAllBalances(address sourceWallet, address targetWallet)
    public
    {
        clientFund.seizeAllBalances(sourceWallet, targetWallet);
    }
}