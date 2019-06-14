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
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";

/**
 * @title FraudChallengeByTradeOrderResiduals
 * @notice Where driips are challenged wrt fraud by mismatch in trade order residuals
 */
contract FraudChallengeByTradeOrderResiduals is Ownable, FraudChallengable, ConfigurableOperational, ValidatableV2,
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
        TradeTypesLib.Trade memory firstTrade,
        TradeTypesLib.Trade memory lastTrade,
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
        TradeTypesLib.TradePartyRole firstTradePartyRole = (wallet == firstTrade.buyer.wallet ? TradeTypesLib.TradePartyRole.Buyer : TradeTypesLib.TradePartyRole.Seller);
        TradeTypesLib.TradePartyRole lastTradePartyRole = (wallet == lastTrade.buyer.wallet ? TradeTypesLib.TradePartyRole.Buyer : TradeTypesLib.TradePartyRole.Seller);
        require(firstTradePartyRole == lastTradePartyRole);

        // Require that the two trades's relevant wallet order hash (that excludes residual) are equal
        if (TradeTypesLib.TradePartyRole.Buyer == firstTradePartyRole)
            require(firstTrade.buyer.order.hashes.wallet == lastTrade.buyer.order.hashes.wallet);
        else // TradeTypesLib.TradePartyRole.Seller == firstTradePartyRole
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
            lastTrade.currencies.intended.ct, lastTrade.currencies.intended.id, 0
        );
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            _tradeConjugateLockAmount(lastTrade, lastTradePartyRole),
            lastTrade.currencies.conjugate.ct, lastTrade.currencies.conjugate.id, 0
        );

        // Emit event
        emit ChallengeByTradeOrderResidualsEvent(
            firstTrade.seal.hash, lastTrade.seal.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _tradeIntendedLockAmount(TradeTypesLib.Trade memory trade, TradeTypesLib.TradePartyRole tradePartyRole)
    private
    pure
    returns (int256)
    {
        if (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole)
            return trade.buyer.balances.intended.current;
        else // TradeTypesLib.TradePartyRole.Seller == tradePartyRole)
            return trade.seller.balances.intended.current;
    }

    function _tradeConjugateLockAmount(TradeTypesLib.Trade memory trade, TradeTypesLib.TradePartyRole tradePartyRole)
    private
    pure
    returns (int256)
    {
        if (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole)
            return trade.buyer.balances.conjugate.current;
        else // TradeTypesLib.TradePartyRole.Seller == tradePartyRole)
            return trade.seller.balances.conjugate.current;
    }
}