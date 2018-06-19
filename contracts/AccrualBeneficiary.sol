/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
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
    function closeAccrualPeriod() public {
        emit CloseAccrualPeriodEvent();
    }
}
