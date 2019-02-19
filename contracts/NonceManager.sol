/*
* Hubii Nahmii
*
* Compliant with the Hubii Nahmii specification v0.12.
*
* Copyright (C) 2017-2018 Hubii AS
*/

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Servable} from "./Servable.sol";

/**
 * @title NonceManager
 * @notice Manager of nonce state
 */
contract NonceManager is Ownable, Servable {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    // TODO Register DriipSettlementChallengeState and NullSettlementChallengeState as services and enable actions
    string constant public INCREMENT_NONCE_ACTION = "increment_nonce";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public nonce;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event IncrementNonceEvent(uint256 nonce);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Increment and return nonce
    /// @return The next incremental nonce
    function incrementNonce()
    public
    onlyEnabledServiceAction(INCREMENT_NONCE_ACTION)
    returns (uint256)
    {
        // Emit event
        emit IncrementNonceEvent(++nonce);

        // Return new nonce
        return nonce;
    }
}
