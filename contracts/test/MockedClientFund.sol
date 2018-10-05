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
        address destination;
    }

    struct WalletUpdate {
        address wallet;
        MonetaryTypes.Figure figure;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Seizure[] public seizures;
    WalletUpdate[] public updateSettledBalances;
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
        updateSettledBalances.length = 0;
        stages.length = 0;
    }

    function seizeAllBalances(address sourceWallet, address destinationWallet)
    public
    {
        seizures.push(Seizure(sourceWallet, destinationWallet));
        emit SeizeAllBalancesEvent(sourceWallet, destinationWallet);
    }

    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        updateSettledBalances.push(
            WalletUpdate(
                wallet,
                MonetaryTypes.Figure(
                    amount,
                    MonetaryTypes.Currency(currencyCt, currencyId)
                )
            )
        );
        emit UpdateSettledBalanceEvent(wallet, amount, currencyCt, currencyId);
    }

    function getUpdateSettledBalance(uint256 index) public view returns (address, int256, address, uint256) {
        return (
        updateSettledBalances[index].wallet,
        updateSettledBalances[index].figure.amount,
        updateSettledBalances[index].figure.currency.ct,
        updateSettledBalances[index].figure.currency.id
        );
    }

    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        stages.push(
            WalletUpdate(
                wallet,
                MonetaryTypes.Figure(
                    amount,
                    MonetaryTypes.Currency(currencyCt, currencyId)
                )
            )
        );
        emit StageEvent(wallet, amount, currencyCt, currencyId);
    }
}