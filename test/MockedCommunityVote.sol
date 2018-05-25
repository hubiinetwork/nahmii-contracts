/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

//import "../contracts/CommunityVote.sol";

contract MockedCommunityVote /* is CommunityVote*/ {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address[3] internal doubleSpenders;
    uint256 internal highestAbsoluteDealNonce;
    bool internal dataAvailable;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*CommunityVote(owner)*/ {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function setDoubleSpenders(address address0, address address1, address address2) public returns (address[3]) {
        doubleSpenders[0] = address0;
        doubleSpenders[1] = address1;
        doubleSpenders[2] = address2;
    }

    function getDoubleSpenders() public view returns (address[3]) {
        return doubleSpenders;
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