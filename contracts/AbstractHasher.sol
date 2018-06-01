/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./Types.sol";

contract AbstractHasher {
    function hashOrderAsWallet(Types.Order order) public pure returns (bytes32);

    function hashOrderAsExchange(Types.Order order) public pure returns (bytes32);

    function hashTrade(Types.Trade trade) public pure returns (bytes32);

    function hashPaymentAsWallet(Types.Payment payment) public pure returns (bytes32);

    function hashPaymentAsExchange(Types.Payment payment) public pure returns (bytes32);
}