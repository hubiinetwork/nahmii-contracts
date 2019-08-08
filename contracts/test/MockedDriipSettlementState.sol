/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {DriipSettlementTypesLib} from "../DriipSettlementTypesLib.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";
import {Beneficiary} from "../Beneficiary.sol";
import {SafeMathUintLib} from "../SafeMathUintLib.sol";

/**
 * @title MockedDriipSettlementState
 * @notice Mocked implementation of driip settlement state contract
 */
contract MockedDriipSettlementState {
    using SafeMathUintLib for uint256;

    DriipSettlementTypesLib.Settlement[] public settlements;
    uint256 public _maxNonceByWalletAndCurrency;
    uint256 public maxDriipNonce;
    int256 public _settledAmount;
    MonetaryTypesLib.NoncedAmount public _totalFee;

    function _reset()
    public
    {
        delete settlements;
        delete _maxNonceByWalletAndCurrency;
        delete maxDriipNonce;
        delete _settledAmount;
        delete _totalFee;
    }

    function settlementsCount()
    public
    view
    returns (uint256)
    {
        return settlements.length;
    }

    function initSettlement(string memory settledKind, bytes32 settledHash, address originWallet,
        uint256 originNonce, address targetWallet, uint256 targetNonce)
    public
    {
        uint256 index = _addSettlementIfNone();
        settlements[index].settledKind = settledKind;
        settlements[index].settledHash = settledHash;
        settlements[index].origin.nonce = originNonce;
        settlements[index].origin.wallet = originWallet;
        settlements[index].target.nonce = targetNonce;
        settlements[index].target.wallet = targetWallet;
    }

    function completeSettlement(address, uint256,
        DriipSettlementTypesLib.SettlementRole settlementRole,
        bool done)
    public
    {
        uint256 index = _addSettlementIfNone();

        DriipSettlementTypesLib.SettlementParty storage settlementParty =
        DriipSettlementTypesLib.SettlementRole.Origin == settlementRole ?
        settlements[index].origin :
        settlements[index].target;

        settlementParty.doneBlockNumber = done ? block.number : 0;
    }

    function isSettlementPartyDone(address, uint256)
    public
    view
    returns (bool)
    {
        if (0 == settlements.length)
            return false;

        uint256 index = settlements.length - 1;

        return (0 != settlements[index - 1].origin.doneBlockNumber || 0 != settlements[index - 1].target.doneBlockNumber);
    }

    function isSettlementPartyDone(address, uint256,
        DriipSettlementTypesLib.SettlementRole settlementRole)
    public
    view
    returns (bool)
    {
        if (0 == settlements.length)
            return false;

        uint256 index = settlements.length - 1;

        if (DriipSettlementTypesLib.SettlementRole.Origin == settlementRole)
            return 0 != settlements[index].origin.doneBlockNumber;
        else
            return 0 != settlements[index].target.doneBlockNumber;
    }

    function _setSettlementPartyDone(DriipSettlementTypesLib.SettlementRole settlementRole, bool done)
    public
    {
        require(0 < settlements.length);

        uint256 index = settlements.length - 1;

        if (DriipSettlementTypesLib.SettlementRole.Origin == settlementRole)
            settlements[index].origin.doneBlockNumber = done ? block.number : 0;
        else
            settlements[index].target.doneBlockNumber = done ? block.number : 0;
    }

    function settlementPartyDoneBlockNumber(address, uint256)
    public
    view
    returns (uint256)
    {
        require(0 < settlements.length);

        uint256 index = settlements.length - 1;

        return settlements[index].origin.doneBlockNumber.clampMin(settlements[index].target.doneBlockNumber);
    }

    function settlementPartyDoneBlockNumber(address, uint256,
        DriipSettlementTypesLib.SettlementRole settlementRole)
    public
    view
    returns (uint256)
    {
        require(0 < settlements.length);

        uint256 index = settlements.length - 1;

        if (DriipSettlementTypesLib.SettlementRole.Origin == settlementRole)
            return settlements[index].origin.doneBlockNumber;
        else
            return settlements[index].target.doneBlockNumber;
    }

    function _setSettlementPartyDoneBlockNumber(DriipSettlementTypesLib.SettlementRole settlementRole, uint256 doneBlockNumber)
    public
    {
        require(0 < settlements.length);

        uint256 index = settlements.length - 1;

        if (DriipSettlementTypesLib.SettlementRole.Origin == settlementRole)
            settlements[index].origin.doneBlockNumber = doneBlockNumber;
        else
            settlements[index].target.doneBlockNumber = doneBlockNumber;
    }

    function _addSettlementIfNone()
    public
    returns (uint256)
    {
        return settlements.length > 0 ? settlements.length - 1 : settlements.length++;
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

    function setMaxDriipNonce(uint256 _maxDriipNonce)
    public
    {
        maxDriipNonce = _maxDriipNonce;
    }

    function settledAmountByBlockNumber(address, MonetaryTypesLib.Currency memory, uint256)
    public
    view
    returns (int256) {
        return _settledAmount;
    }

    function addSettledAmountByBlockNumber(address, int256 amount, MonetaryTypesLib.Currency memory, uint256)
    public
    {
        _settledAmount += amount;
    }

    function totalFee(address, Beneficiary, address, MonetaryTypesLib.Currency memory)
    public
    view
    returns (MonetaryTypesLib.NoncedAmount memory)
    {
        return _totalFee;
    }

    function setTotalFee(address, Beneficiary, address, MonetaryTypesLib.Currency memory,
        MonetaryTypesLib.NoncedAmount memory fee)
    public
    {
        _totalFee = fee;
    }
}