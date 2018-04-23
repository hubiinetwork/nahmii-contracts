/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract Exchange {

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Signature {
        bytes32 r;
        bytes32 s;
        uint8 v;
    }

    struct Trade {
        uint256 buyOrderHash;
        uint256 sellOrderHash;
        uint256 buyerOrderNonce;    // These ones should be obtained from orders map (accessed by hash),
        uint256 sellerOrderNonce;   // but we don't have such information.
        address buyer;
        address seller;
        uint256 tokenAmount;
        uint256 etherAmount;
        address token;
        bool immediateSettlement;
        Signature signature;
    }

    struct Settlement {
        // uint256[] tradeNonces;
        // uint256[] tradeHashes;
        // // Balances here
        // uint256[] signature;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function Exchange(address _owner) public notNullAddress(_owner) {
        owner = _owner;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        address oldOwner;

        if (newOwner != owner) {
            // Set new owner
            oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}