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
    event ChangeCommunityVoteEvent(CommunityVote oldCommunityVote, CommunityVote newCommunityVote);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Disable future updates of community vote contract
    function disableUpdateOfCommunityVote() 
    public 
    onlyDeployer 
    {
        communityVoteUpdateDisabled = true;
    }

    /// @notice Change the community vote contract
    /// @param newCommunityVote The (address of) CommunityVote contract instance
    function changeCommunityVote(CommunityVote newCommunityVote) 
    public 
    onlyDeployer
    notNullAddress(newCommunityVote)
    notSameAddresses(newCommunityVote, communityVote)
    {
        require(!communityVoteUpdateDisabled);

        // Set new community vote
        CommunityVote oldCommunityVote = communityVote;
        communityVote = newCommunityVote;

        // Emit event
        emit ChangeCommunityVoteEvent(oldCommunityVote, newCommunityVote);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier communityVoteInitialized() {
        require(communityVote != address(0));
        _;
    }
}
