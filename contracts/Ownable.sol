/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

contract Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeOwnerEvent(address oldOwner, address newOwner);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) internal {
        require(_owner != address(0));
        require(_owner != address(this));

        owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the owner of this contract
    /// @param newOwner The address of the new owner
    function changeOwner(address newOwner) public onlyOwner {
        address oldOwner;

        require(newOwner != address(0));
        require(newOwner != address(this));

        if (newOwner != owner) {
            // Set new owner
            oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit ChangeOwnerEvent(oldOwner, newOwner);
        }
    }

    function isOwner() internal view returns (bool) {
        return msg.sender == owner;
    }

    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    modifier notOwner() {
        require(!isOwner());
        _;
    }
}
