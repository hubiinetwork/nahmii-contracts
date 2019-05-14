/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {FraudChallenge} from "../FraudChallenge.sol";

/**
 * @title MockedFraudChallenge
 * @notice Mocked implementation of fraud challenge contract
 */
contract MockedFraudChallenge is FraudChallenge {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) public FraudChallenge(owner) {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        uint256 i;
        for (i = 0; i < fraudulentOrderHashes.length; i++)
            fraudulentByOrderHash[fraudulentOrderHashes[i]] = false;
        fraudulentOrderHashes.length = 0;
        for (i = 0; i < fraudulentTradeHashes.length; i++)
            fraudulentByTradeHash[fraudulentTradeHashes[i]] = false;
        fraudulentTradeHashes.length = 0;
        for (i = 0; i < fraudulentPaymentHashes.length; i++)
            fraudulentByPaymentHash[fraudulentPaymentHashes[i]] = false;
        fraudulentPaymentHashes.length = 0;
        for (i = 0; i < doubleSpenderWallets.length; i++)
            doubleSpenderByWallet[doubleSpenderWallets[i]] = false;
        doubleSpenderWallets.length = 0;
    }

    function addFraudulentOrderHash(bytes32 hash)
    public
    {
        fraudulentOrderHashes.push(hash);
        fraudulentByOrderHash[hash] = true;
        emit AddFraudulentOrderHashEvent(hash);
    }

    function addFraudulentTradeHash(bytes32 hash)
    public
    {
        fraudulentTradeHashes.push(hash);
        fraudulentByTradeHash[hash] = true;
        emit AddFraudulentTradeHashEvent(hash);
    }

    function addFraudulentPaymentHash(bytes32 hash)
    public
    {
        fraudulentPaymentHashes.push(hash);
        fraudulentByPaymentHash[hash] = true;
        emit AddFraudulentPaymentHashEvent(hash);
    }

    function addDoubleSpenderWallet(address wallet)
    public
    {
        doubleSpenderWallets.push(wallet);
        doubleSpenderByWallet[wallet] = true;
        emit AddDoubleSpenderWalletEvent(wallet);
    }
}
