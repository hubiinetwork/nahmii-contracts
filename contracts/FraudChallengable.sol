/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {FraudChallenge} from "./FraudChallenge.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

contract FraudChallengable is Ownable, Modifiable, SelfDestructible {

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
    event ChangeFraudChallengeEvent(FraudChallenge oldFraudChallenge, FraudChallenge newFraudChallenge);

    /// @notice Change the fraudChallenge contract
    /// @param newFraudChallenge The (address of) FraudChallenge contract instance
    function changeFraudChallenge(FraudChallenge newFraudChallenge)
    public
    onlyOwner
    notNullAddress(newFraudChallenge)
    {
        FraudChallenge oldFraudChallenge = fraudChallenge;
        fraudChallenge = newFraudChallenge;
        emit ChangeFraudChallengeEvent(oldFraudChallenge, fraudChallenge);
    }
}
