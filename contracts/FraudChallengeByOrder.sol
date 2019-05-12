/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
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
 * @title FraudChallengeByOrder
 * @notice Where order is challenged wrt signature error
 */
contract FraudChallengeByOrder is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
SecurityBondable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByOrderEvent(bytes32 orderHash, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit an order candidate in continuous Fraud Challenge (FC)
    /// @param order Fraudulent order candidate
    function challenge(TradeTypesLib.Order memory order)
    public
    onlyOperationalModeNormal
    onlyOperatorSealedOrder(order)
    {
        require(validator.isGenuineOrderWalletHash(order));

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = validator.isGenuineWalletSignature(
            order.seals.wallet.hash, order.seals.wallet.signature, order.wallet
        );

        // Require existence of fraud signal
        require(!genuineWalletSignature);

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag order (hash) as fraudulent
        fraudChallenge.addFraudulentOrderHash(order.seals.operator.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // TODO Consider balance reward when balance of spending currency has been added to order

        // Emit event
        emit ChallengeByOrderEvent(order.seals.operator.hash, msg.sender);
    }
}