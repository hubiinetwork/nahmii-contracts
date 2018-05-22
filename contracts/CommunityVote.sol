/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "./SafeMathInt.sol";
import "./Ownable.sol";
import "./ERC20.sol";

/**
@title Community vote
@notice An oracle for relevant decisions made by the community.
*/
contract CommunityVote is Ownable {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public Ownable(_owner) {
    }

    //
    // Results functions
    // -----------------------------------------------------------------------------------------------------------------
    function getDoubleSpenders() public pure returns(uint256) {
        return 0;
    }

    function getHighestAbsoluteDealNonce() public pure returns(uint256) {
        return 0;
    }
    
    function isDataAvailable() public pure returns(bool) {
        return false;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }
}