/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";

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
    struct PaymentSenderParty {
        uint256 nonce;
        address wallet;

        uint256 lastSync;

        NahmiiTypesLib.CurrentPreviousInt256 balances;

        NahmiiTypesLib.SingleFigureTotalOriginFigures fees;
    }

    struct PaymentRecipientParty {
        uint256 nonce;
        address wallet;

        uint256 lastSync;

        NahmiiTypesLib.CurrentPreviousInt256 balances;

        NahmiiTypesLib.TotalOriginFigures fees;
    }

    struct Payment {
        uint256 nonce;

        int256 amount;
        MonetaryTypesLib.Currency currency;

        PaymentSenderParty sender;
        PaymentRecipientParty recipient;

        // Positive transfer is always in direction from sender to recipient
        NahmiiTypesLib.SingleTotalInt256 transfers;

        NahmiiTypesLib.WalletOperatorSeal seals;
        uint256 blockNumber;
        uint256 operatorId;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function PAYMENT_TYPE()
    public
    pure
    returns (string)
    {
        return "payment";
    }
}