/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {Types} from "./Types.sol";

/**
@title FraudChallengeByOrder
@notice Where order is challenged wrt signature error
*/
contract FraudChallengeByOrder is Ownable, FraudChallengable, Configurable, Validatable, SecurityBondable {

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
    function challenge(Types.Order order)
    public
    validatorInitialized
    onlyExchangeSealedOrder(order)
    {
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(securityBond != address(0));

        require(validator.isGenuineOrderWalletHash(order));

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