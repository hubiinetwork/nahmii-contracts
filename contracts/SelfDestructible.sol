/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

/**
@title SelfDestructible
@notice Contract that allows for self-destruction
*/
contract SelfDestructible {
    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Destroy this contract
    /// @dev Requires that msg.sender is the defined destructor
    function triggerDestroy() public {
        require(msg.sender == destructor());
        selfdestruct(destructor());
    }

    /// @notice Get the address of the destructor role
    function destructor() public view returns (address);
}
