/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "../Ownable.sol";
import {Beneficiary} from "../Beneficiary.sol";

/**
 * @title MockedBenefactor
 * @notice Mocked implementation of benefactor
 */
contract MockedBenefactor {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Beneficiary[] public beneficiaries;
    mapping(address => uint256) public beneficiaryIndexByAddress;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterBeneficiaryEvent(Beneficiary beneficiary);
    event DeregisterBeneficiaryEvent(Beneficiary beneficiary);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        for (uint256 i = 0; i < beneficiaries.length; i++)
            beneficiaryIndexByAddress[address(beneficiaries[i])] = 0;
        delete beneficiaries;
    }

    function registerBeneficiary(Beneficiary beneficiary)
    public
    returns (bool)
    {
        address _beneficiary = address(beneficiary);

        if (beneficiaryIndexByAddress[_beneficiary] > 0)
            return false;

        beneficiaries.push(beneficiary);
        beneficiaryIndexByAddress[_beneficiary] = beneficiaries.length;

        // Emit event
        emit RegisterBeneficiaryEvent(beneficiary);

        return true;
    }

    function deregisterBeneficiary(Beneficiary beneficiary)
    public
    returns (bool)
    {
        address _beneficiary = address(beneficiary);

        if (beneficiaryIndexByAddress[_beneficiary] == 0)
            return false;

        uint256 idx = beneficiaryIndexByAddress[_beneficiary] - 1;
        if (idx < beneficiaries.length - 1) {
            // Remap the last item in the array to this index
            beneficiaries[idx] = beneficiaries[beneficiaries.length - 1];
            beneficiaryIndexByAddress[address(beneficiaries[idx])] = idx + 1;
        }
        beneficiaries.length--;
        beneficiaryIndexByAddress[_beneficiary] = 0;

        // Emit event
        emit DeregisterBeneficiaryEvent(beneficiary);

        return true;
    }

    function isRegisteredBeneficiary(Beneficiary beneficiary)
    public
    view
    returns (bool)
    {
        return beneficiaryIndexByAddress[address(beneficiary)] > 0;
    }

    function registeredBeneficiariesCount()
    public
    view
    returns (uint256)
    {
        return beneficiaries.length;
    }}
