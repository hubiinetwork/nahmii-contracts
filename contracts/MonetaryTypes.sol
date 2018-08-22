/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

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
}