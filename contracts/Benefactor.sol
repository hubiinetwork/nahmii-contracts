/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

import "./Ownable.sol";

contract Benefactor is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address[] internal beneficiaries;
    mapping(address => bool) internal beneficiaryRegisteredMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterBeneficiaryEvent(address beneficiary);
    event DeregisterBeneficiaryEvent(address beneficiary);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerBeneficiary(address beneficiary) public onlyOwner notNullAddress(beneficiary) returns (bool) {
        if (beneficiaryRegisteredMap[beneficiary])
            return false;

        beneficiaries.push(beneficiary);
        beneficiaryRegisteredMap[beneficiary] = true;

        //raise event
        emit RegisterBeneficiaryEvent(beneficiary);

        return true;
    }

    function deregisterBeneficiary(address beneficiary) public onlyOwner notNullAddress(beneficiary) returns (bool) {
        if (!beneficiaryRegisteredMap[beneficiary])
            return false;

        beneficiaryRegisteredMap[beneficiary] = false;

        //raise event
        emit DeregisterBeneficiaryEvent(beneficiary);

        return true;
    }

    function isRegisteredBeneficiary(address beneficiary) public view returns (bool) {
        return beneficiaryRegisteredMap[beneficiary];
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }
}
