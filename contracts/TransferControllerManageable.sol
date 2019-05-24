/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {TransferControllerManager} from "./TransferControllerManager.sol";
import {TransferController} from "./TransferController.sol";

/**
 * @title TransferControllerManageable
 * @notice An ownable with a transfer controller manager
 */
contract TransferControllerManageable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    TransferControllerManager public transferControllerManager;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetTransferControllerManagerEvent(TransferControllerManager oldTransferControllerManager,
        TransferControllerManager newTransferControllerManager);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the currency manager contract
    /// @param newTransferControllerManager The (address of) TransferControllerManager contract instance
    function setTransferControllerManager(TransferControllerManager newTransferControllerManager)
    public
    onlyDeployer
    notNullAddress(address(newTransferControllerManager))
    notSameAddresses(address(newTransferControllerManager), address(transferControllerManager))
    {
        //set new currency manager
        TransferControllerManager oldTransferControllerManager = transferControllerManager;
        transferControllerManager = newTransferControllerManager;

        // Emit event
        emit SetTransferControllerManagerEvent(oldTransferControllerManager, newTransferControllerManager);
    }

    /// @notice Get the transfer controller of the given currency contract address and standard
    function transferController(address currencyCt, string memory standard)
    internal
    view
    returns (TransferController)
    {
        return transferControllerManager.transferController(currencyCt, standard);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier transferControllerManagerInitialized() {
        require(address(transferControllerManager) != address(0), "Transfer controller manager not initialized [TransferControllerManageable.sol:63]");
        _;
    }
}