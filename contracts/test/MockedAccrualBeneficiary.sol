/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2020 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {AccrualBeneficiary} from "../AccrualBeneficiary.sol";
import {MockedBeneficiary} from "./MockedBeneficiary.sol";
import {MonetaryTypesLib} from "../MonetaryTypesLib.sol";
import {IERC20} from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockedAccrualBeneficiary
 * @notice Mocked implementation of accrual beneficiary
 */
contract MockedAccrualBeneficiary is AccrualBeneficiary, MockedBeneficiary {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public _closedAccrualPeriodsCount;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _reset()
    public
    {
        super._reset();
        _closedAccrualPeriodsCount = 0;
    }

    function receiveTokensTo(address wallet, string memory balanceType, int256 amount,
        address currencyCt, uint256 currencyId, string memory standard)
    public
    {
        super.receiveTokensTo(wallet, balanceType, amount, currencyCt, currencyId, standard);
        require(IERC20(currencyCt).transferFrom(msg.sender, address(this), uint256(amount)), "Transfer not successful");
    }

    function closeAccrualPeriod(MonetaryTypesLib.Currency[] memory)
    public
    {
        _closedAccrualPeriodsCount++;
    }
}