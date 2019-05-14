/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {Benefactor} from "./Benefactor.sol";

/**
 * @title PartnerBenefactor
 * @notice A benefactor/manager of registered partners
 */
contract PartnerBenefactor is Ownable, Benefactor {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) Benefactor()
    public
    {
    }
}
