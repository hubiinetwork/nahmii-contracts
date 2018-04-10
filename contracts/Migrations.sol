/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Copyright (C) 2017-2018 Hubii
 */
pragma solidity ^0.4.15;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    function Migrations() public {
        owner = msg.sender;
    }

    function setCompleted(uint completed) public onlyOwner {
        last_completed_migration = completed;
    }

    function upgrade(address newAddress) public onlyOwner {
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(last_completed_migration);
    }

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }
}
