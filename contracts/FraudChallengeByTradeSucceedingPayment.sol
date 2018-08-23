/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SelfDestructible} from "./SelfDestructible.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {Types} from "./Types.sol";

/**
@title FraudChallengeByTradeSucceedingPayment
@notice Where driips are challenged wrt fraud by mismatch in trade succeeding payment
*/
contract FraudChallengeByTradeSucceedingPayment is SelfDestructible, FraudChallengable, Configurable, Validatable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeSucceedingPaymentEvent(Types.Payment payment, Types.Trade trade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) SelfDestructible(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit payment and subsequent trade candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param payment Reference payment
    /// @param trade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency of trade (0 if ETH)
    function challenge(
        Types.Payment payment,
        Types.Trade trade,
        address wallet,
        address currency
    )
    public
    validatorInitialized
    onlySealedPayment(payment)
    onlySealedTrade(trade)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(Types.isTradeParty(trade, wallet));
        require(Types.isPaymentParty(payment, wallet));
        require(currency == payment.currency);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);

        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);
        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);

        require(validator.isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, currencyRole) ||
        !validator.isGenuineSuccessivePaymentTradeNetFees(payment, paymentPartyRole, trade, tradePartyRole, currencyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(trade);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByTradeSucceedingPaymentEvent(payment, trade, msg.sender, wallet);
    }

}