/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "../Ownable.sol";
import {AccrualBeneficiary} from "../AccrualBeneficiary.sol";
import {SafeMathUintLib} from "../SafeMathUintLib.sol";
import {ClientFund} from "../ClientFund.sol";
import {RevenueFund} from "../RevenueFund.sol";
import {SecurityBond} from "../SecurityBond.sol";
import {TokenHolderRevenueFund} from "../TokenHolderRevenueFund.sol";
import {TransferControllerManageable} from "../TransferControllerManageable.sol";
import {TransferController} from "../TransferController.sol";

/**
@title UnitTestHelpers
@notice A dummy SC where several functions are added to assist in unit testing.
*/
contract UnitTestHelpers is Ownable, AccrualBeneficiary, TransferControllerManageable {
    using SafeMathUintLib for uint256;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEthersToWasCalled(address wallet, string balance);
    event DepositTokensToWasCalled(address wallet, string balance, int256 amount, address currencyCt, uint256 currencyId);
    event CloseAccrualPeriodWasCalled();

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public Ownable(_owner) {
    }

    function() public payable {
    }

    function send_money(address target, uint256 amount) public {
        require(amount > 0);
        require(target.call.value(amount)());
    }

    /*
    //
    // Helpers for testing ERC20
    // -----------------------------------------------------------------------------------------------------------------
    function callToApprove_ERC20(address token, address spender, uint256 value) public {
        require(token != address(0));
        ERC20 tok = ERC20(token);
        tok.approve(spender, value);
    }
    */

    //
    // Helpers for RevenueFund SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToDepositTokens_REVENUEFUND(address revenueFund, int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        require(revenueFund != address(0));
        RevenueFund sc = RevenueFund(revenueFund);
        sc.receiveTokens("", amount, currencyCt, currencyId, standard);
    }

    function receiveEthersTo(address wallet, string balance) public payable {
        emit DepositEthersToWasCalled(wallet, balance);
    }

    function receiveTokensTo(address wallet, string balance, int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        //execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        controller.receive(msg.sender, this, uint256(amount), currencyCt, currencyId);
        emit DepositTokensToWasCalled(wallet, balance, amount, currencyCt, currencyId);
    }

    function closeAccrualPeriod() public {
        emit CloseAccrualPeriodWasCalled();
    }

    //
    // Helpers for TokenHolderRevenueFund SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToDepositTokens_TOKENHOLDERREVENUEFUND(address tokenHolderRevenueFund, address token, int256 amount) public {
        require(tokenHolderRevenueFund != address(0));
        TokenHolderRevenueFund sc = TokenHolderRevenueFund(tokenHolderRevenueFund);
        sc.receiveTokens("", amount, token, 0, "");
    }

    function callToCloseAccrualPeriod_TOKENHOLDERREVENUEFUND(address tokenHolderRevenueFund) public {
        require(tokenHolderRevenueFund != address(0));
        TokenHolderRevenueFund sc = TokenHolderRevenueFund(tokenHolderRevenueFund);
        sc.closeAccrualPeriod();
    }

    function balanceBlocksIn(address /*a*/, uint256 /*from*/, uint256 /*to*/) public pure returns (uint256) {
        return 1e10;
    }
}
