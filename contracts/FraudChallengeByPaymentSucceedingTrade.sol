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
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {Types} from "./Types.sol";

/**
@title FraudChallengeByPaymentSucceedingTrade
@notice Where driips are challenged wrt fraud by mismatch in payment succeeding trade
*/
contract FraudChallengeByPaymentSucceedingTrade is Ownable, FraudChallengable, Configurable, Validatable, ClientFundable {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentSucceedingTradeEvent(Types.Trade trade, Types.Payment payment, address challenger, address seizedWallet);

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
        Types.Trade trade,
        Types.Payment payment,
        address wallet,
        address currency
    )
    public
    validatorInitialized
    onlySealedTrade(trade)
    onlySealedPayment(payment)
    {
        require(configuration != address(0));
        require(fraudChallenge != address(0));
        require(clientFund != address(0));

        require(Types.isTradeParty(trade, wallet));
        require(Types.isPaymentParty(payment, wallet));
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);
        require(currency == payment.currency);

        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);

        require(validator.isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        Types.CurrencyRole currencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, currencyRole, payment, paymentPartyRole) ||
        !validator.isGenuineSuccessiveTradePaymentNetFees(trade, tradePartyRole, currencyRole, payment, paymentPartyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPayment(payment);

        clientFund.seizeDepositedAndSettledBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByPaymentSucceedingTradeEvent(trade, payment, msg.sender, wallet);
    }
}