/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {DriipSettlementTypesLib} from "../DriipSettlementTypesLib.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";
import "../Beneficiary.sol";
pragma experimental ABIEncoderV2;

/**
 * @title MockedDriipSettlementState
 * @notice Mocked implementation of driip settlement state contract
 */
contract MockedDriipSettlementState {

    DriipSettlementTypesLib.Settlement[] public settlements;
    uint256 public _maxNonceByWalletAndCurrency;
    uint256 public maxDriipNonce;
    MonetaryTypesLib.NoncedAmount public _totalFee;

    function _reset()
    public
    {
        delete settlements;
        delete _maxNonceByWalletAndCurrency;
        delete maxDriipNonce;
        delete _totalFee;
    }

    function initSettlement(string settledType, bytes32 settledHash, address originWallet,
        uint256 originNonce, address targetWallet, uint256 targetNonce)
    public
    {
        uint256 index = _addSettlementIfNone();
        settlements[index].settledType = settledType;
        settlements[index].settledHash = settledHash;
        settlements[index].origin.nonce = originNonce;
        settlements[index].origin.wallet = originWallet;
        settlements[index].target.nonce = targetNonce;
        settlements[index].target.wallet = targetWallet;
    }

    function settlementsCount()
    public
    view
    returns (uint256)
    {
        return settlements.length;
    }

    function isSettlementRoleDone(address, uint256,
        DriipSettlementTypesLib.SettlementRole settlementRole)
    public
    view
    returns (bool)
    {
        if (0 == settlements.length)
            return false;

        uint256 index = settlements.length - 1;

        if (DriipSettlementTypesLib.SettlementRole.Origin == settlementRole)
            return settlements[index].origin.done;
        else
            return settlements[index].target.done;
    }

    function setSettlementRoleDone(address, uint256,
        DriipSettlementTypesLib.SettlementRole settlementRole,
        bool done)
    public
    {
        uint256 index = _addSettlementIfNone();

        if (DriipSettlementTypesLib.SettlementRole.Origin == settlementRole)
            settlements[index].origin.done = done;
        else
            settlements[index].target.done = done;
    }

    function _addSettlementIfNone()
    public
    returns (uint256)
    {
        return settlements.length > 0 ? settlements.length - 1 : settlements.length++;
    }

    function maxNonceByWalletAndCurrency(address, MonetaryTypesLib.Currency)
    public
    view
    returns (uint256)
    {
        return _maxNonceByWalletAndCurrency;
    }

    function setMaxNonceByWalletAndCurrency(address, MonetaryTypesLib.Currency,
        uint256 maxNonce)
    public
    {
        _maxNonceByWalletAndCurrency = maxNonce;
    }

    function setMaxDriipNonce(uint256 _maxDriipNonce)
    public
    {
        maxDriipNonce = _maxDriipNonce;
    }

    function totalFee(address, Beneficiary, address, MonetaryTypesLib.Currency)
    public
    view
    returns (MonetaryTypesLib.NoncedAmount)
    {
        return _totalFee;
    }

    function setTotalFee(address, Beneficiary, address, MonetaryTypesLib.Currency,
        MonetaryTypesLib.NoncedAmount fee)
    public
    {
        _totalFee = fee;
    }
}