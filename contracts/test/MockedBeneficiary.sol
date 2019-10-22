/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Beneficiary} from "../Beneficiary.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";
import {IERC20} from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockedBeneficiary
 * @notice Mocked implementation of beneficiary
 */
contract MockedBeneficiary is Beneficiary {
    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Benefit {
        address wallet;
        string balanceType;
        MonetaryTypesLib.Figure figure;
        string standard;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Benefit[] public _benefits;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        _benefits.length = 0;
    }

    function receiveEthersTo(address wallet, string memory balanceType)
    public
    payable
    {
        _benefits.push(
            Benefit(
                wallet,
                balanceType,
                MonetaryTypesLib.Figure(
                    int256(msg.value),
                    MonetaryTypesLib.Currency(address(0), 0)
                ),
                ""
            )
        );
    }

    function receiveTokensTo(address wallet, string memory balanceType, int256 amount,
        address currencyCt, uint256 currencyId, string memory standard)
    public
    {
        _benefits.push(
            Benefit(
                wallet,
                balanceType,
                MonetaryTypesLib.Figure(
                    amount,
                    MonetaryTypesLib.Currency(currencyCt, currencyId)
                ),
                standard
            )
        );
        IERC20(currencyCt).transferFrom(msg.sender, address(this), uint256(amount));
    }

    function _getBenefit(uint256 index)
    public
    view
    returns (address wallet, string memory balanceType, int256 amount, address currencyCt,
        uint256 currencyId, string memory standard)
    {
        wallet = _benefits[index].wallet;
        balanceType = _benefits[index].balanceType;
        amount = _benefits[index].figure.amount;
        currencyCt = _benefits[index].figure.currency.ct;
        currencyId = _benefits[index].figure.currency.id;
        standard = _benefits[index].standard;
    }
}