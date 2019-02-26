/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Servable} from "./Servable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";

/**
 * @title NullSettlementState
 * @notice Where null settlement state is managed
 */
contract NullSettlementState is Ownable, Servable, CommunityVotable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public SET_MAX_NULL_NONCE_ACTION = "set_max_null_nonce";
    string constant public SET_MAX_NONCE_WALLET_CURRENCY_ACTION = "set_max_nonce_wallet_currency";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public maxNullNonce;

    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxNonce;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetMaxNullNonceEvent(uint256 maxNullNonce);
    event SetMaxNonceByWalletAndCurrencyEvent(address wallet, MonetaryTypesLib.Currency currency,
        uint256 maxNullNonce);
    event UpdateMaxNullNonceEvent(uint256 maxDriipNonce);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the max null nonce
    /// @param _maxNullNonce The max nonce
    function setMaxNullNonce(uint256 _maxNullNonce)
    public
    onlyEnabledServiceAction(SET_MAX_NULL_NONCE_ACTION)
    {
        maxNullNonce = _maxNullNonce;

        // Emit event
        emit SetMaxNullNonceEvent(_maxNullNonce);
    }

    /// @notice Get the max null nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The max nonce
    function maxNonceByWalletAndCurrency(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (uint256) {
        return walletCurrencyMaxNonce[wallet][currency.ct][currency.id];
    }

    /// @notice Set the max null nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @param _maxNullNonce The max nonce
    function setMaxNonceByWalletAndCurrency(address wallet, MonetaryTypesLib.Currency currency,
        uint256 _maxNullNonce)
    public
    onlyEnabledServiceAction(SET_MAX_NONCE_WALLET_CURRENCY_ACTION)
    {
        walletCurrencyMaxNonce[wallet][currency.ct][currency.id] = _maxNullNonce;

        // Emit event
        emit SetMaxNonceByWalletAndCurrencyEvent(wallet, currency, _maxNullNonce);
    }

    /// @notice Update the max null settlement nonce property from CommunityVote contract
    function updateMaxNullNonce()
    public
    {
        uint256 _maxNullNonce = communityVote.getMaxNullNonce();
        if (0 == _maxNullNonce)
            return;

        maxNullNonce = _maxNullNonce;

        // Emit event
        emit UpdateMaxNullNonceEvent(maxNullNonce);
    }
}