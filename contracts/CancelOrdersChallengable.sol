/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {CancelOrdersChallenge} from "./CancelOrdersChallenge.sol";

/**
 * @title CancelOrdersChallengable
 * @notice An ownable that has a cancel orders challenge property
 */
contract CancelOrdersChallengable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    CancelOrdersChallenge public cancelOrdersChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetCancelOrdersChallengeEvent(CancelOrdersChallenge oldCancelOrdersChallenge,
        CancelOrdersChallenge newCancelOrdersChallenge);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the cancel orders challenge contract
    /// @param newCancelOrdersChallenge The (address of) CancelOrdersChallenge contract instance
    function setCancelOrdersChallenge(CancelOrdersChallenge newCancelOrdersChallenge)
    public
    onlyDeployer
    notNullAddress(address(newCancelOrdersChallenge))
    notSameAddresses(address(newCancelOrdersChallenge), address(cancelOrdersChallenge))
    {
        // Set new cancel orders challenge
        CancelOrdersChallenge oldCancelOrdersChallenge = cancelOrdersChallenge;
        cancelOrdersChallenge = newCancelOrdersChallenge;

        // Emit event
        emit SetCancelOrdersChallengeEvent(oldCancelOrdersChallenge, newCancelOrdersChallenge);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier cancelOrdersChallengeInitialized() {
        require(address(cancelOrdersChallenge) != address(0), "Cancel orders challenge not initialized [CancelOrdersChallengable.sol:53]");
        _;
    }
}