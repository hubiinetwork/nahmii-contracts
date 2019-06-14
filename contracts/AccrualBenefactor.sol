/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Benefactor} from "./Benefactor.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {ConstantsLib} from "./ConstantsLib.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";

/**
 * @title AccrualBenefactor
 * @notice A benefactor whose registered beneficiaries obtain a predefined fraction of total amount
 */
contract AccrualBenefactor is Benefactor {
    using SafeMathIntLib for int256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => int256) private _beneficiaryFractionMap;
    int256 public totalBeneficiaryFraction;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterAccrualBeneficiaryEvent(Beneficiary beneficiary, int256 fraction);
    event DeregisterAccrualBeneficiaryEvent(Beneficiary beneficiary);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Register the given accrual beneficiary for the entirety fraction
    /// @param beneficiary Address of accrual beneficiary to be registered
    function registerBeneficiary(Beneficiary beneficiary)
    public
    onlyDeployer
    notNullAddress(address(beneficiary))
    returns (bool)
    {
        return registerFractionalBeneficiary(AccrualBeneficiary(address(beneficiary)), ConstantsLib.PARTS_PER());
    }

    /// @notice Register the given accrual beneficiary for the given fraction
    /// @param beneficiary Address of accrual beneficiary to be registered
    /// @param fraction Fraction of benefits to be given
    function registerFractionalBeneficiary(AccrualBeneficiary beneficiary, int256 fraction)
    public
    onlyDeployer
    notNullAddress(address(beneficiary))
    returns (bool)
    {
        require(fraction > 0, "Fraction not strictly positive [AccrualBenefactor.sol:59]");
        require(
            totalBeneficiaryFraction.add(fraction) <= ConstantsLib.PARTS_PER(),
            "Total beneficiary fraction out of bounds [AccrualBenefactor.sol:60]"
        );

        if (!super.registerBeneficiary(beneficiary))
            return false;

        _beneficiaryFractionMap[address(beneficiary)] = fraction;
        totalBeneficiaryFraction = totalBeneficiaryFraction.add(fraction);

        // Emit event
        emit RegisterAccrualBeneficiaryEvent(beneficiary, fraction);

        return true;
    }

    /// @notice Deregister the given accrual beneficiary
    /// @param beneficiary Address of accrual beneficiary to be deregistered
    function deregisterBeneficiary(Beneficiary beneficiary)
    public
    onlyDeployer
    notNullAddress(address(beneficiary))
    returns (bool)
    {
        if (!super.deregisterBeneficiary(beneficiary))
            return false;

        address _beneficiary = address(beneficiary);

        totalBeneficiaryFraction = totalBeneficiaryFraction.sub(_beneficiaryFractionMap[_beneficiary]);
        _beneficiaryFractionMap[_beneficiary] = 0;

        // Emit event
        emit DeregisterAccrualBeneficiaryEvent(beneficiary);

        return true;
    }

    /// @notice Get the fraction of benefits that is granted the given accrual beneficiary
    /// @param beneficiary Address of accrual beneficiary
    /// @return The beneficiary's fraction
    function beneficiaryFraction(AccrualBeneficiary beneficiary)
    public
    view
    returns (int256)
    {
        return _beneficiaryFractionMap[address(beneficiary)];
    }
}