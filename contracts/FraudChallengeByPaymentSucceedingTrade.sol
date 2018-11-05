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
import {SecurityBondable} from "./SecurityBondable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
@title FraudChallengeByPaymentSucceedingTrade
@notice Where driips are challenged wrt fraud by mismatch in payment succeeding trade
*/
contract FraudChallengeByPaymentSucceedingTrade is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable, ClientFundable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentSucceedingTradeEvent(bytes32 tradeHash,
        bytes32 paymentHash, address challenger, address seizedWallet);

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
        NahmiiTypesLib.Trade trade,
        NahmiiTypesLib.Payment payment,
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

        require(validator.isTradeParty(trade, wallet));
        require(validator.isPaymentParty(payment, wallet));
        require((currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id)
            || (currencyCt == trade.currencies.conjugate.ct && currencyId == trade.currencies.conjugate.id));
        require(currencyCt == payment.currency.ct && currencyId == payment.currency.id);

        NahmiiTypesLib.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? NahmiiTypesLib.TradePartyRole.Buyer : NahmiiTypesLib.TradePartyRole.Seller);
        NahmiiTypesLib.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? NahmiiTypesLib.PaymentPartyRole.Sender : NahmiiTypesLib.PaymentPartyRole.Recipient);

        require(validator.isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        NahmiiTypesLib.CurrencyRole tradeCurrencyRole = (currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id ? NahmiiTypesLib.CurrencyRole.Intended : NahmiiTypesLib.CurrencyRole.Conjugate);

        require(
            !validator.isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, tradeCurrencyRole, payment, paymentPartyRole) ||
        !validator.isGenuineSuccessiveTradePaymentTotalFees(trade, tradePartyRole, payment)
        );

        configuration.setOperationalModeExit();
        fraudChallenge.addFraudulentPaymentHash(payment.seals.operator.hash);

        // Reward stake fraction
        securityBond.reward(msg.sender, configuration.fraudStakeFraction());

        clientFund.seizeAllBalances(wallet, msg.sender);

        emit ChallengeByPaymentSucceedingTradeEvent(
            trade.seal.hash, payment.seals.operator.hash, msg.sender, wallet
        );
    }
}