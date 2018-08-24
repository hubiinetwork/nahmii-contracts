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
import {ClientFundable} from "./ClientFundable.sol";
import {Types} from "./Types.sol";

/**
@title FraudChallengeByTrade
@notice Where driips are challenged wrt fraud by mismatch in single trade property values
*/
contract FraudChallengeByTrade is Ownable, FraudChallengable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeEvent(Types.Trade trade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit a trade candidate in continuous Fraud Challenge (FC)
    /// @param trade Fraudulent trade candidate
    function challenge(Types.Trade trade)
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(clientFund != address(0));

        // Gauge the genuineness of maker and taker fees. Depending on whether maker is buyer or seller
        // this result is baked into genuineness by buyer and seller below.
        bool genuineMakerFee = validator.isGenuineTradeMakerFee(trade);
        bool genuineTakerFee = validator.isGenuineTradeTakerFee(trade);

        // Genuineness affected by buyer
        bool genuineBuyerAndFee = validator.isGenuineTradeBuyer(trade, owner)
        && (Types.LiquidityRole.Maker == trade.buyer.liquidityRole ? genuineMakerFee : genuineTakerFee);

        // Genuineness affected by seller
        bool genuineSellerAndFee = validator.isGenuineTradeSeller(trade, owner)
        && (Types.LiquidityRole.Maker == trade.seller.liquidityRole ? genuineMakerFee : genuineTakerFee);

        require(!genuineBuyerAndFee || !genuineSellerAndFee);

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(trade);

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