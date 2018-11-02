/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

pragma experimental ABIEncoderV2;

//import {SecurityBond} from "../SecurityBond.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";

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
        uint256 fraction;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Stage[] public stages;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event StageEvent(address wallet, uint256 fraction);

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

    function stage(address wallet, uint256 fraction) {
        stages.push(Stage(wallet, fraction));
        emit StageEvent(msg.sender, fraction);
    }
}