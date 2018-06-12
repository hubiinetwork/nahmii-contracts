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
import {ClientFundable} from "./ClientFundable.sol";
import {Types} from "./Types.sol";

contract FraudChallengeBySuccessiveTrades is Ownable, FraudChallengable, Configurable, Hashable, SecurityBondable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeBySuccessiveTradesEvent(Types.Trade firstTrade, Types.Trade lastTrade, address challenger, address seizedWallet);

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
    function challengeBySuccessiveTrades(
        Types.Trade firstTrade,
        Types.Trade lastTrade,
        address wallet,
        address currency
    )
    public
    validatorInitialized
    onlySealedTrade(firstTrade)
    onlySealedTrade(lastTrade)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(Types.isTradeParty(firstTrade, wallet));
        require(Types.isTradeParty(lastTrade, wallet));
        require(currency == firstTrade.currencies.intended || currency == firstTrade.currencies.conjugate);
        require(currency == lastTrade.currencies.intended || currency == lastTrade.currencies.conjugate);

        Types.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        Types.CurrencyRole firstCurrencyRole = (currency == firstTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);
        Types.CurrencyRole lastCurrencyRole = (currency == lastTrade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole) ||
        !validator.isGenuineSuccessiveTradesNetFees(firstTrade, firstTradePartyRole, firstCurrencyRole, lastTrade, lastTradePartyRole, lastCurrencyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(lastTrade);

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeBySuccessiveTradesEvent(firstTrade, lastTrade, msg.sender, wallet);
    }
}