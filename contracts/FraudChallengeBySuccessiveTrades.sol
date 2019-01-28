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
import {Challenge} from "./Challenge.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";

/**
 * @title FraudChallengeBySuccessiveTrades
 * @notice Where driips are challenged wrt fraud by mismatch in successive trades
 */
contract FraudChallengeBySuccessiveTrades is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable, WalletLockable {
    using SafeMathIntLib for int256;

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
        NahmiiTypesLib.Trade firstTrade,
        NahmiiTypesLib.Trade lastTrade,
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
        require(
            (currencyCt == firstTrade.currencies.intended.ct && currencyId == firstTrade.currencies.intended.id) ||
            (currencyCt == firstTrade.currencies.conjugate.ct && currencyId == firstTrade.currencies.conjugate.id)
        );
        require(
            (currencyCt == lastTrade.currencies.intended.ct && currencyId == lastTrade.currencies.intended.id) ||
            (currencyCt == lastTrade.currencies.conjugate.ct && currencyId == lastTrade.currencies.conjugate.id)
        );

        NahmiiTypesLib.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? NahmiiTypesLib.TradePartyRole.Buyer : NahmiiTypesLib.TradePartyRole.Seller);
        NahmiiTypesLib.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? NahmiiTypesLib.TradePartyRole.Buyer : NahmiiTypesLib.TradePartyRole.Seller);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        NahmiiTypesLib.CurrencyRole firstTradeCurrencyRole = (currencyCt == firstTrade.currencies.intended.ct && currencyId == firstTrade.currencies.intended.id ? NahmiiTypesLib.CurrencyRole.Intended : NahmiiTypesLib.CurrencyRole.Conjugate);
        NahmiiTypesLib.CurrencyRole lastTradeCurrencyRole = (currencyCt == lastTrade.currencies.intended.ct && currencyId == lastTrade.currencies.intended.id ? NahmiiTypesLib.CurrencyRole.Intended : NahmiiTypesLib.CurrencyRole.Conjugate);

        // Require existence of fraud signal
        require(!(
            (validator.isGenuineSuccessiveTradesBalances(firstTrade, firstTradePartyRole, firstTradeCurrencyRole, lastTrade, lastTradePartyRole, lastTradeCurrencyRole)) &&
            (validator.isGenuineSuccessiveTradesTotalFees(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole))
        ));

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag last trade (hash) as fraudulent
        fraudChallenge.addFraudulentTradeHash(lastTrade.seal.hash);

        // Reward stake fraction
        securityBond.reward(msg.sender, configuration.fraudStakeFraction(), 0);

        // Lock amount of size equivalent to wallet's balance of intended or conjugate currencies
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            _tradeLockAmount(lastTrade, lastTradePartyRole, lastTradeCurrencyRole),
            currencyCt, currencyId
        );

        // Emit event
        emit ChallengeBySuccessiveTradesEvent(
            firstTrade.seal.hash, lastTrade.seal.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _tradeLockAmount(NahmiiTypesLib.Trade trade, NahmiiTypesLib.TradePartyRole tradePartyRole,
        NahmiiTypesLib.CurrencyRole currencyRole)
    private
    pure
    returns (int256)
    {
        if (NahmiiTypesLib.TradePartyRole.Buyer == tradePartyRole)
            if (NahmiiTypesLib.CurrencyRole.Intended == currencyRole)
                return trade.buyer.balances.intended.current;
            else // NahmiiTypesLib.CurrencyRole.Conjugate == currencyRole
                return trade.buyer.balances.conjugate.current;
        else // NahmiiTypesLib.TradePartyRole.Seller == tradePartyRole)
            if (NahmiiTypesLib.CurrencyRole.Intended == currencyRole)
                return trade.seller.balances.intended.current;
            else // NahmiiTypesLib.CurrencyRole.Conjugate == currencyRole
                return trade.seller.balances.conjugate.current;
    }
}