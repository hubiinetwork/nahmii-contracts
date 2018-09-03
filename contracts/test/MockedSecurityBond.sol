/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

pragma experimental ABIEncoderV2;

//import {SecurityBond} from "../SecurityBond.sol";
import {MonetaryTypes} from "../MonetaryTypes.sol";

/**
@title MockedSecurityBond
@notice Mocked implementation of security bond contract
*/
contract MockedSecurityBond /*is SecurityBond*/ {

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Stage {
        address wallet;
        MonetaryTypes.Figure figure;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Stage[] public stages;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event StageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*SecurityBond(owner)*/ {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        stages.length = 0;
    }

    function stagesCount() public view returns (uint256) {
        return stages.length;
    }

    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId) public {
        stages.push(Stage(wallet, MonetaryTypes.Figure(amount, MonetaryTypes.Currency(currencyCt, currencyId))));
        emit StageEvent(msg.sender, amount, currencyCt, currencyId);
    }
}