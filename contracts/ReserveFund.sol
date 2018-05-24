/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

/**
@title Reserve fund
@notice Fund into which users may make deposits and earn share of revenue relative to their contribution.
 There will likely be 2 instances of this smart contract, one for trade reserves and one for payment reserves.

*/
contract ReserveFund {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;

    // TODO Remove
    mapping(address => int256) public currencyAmountMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function ReserveFund(address _owner) public notNullAddress(_owner) {
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

    // TODO Remove
    function setMaxOutboundTransfer(address currency, int256 amount) public {
        currencyAmountMap[currency] = amount;
    }

    // TODO Remove
    function outboundTransferSupported(address currency, int256 amount) public view returns (bool) {
        return currencyAmountMap[currency] >= amount;
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