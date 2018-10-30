/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {TransferController} from "./TransferController.sol";
import {ERC721} from "./ERC721.sol";

/**
@title ERC721TransferController
@notice Handles transfers of ERC721 tokens
*/
contract ERC721TransferController is TransferController {
    function isTyped() public view returns (bool) {
        return true;
    }

    function isQuantifiable() public view returns (bool) {
        return false;
    }

    function receive(address from, address to, uint256 amount, address currencyCt, uint256 currencyId) public {
        require(amount == 1);
        require(currencyId != 0);

        ERC721(currencyCt).safeTransferFrom(from, to, currencyId);

        // Raise event
        emit CurrencyTransferred(from, to, 1, currencyCt, currencyId);
    }

    /// @notice MUST be called with DELEGATECALL
    function approve(address to, uint256 amount, address currencyCt, uint256 currencyId) public {
        require(amount == 1);
        require(currencyId != 0);

        ERC721(currencyCt).approve(to, currencyId);
    }

    /// @notice MUST be called with DELEGATECALL
    function dispatch(address from, address to, uint256 amount, address currencyCt, uint256 currencyId) public {
        require(amount == 1);
        require(currencyId != 0);

        ERC721(currencyCt).approve(from, currencyId);
        ERC721(currencyCt).safeTransferFrom(from, to, currencyId);

        // Raise event
        emit CurrencyTransferred(from, to, 1, currencyCt, currencyId);
    }
}
