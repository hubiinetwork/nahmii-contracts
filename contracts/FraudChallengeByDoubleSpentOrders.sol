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
import {FraudChallengable} from "./FraudChallengable.sol";
import {Configurable} from "./Configurable.sol";
import {Hashable} from "./Hashable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {Types} from "./Types.sol";

contract FraudChallengeByDoubleSpentOrders is Ownable, FraudChallengable, Configurable, Hashable, SecurityBondable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByDoubleSpentOrdersEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// trade order double spenditure
    /// @param trade1 First trade with double spent order
    /// @param trade2 Last trade with double spent order
    function challengeByDoubleSpentOrders(
        Types.Trade trade1,
        Types.Trade trade2
    )
    public
    validatorInitialized
    onlySealedTrade(trade1)
    onlySealedTrade(trade2)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(securityBond != address(0));

        bool doubleSpentBuyOrder = trade1.buyer.order.hashes.exchange == trade2.buyer.order.hashes.exchange;
        bool doubleSpentSellOrder = trade1.seller.order.hashes.exchange == trade2.seller.order.hashes.exchange;

        require(doubleSpentBuyOrder || doubleSpentSellOrder);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(trade1);
        fraudChallenge.addFraudulentTrade(trade2);

        (address stakeCurrency, int256 stakeAmount) = configuration.getDoubleSpentOrderStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        if (doubleSpentBuyOrder) {
            fraudChallenge.addDoubleSpenderWallet(trade1.buyer.wallet);
            fraudChallenge.addDoubleSpenderWallet(trade2.buyer.wallet);
        }
        if (doubleSpentSellOrder) {
            fraudChallenge.addDoubleSpenderWallet(trade1.seller.wallet);
            fraudChallenge.addDoubleSpenderWallet(trade2.seller.wallet);
        }

        emit ChallengeByDoubleSpentOrdersEvent(trade1, trade2, msg.sender);
    }
}