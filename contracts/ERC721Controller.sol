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

    function receive(address token, address from, address to, uint256 amount, uint256 id) public {
        require(amount == 1);
        require(id != 0);

        ERC721 erc721 = ERC721(token);
        erc721.safeTransferFrom(from, to, id);

        //raise event
        emit TokenTransferred(token, from, to, 1, id);
    }

    function send(address token, address to, uint256 amount, uint256 id) public {
        require(msg.sender != address(0));
        require(amount == 1);
        require(id != 0);

        ERC721 erc721 = ERC721(token);
        erc721.approve(to, id);
        erc721.safeTransferFrom(msg.sender, to, id);

        //raise event
        emit TokenTransferred(token, msg.sender, to, 1, id);
    }
}
