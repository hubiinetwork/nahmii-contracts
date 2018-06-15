/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {CommunityVote} from "./CommunityVote.sol";

contract CommunityVotable is Ownable, Modifiable {

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
    function disableUpdateOfCommunityVote() public onlyOwner {
        communityVoteUpdateDisabled = true;
    }

    /// @notice Change the community vote contract
    /// @param newCommunityVote The (address of) CommunityVote contract instance
    function changeCommunityVote(CommunityVote newCommunityVote)
    public
    onlyOwner
    notNullAddress(newCommunityVote)
    notEqualAddresses(newCommunityVote, communityVote)
    {
        require(!communityVoteUpdateDisabled);
        CommunityVote oldCommunityVote = communityVote;
        communityVote = newCommunityVote;
        emit ChangeCommunityVoteEvent(oldCommunityVote, communityVote);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier communityVoteInitialized() {
        require(communityVote != address(0));
        _;
    }
}
