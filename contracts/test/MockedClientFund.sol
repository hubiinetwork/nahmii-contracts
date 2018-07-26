/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

//import {ClientFund} from "../ClientFund.sol";

/**
@title MockedClientFund
@notice Mocked implementation of client fund contract
*/
contract MockedClientFund /*is ClientFund*/ {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Seizure {
        address source;
        address destination;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Seizure[] public seizures;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SeizeAllBalancesEvent(address sourceWallet, address targetWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*ClientFund(owner)*/ {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        seizures.length = 0;
    }

    function seizeAllBalances(address sourceWallet, address destinationWallet) public {
        seizures.push(Seizure(sourceWallet, destinationWallet));
        emit SeizeAllBalancesEvent(sourceWallet, destinationWallet);
    }
}
