/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
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

    function receive(address from, address to, uint256 amount, address currency, uint256 currencyId) public {
        require(amount == 1);
        require(currencyId != 0);

        ERC721(currency).safeTransferFrom(from, to, currencyId);

        //raise event
        emit CurrencyTransferred(from, to, 1, currency, currencyId);
    }

    /// @notice MUST be called with DELEGATECALL
    function approve(address to, uint256 amount, address currency, uint256 currencyId) public {
        require(msg.sender != address(0));
        require(amount == 1);
        require(currencyId != 0);

        ERC721(currency).approve(to, currencyId);
    }

    /// @notice MUST be called with DELEGATECALL
    function send(address to, uint256 amount, address currency, uint256 currencyId) public {
        require(msg.sender != address(0));
        require(amount == 1);
        require(currencyId != 0);

        ERC721(currency).approve(to, currencyId);
        ERC721(currency).safeTransferFrom(msg.sender, to, currencyId);

        //raise event
        emit CurrencyTransferred(msg.sender, to, 1, currency, currencyId);
    }
}
