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
@title FraudChallengeByPaymentSucceedingTrade
@notice Where driips are challenged wrt fraud by mismatch in payment succeeding trade
*/
contract FraudChallengeByPaymentSucceedingTrade is Ownable, FraudChallengable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentSucceedingTradeEvent(StriimTypes.Trade trade, StriimTypes.Payment payment, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) FraudChallengable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit trade and subsequent payment candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param trade Reference trade
    /// @param payment Fraudulent payment candidate
    /// @param wallet Address of concerned wallet
    /// @param currency Address of concerned currency of trade (0 if ETH)
    function challenge(
        StriimTypes.Trade trade,
        StriimTypes.Payment payment,
        address wallet,
        address currency
    )
    public
    onlyOperationalModeNormal
    validatorInitialized
    onlySealedTrade(trade)
    onlySealedPayment(payment)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(StriimTypes.isTradeParty(trade, wallet));
        require(StriimTypes.isPaymentParty(payment, wallet));
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);
        require(currency == payment.currency);

        StriimTypes.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);
        StriimTypes.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? StriimTypes.PaymentPartyRole.Sender : StriimTypes.PaymentPartyRole.Recipient);

        require(validator.isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        StriimTypes.CurrencyRole currencyRole = (currency == trade.currencies.intended ? StriimTypes.CurrencyRole.Intended : StriimTypes.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, currencyRole, payment, paymentPartyRole) ||
        !validator.isGenuineSuccessiveTradePaymentNetFees(trade, tradePartyRole, payment)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPayment(payment);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByPaymentSucceedingTradeEvent(trade, payment, msg.sender, wallet);
    }
}