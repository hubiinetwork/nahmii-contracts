/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

import {Benefactor} from "./Benefactor.sol";
import {SafeMathUint} from "./SafeMathUint.sol";

contract AccrualBenefactor is Benefactor {
    using SafeMathUint for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    uint256 constant public PARTS_PER = 1e18;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => uint256) internal beneficiaryFractionMap;
    uint256 internal totalBeneficiaryFraction;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterAccrualBeneficiaryEvent(address beneficiary, uint256 fraction);
    event DeregisterAccrualBeneficiaryEvent(address beneficiary);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerBeneficiary(address beneficiary) public onlyOwner notNullAddress(beneficiary) returns (bool) {
        return registerBeneficiary(beneficiary, PARTS_PER);
    }

    function registerBeneficiary(address beneficiary, uint256 fraction) public onlyOwner notNullAddress(beneficiary) returns (bool) {
        require(fraction > 0);
        require(totalBeneficiaryFraction.add(fraction) <= PARTS_PER);

        if (!super.registerBeneficiary(beneficiary))
            return false;

        beneficiaryFractionMap[beneficiary] = fraction;
        totalBeneficiaryFraction = totalBeneficiaryFraction.add(fraction);

        //raise event
        emit RegisterAccrualBeneficiaryEvent(beneficiary, fraction);

        return true;
    }

    function deregisterBeneficiary(address beneficiary) public onlyOwner notNullAddress(beneficiary) returns (bool) {
        if (!super.deregisterBeneficiary(beneficiary))
            return false;

        totalBeneficiaryFraction = totalBeneficiaryFraction.sub(beneficiaryFractionMap[beneficiary]);
        beneficiaryFractionMap[beneficiary] = 0;

        //raise event
        emit DeregisterAccrualBeneficiaryEvent(beneficiary);

        return true;
    }

    function getBeneficiaryFraction(address beneficiary) public view returns (uint256) {
        return beneficiaryFractionMap[beneficiary];
    }

    function getTotalBeneficiaryFraction() public view returns (uint256) {
        return totalBeneficiaryFraction;
    }
}