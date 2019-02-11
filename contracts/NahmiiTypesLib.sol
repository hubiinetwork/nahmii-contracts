/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";

// TODO Consider removal vs strip-down
//   * possibly keep it for CurrencyRole, DriipType and ChallengePhase
//   * DriipType is too rigid and should rather have dynamic size.
/**
 * @title     NahmiiTypesLib
 * @dev       Data types of general nahmii character
 */
library NahmiiTypesLib {
    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum LiquidityRole {Maker, Taker} // TODO Remove
    enum CurrencyRole {Intended, Conjugate}
    enum DriipType {Trade, Payment} // TODO Make dynamic
    enum Intention {Buy, Sell} // TODO Remove
    enum TradePartyRole {Buyer, Seller} // TODO Remove
    enum PaymentPartyRole {Sender, Recipient} // TODO Remove
    enum ChallengePhase {Dispute, Closed} // TODO Move

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct OriginFigure {
        uint256 originId;
        MonetaryTypesLib.Figure figure;
    }

    struct IntendedConjugateCurrency {
        MonetaryTypesLib.Currency intended;
        MonetaryTypesLib.Currency conjugate;
    }

    struct SingleFigureTotalOriginFigures {
        MonetaryTypesLib.Figure single;
        OriginFigure[] total;
    }

    struct TotalOriginFigures {
        OriginFigure[] total;
    }

    struct CurrentPreviousInt256 {
        int256 current;
        int256 previous;
    }

    struct SingleTotalInt256 {
        int256 single;
        int256 total;
    }

    struct IntendedConjugateCurrentPreviousInt256 {
        CurrentPreviousInt256 intended;
        CurrentPreviousInt256 conjugate;
    }

    struct IntendedConjugateSingleTotalInt256 {
        SingleTotalInt256 intended;
        SingleTotalInt256 conjugate;
    }

    struct WalletOperatorHashes {
        bytes32 wallet;
        bytes32 operator;
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

    struct WalletOperatorSeal {
        Seal wallet;
        Seal operator;
    }

    // TODO Remove
    struct TradeOrder {
        int256 amount;
        WalletOperatorHashes hashes;
        CurrentPreviousInt256 residuals;
    }

    // TODO Remove
    struct TradeParty {
        uint256 nonce;
        address wallet;

        uint256 rollingVolume;

        LiquidityRole liquidityRole;

        TradeOrder order;

        IntendedConjugateCurrentPreviousInt256 balances;

        SingleFigureTotalOriginFigures fees;
    }

    // TODO Remove
    struct Trade {
        uint256 nonce;

        int256 amount;
        IntendedConjugateCurrency currencies;
        int256 rate;

        TradeParty buyer;
        TradeParty seller;

        // Positive intended transfer is always in direction from seller to buyer
        // Positive conjugate transfer is always in direction from buyer to seller
        IntendedConjugateSingleTotalInt256 transfers;

        Seal seal;
        uint256 blockNumber;
        uint256 operatorId;
    }

    // TODO Remove
    struct PaymentSenderParty {
        uint256 nonce;
        address wallet;

        CurrentPreviousInt256 balances;

        SingleFigureTotalOriginFigures fees;
    }

    // TODO Remove
    struct PaymentRecipientParty {
        uint256 nonce;
        address wallet;

        CurrentPreviousInt256 balances;

        TotalOriginFigures fees;
    }

    // TODO Remove
    struct Payment {
        uint256 nonce;

        int256 amount;
        MonetaryTypesLib.Currency currency;

        PaymentSenderParty sender;
        PaymentRecipientParty recipient;

        // Positive transfer is always in direction from sender to recipient
        SingleTotalInt256 transfers;

        WalletOperatorSeal seals;
        uint256 blockNumber;
        uint256 operatorId;
    }

    // TODO Remove
    struct OrderPlacement {
        Intention intention;

        int256 amount;
        IntendedConjugateCurrency currencies;
        int256 rate;

        CurrentPreviousInt256 residuals;
    }

    // TODO Remove
    struct Order {
        uint256 nonce;
        address wallet;

        OrderPlacement placement;

        WalletOperatorSeal seals;
        uint256 blockNumber;
        uint256 operatorId;
    }
}