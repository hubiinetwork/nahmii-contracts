/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {PartnerBenefactor} from "./PartnerBenefactor.sol";

/**
 * @title PartnerBenefactorable
 * @notice An ownable that has a partner benefactor property
 */
contract PartnerBenefactorable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    PartnerBenefactor public partnerBenefactor;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetPartnerBenefactorEvent(PartnerBenefactor oldPartnerBenefactor, PartnerBenefactor newPartnerBenefactor);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the partner benefactor contract
    /// @param newPartnerBenefactor The (address of) PartnerBenefactor contract instance
    function setPartnerBenefactor(PartnerBenefactor newPartnerBenefactor)
    public
    onlyDeployer
    notNullAddress(address(newPartnerBenefactor))
    notSameAddresses(address(newPartnerBenefactor), address(partnerBenefactor))
    {
        // Set new partner benefactor
        PartnerBenefactor oldPartnerBenefactor = partnerBenefactor;
        partnerBenefactor = newPartnerBenefactor;

        // Emit event
        emit SetPartnerBenefactorEvent(oldPartnerBenefactor, newPartnerBenefactor);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier partnerBenefactorInitialized() {
        require(address(partnerBenefactor) != address(0), "Partner benefactor not initialized [PartnerBenefactorable.sol:52]");
        _;
    }
}