/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

// TODO Replace DepositOrWithdrawal.timestamp by DepositOrWithdrawal.blockNumber
library TxHistoryLib {
    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct DepositOrWithdrawal {
        int256 amount;
        uint256 timestamp;
        address currencyCt;      //0 for ethers
        uint256 currencyId;
    }

    struct TxHistory {
        DepositOrWithdrawal[] deposits;
        DepositOrWithdrawal[] withdrawals;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function addDeposit(TxHistory storage self, int256 amount, address currencyCt, uint256 currencyId) internal {
        self.deposits.push(DepositOrWithdrawal(amount, block.timestamp, currencyCt, currencyId));
    }

    function addWithdrawal(TxHistory storage self, int256 amount, address currencyCt, uint256 currencyId) internal {
        self.withdrawals.push(DepositOrWithdrawal(amount, block.timestamp, currencyCt, currencyId));
    }

    //----

    function deposit(TxHistory storage self, uint index) internal view returns (int256 amount, uint256 timestamp, address currencyCt, uint256 currencyId) {
        require(index < self.deposits.length);

        amount = self.deposits[index].amount;
        timestamp = self.deposits[index].timestamp;
        currencyCt = self.deposits[index].currencyCt;
        currencyId = self.deposits[index].currencyId;
    }

    function depositCount(TxHistory storage self) internal view returns (uint256) {
        return self.deposits.length;
    }

    //----

    function withdrawal(TxHistory storage self, uint index) internal view returns (int256 amount, uint256 timestamp, address currencyCt, uint256 currencyId) {
        require(index < self.withdrawals.length);

        amount = self.withdrawals[index].amount;
        timestamp = self.withdrawals[index].timestamp;
        currencyCt = self.withdrawals[index].currencyCt;
        currencyId = self.withdrawals[index].currencyId;
    }

    function withdrawalCount(TxHistory storage self) internal view returns (uint256) {
        return self.withdrawals.length;
    }
}
