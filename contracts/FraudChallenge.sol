/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {DriipStorable} from "./DriipStorable.sol";
import {Servable} from "./Servable.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title FraudChallenge
@notice Where fraud challenge results are found
*/
contract FraudChallenge is Ownable, DriipStorable, Servable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    string constant public ADD_SEIZED_WALLET_ACTION = "add_seized_wallet";
    string constant public ADD_DOUBLE_SPENDER_WALLET_ACTION = "add_double_spender_wallet";
    string constant public ADD_FRAUDULENT_ORDER_ACTION = "add_fraudulent_order";
    string constant public ADD_FRAUDULENT_TRADE_ACTION = "add_fraudulent_trade";
    string constant public ADD_FRAUDULENT_PAYMENT_ACTION = "add_fraudulent_payment";

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    address[] public doubleSpenderWallets;
    mapping(address => bool) public doubleSpenderWalletsMap;

    bytes32[] public fraudulentOrderHashes;
    mapping(bytes32 => bool) public fraudulentOrderHashMap;

    bytes32[] public fraudulentTradeHashes;
    mapping(bytes32 => bool) public fraudulentTradeHashMap;

    bytes32[] public fraudulentPaymentHashes;
    mapping(bytes32 => bool) public fraudulentPaymentHashMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event AddSeizedWalletEvent(address wallet);
    event AddDoubleSpenderWalletEvent(address wallet);
    event AddFraudulentOrderHashEvent(bytes32 hash);
    event AddFraudulentTradeHashEvent(bytes32 hash);
    event AddFraudulentPaymentHashEvent(bytes32 hash);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Get the seized status of given wallet
    /// @param wallet The wallet address for which to check seized status
    /// @return true if wallet is seized, false otherwise
    function isSeizedWallet(address wallet) public view returns (bool) {
        return seizedWalletsMap[wallet];
    }

    /// @notice Get the number of wallets whose funds have be seized
    /// @return Number of seized wallets
    function seizedWalletsCount() public view returns (uint256) {
        return seizedWallets.length;
    }

    /// @notice Add given wallet to store of seized wallets if not already present
    /// @param wallet The seized wallet
    function addSeizedWallet(address wallet) public onlyDeployerOrEnabledServiceAction(ADD_SEIZED_WALLET_ACTION) {
        if (!seizedWalletsMap[wallet]) {
            seizedWallets.push(wallet);
            seizedWalletsMap[wallet] = true;
            emit AddSeizedWalletEvent(wallet);
        }
    }

    /// @notice Get the double spender status of given wallet
    /// @param wallet The wallet address for which to check double spender status
    /// @return true if wallet is double spender, false otherwise
    function isDoubleSpenderWallet(address wallet) public view returns (bool) {
        return doubleSpenderWalletsMap[wallet];
    }

    /// @notice Get the number of wallets tagged as double spenders
    /// @return Number of double spender wallets
    function doubleSpenderWalletsCount() public view returns (uint256) {
        return doubleSpenderWallets.length;
    }

    /// @notice Add given wallets to store of double spender wallets if not already present
    /// @param wallet The first wallet to add
    function addDoubleSpenderWallet(address wallet) public onlyDeployerOrEnabledServiceAction(ADD_DOUBLE_SPENDER_WALLET_ACTION) {
        if (!doubleSpenderWalletsMap[wallet]) {
            doubleSpenderWallets.push(wallet);
            doubleSpenderWalletsMap[wallet] = true;
            emit AddDoubleSpenderWalletEvent(wallet);
        }
    }

    /// @notice Get the number of fraudulent order hashes
    function fraudulentOrderHashesCount() public view returns (uint256) {
        return fraudulentOrderHashes.length;
    }

    /// @notice Get the state about whether the given hash equals the hash of a fraudulent order
    /// @param hash The hash to be tested
    function isFraudulentOrderHash(bytes32 hash) public view returns (bool) {
        return fraudulentOrderHashMap[hash];
    }

    /// @notice Add given order hash to store of fraudulent order hashes if not already present
    function addFraudulentOrderHash(bytes32 hash)
    public
    onlyDeployerOrEnabledServiceAction(ADD_FRAUDULENT_ORDER_ACTION)
    {
        if (!fraudulentOrderHashMap[hash]) {
            fraudulentOrderHashMap[hash] = true;
            fraudulentOrderHashes.push(hash);
            emit AddFraudulentOrderHashEvent(hash);
        }
    }

    /// @notice Get the number of fraudulent trade hashes
    function fraudulentTradeHashesCount() public view returns (uint256) {
        return fraudulentTradeHashes.length;
    }

    /// @notice Get the state about whether the given hash equals the hash of a fraudulent trade
    /// @param hash The hash to be tested
    /// @return true if hash is the one of a fraudulent trade, else false
    function isFraudulentTradeHash(bytes32 hash) public view returns (bool) {
        return fraudulentTradeHashMap[hash];
    }

    /// @notice Add given trade hash to store of fraudulent trade hashes if not already present
    function addFraudulentTradeHash(bytes32 hash)
    public
    onlyDeployerOrEnabledServiceAction(ADD_FRAUDULENT_TRADE_ACTION)
    {
        if (!fraudulentTradeHashMap[hash]) {
            fraudulentTradeHashMap[hash] = true;
            fraudulentTradeHashes.push(hash);
            emit AddFraudulentTradeHashEvent(hash);
        }
    }

    /// @notice Get the number of fraudulent payment hashes
    function fraudulentPaymentHashesCount() public view returns (uint256) {
        return fraudulentPaymentHashes.length;
    }

    /// @notice Get the state about whether the given hash equals the hash of a fraudulent payment
    /// @param hash The hash to be tested
    /// @return true if hash is the one of a fraudulent payment, else null
    function isFraudulentPaymentHash(bytes32 hash) public view returns (bool) {
        return fraudulentPaymentHashMap[hash];
    }

    /// @notice Add given payment hash to store of fraudulent payment hashes if not already present
    function addFraudulentPaymentHash(bytes32 hash)
    public
    onlyDeployerOrEnabledServiceAction(ADD_FRAUDULENT_PAYMENT_ACTION)
    {
        if (!fraudulentPaymentHashMap[hash]) {
            fraudulentPaymentHashMap[hash] = true;
            fraudulentPaymentHashes.push(hash);
            emit AddFraudulentPaymentHashEvent(hash);
        }
    }
}