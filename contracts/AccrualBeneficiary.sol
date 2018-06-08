/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

import {Beneficiary} from "./Beneficiary.sol";

contract AccrualBeneficiary is Beneficiary {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event CloseAccrualPeriodEvent();

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function closeAccrualPeriod() public;
}
