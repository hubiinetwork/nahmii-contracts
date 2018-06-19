/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

//import "../CommunityVote.sol";

contract MockedCommunityVote /* is CommunityVote*/ {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => bool) internal doubleSpenderWalletsMap;
    uint256 internal highestAbsoluteDealNonce;
    bool internal dataAvailable;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*CommunityVote(owner)*/ {
        dataAvailable = true;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function setDoubleSpenderWallet(address wallet, bool doubleSpender) public returns (address[3]) {
        doubleSpenderWalletsMap[wallet] = doubleSpender;
    }

    function isDoubleSpenderWallet(address wallet) public view returns (bool) {
        return doubleSpenderWalletsMap[wallet];
    }

    function setHighestAbsoluteDealNonce(uint256 _highestAbsoluteDealNonce) public returns (uint256) {
        return highestAbsoluteDealNonce = _highestAbsoluteDealNonce;
    }

    function getHighestAbsoluteDealNonce() public view returns (uint256) {
        return highestAbsoluteDealNonce;
    }

    function setDataAvailable(bool _dataAvailable) public returns (bool) {
        return dataAvailable = _dataAvailable;
    }

    function isDataAvailable() public view returns (bool) {
        return dataAvailable;
    }
}