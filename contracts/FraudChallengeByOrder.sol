/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title FraudChallengeByOrder
@notice Where order is challenged wrt signature error
*/
contract FraudChallengeByOrder is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByOrderEvent(NahmiiTypesLib.Order order, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit an order candidate in continuous Fraud Challenge (FC)
    /// @param order Fraudulent order candidate
    function challenge(NahmiiTypesLib.Order order)
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlyOperatorSealedOrder(order)
    {
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(securityBond != address(0));

        require(validator.isGenuineOrderWalletHash(order));

        // Genuineness affected by wallet not having signed the payment
        bool genuineWalletSignature = validator.isGenuineWalletSignature(
            order.seals.wallet.hash, order.seals.wallet.signature, order.wallet
        );
        require(!genuineWalletSignature);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentOrderHash(order.seals.operator.hash);

        // Obtain stake fraction and stage
        securityBond.stageToBeneficiary(msg.sender, clientFund, configuration.fraudStakeFraction());

        emit ChallengeByOrderEvent(order, msg.sender);
    }
}