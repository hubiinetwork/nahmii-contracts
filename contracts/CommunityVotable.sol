/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {CommunityVote} from "./CommunityVote.sol";

/**
 * @title CommunityVotable
 * @notice An ownable that has a community vote property
 */
contract CommunityVotable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    CommunityVote public communityVote;
    bool public communityVoteFrozen;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetCommunityVoteEvent(CommunityVote oldCommunityVote, CommunityVote newCommunityVote);
    event FreezeCommunityVoteEvent();

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the community vote contract
    /// @param newCommunityVote The (address of) CommunityVote contract instance
    function setCommunityVote(CommunityVote newCommunityVote) 
    public 
    onlyDeployer
    notNullAddress(address(newCommunityVote))
    notSameAddresses(address(newCommunityVote), address(communityVote))
    {
        require(!communityVoteFrozen, "Community vote frozen [CommunityVotable.sol:41]");

        // Set new community vote
        CommunityVote oldCommunityVote = communityVote;
        communityVote = newCommunityVote;

        // Emit event
        emit SetCommunityVoteEvent(oldCommunityVote, newCommunityVote);
    }

    /// @notice Freeze the community vote from further updates
    /// @dev This operation can not be undone
    function freezeCommunityVote()
    public
    onlyDeployer
    {
        communityVoteFrozen = true;

        // Emit event
        emit FreezeCommunityVoteEvent();
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier communityVoteInitialized() {
        require(address(communityVote) != address(0), "Community vote not initialized [CommunityVotable.sol:67]");
        _;
    }
}