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
    mapping(address => bool) doubleSpenderWalletsMap;
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
        dataAvailable = true;
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