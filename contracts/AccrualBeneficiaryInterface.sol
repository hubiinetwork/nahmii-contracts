/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

contract AccrualBeneficiaryInterface {
    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event CloseAccrualPeriodEvent();

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function closeAccrualPeriod() public;
}
