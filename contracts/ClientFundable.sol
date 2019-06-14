/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {ClientFund} from "./ClientFund.sol";

/**
 * @title ClientFundable
 * @notice An ownable that has a client fund property
 */
contract ClientFundable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    ClientFund public clientFund;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetClientFundEvent(ClientFund oldClientFund, ClientFund newClientFund);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the client fund contract
    /// @param newClientFund The (address of) ClientFund contract instance
    function setClientFund(ClientFund newClientFund) public
    onlyDeployer
    notNullAddress(address(newClientFund))
    notSameAddresses(address(newClientFund), address(clientFund))
    {
        // Update field
        ClientFund oldClientFund = clientFund;
        clientFund = newClientFund;

        // Emit event
        emit SetClientFundEvent(oldClientFund, newClientFund);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier clientFundInitialized() {
        require(address(clientFund) != address(0), "Client fund not initialized [ClientFundable.sol:51]");
        _;
    }
}