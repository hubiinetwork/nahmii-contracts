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
 * @title FraudChallengeByTradeSucceedingPayment
 * @notice Where driips are challenged wrt fraud by mismatch in trade succeeding payment
 */
contract FraudChallengeByTradeSucceedingPayment is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
SecurityBondable, WalletLockable, BalanceTrackable {
    using SafeMathIntLib for int256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeSucceedingPaymentEvent(bytes32 paymentHash, bytes32 tradeHash,
        address challenger, address lockedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit payment and subsequent trade candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param payment Reference payment
    /// @param trade Fraudulent trade candidate
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function challenge(
        PaymentTypesLib.Payment memory payment,
        TradeTypesLib.Trade memory trade,
        address wallet,
        address currencyCt,
        uint256 currencyId
    )
    public
    onlyOperationalModeNormal
    onlySealedPayment(payment)
    onlySealedTrade(trade)
    {
        require(validator.isPaymentParty(payment, wallet));
        require(validator.isTradeParty(trade, wallet));

        require(validator.isPaymentCurrency(payment, MonetaryTypesLib.Currency(currencyCt, currencyId)));
        require(validator.isTradeCurrency(trade, MonetaryTypesLib.Currency(currencyCt, currencyId)));

        (
        PaymentTypesLib.PaymentPartyRole paymentPartyRole,
        TradeTypesLib.TradePartyRole tradePartyRole,
        TradeTypesLib.CurrencyRole tradeCurrencyRole,
        int256 deltaActiveBalance
        )
        = _rolesAndDeltaActiveBalance(payment, trade, wallet, MonetaryTypesLib.Currency(currencyCt, currencyId));

        require(validator.isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        // Require existence of fraud signal
        require(!(
        validator.isGenuineSuccessivePaymentTradeBalances(
            payment, paymentPartyRole, trade, tradePartyRole, tradeCurrencyRole, deltaActiveBalance
        ) &&
        validator.isGenuineSuccessivePaymentTradeTotalFees(payment, paymentPartyRole, trade, tradePartyRole)
        ));

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag payment (hash) as fraudulent
        fraudChallenge.addFraudulentTradeHash(trade.seal.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // Lock amount of size equivalent to trade amount of currency of wallet
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            _tradeLockAmount(trade, tradePartyRole, tradeCurrencyRole),
            currencyCt, currencyId, 0
        );

        emit ChallengeByTradeSucceedingPaymentEvent(
            payment.seals.operator.hash, trade.seal.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _rolesAndDeltaActiveBalance(PaymentTypesLib.Payment memory payment, TradeTypesLib.Trade memory trade, address wallet,
        MonetaryTypesLib.Currency memory currency)
    private
    view
    returns (
        PaymentTypesLib.PaymentPartyRole paymentPartyRole, TradeTypesLib.TradePartyRole tradePartyRole,
        TradeTypesLib.CurrencyRole tradeCurrencyRole, int256 deltaActiveBalance
    )
    {
        paymentPartyRole = _paymentPartyRole(payment, wallet);
        tradePartyRole = _tradePartyRole(trade, wallet);

        tradeCurrencyRole = _tradeCurrencyRole(trade, currency);

        deltaActiveBalance = balanceTracker.fungibleActiveDeltaBalanceAmountByBlockNumbers(
            wallet, currency, payment.blockNumber, trade.blockNumber
        );
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

    function _tradeLockAmount(TradeTypesLib.Trade memory trade, TradeTypesLib.TradePartyRole tradePartyRole,
        TradeTypesLib.CurrencyRole currencyRole)
    private
    pure
    returns (int256)
    {
        if (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole)
            if (TradeTypesLib.CurrencyRole.Intended == currencyRole)
                return trade.buyer.balances.intended.current;
            else // TradeTypesLib.CurrencyRole.Conjugate == currencyRole
                return trade.buyer.balances.conjugate.current;
        else // TradeTypesLib.TradePartyRole.Seller == tradePartyRole)
            if (TradeTypesLib.CurrencyRole.Intended == currencyRole)
                return trade.seller.balances.intended.current;
            else // TradeTypesLib.CurrencyRole.Conjugate == currencyRole
                return trade.seller.balances.conjugate.current;
    }
}