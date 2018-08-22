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
@title FraudChallengeBySuccessiveTrades
@notice Where driips are challenged wrt fraud by mismatch in successive trades
*/
contract FraudChallengeBySuccessiveTrades is Ownable, FraudChallengable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeBySuccessiveTradesEvent(StriimTypes.Trade firstTrade, StriimTypes.Trade lastTrade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
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
        require(currency == firstTrade.currencies.intended || currency == firstTrade.currencies.conjugate);
        require(currency == lastTrade.currencies.intended || currency == lastTrade.currencies.conjugate);

        StriimTypes.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);
        StriimTypes.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        require(
            !validator.isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole) ||
        !validator.isGenuineSuccessiveTradesNetFees(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(lastTrade);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeBySuccessiveTradesEvent(firstTrade, lastTrade, msg.sender, wallet);
    }
}