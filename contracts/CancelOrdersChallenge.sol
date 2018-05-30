/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import "./Ownable.sol";
import "./Configuration.sol";
import "./RevenueFund.sol";
import "./ClientFund.sol";
import "./CommunityVote.sol";
import "./ERC20.sol";
import "./Types.sol";
import "./SecurityBond.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract CancelOrdersChallenge is Ownable {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Configuration public configuration;

    mapping(address => mapping(bytes32 => bool)) public walletOrderExchangeHashCancelledMap;
    mapping(address => Types.Order[]) public walletOrderCancelledListMap;
    mapping(address => mapping(bytes32 => uint256)) public walletOrderExchangeHashIndexMap;
    mapping(address => uint256) public walletOrderCancelledTimeoutMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);
    event CancelOrdersEvent(Types.Order[] orders, address wallet);
    event ChallengeCancelledOrderEvent(Types.Order order, Types.Trade trade, address wallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the configuration contract
    /// @param newConfiguration The (address of) Configuration contract instance
    function changeConfiguration(Configuration newConfiguration)
    public
    onlyOwner
    notNullAddress(newConfiguration)
    notEqualAddresses(newConfiguration, configuration)
    {
        Configuration oldConfiguration = configuration;
        configuration = newConfiguration;
        emit ChangeConfigurationEvent(oldConfiguration, configuration);
    }

    /// @notice Get count of cancelled orders for given wallet
    /// @param wallet The wallet for which to return the count of cancelled orders
    function getCancelledOrdersCount(address wallet) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < walletOrderCancelledListMap[wallet].length; i++) {
            Types.Order storage order = walletOrderCancelledListMap[wallet][i];
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
    function getCancelledOrders(address wallet, uint256 startIndex) public view returns (Types.Order[10]) {
        Types.Order[10] memory returnOrders;
        uint256 i = 0;
        uint256 j = startIndex;
        while (i < 10 && j < walletOrderCancelledListMap[wallet].length) {
            Types.Order storage order = walletOrderCancelledListMap[wallet][j];
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
    function cancelOrders(Types.Order[] orders) public
    {
        for (uint256 i = 0; i < orders.length; i++) {
            require(msg.sender == orders[i]._address);
            require(Types.isGenuineSignature(orders[i].seals.wallet.hash, orders[i].seals.wallet.signature, orders[i]._address));
            require(Types.isGenuineSignature(orders[i].seals.exchange.hash, orders[i].seals.exchange.signature, owner));
        }

        for (uint256 j = 0; j < orders.length; j++) {
            walletOrderExchangeHashCancelledMap[msg.sender][orders[j].seals.exchange.hash] = true;
            walletOrderCancelledListMap[msg.sender].push(orders[j]);
            walletOrderExchangeHashIndexMap[msg.sender][orders[j].seals.exchange.hash] = walletOrderCancelledListMap[msg.sender].length - 1;
        }

        walletOrderCancelledTimeoutMap[msg.sender] = block.timestamp.add(configuration.cancelOrderChallengeTimeout());

        emit CancelOrdersEvent(orders, msg.sender);
    }

    /// @notice Challenge cancelled order
    /// @param trade The trade that challenges a cancelled order
    /// @param wallet The concerned wallet
    function challengeCancelledOrder(Types.Trade trade, address wallet)
    public
    signedBy(trade.seal.hash, trade.seal.signature, owner)
    {
        require(block.timestamp < walletOrderCancelledTimeoutMap[wallet]);

        bytes32 orderExchangeHash = (
        wallet == trade.buyer._address ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange
        );

        require(walletOrderExchangeHashCancelledMap[wallet][orderExchangeHash]);

        walletOrderExchangeHashCancelledMap[wallet][orderExchangeHash] = false;

        uint256 orderIndex = walletOrderExchangeHashIndexMap[wallet][orderExchangeHash];
        Types.Order memory order = walletOrderCancelledListMap[wallet][orderIndex];
        emit ChallengeCancelledOrderEvent(order, trade, msg.sender);
    }

    /// @notice Get current phase of a wallets cancelled order challenge
    /// @param wallet The address of wallet for which the cancelled order challenge phase is returned
    function challengePhase(address wallet) public view returns (Types.ChallengePhase) {
        if (0 == walletOrderCancelledListMap[wallet].length)
            return Types.ChallengePhase.Closed;
        if (block.timestamp < walletOrderCancelledTimeoutMap[wallet])
            return Types.ChallengePhase.Dispute;
        else
            return Types.ChallengePhase.Closed;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier notEqualAddresses(address address1, address address2) {
        require(address1 != address2);
        _;
    }

    modifier signedBy(bytes32 hash, Types.Signature signature, address signer) {
        require(Types.isGenuineSignature(hash, signature, signer));
        _;
    }
}