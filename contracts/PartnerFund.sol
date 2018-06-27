/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {Ownable} from "./Ownable.sol";
import {ERC20} from "./ERC20.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title ParnerFund
@notice XXXX
*/
contract ParnerFund is Ownable, SelfDestructible {
    using SafeMathInt for int256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct DepositHistory {
        address currency;
        uint listIndex;
    }

    struct DepositInfo {
        int256 amount;
        uint256 timestamp;
        int256 balance;
        uint256 block;
    }

    struct PerWalletInfo {
        uint256 fee;
        address wallet;

        DepositInfo[] depositsEther;
        mapping(address => DepositInfo[]) depositsToken;

        // Active balance of ethers and tokens.
        int256 activeEtherBalance;
        mapping(address => int256) activeTokenBalance;

        // Staged balance of ethers and tokens.
        int256 stagedEtherBalance;
        mapping(address => int256) stagedTokenBalance;

        DepositHistory[] depositsHistory;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(bytes32 => PerWalletInfo) private walletInfoMap;
    mapping(address => bytes32) private addressTagMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangedFeeEvent(bytes32 tag, uint256 fee);
    event ChangedWalletEvent(bytes32 tag, address oldWallet, address newWallet);
    event DepositEvent(bytes32 tag, int256 amount, address token); //token==0 for ethers
    event StageEvent(bytes32 tag, address wallet, int256 amount, address token); //token==0 for ethers
    event WithdrawEvent(bytes32 tag, address wallet, int256 amount, address token); //token==0 for ethers

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Partner relationship functions
    // -----------------------------------------------------------------------------------------------------------------
    function setPartnerFee(bytes32 tag, uint256 fee) public onlyOwner notNullTag(tag) {
        require(fee > 0);

        walletInfoMap[tag].fee = fee;

        //raise event
        emit ChangedFeeEvent(tag, fee);
    }

    function getPartnerFee(bytes32 tag) public view notNullTag(tag) returns (uint256) {
        return walletInfoMap[tag].fee;
    }

    function setPartnerAddress(bytes32 tag, address newWallet) public onlyOwner notNullTag(tag) {
        //we allow wallet==0 to unlink
        address oldWallet = walletInfoMap[tag].wallet;

        walletInfoMap[tag].wallet = newWallet;

        if (oldWallet != address(0))
            addressTagMap[oldWallet] = 0x0;
        if (newWallet != address(0))
            addressTagMap[newWallet] = tag;

        //raise event
        emit ChangedWalletEvent(tag, oldWallet, newWallet);
    }

    function getPartnerAddress(bytes32 tag) public view returns (address) {
        return walletInfoMap[tag].wallet;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        revert();
    }

    function receiveEthers(bytes32 tag) public notNullTag(tag) payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        walletInfoMap[tag].activeEtherBalance = walletInfoMap[tag].activeEtherBalance.add_nn(amount);

        walletInfoMap[tag].depositsEther.push(DepositInfo(amount, now, walletInfoMap[tag].activeEtherBalance, block.number));
        walletInfoMap[tag].depositsHistory.push(DepositHistory(address(0), walletInfoMap[tag].depositsEther.length - 1));

        //emit event
        emit DepositEvent(tag, amount, address(0));
    }

    //NOTE: 'wallet' must call ERC20.approve first
    function receiveTokens(bytes32 tag, address sourceWallet, int256 amount, address token) public notNullTag(tag) {
        require(token != address(0));
        require(amount > 0);

        // Amount must be >0 so there's no problem with conversion to unsigned.
        ERC20 erc20 = ERC20(token);
        require(erc20.transferFrom(sourceWallet, this, uint256(amount)));

        walletInfoMap[tag].activeTokenBalance[token] = walletInfoMap[tag].activeTokenBalance[token].add_nn(amount);

        walletInfoMap[tag].depositsToken[token].push(DepositInfo(amount, now, walletInfoMap[tag].activeTokenBalance[token], block.number));
        walletInfoMap[tag].depositsHistory.push(DepositHistory(token, walletInfoMap[tag].depositsToken[token].length - 1));

        //emit event
        emit DepositEvent(tag, amount, token);
    }

    function deposit(bytes32 tag, uint index) public view notNullTag(tag) returns (int256 amount, address token, uint256 blockNumber) {
        require(index < walletInfoMap[tag].depositsHistory.length);

        DepositHistory storage dh = walletInfoMap[tag].depositsHistory[index];
        //NOTE: Code duplication in order to keep compiler happy and avoid warnings
        if (dh.currency == address(0)) {
            DepositInfo[] storage di = walletInfoMap[tag].depositsEther;
            amount = di[dh.listIndex].amount;
            token = address(0);
            blockNumber = di[dh.listIndex].block;
        } else {
            DepositInfo[] storage diT = walletInfoMap[tag].depositsToken[dh.currency];
            amount = diT[dh.listIndex].amount;
            token = dh.currency;
            blockNumber = diT[dh.listIndex].block;
        }
    }

    function depositFromAddress(address wallet, uint index) public view returns (int256 amount, address token, uint256 blockNumber) {
        return deposit(partnerFromWallet(wallet), index);
    }

    function depositCount(bytes32 tag) public view notNullTag(tag) returns (uint256) {
        return walletInfoMap[tag].depositsHistory.length;
    }

    function depositCountFromAddress(address wallet) public view returns (uint256) {
        return depositCount(partnerFromWallet(wallet));
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(address token, int256 amount) public notOwner {
        bytes32 tag = partnerFromWallet(msg.sender);
        require(amount.isPositiveInt256());

        if (token == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[tag].activeEtherBalance);
            require(amount > 0);

            walletInfoMap[tag].activeEtherBalance = walletInfoMap[tag].activeEtherBalance.sub_nn(amount);
            walletInfoMap[tag].stagedEtherBalance = walletInfoMap[tag].stagedEtherBalance.add_nn(amount);

            walletInfoMap[tag].depositsEther.push(DepositInfo(amount, now, walletInfoMap[tag].activeEtherBalance, block.number));
            walletInfoMap[tag].depositsHistory.push(DepositHistory(address(0), walletInfoMap[tag].depositsEther.length - 1));
        } else {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[tag].activeTokenBalance[token]);
            require(amount > 0);

            walletInfoMap[tag].activeTokenBalance[token] = walletInfoMap[tag].activeTokenBalance[token].sub_nn(amount);
            walletInfoMap[tag].stagedTokenBalance[token] = walletInfoMap[tag].stagedTokenBalance[token].add_nn(amount);

            walletInfoMap[tag].depositsToken[token].push(DepositInfo(int256(amount), now, walletInfoMap[tag].activeTokenBalance[token], block.number));
            walletInfoMap[tag].depositsHistory.push(DepositHistory(token, walletInfoMap[tag].depositsToken[token].length - 1));
        }

        //emit event
        emit StageEvent(tag, msg.sender, amount, token);
    }

    //
    // Balance functions
    // -----------------------------------------------------------------------------------------------------------------
    function activeBalance(bytes32 tag, address token) public view notNullTag(tag) returns (int256) {
        if (token == address(0))
            return walletInfoMap[tag].activeEtherBalance;
        return walletInfoMap[tag].activeTokenBalance[token];
    }

    function activeBalanceFromAddress(address wallet, address token) public view returns (int256) {
        return activeBalance(partnerFromWallet(wallet), token);
    }

    function stagedBalance(bytes32 tag, address token) public view notNullTag(tag) returns (int256) {
        if (token == address(0))
            return walletInfoMap[tag].stagedEtherBalance;
        return walletInfoMap[tag].stagedTokenBalance[token];
    }

    function stagedBalanceFromAddress(address wallet, address token) public view returns (int256) {
        return stagedBalance(partnerFromWallet(wallet), token);
    }

    //
    // Withdrawal functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdrawEther(int256 amount) public {
        bytes32 tag = partnerFromWallet(msg.sender);

        if (amount > walletInfoMap[tag].stagedEtherBalance) {
            amount = walletInfoMap[tag].stagedEtherBalance;
        }
        require(amount > 0);

        walletInfoMap[tag].stagedEtherBalance = walletInfoMap[tag].stagedEtherBalance.sub_nn(amount);

        //execute transfer
        msg.sender.transfer(uint256(amount));

        //raise event
        emit WithdrawEvent(tag, msg.sender, amount, address(0));
    }

    function withdrawTokens(address token, int256 amount) public {
        bytes32 tag = partnerFromWallet(msg.sender);
        require(token != address(0));

        if (amount > walletInfoMap[tag].stagedTokenBalance[token]) {
            amount = walletInfoMap[tag].stagedTokenBalance[token];
        }
        require(amount > 0);

        walletInfoMap[tag].stagedTokenBalance[token] = walletInfoMap[tag].stagedTokenBalance[token].sub_nn(amount);

        //execute transfer
        ERC20 erc20_token = ERC20(token);
        erc20_token.transfer(msg.sender, uint256(amount));

        //raise event
        emit WithdrawEvent(tag, msg.sender, amount, token);
    }

    //
    // Helpers
    // -----------------------------------------------------------------------------------------------------------------
    function partnerFromWallet(address wallet) internal view returns (bytes32) {
        bytes32 tag = addressTagMap[wallet];
        require(tag != 0);
        return tag;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullTag(bytes32 tag) {
        require(tag != 0);
        _;
    }
}
