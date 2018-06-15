/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import "./Ownable.sol";

contract SelfDestructible is Ownable {
    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function triggerDestroy() onlyOwner public {
        selfdestruct(owner);
    }
}
