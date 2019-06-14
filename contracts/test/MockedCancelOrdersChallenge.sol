/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {TradeTypesLib} from "../TradeTypesLib.sol";

/**
 * @title MockedCancelOrdersChallenge
 * @notice Mocked implementation of cancel orders challenge contract
 */
contract MockedCancelOrdersChallenge {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    bytes32[] cancelledOrderHashes;
    mapping(bytes32 => bool) orderHashCancelledMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event CancelOrdersEvent(TradeTypesLib.Order[] orders, address wallet);
    event CancelOrdersByHashEvent(bytes32[] orders, address wallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        for (uint256 i = 0; i < cancelledOrderHashes.length; i++)
            orderHashCancelledMap[cancelledOrderHashes[i]] = false;
        cancelledOrderHashes.length = 0;
    }

    function cancelOrders(TradeTypesLib.Order[] memory orders)
    public
    {
        for (uint256 i = 0; i < orders.length; i++) {
            cancelledOrderHashes.push(orders[i].seals.operator.hash);
            orderHashCancelledMap[orders[i].seals.operator.hash] = true;
        }

        emit CancelOrdersEvent(orders, msg.sender);
    }

    function cancelOrdersByHash(bytes32[] memory orderHashes)
    public
    {
        for (uint256 i = 0; i < orderHashes.length; i++) {
            cancelledOrderHashes.push(orderHashes[i]);
            orderHashCancelledMap[orderHashes[i]] = true;
        }

        emit CancelOrdersByHashEvent(orderHashes, msg.sender);
    }

    function isOrderCancelled(address, bytes32 orderHash)
    public
    view
    returns (bool)
    {
        return orderHashCancelledMap[orderHash];
    }
}