/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {FraudChallenge} from "./FraudChallenge.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title FraudChallengable
@notice An ownable that has a fraud challenge property
*/
contract FraudChallengable is Ownable, SelfDestructible {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    FraudChallenge public fraudChallenge;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeFraudChallengeEvent(address oldAddress, address newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the fraudChallenge contract
    /// @param newAddress The (address of) FraudChallenge contract instance
    function changeFraudChallenge(address newAddress) public onlyOwner notNullAddress(newFraudChallenge) {
        if (newAddress != address(fraudChallenge)) {
            //set new fraud challenge
            address oldAddress = address(fraudChallenge);
            fraudChallenge = FraudChallenge(newAddress);

            //emit event
            emit ChangeFraudChallengeEvent(oldAddress, newAddress);
        }
    }
}
