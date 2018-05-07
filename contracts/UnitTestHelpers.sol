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

/**
@title UnitTestHelpers
@notice A dummy SC where several functions are added to assist in unit testing.
*/
contract UnitTestHelpers is AccrualBeneficiaryInterface {
    using SafeMathUint for uint256;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    function () public payable {
    }

    //
    // Helpers for testing ERC20
    // -----------------------------------------------------------------------------------------------------------------
    function erc20_approve(address token, address spender, uint256 value) public {
        require(token != address(0));
        ERC20 tok = ERC20(token);
        tok.approve(spender, value);
    }

    //
    // Helper for ClientFunds SC
    // -----------------------------------------------------------------------------------------------------------------
    function callToTransferFromDepositedToSettledBalance(address clientFunds, address sourceWallet, address destWallet, int256 amount, address token) public {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.transferFromDepositedToSettledBalance(sourceWallet, destWallet, amount, token);
    }

    function callToWithdrawFromDepositedBalance(address clientFunds, address sourceWallet, address destWallet, int256 amount, address token) public {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.withdrawFromDepositedBalance(sourceWallet, destWallet, amount, token);
    }

    function callToDepositEthersToSettledBalance(address clientFunds, address destWallet) public payable {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.depositEthersToSettledBalance.value(msg.value)(destWallet);
    }

    function callToDepositTokensToSettledBalance(address clientFunds, address destWallet, address token, int256 amount) public {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.depositTokensToSettledBalance(destWallet, token, amount);
    }

    //
    // Helpers for RevenueFunc SC
    // -----------------------------------------------------------------------------------------------------------------
    function closeAccrualPeriod() public {

    }
}
