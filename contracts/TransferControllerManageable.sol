/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {TransferControllerManager} from "./TransferControllerManager.sol";
import {TransferController} from "./TransferController.sol";

/**
@title FraudChallengable
@notice An ownable that has a fraud challenge property
*/
contract TransferControllerManageable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    TransferControllerManager public transferControllerManager;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeTransferControllerManagerEvent(TransferControllerManager oldTransferControllerManager, TransferControllerManager newTransferControllerManager);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the currency manager contract
    /// @param newAddress The (address of) TransferControllerManager contract instance
    function changeTransferControllerManager(TransferControllerManager newAddress) public onlyOwner
        notNullAddress(newAddress)
        notSameAddresses(newAddress, transferControllerManager)
    {
        //set new currency manager
        TransferControllerManager oldAddress = transferControllerManager;
        transferControllerManager = newAddress;

        //emit event
        emit ChangeTransferControllerManagerEvent(oldAddress, newAddress);
    }

    function getTransferController(address currencyCt, string standard) internal view transferControllerManagerInitialized returns(TransferController) {
        return transferControllerManager.getTransferController(currencyCt, standard);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier transferControllerManagerInitialized() {
        require(transferControllerManager != address(0));
        _;
    }
}
