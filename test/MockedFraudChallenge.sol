/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {FraudChallenge} from "../contracts/FraudChallenge.sol";
import {Types} from "../contracts/Types.sol";

contract MockedFraudChallenge is FraudChallenge {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) public FraudChallenge(owner) {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        fraudulentOrders.length = 0;
        fraudulentTrades.length = 0;
        fraudulentPayments.length = 0;
        seizedWallets.length = 0;
    }

    function addFraudulentOrder(Types.Order order) public {
        fraudulentOrders.push(order);
        emit AddFraudulentOrderEvent(order);
    }

    function addFraudulentTrade(Types.Trade trade) public {
        fraudulentTrades.push(trade);
        emit AddFraudulentTradeEvent(trade);
    }

    function addFraudulentPayment(Types.Payment payment) public {
        fraudulentPayments.push(payment);
        emit AddFraudulentPaymentEvent(payment);
    }

    function addSeizedWallet(address wallet) public {
        seizedWallets.push(wallet);
        emit AddSeizedWalletEvent(wallet);
    }
}
