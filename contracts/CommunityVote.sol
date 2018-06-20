/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SafeMathInt} from "./SafeMathInt.sol";
import {Ownable} from "./Ownable.sol";
import {ERC20} from "./ERC20.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title Community vote
@notice An oracle for relevant decisions made by the community.
*/
contract CommunityVote is Ownable, SelfDestructible {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => bool) doubleSpenderWalletsMap;
    uint256 highestAbsoluteDealNonce;
    bool dataAvailable;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public Ownable(_owner) {
        dataAvailable = true;
    }

    //
    // Results functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Get the double spender status of given wallet
    /// @param wallet The wallet address for which to check double spender status
    /// @return true if wallet is double spender, false otherwise
    function isDoubleSpenderWallet(address wallet) public view returns (bool) {
        return doubleSpenderWalletsMap[wallet];
    }

    /// @notice Get the highest absolute deal nonce to be accepted in settlements
    /// @return the highest absolute deal nonce
    function getHighestAbsoluteDealNonce() public view returns (uint256) {
        return highestAbsoluteDealNonce;
    }

    /// @notice Get the data availability status
    /// @return true if data is available
    function isDataAvailable() public view returns (bool) {
        return dataAvailable;
    }
}