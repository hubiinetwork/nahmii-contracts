/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Beneficiary} from "../Beneficiary.sol";
import {MonetaryTypes} from "../MonetaryTypes.sol";

/**
@title MockedBeneficiary
@notice Mocked implementation of beneficiary
*/
contract MockedBeneficiary is Beneficiary {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Deposit {
        address wallet;
        MonetaryTypes.Figure figure;
        string standard;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Deposit[] public deposits;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        deposits.length = 0;
    }

    function depositEthersTo(address wallet) public payable {
        deposits.push(
            Deposit(
                wallet,
                MonetaryTypes.Figure(
                    int256(msg.value),
                    MonetaryTypes.Currency(address(0), 0)
                ),
                "ether"
            )
        );
    }

    //NOTE: 'wallet' must call currency's approve first
    function depositTokensTo(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        deposits.push(
            Deposit(
                wallet,
                MonetaryTypes.Figure(
                    amount,
                    MonetaryTypes.Currency(currencyCt, currencyId)
                ),
                standard
            )
        );
    }

    function getDeposit(uint256 index)
    public
    view
    returns (address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard)
    {
        wallet = deposits[index].wallet;
        amount = deposits[index].figure.amount;
        currencyCt = deposits[index].figure.currency.ct;
        currencyId = deposits[index].figure.currency.id;
        standard = deposits[index].standard;
    }
}