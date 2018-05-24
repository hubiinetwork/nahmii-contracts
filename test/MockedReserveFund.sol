/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

/**
@title Mocked Reserve fund
*/
contract MockedReserveFund {

    struct TransferInfo {
        address tokenAddress; // 0 for ethers.
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address public owner;

    mapping(address => int256) public currencyAmountMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    //    event OwnerChangedEvent(address oldOwner, address newOwner);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    //    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
    //        emit OwnerChangedEvent(address(0), newOwner);
    //    }

    // TODO Update to using TransferInfo parameter
    function setMaxOutboundTransfer(address currency, int256 amount) public {
        currencyAmountMap[currency] = amount;
    }

    // TODO Update to using TransferInfo parameter
    function outboundTransferSupported(address currency, int256 amount) public view returns (bool) {
        return currencyAmountMap[currency] >= amount;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    //    modifier notNullAddress(address _address) {
    //        require(_address != address(0));
    //        _;
    //    }

    //    modifier onlyOwner() {
    //        require(msg.sender == owner);
    //        _;
    //    }
}