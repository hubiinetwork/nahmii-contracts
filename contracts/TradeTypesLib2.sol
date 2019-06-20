/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

/**
 * @title     TradeTypesLib2
 * @dev       Data types centered around trade
 */
library TradeTypesLib2 {
    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum CurrencyRole {Intended, Conjugate}
    enum LiquidityRole {Maker, Taker}
    enum Intention {Buy, Sell}
    enum TradePartyRole {Buyer, Seller}

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Operator {
        uint256 id;
        string data;
    }

    struct OrderParty {
        uint256 nonce;
        address wallet;

        NahmiiTypesLib.IntendedConjugateInt256 balances;

        string data;
    }

    struct OrderPlacement {
        Intention intention;

        int256 amount;
        NahmiiTypesLib.IntendedConjugateCurrency currencies;
        int256 rate;
    }

    struct Order {
        OrderParty party;

        OrderPlacement placement;

        NahmiiTypesLib.WalletOperatorSeal seals;
        uint256 blockNumber;

        Operator operator;
    }

    struct OrderCancellation {
        OrderParty party;

        NahmiiTypesLib.WalletOperatorSeal seals;
        uint256 blockNumber;

        Operator operator;
    }

    struct TradeOrder {
        int256 amount;
        NahmiiTypesLib.WalletOperatorHashes hashes;
        NahmiiTypesLib.CurrentPreviousInt256 residuals;
    }

    struct TradeParty {
        uint256 nonce;
        address wallet;

        uint256 rollingVolume;

        LiquidityRole liquidityRole;

        TradeOrder order;

        NahmiiTypesLib.IntendedConjugateCurrentPreviousInt256 balances;

        NahmiiTypesLib.SingleFigureTotalOriginFigures fees;

        string data;
    }

    struct Trade {
        int256 amount;
        NahmiiTypesLib.IntendedConjugateCurrency currencies;
        int256 rate;

        TradeParty buyer;
        TradeParty seller;

        // TODO Consider the need after updating overrun logics when challenging NSC and DSC by trade
        // Positive intended transfer is always in direction from seller to buyer
        // Positive conjugate transfer is always in direction from buyer to seller
        NahmiiTypesLib.IntendedConjugateSingleTotalInt256 transfers;

        NahmiiTypesLib.Seal seal;
        uint256 blockNumber;

        Operator operator;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function TRADE_KIND()
    public
    pure
    returns (string memory)
    {
        return "trade";
    }

    function ORDER_KIND()
    public
    pure
    returns (string memory)
    {
        return "order";
    }
}