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
import {WalletLockable} from "./WalletLockable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";

/**
 * @title FraudChallengeByTradeSucceedingPayment
 * @notice Where driips are challenged wrt fraud by mismatch in trade succeeding payment
 */
contract FraudChallengeByTradeSucceedingPayment is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
SecurityBondable, WalletLockable {
    using SafeMathIntLib for int256;

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
        PaymentTypesLib.Payment payment,
        TradeTypesLib.Trade trade,
        address wallet,
        address currencyCt,
        uint256 currencyId
    )
    public
    onlyOperationalModeNormal
    onlySealedPayment(payment)
    onlySealedTrade(trade)
    {
        require(validator.isTradeParty(trade, wallet));
        require(validator.isPaymentParty(payment, wallet));
        require(currencyCt == payment.currency.ct && currencyId == payment.currency.id);
        require(
            (currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id) ||
            (currencyCt == trade.currencies.conjugate.ct && currencyId == trade.currencies.conjugate.id)
        );

        PaymentTypesLib.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? PaymentTypesLib.PaymentPartyRole.Sender : PaymentTypesLib.PaymentPartyRole.Recipient);
        TradeTypesLib.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? TradeTypesLib.TradePartyRole.Buyer : TradeTypesLib.TradePartyRole.Seller);

        require(validator.isSuccessivePaymentTradePartyNonces(payment, paymentPartyRole, trade, tradePartyRole));

        NahmiiTypesLib.CurrencyRole tradeCurrencyRole = (currencyCt == trade.currencies.intended.ct && currencyId == trade.currencies.intended.id ? NahmiiTypesLib.CurrencyRole.Intended : NahmiiTypesLib.CurrencyRole.Conjugate);

        // Require existence of fraud signal
        require(!(
            (validator.isGenuineSuccessivePaymentTradeBalances(payment, paymentPartyRole, trade, tradePartyRole, tradeCurrencyRole)) &&
            (validator.isGenuineSuccessivePaymentTradeTotalFees(payment, paymentPartyRole, trade, tradePartyRole))
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
            currencyCt, currencyId
        );

        emit ChallengeByTradeSucceedingPaymentEvent(
            payment.seals.operator.hash, trade.seal.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _tradeLockAmount(TradeTypesLib.Trade trade, TradeTypesLib.TradePartyRole tradePartyRole,
        NahmiiTypesLib.CurrencyRole currencyRole)
    private
    pure
    returns (int256)
    {
        if (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole)
            if (NahmiiTypesLib.CurrencyRole.Intended == currencyRole)
                return trade.buyer.balances.intended.current;
            else // NahmiiTypesLib.CurrencyRole.Conjugate == currencyRole
                return trade.buyer.balances.conjugate.current;
        else // TradeTypesLib.TradePartyRole.Seller == tradePartyRole)
            if (NahmiiTypesLib.CurrencyRole.Intended == currencyRole)
                return trade.seller.balances.intended.current;
            else // NahmiiTypesLib.CurrencyRole.Conjugate == currencyRole
                return trade.seller.balances.conjugate.current;
    }
}