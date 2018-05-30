/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

//import "../contracts/ClientFund.sol";

contract MockedClientFund /*is ClientFund*/ {

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Shift {
        address source;
        address destination;
        int256 amount;
        address currency;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Shift[] public transfers;
    Shift[] public withdrawals;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event TransferFromDepositedToSettledBalanceEvent(address from, address to, int256 amount, address token); //token==0 for ethers
    event WithdrawFromDepositedBalanceEvent(address from, address to, int256 amount, address token); //token==0 for ethers

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*ClientFund(owner)*/ {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        transfers.length = 0;
        withdrawals.length = 0;
    }

    function transferFromDepositedToSettledBalance(address sourceWallet, address destWallet, int256 amount, address token) public /*notOwner*/ {
        transfers.push(Shift(sourceWallet, destWallet, amount, token));
        emit TransferFromDepositedToSettledBalanceEvent(sourceWallet, destWallet, amount, token);
    }

    function withdrawFromDepositedBalance(address sourceWallet, address destWallet, int256 amount, address token) public /*notOwner*/ {
        withdrawals.push(Shift(sourceWallet, destWallet, amount, token));
        emit WithdrawFromDepositedBalanceEvent(sourceWallet, destWallet, amount, token);
    }
}