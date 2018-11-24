/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Beneficiary} from "../Beneficiary.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";

/**
@title MockedBeneficiary
@notice Mocked implementation of beneficiary
*/
contract MockedBeneficiary is Beneficiary {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Benefit {
        address wallet;
        string balance;
        MonetaryTypesLib.Figure figure;
        string standard;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Benefit[] public benefits;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        benefits.length = 0;
    }

    function receiveEthersTo(address wallet, string balance)
    public
    payable
    {
        benefits.push(
            Benefit(
                wallet,
                balance,
                MonetaryTypesLib.Figure(
                    int256(msg.value),
                    MonetaryTypesLib.Currency(address(0), 0)
                ),
                ""
            )
        );
    }

    function receiveTokensTo(address wallet, string balance, int256 amount,
        address currencyCt, uint256 currencyId, string standard)
    public
    {
        benefits.push(
            Benefit(
                wallet,
                balance,
                MonetaryTypesLib.Figure(
                    amount,
                    MonetaryTypesLib.Currency(currencyCt, currencyId)
                ),
                standard
            )
        );
    }

    function getBenefit(uint256 index)
    public
    view
    returns (address wallet, string balance, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    {
        wallet = benefits[index].wallet;
        balance = benefits[index].balance;
        amount = benefits[index].figure.amount;
        currencyCt = benefits[index].figure.currency.ct;
        currencyId = benefits[index].figure.currency.id;
        standard = benefits[index].standard;
    }
}