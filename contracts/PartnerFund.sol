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
import {Beneficiary} from "./Beneficiary.sol";

/**
@title PartnerFund
@notice XXXX
*/
contract PartnerFund is Ownable, Beneficiary, SelfDestructible {
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
        bool isRegistered;
        bool ownerCanChangeAddress;
        bool canChangeAddress;

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
    mapping(address => PerWalletInfo) private walletInfoMap;
    mapping(address => address) private addressTagMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterParnerEvent(address tag, uint256 fee);
    event ChangedFeeEvent(address tag, uint256 fee);
    event ChangedWalletEvent(address tag, address oldWallet, address newWallet);
    event DepositEvent(address tag, int256 amount, address token); //token==0 for ethers
    event StageEvent(address tag, address wallet, int256 amount, address token); //token==0 for ethers
    event WithdrawEvent(address tag, address wallet, int256 amount, address token); //token==0 for ethers

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Partner relationship functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerPartner(address tag, uint256 fee, bool canChangeAddress, bool ownerCanChangeAddress) public onlyOwner notNullTag(tag) {
        require(!walletInfoMap[tag].isRegistered);
        require(fee > 0);
        require(canChangeAddress || ownerCanChangeAddress);

        walletInfoMap[tag].isRegistered = true;
        walletInfoMap[tag].ownerCanChangeAddress = ownerCanChangeAddress;
        walletInfoMap[tag].canChangeAddress = canChangeAddress;
        walletInfoMap[tag].fee = fee;

        //raise event
        emit RegisterParnerEvent(tag, fee);
    }

    function changePartnerFee(address tag, uint256 fee) public onlyOwner isRegisteredTag(tag) {
        require(fee > 0);

        walletInfoMap[tag].fee = fee;

        //raise event
        emit ChangedFeeEvent(tag, fee);
    }

    function getPartnerFee(address tag) public view isRegisteredTag(tag) returns (uint256) {
        return walletInfoMap[tag].fee;
    }

    function setPartnerAddress(address tag, address newWallet) public isRegisteredTag(tag) {
        address oldWallet;

        require(newWallet != owner);

        oldWallet = walletInfoMap[tag].wallet;

        //checks
        if (oldWallet == address(0)) {
            //if address not set, owner is the only allowed to change it
            require(isOwner());
        }
        else if (isOwner()) {
            //owner trying to change address, verify access
            require(walletInfoMap[tag].ownerCanChangeAddress);
        }
        else {
            //partner trying to change address, verify access
            require(walletInfoMap[tag].canChangeAddress);

            require(oldWallet != address(0) && msg.sender == oldWallet); //only the address owner can change it

            require(newWallet != address(0)); //partners are not allowed to unlink the tag
        }

        //proceed with the change
        walletInfoMap[tag].wallet = newWallet;

        if (oldWallet != address(0))
            addressTagMap[oldWallet] = 0x0;
        if (newWallet != address(0))
            addressTagMap[newWallet] = tag;

        //raise event
        emit ChangedWalletEvent(tag, oldWallet, newWallet);
    }

    function getPartnerAddress(address tag) public view returns (address) {
        return walletInfoMap[tag].wallet;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        revert();
    }

    function receiveEthers(address tag) public isRegisteredTag(tag) payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        walletInfoMap[tag].activeEtherBalance = walletInfoMap[tag].activeEtherBalance.add_nn(amount);

        walletInfoMap[tag].depositsEther.push(DepositInfo(amount, now, walletInfoMap[tag].activeEtherBalance, block.number));
        walletInfoMap[tag].depositsHistory.push(DepositHistory(address(0), walletInfoMap[tag].depositsEther.length - 1));

        //emit event
        emit DepositEvent(tag, amount, address(0));
    }

    //NOTE: 'wallet' must call ERC20.approve first
    function receiveTokens(address tag, int256 amount, address token) public isRegisteredTag(tag) {
        require(token != address(0));
        require(amount > 0);

        // Amount must be >0 so there's no problem with conversion to unsigned.
        ERC20 erc20 = ERC20(token);
        require(erc20.transferFrom(msg.sender, this, uint256(amount)));

        walletInfoMap[tag].activeTokenBalance[token] = walletInfoMap[tag].activeTokenBalance[token].add_nn(amount);

        walletInfoMap[tag].depositsToken[token].push(DepositInfo(amount, now, walletInfoMap[tag].activeTokenBalance[token], block.number));
        walletInfoMap[tag].depositsHistory.push(DepositHistory(token, walletInfoMap[tag].depositsToken[token].length - 1));

        //emit event
        emit DepositEvent(tag, amount, token);
    }

    function deposit(address tag, uint index) public view isRegisteredTag(tag) returns (int256 amount, address token, uint256 blockNumber) {
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

    function depositCount(address tag) public view isRegisteredTag(tag) returns (uint256) {
        return walletInfoMap[tag].depositsHistory.length;
    }

    function depositCountFromAddress(address wallet) public view returns (uint256) {
        return depositCount(partnerFromWallet(wallet));
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(int256 amount, address token) public notOwner {
        address tag = partnerFromWallet(msg.sender);
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
    function activeBalance(address tag, address token) public view isRegisteredTag(tag) returns (int256) {
        if (token == address(0))
            return walletInfoMap[tag].activeEtherBalance;
        return walletInfoMap[tag].activeTokenBalance[token];
    }

    function activeBalanceFromAddress(address wallet, address token) public view returns (int256) {
        return activeBalance(partnerFromWallet(wallet), token);
    }

    function stagedBalance(address tag, address token) public view isRegisteredTag(tag) returns (int256) {
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
    function withdrawEthers(int256 amount) public {
        address tag = partnerFromWallet(msg.sender);

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

    function withdrawTokens(int256 amount, address token) public {
        address tag = partnerFromWallet(msg.sender);
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
    function partnerFromWallet(address wallet) internal view returns (address) {
        address tag = addressTagMap[wallet];
        require(tag != 0);
        require(walletInfoMap[tag].isRegistered);
        return tag;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullTag(address tag) {
        require(tag != 0);
        _;
    }

    modifier isRegisteredTag(address tag) {
        require(tag != 0);
        require(walletInfoMap[tag].isRegistered);
        _;
    }
}
