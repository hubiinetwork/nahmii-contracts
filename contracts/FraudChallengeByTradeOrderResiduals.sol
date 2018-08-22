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
import {StriimTypes} from "./StriimTypes.sol";

/**
@title FraudChallengeByTradeOrderResiduals
@notice Where driips are challenged wrt fraud by mismatch in trade order residuals
*/
contract FraudChallengeByTradeOrderResiduals is Ownable, FraudChallengable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeOrderResidualsEvent(StriimTypes.Trade firstTrade, StriimTypes.Trade lastTrade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// trade order residual differences
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency (0 if ETH)
    function challenge(
        StriimTypes.Trade firstTrade,
        StriimTypes.Trade lastTrade,
        address wallet,
        address currency
    )
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlySealedTrade(firstTrade)
    onlySealedTrade(lastTrade)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(StriimTypes.isTradeParty(firstTrade, wallet));
        require(StriimTypes.isTradeParty(lastTrade, wallet));
        require(currency == firstTrade.currencies.intended);
        require(currency == lastTrade.currencies.intended);

        StriimTypes.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);
        StriimTypes.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);
        require(firstTradePartyRole == lastTradePartyRole);

        if (StriimTypes.TradePartyRole.Buyer == firstTradePartyRole)
            require(firstTrade.buyer.order.hashes.wallet == lastTrade.buyer.order.hashes.wallet);
        else // StriimTypes.TradePartyRole.Seller == firstTradePartyRole
            require(firstTrade.seller.order.hashes.wallet == lastTrade.seller.order.hashes.wallet);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        require(!validator.isGenuineSuccessiveTradeOrderResiduals(firstTrade, lastTrade, firstTradePartyRole));

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(lastTrade);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByTradeOrderResidualsEvent(firstTrade, lastTrade, msg.sender, wallet);
    }
}