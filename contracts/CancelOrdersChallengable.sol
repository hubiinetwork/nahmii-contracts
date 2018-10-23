/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {CancelOrdersChallenge} from "./CancelOrdersChallenge.sol";

/**
@title CancelOrdersChallengable
@notice An ownable that has a cancel orders challenge property
*/
contract CancelOrdersChallengable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    CancelOrdersChallenge public cancelOrdersChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeCancelOrdersChallengeEvent(CancelOrdersChallenge oldCancelOrdersChallenge, CancelOrdersChallenge newCancelOrdersChallenge);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the cancel orders challenge contract
    /// @param newCancelOrdersChallenge The (address of) CancelOrdersChallenge contract instance
    function changeCancelOrdersChallenge(CancelOrdersChallenge newCancelOrdersChallenge)
    public
    onlyDeployer
    notNullAddress(newCancelOrdersChallenge)
    notSameAddresses(newCancelOrdersChallenge, cancelOrdersChallenge)
    {
        // Set new cancel orders challenge
        CancelOrdersChallenge oldCancelOrdersChallenge = cancelOrdersChallenge;
        cancelOrdersChallenge = newCancelOrdersChallenge;

        // Emit event
        emit ChangeCancelOrdersChallengeEvent(oldCancelOrdersChallenge, newCancelOrdersChallenge);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier cancelOrdersChallengeInitialized() {
        require(cancelOrdersChallenge != address(0));
        _;
    }
}
