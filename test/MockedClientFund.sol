/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

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
    
    struct Seizure {
        address source;
        address destination;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Shift[] public transfers;
    Shift[] public withdrawals;
    Seizure[] public seizures;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event TransferFromDepositedToSettledBalanceEvent(address from, address to, int256 amount, address token); //token==0 for ethers
    event WithdrawFromDepositedBalanceEvent(address from, address to, int256 amount, address token); //token==0 for ethers
    event SeizeDepositedAndSettledBalancesEvent(address sourceWallet, address targetWallet);

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
        seizures.length = 0;
    }

    function transferFromDepositedToSettledBalance(address sourceWallet, address destinationWallet, int256 amount, address token) public /*notOwner*/ {
        transfers.push(Shift(sourceWallet, destinationWallet, amount, token));
        emit TransferFromDepositedToSettledBalanceEvent(sourceWallet, destinationWallet, amount, token);
    }

    function withdrawFromDepositedBalance(address sourceWallet, address destinationWallet, int256 amount, address token) public /*notOwner*/ {
        withdrawals.push(Shift(sourceWallet, destinationWallet, amount, token));
        emit WithdrawFromDepositedBalanceEvent(sourceWallet, destinationWallet, amount, token);
    }

    function seizeDepositedAndSettledBalances(address sourceWallet, address destinationWallet) public /*onlyRegisteredService notNullAddress(sourceWallet) notNullAddress(targetWallet)*/ {
        seizures.push(Seizure(sourceWallet, destinationWallet));
        emit SeizeDepositedAndSettledBalancesEvent(sourceWallet, destinationWallet);
    }
}
