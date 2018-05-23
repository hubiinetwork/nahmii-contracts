/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "./Ownable.sol";

contract Benefactor is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping (address => bool) private registeredBeneficiaries;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisteredBeneficiaryEvent(address beneficiary);
    event UnregisteredBeneficiaryEvent(address beneficiary);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerBeneficiary(address beneficiary) public onlyOwner {
        registeredBeneficiaries[beneficiary] = true;

        //raise event
        emit RegisteredBeneficiaryEvent(beneficiary);
    }

    function unregisterBeneficiary(address beneficiary) public onlyOwner {
        registeredBeneficiaries[beneficiary] = false;

        //raise event
        emit UnregisteredBeneficiaryEvent(beneficiary);
    }

    function isValidRegisteredReceiver(address beneficiary) internal view returns (bool) {
        return registeredBeneficiaries[beneficiary];
    }
}
