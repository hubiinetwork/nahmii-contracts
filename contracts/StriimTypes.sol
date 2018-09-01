/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {MonetaryTypes} from "./MonetaryTypes.sol";

/**
 * @title     StriimTypes
 * @dev       Data types of order, trade, payment and more
 */
library StriimTypes {
    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum LiquidityRole {Maker, Taker}
    enum CurrencyRole {Intended, Conjugate}
    enum DriipType {Trade, Payment}
    enum Intention {Buy, Sell}
    enum TradePartyRole {Buyer, Seller}
    enum PaymentPartyRole {Sender, Recipient}
    enum ChallengePhase {Dispute, Closed} // TODO Consider moving to DriipSettlementChallengeTypes
    enum ChallengeStatus {Unknown, Qualified, Disqualified} // TODO Consider moving to DriipSettlementChallengeTypes
    enum SettlementRole {Origin, Target}

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct IntendedConjugateCurrency {
        MonetaryTypes.Currency intended;
        MonetaryTypes.Currency conjugate;
    }

    struct SingleFigureNetFigures {
        MonetaryTypes.Figure single;
        MonetaryTypes.Figure[] net;
    }

    struct NetFigures {
        MonetaryTypes.Figure[] net;
    }

    struct CurrentPreviousInt256 {
        int256 current;
        int256 previous;
    }

    struct SingleNetInt256 {
        int256 single;
        int256 net;
    }

    struct IntendedConjugateCurrentPreviousInt256 {
        CurrentPreviousInt256 intended;
        CurrentPreviousInt256 conjugate;
    }

    struct IntendedConjugateSingleNetInt256 {
        SingleNetInt256 intended;
        SingleNetInt256 conjugate;
    }

    struct WalletExchangeHashes {
        bytes32 wallet;
        bytes32 exchange;
    }

    struct TradeOrder {
        int256 amount;
        WalletExchangeHashes hashes;
        CurrentPreviousInt256 residuals;
    }

    struct Signature {
        bytes32 r;
        bytes32 s;
        uint8 v;
    }

    struct Seal {
        bytes32 hash;
        Signature signature;
    }

    struct WalletExchangeSeal {
        Seal wallet;
        Seal exchange;
    }

    struct TradeParty {
        uint256 nonce;
        address wallet;

        uint256 rollingVolume;

        LiquidityRole liquidityRole;

        TradeOrder order;

        IntendedConjugateCurrentPreviousInt256 balances;

        SingleFigureNetFigures fees;
    }

    struct Trade {
        uint256 nonce;

        int256 amount;
        IntendedConjugateCurrency currencies;
        int256 rate;

        TradeParty buyer;
        TradeParty seller;

        // Positive intended transfer is always in direction from seller to buyer
        // Positive conjugate transfer is always in direction from buyer to seller
        IntendedConjugateSingleNetInt256 transfers;

        Seal seal;
        uint256 blockNumber;
    }

    struct PaymentSenderParty {
        uint256 nonce;
        address wallet;

        CurrentPreviousInt256 balances;

        SingleFigureNetFigures fees;
    }

    struct PaymentRecipientParty {
        uint256 nonce;
        address wallet;

        CurrentPreviousInt256 balances;

        NetFigures fees;
    }

    struct Payment {
        uint256 nonce;

        int256 amount;
        MonetaryTypes.Currency currency;

        PaymentSenderParty sender;
        PaymentRecipientParty recipient;

        // Positive transfer is always in direction from sender to recipient
        SingleNetInt256 transfers;

        WalletExchangeSeal seals;
        uint256 blockNumber;
    }

    struct OrderPlacement {
        Intention intention;

        int256 amount;
        IntendedConjugateCurrency currencies;
        int256 rate;

        CurrentPreviousInt256 residuals;
    }

    struct Order {
        uint256 nonce;
        address wallet;

        OrderPlacement placement;

        WalletExchangeSeal seals;
        uint256 blockNumber;
    }

    struct Settlement {
        uint256 nonce;
        DriipType driipType;
        address origin;
        address target;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function isTradeParty(StriimTypes.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.buyer.wallet || wallet == trade.seller.wallet;
    }

    function isTradeBuyer(StriimTypes.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.buyer.wallet;
    }

    function isTradeSeller(StriimTypes.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.seller.wallet;
    }

    function isPaymentParty(StriimTypes.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.sender.wallet || wallet == payment.recipient.wallet;
    }

    function isPaymentSender(StriimTypes.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.sender.wallet;
    }

    function isPaymentRecipient(StriimTypes.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.recipient.wallet;
    }

    function isTradeOrder(StriimTypes.Trade trade, StriimTypes.Order order) internal pure returns (bool) {
        return (trade.buyer.order.hashes.exchange == order.seals.exchange.hash ||
        trade.seller.order.hashes.exchange == order.seals.exchange.hash);
    }

    function isGenuineSignature(bytes32 hash, StriimTypes.Signature signature, address signer) internal pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        return ecrecover(prefixedHash, signature.v, signature.r, signature.s) == signer;
    }
}