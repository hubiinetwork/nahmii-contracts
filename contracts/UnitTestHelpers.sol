/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

import "./SafeMathUint.sol";
import "./ERC20.sol";
import "./AccrualBeneficiaryInterface.sol";
import "./ClientFund.sol";
import "./RevenueFund.sol";
import "./SecurityBond.sol";
import "./TokenHolderRevenueFund.sol";

/**
@title UnitTestHelpers
@notice A dummy SC where several functions are added to assist in unit testing.
*/
contract UnitTestHelpers is AccrualBeneficiaryInterface {
    using SafeMathUint for uint256;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event CloseAccrualPeriodWasCalled();

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    function () public payable {
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
    function callToTransferFromDepositedToSettledBalance_CLIENTFUND(address clientFunds, address sourceWallet, address destWallet, int256 amount, address token) public {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.transferFromDepositedToSettledBalance(sourceWallet, destWallet, amount, token);
    }

    function callToWithdrawFromDepositedBalance_CLIENTFUND(address clientFunds, address sourceWallet, address destWallet, int256 amount, address token) public {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.withdrawFromDepositedBalance(sourceWallet, destWallet, amount, token);
    }

    function callToDepositEthersToSettledBalance_CLIENTFUND(address clientFunds, address destWallet) public payable {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.depositEthersToSettledBalance.value(msg.value)(destWallet);
    }

    function callToDepositTokensToSettledBalance_CLIENTFUND(address clientFunds, address destWallet, address token, int256 amount) public {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.depositTokensToSettledBalance(destWallet, token, amount);
    }
    function callToSeizeDepositedAndSettledBalances_CLIENTFUND(address clientFunds, address sourceWallet, address destWallet) public {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.seizeDepositedAndSettledBalances(sourceWallet, destWallet);
    }


    //
    // Helpers for RevenueFund SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToDepositTokens_REVENUEFUND(address revenueFunds, address token, int256 amount) public {
        require(revenueFunds != address(0));
        RevenueFund sc = RevenueFund(revenueFunds);
        sc.depositTokens(token, amount);
    }

    function closeAccrualPeriod() public {
        emit CloseAccrualPeriodWasCalled();
    }

    //
    // Helpers for SecurityBond SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToStage_SECURITYBOND(address securityBonds, int256 amount, address token, address wallet) public {
        require(securityBonds != address(0));
        SecurityBond sc = SecurityBond(securityBonds);
        sc.stage(amount, token, wallet);
    }

    //
    // Helpers for TokenHolderRevenueFund SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToDepositTokens_TOKENHOLDERREVENUEFUND(address tokenHolderRevenueFunds, address token, int256 amount) public {
        require(tokenHolderRevenueFunds != address(0));
        TokenHolderRevenueFund sc = TokenHolderRevenueFund(tokenHolderRevenueFunds);
        sc.depositTokens(token, amount);
    }

    function callToCloseAccrualPeriod_TOKENHOLDERREVENUEFUND(address tokenHolderRevenueFunds) public {
        require(tokenHolderRevenueFunds != address(0));
        TokenHolderRevenueFund sc = TokenHolderRevenueFund(tokenHolderRevenueFunds);
        sc.closeAccrualPeriod();
    }

    function balanceBlocksIn(address /*a*/, uint256 /*from*/, uint256 /*to*/) public pure returns (uint256) {
        return 1e10;
    }
}
