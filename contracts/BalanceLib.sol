/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SafeMathInt} from "./SafeMathInt.sol";

library BalanceLib {
    using SafeMathInt for int256;

    struct Deposit {
        int256 amount;
        uint256 timestamp;
        address token;      //0 for ethers
        uint256 nonfungible_id;
    }

    struct Withdrawal {
        int256 amount;
        uint256 timestamp;
        address token;      //0 for ethers
        uint256 nonfungible_id;
    }

    struct Balance {
        int256 ethers;
        mapping(address => mapping(uint256 => int256)) tokens;

        Deposit[] deposits;
        Withdrawal[] withdrawals;
    }

    function get(Balance storage self, address token, uint256 id) internal view returns (int256) {
        if (token == address(0)) {
            return self.ethers;
        }
        return self.tokens[token][id];
    }

    function add(Balance storage self, int256 amount, address token, uint256 id, bool addToHistory) internal {
        if (token == address(0)) {
            self.ethers = self.ethers.add_nn(amount);
            if (addToHistory) {
                self.deposits.push(Deposit(amount, block.timestamp, address(0), 0));
            }
        }
        else {
            self.tokens[token][id] = self.tokens[token][id].add_nn(amount);
            if (addToHistory) {
                self.deposits.push(Deposit(amount, block.timestamp, token, id));
            }
        }
    }

    function sub(Balance storage self, int256 amount, address token, uint256 id, bool addToHistory) internal {
        if (token == address(0)) {
            self.ethers = self.ethers.sub_nn(amount);
            if (addToHistory) {
                self.withdrawals.push(Withdrawal(amount, block.timestamp, address(0), 0));
            }
        }
        else {
            self.tokens[token][id] = self.tokens[token][id].sub_nn(amount);
            if (addToHistory) {
                self.withdrawals.push(Withdrawal(amount, block.timestamp,  token, id));
            }
        }
    }

    function transfer(Balance storage _from, Balance storage _to, int256 amount, address token, uint256 id, bool addToHistory) internal {
        sub(_from, amount, token, id, addToHistory);
        add(_to, amount, token, id, addToHistory);
    }

    //----

    function add_allow_neg(Balance storage self, int256 amount, address token, uint256 id, bool addToHistory) internal {
        if (token == address(0)) {
            self.ethers = self.ethers.add(amount);
            if (addToHistory) {
                self.deposits.push(Deposit(amount, block.timestamp, address(0), 0));
            }
        }
        else {
            self.tokens[token][id] = self.tokens[token][id].add(amount);
            if (addToHistory) {
                self.deposits.push(Deposit(amount, block.timestamp, token, id));
            }
        }
    }

    function sub_allow_neg(Balance storage self, int256 amount, address token, uint256 id, bool addToHistory) internal {
        if (token == address(0)) {
            self.ethers = self.ethers.sub(amount);
            if (addToHistory) {
                self.withdrawals.push(Withdrawal(amount, block.timestamp, address(0), 0));
            }
        }
        else {
            self.tokens[token][id] = self.tokens[token][id].sub(amount);
            if (addToHistory) {
                self.withdrawals.push(Withdrawal(amount, block.timestamp,  token, id));
            }
        }
    }

    function transfer_allow_neg(Balance storage _from, Balance storage _to, int256 amount, address token, uint256 id, bool addToHistory) internal {
        sub_allow_neg(_from, amount, token, id, addToHistory);
        add_allow_neg(_to, amount, token, id, addToHistory);
    }

    //----

    function deposit(Balance storage self, uint index) internal view returns (int256 amount, uint256 timestamp, address token, uint256 id) {
        require(index < self.deposits.length);

        amount = self.deposits[index].amount;
        timestamp = self.deposits[index].timestamp;
        token = self.deposits[index].token;
        id = self.deposits[index].nonfungible_id;
    }

    function depositCount(Balance storage self) internal view returns (uint256) {
        return self.deposits.length;
    }

    //----

    function withdrawal(Balance storage self, uint index) internal view returns (int256 amount, uint256 timestamp, address token, uint256 id) {
        require(index < self.withdrawals.length);

        amount = self.withdrawals[index].amount;
        timestamp = self.withdrawals[index].timestamp;
        token = self.withdrawals[index].token;
        id = self.withdrawals[index].nonfungible_id;
    }

    function withdrawalCount(Balance storage self) internal view returns (uint256) {
        return self.withdrawals.length;
    }
}
