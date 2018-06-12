/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Modifyable} from "./Modifyable.sol";
import {Types} from "./Types.sol";

interface ClientFund {
    function seizeDepositedAndSettledBalances(address sourceWallet, address targetWallet) external;
}

contract ClientFundable is Ownable, Modifyable {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    ClientFund public clientFund;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeClientFundEvent(ClientFund oldClientFund, ClientFund newClientFund);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the client fund contract
    /// @param newClientFund The (address of) ClientFund contract instance
    function changeClientFund(ClientFund newClientFund)
    public
    onlyOwner
    notNullAddress(newClientFund)
    notEqualAddresses(newClientFund, clientFund)
    {
        ClientFund oldClientFund = clientFund;
        clientFund = newClientFund;
        emit ChangeClientFundEvent(oldClientFund, clientFund);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier clientFundInitialized() {
        require(clientFund != address(0));
        _;
    }
}
