/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {CommunityVote} from "./CommunityVote.sol";

/**
@title CommunityVotable
@notice An ownable that has a community vote property
*/
contract CommunityVotable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    CommunityVote public communityVote;

    bool public communityVoteUpdateDisabled;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeCommunityVoteEvent(address oldAddress, address newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Disable future updates of community vote contract
    function disableUpdateOfCommunityVote() public onlyOwner {
        communityVoteUpdateDisabled = true;
    }

    /// @notice Change the community vote contract
    /// @param newAddress The (address of) CommunityVote contract instance
    function changeCommunityVote(address newAddress) public onlyOwner notNullAddress(newAddress) {
        require(!communityVoteUpdateDisabled);

        if (newAddress != address(communityVote)) {
            //set new community vote
            address oldAddress = address(communityVote);
            communityVote = CommunityVote(newAddress);

            //emit event
            emit ChangeCommunityVoteEvent(oldAddress, newAddress);
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier communityVoteInitialized() {
        require(communityVote != address(0));
        _;
    }
}
