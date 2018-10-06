/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

//import {ClientFund} from "../ClientFund.sol";
import {MonetaryTypes} from "../MonetaryTypes.sol";
import {Beneficiary} from "../Beneficiary.sol";

/**
@title MockedClientFund
@notice Mocked implementation of client fund contract
*/
contract MockedClientFund /*is ClientFund*/ {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Seizure {
        address source;
        address target;
    }

    struct WalletUpdate {
        address sourceWallet;
        address targetWallet;
        MonetaryTypes.Figure figure;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Seizure[] public seizures;
    WalletUpdate[] public settledBalanceUpdates;
    WalletUpdate[] public stages;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SeizeAllBalancesEvent(address sourceWallet, address targetWallet);
    event UpdateSettledBalanceEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event StageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*ClientFund(owner)*/ {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        seizures.length = 0;
        settledBalanceUpdates.length = 0;
        stages.length = 0;
    }

    function seizeAllBalances(address sourceWallet, address targetWallet)
    public
    {
        seizures.push(Seizure(sourceWallet, targetWallet));
        emit SeizeAllBalancesEvent(sourceWallet, targetWallet);
    }

    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        settledBalanceUpdates.push(
            WalletUpdate(
                wallet,
                address(0),
                MonetaryTypes.Figure(
                    amount,
                    MonetaryTypes.Currency(currencyCt, currencyId)
                )
            )
        );
        emit UpdateSettledBalanceEvent(wallet, amount, currencyCt, currencyId);
    }

    function _settledBalanceUpdates(uint256 index)
    public
    view
    returns (address, int256, address, uint256) {
        return (
        settledBalanceUpdates[index].sourceWallet,
        settledBalanceUpdates[index].figure.amount,
        settledBalanceUpdates[index].figure.currency.ct,
        settledBalanceUpdates[index].figure.currency.id
        );
    }

    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        stages.push(
            WalletUpdate(
                wallet,
                address(0),
                MonetaryTypes.Figure(
                    amount,
                    MonetaryTypes.Currency(currencyCt, currencyId)
                )
            )
        );
        emit StageEvent(wallet, amount, currencyCt, currencyId);
    }

    function stageToBeneficiaryUntargeted(address sourceWallet, Beneficiary beneficiary, int256 amount,
        address currencyCt, uint256 currencyId)
    public
    {
        stages.push(
            WalletUpdate(
                sourceWallet,
                address(beneficiary),
                MonetaryTypes.Figure(
                    amount,
                    MonetaryTypes.Currency(currencyCt, currencyId)
                )
            )
        );
    }
}