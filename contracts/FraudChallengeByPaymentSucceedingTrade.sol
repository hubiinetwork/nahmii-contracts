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
@title FraudChallengeByPaymentSucceedingTrade
@notice Where driips are challenged wrt fraud by mismatch in payment succeeding trade
*/
contract FraudChallengeByPaymentSucceedingTrade is Ownable, FraudChallengable, Challenge, Validatable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentSucceedingTradeEvent(NahmiiTypes.Trade trade, NahmiiTypes.Payment payment, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit trade and subsequent payment candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param trade Reference trade
    /// @param payment Fraudulent payment candidate
    /// @param wallet Address of concerned wallet
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function challenge(
        NahmiiTypes.Trade trade,
        NahmiiTypes.Payment payment,
        address wallet,
        address currencyCt,
        uint256 currencyId
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

        require(NahmiiTypes.isTradeParty(trade, wallet));
        require(NahmiiTypes.isPaymentParty(payment, wallet));
        require((currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id)
            || (currencyCt == trade.currencies.conjugate.ct && currencyId == trade.currencies.conjugate.id));
        require(currencyCt == payment.currency.ct && currencyId == payment.currency.id);

        NahmiiTypes.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? NahmiiTypes.TradePartyRole.Buyer : NahmiiTypes.TradePartyRole.Seller);
        NahmiiTypes.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? NahmiiTypes.PaymentPartyRole.Sender : NahmiiTypes.PaymentPartyRole.Recipient);

        require(validator.isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        NahmiiTypes.CurrencyRole tradeCurrencyRole = (currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id ? NahmiiTypes.CurrencyRole.Intended : NahmiiTypes.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, tradeCurrencyRole, payment, paymentPartyRole) ||
        !validator.isGenuineSuccessiveTradePaymentTotalFees(trade, tradePartyRole, payment)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPayment(payment);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByPaymentSucceedingTradeEvent(trade, payment, msg.sender, wallet);
    }
}