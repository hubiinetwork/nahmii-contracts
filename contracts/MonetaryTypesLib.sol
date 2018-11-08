/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

/**
 * @title     MonetaryTypesLib
 * @dev       Data types
 */
library MonetaryTypesLib {
    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Currency {
        address ct;
        uint256 id;
    }

    struct Figure {
        int256 amount;
        Currency currency;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function getFigureByCurrency(Figure[] figures, Currency currency)
    public
    pure
    returns (Figure) {
        for (uint256 i = 0; i < figures.length; i++)
            if (figures[i].currency.ct == currency.ct && figures[i].currency.id == currency.id)
                return figures[i];
        return Figure(0, currency);
    }
}