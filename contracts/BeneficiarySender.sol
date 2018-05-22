/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "./Ownable.sol";

contract BeneficiarySender is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping (address => bool) private registeredReceivers;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisteredReceiverEvent(address receiver);
    event UnregisteredReceiverEvent(address receiver);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerReceiver(address receiver) public onlyOwner {
        registeredReceivers[receiver] = true;

        //raise event
        emit RegisteredReceiverEvent(receiver);
    }

    function unregisterReceiver(address receiver) public onlyOwner {
        registeredReceivers[receiver] = false;

        //raise event
        emit UnregisteredReceiverEvent(receiver);
    }

    function isValidRegisteredReceiver(address receiver) internal view returns (bool) {
        return registeredReceivers[receiver];
    }
}
