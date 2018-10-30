/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {TransferController} from "./TransferController.sol";
import {ERC20} from "./ERC20.sol";

/**
@title ERC20TransferController
@notice Handles transfers of ERC20 tokens
*/
contract ERC20TransferController is TransferController {
    function isTyped() public view returns (bool) {
        return false;
    }

    function isQuantifiable() public view returns (bool) {
        return true;
    }

    /// @notice MUST be called with DELEGATECALL
    function receive(address from, address to, uint256 amount, address currencyCt, uint256 currencyId) public {
        require(msg.sender != address(0));
        require(amount > 0);
        require(currencyId == 0);

        require(ERC20(currencyCt).transferFrom(from, to, amount));

        // Raise event
        emit CurrencyTransferred(from, to, amount, currencyCt, 0);
    }

    /// @notice MUST be called with DELEGATECALL
    function approve(address to, uint256 amount, address currencyCt, uint256 currencyId) public {
        require(amount > 0);
        require(currencyId == 0);

        require(ERC20(currencyCt).approve(to, amount));
    }

    /// @notice MUST be called with DELEGATECALL
    function dispatch(address from, address to, uint256 amount, address currencyCt, uint256 currencyId) public {
        require(amount > 0);
        require(currencyId == 0);

        require(ERC20(currencyCt).approve(from, amount));
        require(ERC20(currencyCt).transferFrom(from, to, amount));

        // Raise event
        emit CurrencyTransferred(from, to, amount, currencyCt, 0);
    }
}

