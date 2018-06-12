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
import {Types} from "./Types.sol";

contract FraudChallengeByOrder is Ownable, FraudChallengable, Configurable, Hashable, SecurityBondable, Validatable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByOrderEvent(Types.Order order, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit an order candidate in continuous Fraud Challenge (FC)
    /// @param order Fraudulent order candidate
    function challengeByOrder(Types.Order order)
    public
    validatorInitialized
    onlyExchangeSealedOrder(order)
    {
        require(hasher != address(0));
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(securityBond != address(0));

        require(hasher.hashOrderAsWallet(order) == order.seals.wallet.hash);

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = Types.isGenuineSignature(order.seals.wallet.hash, order.seals.wallet.signature, order.wallet);
        require(!genuineWalletSignature);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentOrder(order);

        (address stakeCurrency, int256 stakeAmount) = configuration.getFalseWalletSignatureStake();
        securityBond.stage(stakeAmount, stakeCurrency, msg.sender);

        emit ChallengeByOrderEvent(order, msg.sender);
    }
}