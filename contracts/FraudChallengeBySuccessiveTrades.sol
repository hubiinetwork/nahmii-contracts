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
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title FraudChallengeBySuccessiveTrades
 * @notice Where driips are challenged wrt fraud by mismatch in successive trades
 */
contract FraudChallengeBySuccessiveTrades is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
SecurityBondable, WalletLockable, BalanceTrackable {
    using SafeMathIntLib for int256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeBySuccessiveTradesEvent(bytes32 firstTradeHash, bytes32 lastTradeHash,
        address challenger, address lockedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function challenge(
        TradeTypesLib.Trade memory firstTrade,
        TradeTypesLib.Trade memory lastTrade,
        address wallet,
        address currencyCt,
        uint256 currencyId
    )
    public
    onlyOperationalModeNormal
    onlySealedTrade(firstTrade)
    onlySealedTrade(lastTrade)
    {
        require(validator.isTradeParty(firstTrade, wallet));
        require(validator.isTradeParty(lastTrade, wallet));

        require(validator.isTradeCurrency(firstTrade, MonetaryTypesLib.Currency(currencyCt, currencyId)));
        require(validator.isTradeCurrency(lastTrade, MonetaryTypesLib.Currency(currencyCt, currencyId)));

        (
        TradeTypesLib.TradePartyRole firstTradePartyRole,
        TradeTypesLib.TradePartyRole lastTradePartyRole,
        TradeTypesLib.CurrencyRole firstTradeCurrencyRole,
        TradeTypesLib.CurrencyRole lastTradeCurrencyRole,
        int256 deltaActiveBalance
        )
        = _rolesAndDeltaActiveBalance(firstTrade, lastTrade, wallet, MonetaryTypesLib.Currency(currencyCt, currencyId));

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        // Require existence of fraud signal
        require(!(
        validator.isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstTradeCurrencyRole, lastTrade, lastTradePartyRole, lastTradeCurrencyRole, deltaActiveBalance) &&
        validator.isGenuineSuccessiveTradesTotalFees(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole)
        ));

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag last trade (hash) as fraudulent
        fraudChallenge.addFraudulentTradeHash(lastTrade.seal.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // Lock amount of size equivalent to wallet's balance of intended or conjugate currencies
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            _tradeLockAmount(lastTrade, lastTradePartyRole, lastTradeCurrencyRole),
            currencyCt, currencyId, 0
        );

        // Emit event
        emit ChallengeBySuccessiveTradesEvent(
            firstTrade.seal.hash, lastTrade.seal.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _rolesAndDeltaActiveBalance(TradeTypesLib.Trade memory firstTrade, TradeTypesLib.Trade memory lastTrade, address wallet,
        MonetaryTypesLib.Currency memory currency)
    private
    view
    returns (
        TradeTypesLib.TradePartyRole firstTradePartyRole, TradeTypesLib.TradePartyRole lastTradePartyRole,
        TradeTypesLib.CurrencyRole firstTradeCurrencyRole, TradeTypesLib.CurrencyRole lastTradeCurrencyRole,
        int256 deltaActiveBalance
    )
    {
        firstTradePartyRole = _tradePartyRole(firstTrade, wallet);
        lastTradePartyRole = _tradePartyRole(lastTrade, wallet);

        firstTradeCurrencyRole = _tradeCurrencyRole(firstTrade, currency);
        lastTradeCurrencyRole = _tradeCurrencyRole(lastTrade, currency);

        deltaActiveBalance = balanceTracker.fungibleActiveDeltaBalanceAmountByBlockNumbers(
            wallet, currency, firstTrade.blockNumber, lastTrade.blockNumber
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

    function _tradeCurrency(TradeTypesLib.Trade memory trade, TradeTypesLib.CurrencyRole currencyRole)
    private
    pure
    returns (MonetaryTypesLib.Currency memory)
    {
        if (TradeTypesLib.CurrencyRole.Intended == currencyRole)
            return trade.currencies.intended;
        else // TradeTypesLib.CurrencyRole.Conjugate == currencyRole
            return trade.currencies.conjugate;
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