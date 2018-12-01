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
import {BalanceLib} from "./BalanceLib.sol";
import {BalanceLogLib} from "./BalanceLogLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";

/**
@title Client fund logger
@notice An ownable that logs client fund balances, both singles and totals
*/
contract ClientFundLogger is Ownable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceLib for BalanceLib.Balance;
    using BalanceLogLib for BalanceLogLib.BalanceLog;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Wallet {
        BalanceLogLib.BalanceLog depositedLog;
        BalanceLogLib.BalanceLog activeLog;

        TxHistoryLib.TxHistory txHistory;

        InUseCurrencyLib.InUseCurrency inUseCurrencies;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer)
    public
    {
    }
}