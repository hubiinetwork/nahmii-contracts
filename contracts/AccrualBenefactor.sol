/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Benefactor} from "./Benefactor.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";

/**
@title AccrualBenefactor
@notice A benefactor whose registered beneficiaries obtain a predefined fraction of total amount
*/
contract AccrualBenefactor is Benefactor {
    using SafeMathUintLib for uint256;

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
    function registerBeneficiary(address beneficiary) public onlyDeployer notNullAddress(beneficiary) returns (bool) {
        return registerFractionalBeneficiary(beneficiary, PARTS_PER);
    }

    function registerFractionalBeneficiary(address beneficiary, uint256 fraction) public onlyDeployer notNullAddress(beneficiary) returns (bool) {
        require(fraction > 0);
        require(totalBeneficiaryFraction.add(fraction) <= PARTS_PER);

        if (!super.registerBeneficiary(beneficiary))
            return false;

        beneficiaryFractionMap[beneficiary] = fraction;
        totalBeneficiaryFraction = totalBeneficiaryFraction.add(fraction);

        // Emit event
        emit RegisterAccrualBeneficiaryEvent(beneficiary, fraction);

        return true;
    }

    function deregisterBeneficiary(address beneficiary) public onlyDeployer notNullAddress(beneficiary) returns (bool) {
        if (!super.deregisterBeneficiary(beneficiary))
            return false;

        totalBeneficiaryFraction = totalBeneficiaryFraction.sub(beneficiaryFractionMap[beneficiary]);
        beneficiaryFractionMap[beneficiary] = 0;

        // Emit event
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
