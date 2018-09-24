/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";

/**
@title Benefactor
@notice An ownable that contains registered beneficiaries
*/
contract Benefactor is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address[] internal beneficiaries;
    mapping(address => uint256) internal beneficiariesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterBeneficiaryEvent(address beneficiary);
    event DeregisterBeneficiaryEvent(address beneficiary);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerBeneficiary(address beneficiary) public onlyDeployer notNullAddress(beneficiary) returns (bool) {
        if (beneficiariesMap[beneficiary] > 0)
            return false;

        beneficiaries.push(beneficiary);
        beneficiariesMap[beneficiary] = beneficiaries.length;

        //raise event
        emit RegisterBeneficiaryEvent(beneficiary);

        return true;
    }

    function deregisterBeneficiary(address beneficiary) public onlyDeployer notNullAddress(beneficiary) returns (bool) {
        if (beneficiariesMap[beneficiary] == 0)
            return false;

        uint256 idx = beneficiariesMap[beneficiary] - 1;
        if (idx < beneficiaries.length - 1) {
            //remap the last item in the array to this index
            beneficiaries[idx] = beneficiaries[beneficiaries.length - 1];
            beneficiariesMap[beneficiaries[idx]] = idx + 1;

            //delete the last item in the array
            delete beneficiaries[beneficiaries.length - 1];
        }
        else {
            //it is the last item in the array
            delete beneficiaries[idx];
        }
        beneficiaries.length--;
        beneficiariesMap[beneficiary] = 0;

        //raise event
        emit DeregisterBeneficiaryEvent(beneficiary);

        return true;
    }

    function isRegisteredBeneficiary(address beneficiary) public view returns (bool) {
        return beneficiariesMap[beneficiary] > 0;
    }
}
