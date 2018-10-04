/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

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
    event ChangeCommunityVoteEvent(CommunityVote oldAddress, CommunityVote newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Disable future updates of community vote contract
    function disableUpdateOfCommunityVote() public onlyDeployer {
        communityVoteUpdateDisabled = true;
    }

    /// @notice Change the community vote contract
    /// @param newAddress The (address of) CommunityVote contract instance
    function changeCommunityVote(CommunityVote newAddress) public onlyDeployer
        notNullAddress(newAddress)
        notSameAddresses(newAddress, communityVote)
    {
        require(!communityVoteUpdateDisabled);

        //set new community vote
        CommunityVote oldAddress = communityVote;
        communityVote = newAddress;

        //emit event
        emit ChangeCommunityVoteEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier communityVoteInitialized() {
        require(communityVote != address(0));
        _;
    }
}
