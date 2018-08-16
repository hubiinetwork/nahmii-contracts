/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {ClientFund} from "./ClientFund.sol";
import {Types} from "./Types.sol";

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
    event ChangeClientFundEvent(ClientFund oldAddress, ClientFund newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the client fund contract
    /// @param newAddress The (address of) ClientFund contract instance
    function changeClientFund(ClientFund newAddress) public onlyOwner notNullAddress(newAddress) {
        if (newAddress != clientFund) {
            //set new community vote
            ClientFund oldAddress = clientFund;
            clientFund = newAddress;

            //emit event
            emit ChangeClientFundEvent(oldAddress, newAddress);
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier clientFundInitialized() {
        require(clientFund != address(0));
        _;
    }
}
