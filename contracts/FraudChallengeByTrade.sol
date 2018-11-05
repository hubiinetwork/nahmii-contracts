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
@title FraudChallengeByTrade
@notice Where driips are challenged wrt fraud by mismatch in single trade property values
*/
contract FraudChallengeByTrade is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeEvent(NahmiiTypesLib.Trade trade, address challenger,
        address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit a trade candidate in continuous Fraud Challenge (FC)
    /// @param trade Fraudulent trade candidate
    function challenge(NahmiiTypesLib.Trade trade) public
    onlyOperationalModeNormal
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(clientFund != address(0));

        // Genuineness affected by buyer
        bool genuineBuyerAndFee = validator.isGenuineTradeBuyer(trade)
        && validator.isGenuineTradeBuyerFee(trade);

        // Genuineness affected by seller
        bool genuineSellerAndFee = validator.isGenuineTradeSeller(trade)
        && validator.isGenuineTradeSellerFee(trade);

        require(!genuineBuyerAndFee || !genuineSellerAndFee);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTradeHash(trade.seal.hash);

        // Reward stake fraction
        securityBond.reward(msg.sender, configuration.fraudStakeFraction());

        address seizedWallet;
        if (!genuineBuyerAndFee)
            seizedWallet = trade.buyer.wallet;
        if (!genuineSellerAndFee)
            seizedWallet = trade.seller.wallet;
        if (address(0) != seizedWallet) {
            clientFund.seizeAllBalances(seizedWallet, msg.sender);
            fraudChallenge.addSeizedWallet(seizedWallet);
        }

        emit ChallengeByTradeEvent(trade, msg.sender, seizedWallet);
    }
}