/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";

/**
 * @title     PaymentTypesLib
 * @dev       Data types centered around payment
 */
library PaymentTypesLib {
    //
    // Enums
    // -----------------------------------------------------------------------------------------------------------------
    enum PaymentPartyRole {Sender, Recipient}

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct OriginFigure {
        uint256 originId;
        MonetaryTypesLib.Figure figure;
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

    struct PaymentSenderParty {
        uint256 nonce;
        address wallet;

        CurrentPreviousInt256 balances;

        SingleFigureTotalOriginFigures fees;
    }

    struct PaymentRecipientParty {
        uint256 nonce;
        address wallet;

        CurrentPreviousInt256 balances;

        TotalOriginFigures fees;
    }

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
}