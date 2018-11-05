/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

pragma experimental ABIEncoderV2;

import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";

/**
@title MockedSecurityBond
@notice Mocked implementation of security bond contract
*/
contract MockedSecurityBond {
    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Reward {
        address wallet;
        uint256 rewardFraction;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Reward[] public rewards;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RewardEvent(address wallet, uint256 rewardFraction);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset() public {
        rewards.length = 0;
    }

    function _rewardsCount() public view returns (uint256) {
        return rewards.length;
    }

    function reward(address wallet, uint256 rewardFraction) {
        rewards.push(Reward(wallet, rewardFraction));
        emit RewardEvent(msg.sender, rewardFraction);
    }
}