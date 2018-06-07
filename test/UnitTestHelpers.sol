/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;

import "../contracts/SafeMathUint.sol";
import "../contracts/ERC20.sol";
import "../contracts/AccrualBeneficiary.sol";
import "../contracts/ClientFund.sol";
import "../contracts/RevenueFund.sol";
import "../contracts/SecurityBond.sol";
import "../contracts/TokenHolderRevenueFund.sol";

/**
@title UnitTestHelpers
@notice A dummy SC where several functions are added to assist in unit testing.
*/
contract UnitTestHelpers is AccrualBeneficiary {
    using SafeMathUint for uint256;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ReceiveEthersWasCalled(address wallet);
    event ReceiveTokensWasCalled(address wallet, int256 amount, address token);
    event CloseAccrualPeriodWasCalled();

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    function() public payable {
    }

    function send_money(address target, uint256 amount) public {
        require(amount > 0);
        require(target.call.value(amount)());
    }

    //
    // Helpers for testing ERC20
    // -----------------------------------------------------------------------------------------------------------------
    function callToApprove_ERC20(address token, address spender, uint256 value) public {
        require(token != address(0));
        ERC20 tok = ERC20(token);
        tok.approve(spender, value);
    }

    //
    // Helper for ClientFunds SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToTransferFromDepositedToSettledBalance_CLIENTFUND(address clientFund, address sourceWallet, address destWallet, int256 amount, address token) public {
        require(clientFund != address(0));
        ClientFund sc = ClientFund(clientFund);
        sc.transferFromDepositedToSettledBalance(sourceWallet, destWallet, amount, token);
    }

    function callToWithdrawFromDepositedBalance_CLIENTFUND(address clientFund, address sourceWallet, address destWallet, int256 amount, address token) public {
        require(clientFund != address(0));
        ClientFund sc = ClientFund(clientFund);
        sc.withdrawFromDepositedBalance(sourceWallet, destWallet, amount, token);
    }

    function callToDepositEthersToSettledBalance_CLIENTFUND(address clientFund, address destWallet) public payable {
        require(clientFund != address(0));
        ClientFund sc = ClientFund(clientFund);
        sc.depositEthersToSettledBalance.value(msg.value)(destWallet);
    }

    function callToDepositTokensToSettledBalance_CLIENTFUND(address clientFund, address destWallet, address token, int256 amount) public {
        require(clientFund != address(0));
        ClientFund sc = ClientFund(clientFund);
        sc.depositTokensToSettledBalance(destWallet, token, amount);
    }

    function callToSeizeDepositedAndSettledBalances_CLIENTFUND(address clientFund, address sourceWallet, address destWallet) public {
        require(clientFund != address(0));
        ClientFund sc = ClientFund(clientFund);
        sc.seizeDepositedAndSettledBalances(sourceWallet, destWallet);
    }

    //
    // Helpers for RevenueFund SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToDepositTokens_REVENUEFUND(address revenueFund, address token, int256 amount) public {
        require(revenueFund != address(0));
        RevenueFund sc = RevenueFund(revenueFund);
        sc.depositTokens(token, amount);
    }

    function receiveEthers(address wallet) public payable {
        emit ReceiveEthersWasCalled(wallet);
    }

    function receiveTokens(address wallet, int256 amount, address token) public {
        emit ReceiveTokensWasCalled(wallet, amount, token);
    }

    function closeAccrualPeriod() public {
        emit CloseAccrualPeriodWasCalled();
    }

    //
    // Helpers for SecurityBond SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToStage_SECURITYBOND(address securityBond, int256 amount, address token, address wallet) public {
        require(securityBond != address(0));
        SecurityBond sc = SecurityBond(securityBond);
        sc.stage(amount, token, wallet);
    }

    //
    // Helpers for TokenHolderRevenueFund SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToDepositTokens_TOKENHOLDERREVENUEFUND(address tokenHolderRevenueFund, address token, int256 amount) public {
        require(tokenHolderRevenueFund != address(0));
        TokenHolderRevenueFund sc = TokenHolderRevenueFund(tokenHolderRevenueFund);
        sc.depositTokens(token, amount);
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
