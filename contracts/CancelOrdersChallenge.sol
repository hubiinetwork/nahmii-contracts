/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title CancelOrdersChallenge
@notice Where orders are cancelled and cancellations challenged
*/
contract CancelOrdersChallenge is Ownable, Challenge, Validatable, SelfDestructible {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => mapping(bytes32 => bool)) public walletOrderExchangeHashCancelledMap;
    mapping(address => StriimTypes.Order[]) public walletOrderCancelledListMap;
    mapping(address => mapping(bytes32 => uint256)) public walletOrderExchangeHashIndexMap;
    mapping(address => uint256) public walletOrderCancelledTimeoutMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event CancelOrdersEvent(StriimTypes.Order[] orders, address wallet);
    event ChallengeEvent(StriimTypes.Order order, StriimTypes.Trade trade, address wallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Get count of cancelled orders for given wallet
    /// @param wallet The wallet for which to return the count of cancelled orders
    function getCancelledOrdersCount(address wallet) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < walletOrderCancelledListMap[wallet].length; i++) {
            StriimTypes.Order storage order = walletOrderCancelledListMap[wallet][i];
            if (walletOrderExchangeHashCancelledMap[wallet][order.seals.exchange.hash])
                count++;
        }
        return count;
    }

    /// @notice Get wallets cancelled status of order
    /// @param wallet The ordering wallet
    /// @param orderHash The (exchange) hash of the order
    function isOrderCancelled(address wallet, bytes32 orderHash) public view returns (bool) {
        return walletOrderExchangeHashCancelledMap[wallet][orderHash];
    }

    /// @notice Get 10 cancelled orders for given wallet starting at given start index
    /// @param wallet The wallet for which to return the nonces of cancelled orders
    /// @param startIndex The start index from which to extract order nonces, used for pagination
    function getCancelledOrders(address wallet, uint256 startIndex) public view returns (StriimTypes.Order[10]) {
        StriimTypes.Order[10] memory returnOrders;
        uint256 i = 0;
        uint256 j = startIndex;
        while (i < 10 && j < walletOrderCancelledListMap[wallet].length) {
            StriimTypes.Order storage order = walletOrderCancelledListMap[wallet][j];
            if (walletOrderExchangeHashCancelledMap[wallet][order.seals.exchange.hash]) {
                returnOrders[i] = order;
                i++;
            }
            j++;
        }
        return returnOrders;
    }

    /// @notice Cancel orders of msg.sender
    /// @param orders The orders to cancel
    function cancelOrders(StriimTypes.Order[] orders)
    public
    onlyOperationalModeNormal
    {
        require(configuration != address(0));

        for (uint256 i = 0; i < orders.length; i++) {
            require(msg.sender == orders[i].wallet);
            require(validator.isGenuineOrderSeals(orders[i], owner));
        }

        for (uint256 j = 0; j < orders.length; j++) {
            walletOrderExchangeHashCancelledMap[msg.sender][orders[j].seals.exchange.hash] = true;
            walletOrderCancelledListMap[msg.sender].push(orders[j]);
            walletOrderExchangeHashIndexMap[msg.sender][orders[j].seals.exchange.hash] = walletOrderCancelledListMap[msg.sender].length - 1;
        }

        walletOrderCancelledTimeoutMap[msg.sender] = block.timestamp.add(configuration.getCancelOrderChallengeTimeout());

        emit CancelOrdersEvent(orders, msg.sender);
    }

    /// @notice Challenge cancelled order
    /// @param trade The trade that challenges a cancelled order
    /// @param wallet The concerned wallet
    function challenge(StriimTypes.Trade trade, address wallet)
    public
    onlyOperationalModeNormal
    onlySealedTrade(trade)
    {
        require(block.timestamp < walletOrderCancelledTimeoutMap[wallet]);

        bytes32 orderExchangeHash = (
        wallet == trade.buyer.wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange
        );

        require(walletOrderExchangeHashCancelledMap[wallet][orderExchangeHash]);

        walletOrderExchangeHashCancelledMap[wallet][orderExchangeHash] = false;

        uint256 orderIndex = walletOrderExchangeHashIndexMap[wallet][orderExchangeHash];
        StriimTypes.Order memory order = walletOrderCancelledListMap[wallet][orderIndex];

        emit ChallengeEvent(order, trade, msg.sender);
    }

    /// @notice Get current phase of a wallets cancelled order challenge
    /// @param wallet The address of wallet for which the cancelled order challenge phase is returned
    function challengePhase(address wallet) public view returns (StriimTypes.ChallengePhase) {
        if (0 == walletOrderCancelledListMap[wallet].length)
            return StriimTypes.ChallengePhase.Closed;
        if (block.timestamp < walletOrderCancelledTimeoutMap[wallet])
            return StriimTypes.ChallengePhase.Dispute;
        else
            return StriimTypes.ChallengePhase.Closed;
    }
}