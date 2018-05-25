/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "./SafeMathInt.sol";
import "./ERC20.sol";

/**
@title Community vote
@notice An oracle for relevant decisions made by the community.
*/
contract CommunityVote {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;
    address[3] internal doubleSpenders;
    uint256 internal highestAbsoluteDealNonce;
    bool internal dataAvailable;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public notNullAddress(_owner) {
        owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        address oldOwner;

        if (newOwner != owner) {
            // Set new owner
            oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    //
    // Results functions
    // -----------------------------------------------------------------------------------------------------------------
    function getDoubleSpenders() public view returns (address[3]) {
        return doubleSpenders;
    }

    function getHighestAbsoluteDealNonce() public view returns (uint256) {
        return highestAbsoluteDealNonce;
    }

    function isDataAvailable() public view returns (bool) {
        return dataAvailable;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}