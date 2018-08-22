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
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {StriimTypes} from "./StriimTypes.sol";

/**
@title FraudChallengeByOrder
@notice Where order is challenged wrt signature error
*/
contract FraudChallengeByOrder is Ownable, FraudChallengable, Validatable, SecurityBondable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByOrderEvent(StriimTypes.Order order, address challenger);

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
    function challenge(StriimTypes.Order order)
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlyExchangeSealedOrder(order)
    {
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(securityBond != address(0));

        require(validator.isGenuineOrderWalletHash(order));

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = StriimTypes.isGenuineSignature(order.seals.wallet.hash, order.seals.wallet.signature, order.wallet);
        require(!genuineWalletSignature);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentOrder(order);

        (int256 stakeAmount, address stakeCurrencyCt, /*uint256 stakeCurrencyId*/) = configuration.getFalseWalletSignatureStake();
        // TODO Update call with stageCurrencyId argument
        securityBond.stage(stakeAmount, stakeCurrencyCt, msg.sender);

        emit ChallengeByOrderEvent(order, msg.sender);
    }
}