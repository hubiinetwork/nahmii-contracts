/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {ValidatableV2} from "./ValidatableV2.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";

/**
 * @title FraudChallengeByPaymentSucceedingTrade
 * @notice Where driips are challenged wrt fraud by mismatch in payment succeeding trade
 */
contract FraudChallengeByPaymentSucceedingTrade is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
SecurityBondable, WalletLockable {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentSucceedingTradeEvent(bytes32 tradeHash,
        bytes32 paymentHash, address challenger, address lockedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit trade and subsequent payment candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences in balance and fees
    /// @param trade Reference trade
    /// @param payment Fraudulent payment candidate
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function challenge(
        TradeTypesLib.Trade trade,
        PaymentTypesLib.Payment payment,
        address wallet,
        address currencyCt,
        uint256 currencyId
    )
    public
    onlyOperationalModeNormal
    onlySealedTrade(trade)
    onlySealedPayment(payment)
    {
        require(validator.isTradeParty(trade, wallet));
        require(validator.isPaymentParty(payment, wallet));
        require(
            (currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id) ||
            (currencyCt == trade.currencies.conjugate.ct && currencyId == trade.currencies.conjugate.id)
        );
        require(currencyCt == payment.currency.ct && currencyId == payment.currency.id);

        TradeTypesLib.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? TradeTypesLib.TradePartyRole.Buyer : TradeTypesLib.TradePartyRole.Seller);
        PaymentTypesLib.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? PaymentTypesLib.PaymentPartyRole.Sender : PaymentTypesLib.PaymentPartyRole.Recipient);

        require(validator.isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        NahmiiTypesLib.CurrencyRole tradeCurrencyRole = (currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id ? NahmiiTypesLib.CurrencyRole.Intended : NahmiiTypesLib.CurrencyRole.Conjugate);

        // Require existence of fraud signal
        require(!(
            (validator.isGenuineSuccessiveTradePaymentBalances(trade, tradePartyRole, tradeCurrencyRole, payment, paymentPartyRole)) &&
            (validator.isGenuineSuccessiveTradePaymentTotalFees(trade, tradePartyRole, payment))
        ));

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag payment (hash) as fraudulent
        fraudChallenge.addFraudulentPaymentHash(payment.seals.operator.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // Lock amount of size equivalent to payment amount
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            _paymentLockAmount(payment, paymentPartyRole),
            payment.currency.ct, payment.currency.id
        );

        // Emit event
        emit ChallengeByPaymentSucceedingTradeEvent(
            trade.seal.hash, payment.seals.operator.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _paymentLockAmount(PaymentTypesLib.Payment payment, PaymentTypesLib.PaymentPartyRole paymentPartyRole)
    private
    pure
    returns (int256)
    {
        return PaymentTypesLib.PaymentPartyRole.Sender == paymentPartyRole ?
        payment.sender.balances.current :
        payment.recipient.balances.current;
    }

}