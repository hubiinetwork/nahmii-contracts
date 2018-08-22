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
@title FraudChallengeByTradeSucceedingPayment
@notice Where driips are challenged wrt fraud by mismatch in trade succeeding payment
*/
contract FraudChallengeByTradeSucceedingPayment is Ownable, FraudChallengable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeSucceedingPaymentEvent(StriimTypes.Payment payment, StriimTypes.Trade trade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
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
        StriimTypes.Payment payment,
        StriimTypes.Trade trade,
        address wallet,
        address currency
    )
    public
    validatorInitialized
    onlyOperationalModeNormal
    onlySealedPayment(payment)
    onlySealedTrade(trade)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(StriimTypes.isTradeParty(trade, wallet));
        require(StriimTypes.isPaymentParty(payment, wallet));
        require(currency == payment.currency);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);

        StriimTypes.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? StriimTypes.PaymentPartyRole.Sender : StriimTypes.PaymentPartyRole.Recipient);
        StriimTypes.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);

        require(validator.isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        StriimTypes.CurrencyRole currencyRole = (currency == trade.currencies.intended ? StriimTypes.CurrencyRole.Intended : StriimTypes.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, currencyRole) ||
        !validator.isGenuineSuccessivePaymentTradeNetFees(payment, paymentPartyRole, trade, tradePartyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(trade);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByTradeSucceedingPaymentEvent(payment, trade, msg.sender, wallet);
    }

}