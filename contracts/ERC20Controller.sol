/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {TokenTypeInterface} from "./TokenTypeInterface.sol";
import "./ERC20.sol";

/**
@title ERC20Controller
@notice Handles transfers of an ERC20 token
*/
contract ERC20Controller is TokenTypeInterface {
    function isTyped() public view returns(bool) {
        return false;
    }

    function isQuantifiable() public view returns(bool) {
        return true;
    }

    function receive(address token, address from, address to, uint256 amount, uint256 id) public {
        require(amount > 0);
        require(id == 0);

        ERC20 erc20 = ERC20(token);
        require(erc20.transferFrom(from, to, uint256(amount)));

        //raise event
        emit TokenTransferred(token, from, to, amount, 0);
    }

    function send(address token, address to, uint256 amount, uint256 id) public {
        require(msg.sender != address(0));
        require(amount > 0);
        require(id == 0);

        ERC20 erc20 = ERC20(token);
        require(erc20.approve(to, amount));
        require(erc20.transferFrom(msg.sender, to, amount));

        //raise event
        emit TokenTransferred(token, msg.sender, to, amount, 0);
    }
}

