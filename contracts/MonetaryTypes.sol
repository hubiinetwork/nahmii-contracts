/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

/**
 * @title     MonetaryTypes
 * @dev       Data types
 */
library MonetaryTypes {
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