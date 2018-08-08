/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

library TxHistoryLib {
    struct DepositOrWithdrawal {
        int256 amount;
        uint256 timestamp;
        address currency;      //0 for ethers
        uint256 currencyId;
    }

    struct TxHistory {
        DepositOrWithdrawal[] deposits;
        DepositOrWithdrawal[] withdrawals;
    }

    function addDeposit(TxHistory storage self, int256 amount, address currency, uint256 currencyId) internal {
        self.deposits.push(DepositOrWithdrawal(amount, block.timestamp, currency, currencyId));
    }

    function addWithdrawal(TxHistory storage self, int256 amount, address currency, uint256 currencyId) internal {
        self.withdrawals.push(DepositOrWithdrawal(amount, block.timestamp, currency, currencyId));
    }

    //----

    function deposit(TxHistory storage self, uint index) internal view returns (int256 amount, uint256 timestamp, address currency, uint256 currencyId) {
        require(index < self.deposits.length);

        amount = self.deposits[index].amount;
        timestamp = self.deposits[index].timestamp;
        currency = self.deposits[index].currency;
        currencyId = self.deposits[index].currencyId;
    }

    function depositCount(TxHistory storage self) internal view returns (uint256) {
        return self.deposits.length;
    }

    //----

    function withdrawal(TxHistory storage self, uint index) internal view returns (int256 amount, uint256 timestamp, address currency, uint256 currencyId) {
        require(index < self.withdrawals.length);

        amount = self.withdrawals[index].amount;
        timestamp = self.withdrawals[index].timestamp;
        currency = self.withdrawals[index].currency;
        currencyId = self.withdrawals[index].currencyId;
    }

    function withdrawalCount(TxHistory storage self) internal view returns (uint256) {
        return self.withdrawals.length;
    }
}
