/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "../Ownable.sol";
import {AccessorManageable} from "../AccessorManageable.sol";
import {ClientFundable} from "../ClientFundable.sol";
import {Beneficiary} from "../Beneficiary.sol";

/**
@title MockedClientFundService
@notice Mocked implementation of service contract that interacts with ClientFund
*/
contract MockedClientFundService is Ownable, AccessorManageable, ClientFundable {

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccessorManageable(accessorManager) public {
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