/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

/**
 * @title Upgradable
 * @notice A contract with basic upgradability features
 */
contract Upgradable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public upgradeAgent;
    bool public upgradesFrozen;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetUpgradeAgentEvent(address upgradeAgent);
    event FreezeUpgradesEvent();

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the upgrade agent of this contract
    /// @param _upgradeAgent The address of the new upgrade agent
    function setUpgradeAgent(address _upgradeAgent)
    public
    onlyWhenUpgradable
    {
        require(address(0) == upgradeAgent, "Upgrade agent has already been set [Upgradable.sol:37]");

        // Set the upgrade agent
        upgradeAgent = _upgradeAgent;

        // Emit event
        emit SetUpgradeAgentEvent(upgradeAgent);
    }

    /// @notice Freeze all future upgrades
    /// @dev This operation can not be undone
    function freezeUpgrades()
    public
    onlyWhenUpgrading
    {
        // Freeze upgrade
        upgradesFrozen = true;

        // Emit event
        emit FreezeUpgradesEvent();
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyWhenUpgrading() {
        require(msg.sender == upgradeAgent, "Caller is not upgrade agent [Upgradable.sol:63]");
        require(!upgradesFrozen, "Upgrades have been frozen [Upgradable.sol:64]");
        _;
    }

    modifier onlyWhenUpgradable() {
        require(!upgradesFrozen, "Upgrades have been frozen [Upgradable.sol:69]");
        _;
    }
}