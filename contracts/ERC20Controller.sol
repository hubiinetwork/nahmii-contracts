/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {TokenController} from "./TokenController.sol";
import "./ERC20.sol";

/**
@title ERC20Controller
@notice Handles transfers of an ERC20 token
*/
contract ERC20Controller is TokenController {
    function isTyped() public view returns(bool) {
        return false;
    }

    function isQuantifiable() public view returns(bool) {
        return true;
    }

    function receive(address from, address to, address token, uint256 amount, uint256 id) public {
        require(amount > 0);
        require(id == 0);

        require(ERC20(token).transferFrom(from, to, amount));

        //raise event
        emit TokenTransferred(from, to, amount, token, 0);
    }

    function send(address to, address token, uint256 amount, uint256 id) public {
        require(msg.sender != address(0));
        require(amount > 0);
        require(id == 0);

        require(ERC20(token).approve(to, amount));
        require(ERC20(token).transferFrom(msg.sender, to, amount));

        //raise event
        emit TokenTransferred(msg.sender, to, amount, token, 0);
    }
}

