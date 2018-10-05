/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {FraudChallenge} from "./FraudChallenge.sol";

/**
@title FraudChallengable
@notice An ownable that has a fraud challenge property
*/
contract FraudChallengable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    FraudChallenge public fraudChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeFraudChallengeEvent(FraudChallenge oldAddress, FraudChallenge newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the fraudChallenge contract
    /// @param newAddress The (address of) FraudChallenge contract instance
    function changeFraudChallenge(FraudChallenge newAddress) public onlyDeployer
        notNullAddress(newAddress)
        notSameAddresses(newAddress, fraudChallenge)
    {
        //set new fraud challenge
        FraudChallenge oldAddress = fraudChallenge;
        fraudChallenge = newAddress;

        //emit event
        emit ChangeFraudChallengeEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier fraudChallengeInitialized() {
        require(fraudChallenge != address(0));
        _;
    }
}
