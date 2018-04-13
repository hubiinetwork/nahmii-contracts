/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
@dev Factored out from previous Trade smart contract.
*/
contract ClientFund {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function ClientFund(address _owner) public notNullAddress(_owner) {
        owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        address oldOwner;

        if (newOwner != owner) {
            // Set new owner
            oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}