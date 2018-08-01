/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import "./ERC20Controller.sol";
import "./ERC721Controller.sol";

/**
@title TokenManager
@notice Handles registration of tokens
*/
contract TokenManager is Ownable, Modifiable, SelfDestructible {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    uint32 constant BLACKLISTED = 2147483648; //0x80000000

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(uint32 => address) registeredTokenControllers;
    mapping(address => uint32) registeredTokens;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisteredTokenController(uint32 _id, address _interface);
    event DeregisteredTokenController(uint32 _id);

    event RegisteredToken(address token, uint32 interface_id);
    event DeregisteredToken(address token);
    event BlacklistedToken(address token);
    event WhitelistedToken(address token);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerTokenController(uint32 _id, address _interface) external onlyOwner notNullAddress(_interface) {
        require(_id >= 1 && _id <= 1048576);
        require(registeredTokenControllers[_id] == address(0));

        registeredTokenControllers[_id] = _interface;

        //raise event
        emit RegisteredTokenController(_id, _interface);
    }

    function deregisterTokenController(uint32 _id) external onlyOwner {
        require(registeredTokenControllers[_id] != address(0));

        registeredTokenControllers[_id] = address(0);

        //raise event
        emit DeregisteredTokenController(_id);
    }

    function registerToken(address token, uint32 interface_id) external onlyOwner notNullAddress(token) {
        require(interface_id >= 1 && interface_id <= 1048576);
        require(registeredTokens[token] == 0);

        registeredTokens[token] = interface_id;

        //raise event
        emit RegisteredToken(token, interface_id);
    }

    function deregisterToken(address token) external onlyOwner {
        require(registeredTokens[token] != 0);

        registeredTokens[token] = 0;

        //raise event
        emit DeregisteredToken(token);
    }

    function blacklistToken(address token) external onlyOwner {
        require(registeredTokens[token] != 0);

        registeredTokens[token] = registeredTokens[token] | BLACKLISTED;

        //raise event
        emit BlacklistedToken(token);
    }

    function whitelistToken(address token) external onlyOwner {
        require(registeredTokens[token] != 0);

        registeredTokens[token] = registeredTokens[token] & (~BLACKLISTED);

        //raise event
        emit WhitelistedToken(token);
    }

    function getTokenController(address token) public view returns (TokenController) {
        uint32 interface_id = registeredTokens[token];

        require(interface_id != 0 && (interface_id & BLACKLISTED) == 0);
        require(registeredTokenControllers[interface_id] != address(0));

        return TokenController(registeredTokenControllers[interface_id]);
    }
}
