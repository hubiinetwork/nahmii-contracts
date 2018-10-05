/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "../Ownable.sol";
import {AccrualBeneficiary} from "../AccrualBeneficiary.sol";
import {SafeMathUint} from "../SafeMathUint.sol";
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
    using SafeMathUint for uint256;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEthersToWasCalled(address wallet);
    event DepositTokensToWasCalled(address wallet, int256 amount, address currencyCt, uint256 currencyId);
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
    // Helper for ClientFunds SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToUpdateSettledBalance_CLIENTFUND(address clientFund, address wallet, int256 amount, address currencyCt, uint256 currencyId) public {
        require(clientFund != address(0));
        ClientFund sc = ClientFund(clientFund);
        sc.updateSettledBalance(wallet, amount, currencyCt, currencyId);
    }

    //    function callToWithdrawFromDepositedBalance_CLIENTFUND(address clientFund, address sourceWallet, address destWallet, int256 amount, address token) public {
    //        require(clientFund != address(0));
    //        ClientFund sc = ClientFund(clientFund);
    //        sc.withdrawFromDepositedBalance(sourceWallet, destWallet, amount, token);
    //    }

    //    function callToDepositEthersToSettledBalance_CLIENTFUND(address clientFund, address destWallet) public payable {
    //        require(clientFund != address(0));
    //        ClientFund sc = ClientFund(clientFund);
    //        sc.depositEthersToSettledBalance.value(msg.value)(destWallet);
    //    }

    //    function callToDepositTokensToSettledBalance_CLIENTFUND(address clientFund, address destWallet, address token, int256 amount) public {
    //        require(clientFund != address(0));
    //        ClientFund sc = ClientFund(clientFund);
    //        sc.depositTokensToSettledBalance(destWallet, token, amount);
    //    }

    function callToSeizeAllBalances_CLIENTFUND(address clientFund, address sourceWallet, address destWallet) public {
        require(clientFund != address(0));
        ClientFund sc = ClientFund(clientFund);
        sc.seizeAllBalances(sourceWallet, destWallet);
    }

    //
    // Helpers for RevenueFund SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToDepositTokens_REVENUEFUND(address revenueFund, int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        require(revenueFund != address(0));
        RevenueFund sc = RevenueFund(revenueFund);
        sc.depositTokens(amount, currencyCt, currencyId, standard);
    }

    function depositEthersTo(address wallet) public payable {
        emit DepositEthersToWasCalled(wallet);
    }

    function depositTokensTo(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        //execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        controller.receive(msg.sender, this, uint256(amount), currencyCt, currencyId);
        emit DepositTokensToWasCalled(wallet, amount, currencyCt, currencyId);
    }

    function closeAccrualPeriod() public {
        emit CloseAccrualPeriodWasCalled();
    }

    //
    // Helpers for SecurityBond SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToStage_SECURITYBOND(address securityBond, address wallet, int256 amount, address currencyCt, uint256 currencyid) public {
        require(securityBond != address(0));
        SecurityBond sc = SecurityBond(securityBond);
        sc.stage(wallet, amount, currencyCt, currencyid);
    }

    //
    // Helpers for TokenHolderRevenueFund SC
    // -----------------------------------------------------------------------------------------------------------------
    // TODO Update to two-component currency descriptor
    function callToDepositTokens_TOKENHOLDERREVENUEFUND(address tokenHolderRevenueFund, address token, int256 amount) public {
        require(tokenHolderRevenueFund != address(0));
        TokenHolderRevenueFund sc = TokenHolderRevenueFund(tokenHolderRevenueFund);
        sc.depositTokens(amount, token, 0, '');
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
