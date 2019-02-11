/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {TradeHasher} from "./TradeHasher.sol";

/**
 * @title TradeHashable
 * @notice An ownable that has a trade hasher property
 */
contract TradeHashable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    TradeHasher public tradeHasher;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetTradeHasherEvent(TradeHasher oldTradeHasher, TradeHasher newTradeHasher);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the trade hasher contract
    /// @param newTradeHasher The (address of) TradeHasher contract instance
    function setTradeHasher(TradeHasher newTradeHasher)
    public
    onlyDeployer
    notNullAddress(newTradeHasher)
    notSameAddresses(newTradeHasher, tradeHasher)
    {
        // Set new trade hasher
        TradeHasher oldTradeHasher = tradeHasher;
        tradeHasher = newTradeHasher;

        // Emit event
        emit SetTradeHasherEvent(oldTradeHasher, newTradeHasher);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier tradeHasherInitialized() {
        require(tradeHasher != address(0));
        _;
    }
}
