/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

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
    constructor(address owner) public Ownable(owner) {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function updateSettledBalanceInClientFund(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        clientFund.updateSettledBalance(wallet, amount, currencyCt, currencyId);
    }

    function stageInClientFund(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        clientFund.stage(wallet, amount, currencyCt, currencyId);
    }

    function stageToBeneficiaryUntargetedInClientFund(address sourceWallet, Beneficiary beneficiary, int256 amount,
        address currencyCt, uint256 currencyId)
    public
    {
        clientFund.stageToBeneficiaryUntargeted(sourceWallet, beneficiary, amount, currencyCt, currencyId);
    }

    function seizeAllBalancesInClientFund(address sourceWallet, address targetWallet)
    public
    {
        clientFund.seizeAllBalances(sourceWallet, targetWallet);
    }
}