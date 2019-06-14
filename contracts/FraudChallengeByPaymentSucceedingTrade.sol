/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {ValidatableV2} from "./ValidatableV2.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title FraudChallengeByPaymentSucceedingTrade
 * @notice Where driips are challenged wrt fraud by mismatch in payment succeeding trade
 */
contract FraudChallengeByPaymentSucceedingTrade is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
SecurityBondable, WalletLockable, BalanceTrackable {
    using SafeMathIntLib for int256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByPaymentSucceedingTradeEvent(bytes32 tradeHash, bytes32 paymentHash,
        address challenger, address lockedWallet);

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
        TradeTypesLib.Trade memory trade,
        PaymentTypesLib.Payment memory payment,
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

        require(validator.isTradeCurrency(trade, MonetaryTypesLib.Currency(currencyCt, currencyId)));
        require(validator.isPaymentCurrency(payment, MonetaryTypesLib.Currency(currencyCt, currencyId)));

        (
        TradeTypesLib.TradePartyRole tradePartyRole,
        PaymentTypesLib.PaymentPartyRole paymentPartyRole,
        TradeTypesLib.CurrencyRole tradeCurrencyRole,
        int256 deltaActiveBalance
        )
        = _rolesAndDeltaActiveBalance(trade, payment, wallet, MonetaryTypesLib.Currency(currencyCt, currencyId));

        require(validator.isSuccessiveTradePaymentPartyNonces(trade, tradePartyRole, payment, paymentPartyRole));

        // Require existence of fraud signal
        require(!(
        validator.isGenuineSuccessiveTradePaymentBalances(
            trade, tradePartyRole, tradeCurrencyRole, payment, paymentPartyRole, deltaActiveBalance
        ) &&
        validator.isGenuineSuccessiveTradePaymentTotalFees(trade, tradePartyRole, payment)
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
            payment.currency.ct, payment.currency.id, 0
        );

        // Emit event
        emit ChallengeByPaymentSucceedingTradeEvent(
            trade.seal.hash, payment.seals.operator.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _rolesAndDeltaActiveBalance(TradeTypesLib.Trade memory trade, PaymentTypesLib.Payment memory payment, address wallet,
        MonetaryTypesLib.Currency memory currency)
    private
    view
    returns (
        TradeTypesLib.TradePartyRole tradePartyRole, PaymentTypesLib.PaymentPartyRole paymentPartyRole,
        TradeTypesLib.CurrencyRole tradeCurrencyRole, int256 deltaActiveBalance
    )
    {
        tradePartyRole = _tradePartyRole(trade, wallet);
        paymentPartyRole = _paymentPartyRole(payment, wallet);

        tradeCurrencyRole = _tradeCurrencyRole(trade, currency);

        deltaActiveBalance = balanceTracker.fungibleActiveDeltaBalanceAmountByBlockNumbers(
            wallet, currency, trade.blockNumber, payment.blockNumber
        );
    }

    function _tradePartyRole(TradeTypesLib.Trade memory trade, address wallet)
    private
    view
    returns (TradeTypesLib.TradePartyRole)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        TradeTypesLib.TradePartyRole.Buyer :
        TradeTypesLib.TradePartyRole.Seller;
    }

    function _tradeCurrencyRole(TradeTypesLib.Trade memory trade, MonetaryTypesLib.Currency memory currency)
    private
    view
    returns (TradeTypesLib.CurrencyRole)
    {
        return validator.isTradeIntendedCurrency(trade, currency) ?
        TradeTypesLib.CurrencyRole.Intended :
        TradeTypesLib.CurrencyRole.Conjugate;
    }

    function _paymentPartyRole(PaymentTypesLib.Payment memory payment, address wallet)
    private
    view
    returns (PaymentTypesLib.PaymentPartyRole)
    {
        return validator.isPaymentSender(payment, wallet) ?
        PaymentTypesLib.PaymentPartyRole.Sender :
        PaymentTypesLib.PaymentPartyRole.Recipient;
    }

    function _paymentLockAmount(PaymentTypesLib.Payment memory payment, PaymentTypesLib.PaymentPartyRole paymentPartyRole)
    private
    pure
    returns (int256)
    {
        return PaymentTypesLib.PaymentPartyRole.Sender == paymentPartyRole ?
        payment.sender.balances.current :
        payment.recipient.balances.current;
    }
}