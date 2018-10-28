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
import {ClientFundable} from "./ClientFundable.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title FraudChallengeBySuccessiveTrades
@notice Where driips are challenged wrt fraud by mismatch in successive trades
*/
contract FraudChallengeBySuccessiveTrades is Ownable, FraudChallengable, Challenge, Validatable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeBySuccessiveTradesEvent(NahmiiTypes.Trade firstTrade, NahmiiTypes.Trade lastTrade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function challenge(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.Trade lastTrade,
        address wallet,
        address currencyCt,
        uint256 currencyId
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

        require(validator.isTradeParty(firstTrade, wallet));
        require(validator.isTradeParty(lastTrade, wallet));
        require((currencyCt == firstTrade.currencies.intended.ct && currencyId == firstTrade.currencies.intended.id) ||
            (currencyCt == firstTrade.currencies.conjugate.ct && currencyId == firstTrade.currencies.conjugate.id));
        require((currencyCt == lastTrade.currencies.intended.ct && currencyId == lastTrade.currencies.intended.id) ||
            (currencyCt == lastTrade.currencies.conjugate.ct && currencyId == lastTrade.currencies.conjugate.id));

        NahmiiTypes.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? NahmiiTypes.TradePartyRole.Buyer : NahmiiTypes.TradePartyRole.Seller);
        NahmiiTypes.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? NahmiiTypes.TradePartyRole.Buyer : NahmiiTypes.TradePartyRole.Seller);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        NahmiiTypes.CurrencyRole firstTradeCurrencyRole = (currencyCt == firstTrade.currencies.intended.ct && currencyId == firstTrade.currencies.intended.id ? NahmiiTypes.CurrencyRole.Intended : NahmiiTypes.CurrencyRole.Conjugate);
        NahmiiTypes.CurrencyRole lastTradeCurrencyRole = (currencyCt == lastTrade.currencies.intended.ct && currencyId == lastTrade.currencies.intended.id ? NahmiiTypes.CurrencyRole.Intended : NahmiiTypes.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstTradeCurrencyRole, lastTrade, lastTradePartyRole, lastTradeCurrencyRole) ||
        !validator.isGenuineSuccessiveTradesTotalFees(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(lastTrade);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeBySuccessiveTradesEvent(firstTrade, lastTrade, msg.sender, wallet);
    }
}