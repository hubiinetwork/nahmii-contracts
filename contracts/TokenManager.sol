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
    struct RegisterToken {
        bytes32 interface_id;
        bool blacklisted;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(bytes32 => address) registeredTokenControllers;
    mapping(address => RegisterToken) registeredTokens;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisteredTokenController(bytes32 interface_id, address _interface);
    event DeregisteredTokenController(bytes32 interface_id);

    event RegisteredToken(address token, bytes32 interface_id);
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
    function registerTokenController(string standard, address _interface) external onlyOwner notNullAddress(_interface) {
        require(bytes(standard).length > 0);
        bytes32 _id = keccak256(abi.encodePacked(standard));

        require(registeredTokenControllers[_id] == address(0));

        registeredTokenControllers[_id] = _interface;

        //raise event
        emit RegisteredTokenController(_id, _interface);
    }

    function deregisterTokenController(string standard) external onlyOwner {
        require(bytes(standard).length > 0);
        bytes32 _id = keccak256(abi.encodePacked(standard));

        require(registeredTokenControllers[_id] != address(0));

        registeredTokenControllers[_id] = address(0);

        //raise event
        emit DeregisteredTokenController(_id);
    }

    function registerToken(address token, string standard) external onlyOwner notNullAddress(token) {
        require(bytes(standard).length > 0);
        bytes32 _id = keccak256(abi.encodePacked(standard));

        require(registeredTokens[token].interface_id == bytes32(0));

        registeredTokens[token].interface_id = _id;

        //raise event
        emit RegisteredToken(token, _id);
    }

    function deregisterToken(address token) external onlyOwner {
        require(registeredTokens[token].interface_id != 0);

        registeredTokens[token].interface_id = bytes32(0);
        registeredTokens[token].blacklisted = false;

        //raise event
        emit DeregisteredToken(token);
    }

    function blacklistToken(address token) external onlyOwner {
        require(registeredTokens[token].interface_id != bytes32(0));

        registeredTokens[token].blacklisted = true;

        //raise event
        emit BlacklistedToken(token);
    }

    function whitelistToken(address token) external onlyOwner {
        require(registeredTokens[token].interface_id != bytes32(0));

        registeredTokens[token].blacklisted = false;

        //raise event
        emit WhitelistedToken(token);
    }

    function getTokenController(address token, string standard) public view returns (TokenController) {
        if (registeredTokens[token].interface_id != bytes32(0)) {
            require(!registeredTokens[token].blacklisted);

            address interface_address = registeredTokenControllers[registeredTokens[token].interface_id];
            require(interface_address != address(0));

            return TokenController(interface_address);
        }

        if (bytes(standard).length > 0) {
            bytes32 _id = keccak256(abi.encodePacked(standard));

            require(registeredTokenControllers[_id] != address(0));
            return TokenController(registeredTokenControllers[_id]);
        }

        revert();
    }
}
