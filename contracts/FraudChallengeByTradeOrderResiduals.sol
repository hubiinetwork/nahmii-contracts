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
 * @title FraudChallengeByTradeOrderResiduals
 * @notice Where driips are challenged wrt fraud by mismatch in trade order residuals
 */
contract FraudChallengeByTradeOrderResiduals is Ownable, FraudChallengable, Challenge, Validatable,
SecurityBondable, WalletLockable {
    using SafeMathIntLib for int256;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeByTradeOrderResidualsEvent(bytes32 firstTradeHash, bytes32 lastTradeHash,
        address challenger, address lockedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two trade candidates in continuous Fraud Challenge (FC) to be tested for
    /// trade order residual differences
    /// @param firstTrade Reference trade
    /// @param lastTrade Fraudulent trade candidate
    /// @param wallet The address of the concerned wallet
    function challenge(
        NahmiiTypesLib.Trade firstTrade,
        NahmiiTypesLib.Trade lastTrade,
        address wallet
    )
    public
    onlyOperationalModeNormal
    onlySealedTrade(firstTrade)
    onlySealedTrade(lastTrade)
    {
        require(validator.isTradeParty(firstTrade, wallet));
        require(validator.isTradeParty(lastTrade, wallet));

        // Require that the wallet has the same party role in both trades
        NahmiiTypesLib.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? NahmiiTypesLib.TradePartyRole.Buyer : NahmiiTypesLib.TradePartyRole.Seller);
        NahmiiTypesLib.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? NahmiiTypesLib.TradePartyRole.Buyer : NahmiiTypesLib.TradePartyRole.Seller);
        require(firstTradePartyRole == lastTradePartyRole);

        // Require that the two trades's relevant wallet order hash (that excludes residual) are equal
        if (NahmiiTypesLib.TradePartyRole.Buyer == firstTradePartyRole)
            require(firstTrade.buyer.order.hashes.wallet == lastTrade.buyer.order.hashes.wallet);
        else // NahmiiTypesLib.TradePartyRole.Seller == firstTradePartyRole
            require(firstTrade.seller.order.hashes.wallet == lastTrade.seller.order.hashes.wallet);

        require(validator.isSuccessiveTradesPartyNonces(firstTrade, firstTradePartyRole, lastTrade, lastTradePartyRole));

        // Require existence of fraud signal
        require(!validator.isGenuineSuccessiveTradeOrderResiduals(firstTrade, lastTrade, firstTradePartyRole));

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag last trade (hash) as fraudulent
        fraudChallenge.addFraudulentTradeHash(lastTrade.seal.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // Lock amounts of size equivalent to last trade's balances
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            _tradeIntendedLockAmount(lastTrade, lastTradePartyRole),
            lastTrade.currencies.intended.ct, lastTrade.currencies.intended.id
        );
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            _tradeConjugateLockAmount(lastTrade, lastTradePartyRole),
            lastTrade.currencies.conjugate.ct, lastTrade.currencies.conjugate.id
        );

        // Emit event
        emit ChallengeByTradeOrderResidualsEvent(
            firstTrade.seal.hash, lastTrade.seal.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _tradeIntendedLockAmount(NahmiiTypesLib.Trade trade, NahmiiTypesLib.TradePartyRole tradePartyRole)
    private
    pure
    returns (int256)
    {
        if (NahmiiTypesLib.TradePartyRole.Buyer == tradePartyRole)
            return trade.buyer.balances.intended.current;
        else // NahmiiTypesLib.TradePartyRole.Seller == tradePartyRole)
            return trade.seller.balances.intended.current;
    }

    function _tradeConjugateLockAmount(NahmiiTypesLib.Trade trade, NahmiiTypesLib.TradePartyRole tradePartyRole)
    private
    pure
    returns (int256)
    {
        if (NahmiiTypesLib.TradePartyRole.Buyer == tradePartyRole)
            return trade.buyer.balances.conjugate.current;
        else // NahmiiTypesLib.TradePartyRole.Seller == tradePartyRole)
            return trade.seller.balances.conjugate.current;
    }
}