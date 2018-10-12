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
@title FraudChallengeByTradeSucceedingPayment
@notice Where driips are challenged wrt fraud by mismatch in trade succeeding payment
*/
contract FraudChallengeByTradeSucceedingPayment is Ownable, FraudChallengable, Challenge, Validatable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeSucceedingPaymentEvent(NahmiiTypes.Payment payment, NahmiiTypes.Trade trade, address challenger, address seizedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit payment and subsequent trade candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param payment Reference payment
    /// @param trade Fraudulent trade candidate
    /// @param wallet Address of concerned wallet
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function challenge(
        NahmiiTypes.Payment payment,
        NahmiiTypes.Trade trade,
        address wallet,
        address currencyCt,
        uint256 currencyId
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

        require(NahmiiTypes.isTradeParty(trade, wallet));
        require(NahmiiTypes.isPaymentParty(payment, wallet));
        require(currencyCt == payment.currency.ct && currencyId == payment.currency.id);
        require((currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id)
            || (currencyCt == trade.currencies.conjugate.ct && currencyId == trade.currencies.conjugate.id));

        NahmiiTypes.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? NahmiiTypes.PaymentPartyRole.Sender : NahmiiTypes.PaymentPartyRole.Recipient);
        NahmiiTypes.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? NahmiiTypes.TradePartyRole.Buyer : NahmiiTypes.TradePartyRole.Seller);

        require(validator.isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        NahmiiTypes.CurrencyRole tradeCurrencyRole = (currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id ? NahmiiTypes.CurrencyRole.Intended : NahmiiTypes.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, tradeCurrencyRole) ||
        !validator.isGenuineSuccessivePaymentTradeTotalFees(payment, paymentPartyRole, trade, tradePartyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTrade(trade);

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByTradeSucceedingPaymentEvent(payment, trade, msg.sender, wallet);
    }

}