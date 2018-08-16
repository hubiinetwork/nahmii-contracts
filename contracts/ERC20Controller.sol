/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {CurrencyController} from "./CurrencyController.sol";
import "./ERC20.sol";

/**
@title ERC20Controller
@notice Handles transfers of an ERC20 token
*/
contract ERC20Controller is CurrencyController {
    function isTyped() public view returns(bool) {
        return false;
    }

    function isQuantifiable() public view returns(bool) {
        return true;
    }

    function receive(address from, address to, uint256 amount, address currency, uint256 currencyId) public {
        require(amount > 0);
        require(currencyId == 0);

        require(ERC20(currency).transferFrom(from, to, amount));

        //raise event
        emit CurrencyTransferred(from, to, amount, currency, 0);
    }

    /// @notice MUST be called with DELEGATECALL
    function approve(address to, uint256 amount, address currency, uint256 currencyId) public {
        require(msg.sender != address(0));
        require(amount > 0);
        require(currencyId == 0);

        require(ERC20(currency).approve(to, amount));
    }

    /// @notice MUST be called with DELEGATECALL
    function send(address to, uint256 amount, address currency, uint256 currencyId) public {
        require(msg.sender != address(0));
        require(amount > 0);
        require(currencyId == 0);

        require(ERC20(currency).approve(to, amount));
        require(ERC20(currency).transferFrom(msg.sender, to, amount));

        //raise event
        emit CurrencyTransferred(msg.sender, to, amount, currency, 0);
    }
}

