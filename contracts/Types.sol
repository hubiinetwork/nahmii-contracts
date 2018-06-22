/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

/**
 * @title     Types
 * @dev       Data types of order, trade, payment and more
 */
library Types {

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum LiquidityRole {Maker, Taker}
    enum CurrencyRole {Intended, Conjugate}
    enum DriipType {Trade, Payment}
    enum Sidedness {OneSided, TwoSided}
    enum Intention {Buy, Sell}
    enum TradePartyRole {Buyer, Seller}
    enum PaymentPartyRole {Sender, Recipient}
    enum ChallengePhase {Dispute, Closed}
    enum ChallengeResult {Unknown, Qualified, Disqualified}

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
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

    struct IntendedConjugateAddress {
        address intended;
        address conjugate;
    }

    struct IntendedConjugateInt256 {
        int256 intended;
        int256 conjugate;
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

    struct WalletExchangeSeals {
        Seal wallet;
        Seal exchange;
    }

    struct TradeParty {
        address wallet;
        uint256 nonce;
        uint256 rollingVolume;
        LiquidityRole liquidityRole;
        TradeOrder order;
        IntendedConjugateCurrentPreviousInt256 balances;
        IntendedConjugateInt256 netFees;
    }

    struct Trade {
        uint256 nonce;
        bool immediateSettlement;
        int256 amount;
        int256 rate;

        IntendedConjugateAddress currencies;

        TradeParty buyer;
        TradeParty seller;

        // Positive intended transfer is always in direction from seller to buyer
        // Positive conjugate transfer is always in direction from buyer to seller
        IntendedConjugateSingleNetInt256 transfers;

        IntendedConjugateInt256 singleFees;

        Seal seal;
        uint256 blockNumber;
    }

    struct PaymentParty {
        address wallet;
        uint256 nonce;
        CurrentPreviousInt256 balances;
        int256 netFee;
    }

    struct Payment {
        uint256 nonce;
        bool immediateSettlement;
        int256 amount;

        address currency;

        PaymentParty sender;
        PaymentParty recipient;

        // Positive transfer is always in direction from sender to recipient
        SingleNetInt256 transfers;

        int256 singleFee;

        WalletExchangeSeals seals;
        uint256 blockNumber;
    }

    struct OrderPlacement {
        Intention intention;
        bool immediateSettlement;
        int256 amount;
        int256 rate;

        IntendedConjugateAddress currencies;

        CurrentPreviousInt256 residuals;
    }

    struct Order {
        uint256 nonce;
        address wallet;
        OrderPlacement placement;
        WalletExchangeSeals seals;
        uint256 blockNumber;
    }

    struct Settlement {
        uint256 nonce;
        DriipType driipType;
        Sidedness sidedness;
        address[2] wallets;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function isTradeParty(Types.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.buyer.wallet || wallet == trade.seller.wallet;
    }

    function isTradeBuyer(Types.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.buyer.wallet;
    }

    function isTradeSeller(Types.Trade trade, address wallet) internal pure returns (bool) {
        return wallet == trade.seller.wallet;
    }

    function isPaymentParty(Types.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.sender.wallet || wallet == payment.recipient.wallet;
    }

    function isPaymentSender(Types.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.sender.wallet;
    }

    function isPaymentRecipient(Types.Payment payment, address wallet) internal pure returns (bool) {
        return wallet == payment.recipient.wallet;
    }

    function isTradeOrder(Types.Trade trade, Types.Order order) internal pure returns (bool) {
        return (trade.buyer.order.hashes.exchange == order.seals.exchange.hash ||
        trade.seller.order.hashes.exchange == order.seals.exchange.hash);
    }

    function isGenuineSignature(bytes32 hash, Types.Signature signature, address signer) internal pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        return ecrecover(prefixedHash, signature.v, signature.r, signature.s) == signer;
    }
}