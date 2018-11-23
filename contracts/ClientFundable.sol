/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {ClientFund} from "./ClientFund.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title ClientFundable
@notice An ownable that has a client fund property
*/
contract ClientFundable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    ClientFund public clientFund;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetClientFundEvent(ClientFund oldAddress, ClientFund newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the client fund contract
    /// @param newAddress The (address of) ClientFund contract instance
    function setClientFund(ClientFund newAddress) public onlyDeployer
    notNullAddress(newAddress)
    notSameAddresses(newAddress, clientFund)
    {
        //set new community vote
        ClientFund oldAddress = clientFund;
        clientFund = newAddress;

        // Emit event
        emit SetClientFundEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier clientFundInitialized() {
        require(clientFund != address(0));
        _;
    }
}
