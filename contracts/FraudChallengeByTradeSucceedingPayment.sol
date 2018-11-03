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
import {SecurityBondable} from "./SecurityBondable.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title FraudChallengeByTradeSucceedingPayment
@notice Where driips are challenged wrt fraud by mismatch in trade succeeding payment
*/
contract FraudChallengeByTradeSucceedingPayment is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeSucceedingPaymentEvent(NahmiiTypesLib.Payment payment,
        NahmiiTypesLib.Trade trade, address challenger, address seizedWallet);

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
        NahmiiTypesLib.Payment payment,
        NahmiiTypesLib.Trade trade,
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

        require(validator.isTradeParty(trade, wallet));
        require(validator.isPaymentParty(payment, wallet));
        require(currencyCt == payment.currency.ct && currencyId == payment.currency.id);
        require((currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id)
            || (currencyCt == trade.currencies.conjugate.ct && currencyId == trade.currencies.conjugate.id));

        NahmiiTypesLib.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? NahmiiTypesLib.PaymentPartyRole.Sender : NahmiiTypesLib.PaymentPartyRole.Recipient);
        NahmiiTypesLib.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? NahmiiTypesLib.TradePartyRole.Buyer : NahmiiTypesLib.TradePartyRole.Seller);

        require(validator.isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        NahmiiTypesLib.CurrencyRole tradeCurrencyRole = (currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id ? NahmiiTypesLib.CurrencyRole.Intended : NahmiiTypesLib.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, tradeCurrencyRole) ||
        !validator.isGenuineSuccessivePaymentTradeTotalFees(payment, paymentPartyRole, trade, tradePartyRole)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentTradeHash(trade.seal.hash);

        // Obtain stake fraction and stage
        securityBond.stageToBeneficiary(msg.sender, clientFund, configuration.fraudStakeFraction());

        clientFund.seizeAllBalances(wallet, msg.sender);
        fraudChallenge.addSeizedWallet(wallet);

        emit ChallengeByTradeSucceedingPaymentEvent(payment, trade, msg.sender, wallet);
    }

}