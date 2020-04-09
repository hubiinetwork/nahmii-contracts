/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2020 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Beneficiary} from "../Beneficiary.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";

/**
 * @title MockedTokenHolderRevenueFund
 * @notice Mocked implementation of TokenHolderRevenueFund
 */
contract MockedTokenHolderRevenueFund /*is Beneficiary*/ {
    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct ClaimTransfer {
        Beneficiary beneficiary;
        address destWallet;
        string balanceType;
        MonetaryTypesLib.Currency currency;
        string standard;
    }

    struct Accrual {
        uint256 startBlock;
        uint256 endBlock;
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    ClaimTransfer[] public _claimTransfers;
    mapping(address => mapping(uint256 => Accrual[])) public _closedAccrualsByCurrency;
    address[] public nonClaimers;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function claimAndTransferToBeneficiary(Beneficiary beneficiary, address destWallet, string memory balanceType,
        address currencyCt, uint256 currencyId, string memory standard)
    public
    {
        _claimTransfers.push(
            ClaimTransfer(
                beneficiary, destWallet, balanceType, MonetaryTypesLib.Currency(currencyCt, currencyId), standard
            )
        );
    }

    function _getClaimTransfer(uint256 index)
    public
    view
    returns (Beneficiary beneficiary, address destWallet, string memory balanceType,
        address currencyCt, uint256 currencyId, string memory standard)
    {
        beneficiary = _claimTransfers[index].beneficiary;
        destWallet = _claimTransfers[index].destWallet;
        balanceType = _claimTransfers[index].balanceType;
        currencyCt = _claimTransfers[index].currency.ct;
        currencyId = _claimTransfers[index].currency.id;
        standard = _claimTransfers[index].standard;
    }

    function closedAccrualsCount(address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return _closedAccrualsByCurrency[currencyCt][currencyId].length;
    }

    function closedAccrualsByCurrency(address currencyCt, uint256 currencyId,
        uint256 index)
    public
    view
    returns (Accrual memory)
    {
        return _closedAccrualsByCurrency[currencyCt][currencyId][index];
    }

    function _setClosedAccrualByCurrency(address currencyCt, uint256 currencyId,
        Accrual memory accrual)
    public
    {
        _closedAccrualsByCurrency[currencyCt][currencyId].push(accrual);
    }

    function nonClaimersCount()
    public
    view
    returns (uint256)
    {
        return nonClaimers.length;
    }

    function _setNonClaimer(address nonClaimer)
    public
    {
        nonClaimers.push(nonClaimer);
    }
}