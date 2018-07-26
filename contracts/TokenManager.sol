/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import "./ERC20Controller.sol";
import "./ERC721Controller.sol";

/**
@title TokenManager
@notice Handles registration of tokens
*/
contract TokenManager is Ownable, SelfDestructible {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    uint32 constant BLACKLISTED = 2147483648;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(uint32 => address) registeredInterfaces;
    mapping(address => uint32) registeredTokens;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisteredInterface(uint32 _id, address _interface);
    event DeregisteredInterface(uint32 _id);

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
    function registerInterface(uint32 _id, address _interface) external onlyOwner {
        require(_id >= 1 && _id <= 1048576);
        require(_interface != address(0));
        require(registeredInterfaces[_id] == address(0));

        registeredInterfaces[_id] = _interface;

        //raise event
        emit RegisteredInterface(_id, _interface);
    }

    function deregisterInterface(uint32 _id) external onlyOwner {
        require(registeredInterfaces[_id] != address(0));

        registeredInterfaces[_id] = address(0);

        //raise event
        emit DeregisteredInterface(_id);
    }

    function registerToken(address token, uint32 interface_id) external onlyOwner {
        require(token != address(0));
        require(interface_id >= 1 && interface_id <= 1048576);
        require(registeredTokens[token] == 0);

        registeredTokens[token] = interface_id;

        //raise event
        emit RegisteredToken(token, interface_id);
    }

    function deregisterToken(address token) external onlyOwner {
        require(token != address(0));
        require(registeredTokens[token] != 0);

        registeredTokens[token] = 0;

        //raise event
        emit DeregisteredToken(token);
    }

    function blacklistToken(address token) external onlyOwner {
        require(token != address(0));
        require(registeredTokens[token] != 0);

        registeredTokens[token] = registeredTokens[token] | BLACKLISTED;

        //raise event
        emit BlacklistedToken(token);
    }

    function whitelistToken(address token) external onlyOwner {
        require(token != address(0));
        require(registeredTokens[token] != 0);

        registeredTokens[token] = registeredTokens[token] & (~BLACKLISTED);

        //raise event
        emit WhitelistedToken(token);
    }

    function getInferface(address token) public view returns (TokenTypeInterface) {
        uint32 interface_id = registeredTokens[token];

        require(interface_id != 0 && (interface_id & BLACKLISTED) == 0);
        require(registeredInterfaces[interface_id] != address(0));

        return TokenTypeInterface(registeredInterfaces[interface_id]);
    }
}
