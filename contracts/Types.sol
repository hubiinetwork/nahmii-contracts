pragma solidity ^0.4.23;

/**
 * @title     Types
 * @dev       Data types
 * Copyright  (C) 2017-2018 Hubii AS
 */
library Types {

    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum LiquidityRole {Maker, Taker}
    enum CurrencyRole {Intended, Conjugate}
    enum DealType {Trade, Payment}
    enum Sidedness {OneSided, TwoSided}
    enum TradePartyRole {Buyer, Seller}
    enum PaymentPartyRole {Source, Destination}

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

    struct PartyExchangeHashes {
        bytes32 party;
        bytes32 exchange;
    }

    struct Order {
        int256 amount;
        PartyExchangeHashes hashes;
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

    struct PartyExchangeSeals {
        Seal party;
        Seal exchange;
    }

    struct TradeParty {
        address _address;
        uint256 nonce;
        uint256 rollingVolume;
        LiquidityRole liquidityRole;
        Order order;
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
        address _address;
        uint256 nonce;
        CurrentPreviousInt256 balances;
        int256 netFee;
    }

    struct Payment {
        uint256 nonce;
        bool immediateSettlement;
        int256 amount;

        address currency;

        PaymentParty source;
        PaymentParty destination;

        // Positive transfer is always in direction from source to destination
        SingleNetInt256 transfers;

        int256 singleFee;

        PartyExchangeSeals seals;
        uint256 blockNumber;
    }

    struct Settlement {
        uint256 nonce;
        DealType dealType;
        Sidedness sidedness;
        address[2] wallets;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    // TODO Implement fully
    function hashTrade(Types.Trade trade) internal pure returns (bytes32) {
        return keccak256(bytes32(trade.nonce));
    }

    // TODO Implement fully
    function hashPaymentAsParty(Types.Payment payment) internal pure returns (bytes32) {
        return keccak256(bytes32(payment.nonce));
    }

    // TODO Implement fully
    function hashPaymentAsExchange(Types.Payment payment) internal pure returns (bytes32) {
        return keccak256(bytes32(payment.nonce));
    }
}
