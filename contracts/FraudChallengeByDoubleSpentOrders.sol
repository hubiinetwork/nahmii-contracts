/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {ValidatableV2} from "./ValidatableV2.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";

/**
 * @title FraudChallengeByDoubleSpentOrders
 * @notice Where driips are challenged wrt fraud by double spent orders
 */
contract FraudChallengeByDoubleSpentOrders is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
SecurityBondable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDoubleSpentOrdersEvent(bytes32 tradeHash1, bytes32 tradeHash2, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// trade order double spenditure
    /// @param trade1 First trade with double spent order
    /// @param trade2 Last trade with double spent order
    function challenge(
        TradeTypesLib.Trade memory trade1,
        TradeTypesLib.Trade memory trade2
    )
    public
    onlyOperationalModeNormal
    onlySealedTrade(trade1)
    onlySealedTrade(trade2)
    {
        require(trade1.seal.hash != trade2.seal.hash);

        // Gauge double expenditure in both sides of the trade
        bool doubleSpentBuyOrder = trade1.buyer.order.hashes.operator == trade2.buyer.order.hashes.operator;
        bool doubleSpentSellOrder = trade1.seller.order.hashes.operator == trade2.seller.order.hashes.operator;

        // Require existence of fraud signal
        require(doubleSpentBuyOrder || doubleSpentSellOrder);

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag trades (hashes) as fraudulent
        fraudChallenge.addFraudulentTradeHash(trade1.seal.hash);
        fraudChallenge.addFraudulentTradeHash(trade2.seal.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // Tag wallet(s) as double spender(s)
        if (doubleSpentBuyOrder)
            fraudChallenge.addDoubleSpenderWallet(trade2.buyer.wallet);
        if (doubleSpentSellOrder)
            fraudChallenge.addDoubleSpenderWallet(trade2.seller.wallet);

        // Emit event
        emit ChallengeByDoubleSpentOrdersEvent(
            trade1.seal.hash, trade2.seal.hash, msg.sender
        );
    }
}