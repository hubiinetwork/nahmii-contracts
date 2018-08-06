/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {TokenController} from "./TokenController.sol";
import "./ERC721.sol";

/**
@title ERC721Controller
@notice Handles transfers of an ERC721 token
*/
contract ERC721Controller is TokenController {
    function isTyped() public view returns (bool) {
        return true;
    }

    function isQuantifiable() public view returns (bool) {
        return false;
    }

    function receive(address from, address to, address token, uint256 amount, uint256 id) public {
        require(amount == 1);
        require(id != 0);

        ERC721(token).safeTransferFrom(from, to, id);

        //raise event
        emit TokenTransferred(from, to, 1, token, id);
    }

    function send(address to, address token, uint256 amount, uint256 id) public {
        require(msg.sender != address(0));
        require(amount == 1);
        require(id != 0);

        ERC721(token).approve(to, id);
        ERC721(token).safeTransferFrom(msg.sender, to, id);

        //raise event
        emit TokenTransferred(msg.sender, to, 1, token, id);
    }
}
