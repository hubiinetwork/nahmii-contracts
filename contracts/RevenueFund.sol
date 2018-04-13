/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

/**
@title Revenue fund
@notice The target of all revenue earned in deal settlements and from which accrued revenue is split amongst
 reserve fund contributors and revenue token holders. There will likely be 2 instances of this smart contract,
 one for revenue from trades and one for revenue from payments.
*/
contract RevenueFund {

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
    function RevenueFund(address _owner) public notNullAddress(_owner) {
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