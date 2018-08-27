/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
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
    function triggerDestroy() public {
        require(msg.sender == owner());
        selfdestruct(owner());
    }

    function owner() public view returns (address);
}
