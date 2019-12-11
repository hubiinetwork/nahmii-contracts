/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

/**
 * @title TokenUpgradeAgent
 * @notice A contract that transfers token from an old origin contract to a new contract
 * @dev A descendant of this contract should under most circumstances be able
 * to denounce itself as minter of the new token after a successful upgrade
 * of the total supply of the old token.
 */
contract TokenUpgradeAgent {

    // The origin token contract to upgrade from
    address public origin;

    constructor(address _origin)
    public
    {
        origin = _origin;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function upgradeFrom(address from, uint256 value)
    public
    returns (bool);

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyOrigin() {
        require(msg.sender == origin);
        _;
    }
}