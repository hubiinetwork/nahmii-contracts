/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

//import {CommunityVote} from "../CommunityVote.sol";

/**
@title MockedCommunityVote
@notice Mocked implementation of community vote contract
*/
contract MockedCommunityVote /* is CommunityVote*/ {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => bool) internal doubleSpenderWalletsMap;
    uint256 internal maxDriipNonce;
    uint256 internal maxNullNonce;
    bool internal dataAvailable;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*CommunityVote(owner)*/ {
        reset();
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        maxDriipNonce = 0;
        maxNullNonce = 0;
        dataAvailable = true;
    }

    function setDoubleSpenderWallet(address wallet, bool doubleSpender) public returns (address[3]) {
        doubleSpenderWalletsMap[wallet] = doubleSpender;
    }

    function isDoubleSpenderWallet(address wallet) public view returns (bool) {
        return doubleSpenderWalletsMap[wallet];
    }

    function setMaxDriipNonce(uint256 _maxDriipNonce) public returns (uint256) {
        return maxDriipNonce = _maxDriipNonce;
    }

    function getMaxDriipNonce() public view returns (uint256) {
        return maxDriipNonce;
    }

    function setMaxNullNonce(uint256 _maxNullNonce) public returns (uint256) {
        return maxNullNonce = _maxNullNonce;
    }

    function getMaxNullNonce() public view returns (uint256) {
        return maxNullNonce;
    }

    function setDataAvailable(bool _dataAvailable) public returns (bool) {
        return dataAvailable = _dataAvailable;
    }

    function isDataAvailable() public view returns (bool) {
        return dataAvailable;
    }
}