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
import {Beneficiary} from "./Beneficiary.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {TransferController} from "./TransferController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";

/**
@title PartnerFund
@notice XXXX
*/
// TODO Update to two-component currency descriptor
contract PartnerFund is Ownable, Beneficiary, TransferControllerManageable {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using SafeMathInt for int256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Wallet {
        bool isRegistered;
        bool ownerCanChangeAddress;
        bool canChangeAddress;

        uint256 fee;
        address wallet;

        BalanceLib.Balance active;
        BalanceLib.Balance staged;

        TxHistoryLib.TxHistory txHistory;
        FullDepositHistory[] fullDepositHistory;
    }

    struct FullDepositHistory {
        uint listIndex;
        int256 balance;
        uint256 blockNumber;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;
    mapping(address => address) private addressTagMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterParnerEvent(address tag, uint256 fee);
    event ChangedFeeEvent(address tag, uint256 fee);
    event ChangedWalletEvent(address tag, address oldWallet, address newWallet);
    event DepositEvent(address tag, address from, int256 amount, address currencyCt, uint256 currencyId);
    event StageEvent(address tag, address from, int256 amount, address currencyCt, uint256 currencyId);
    event WithdrawEvent(address tag, address to, int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Partner relationship functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerPartner(address tag, uint256 fee, bool canChangeAddress, bool ownerCanChangeAddress) public onlyOwner notNullTag(tag) {
        require(!walletMap[tag].isRegistered);
        require(fee > 0);
        require(canChangeAddress || ownerCanChangeAddress);

        walletMap[tag].isRegistered = true;
        walletMap[tag].ownerCanChangeAddress = ownerCanChangeAddress;
        walletMap[tag].canChangeAddress = canChangeAddress;
        walletMap[tag].fee = fee;

        //raise event
        emit RegisterParnerEvent(tag, fee);
    }

    function changePartnerFee(address tag, uint256 fee) public onlyOwner isRegisteredTag(tag) {
        require(fee > 0);

        walletMap[tag].fee = fee;

        //raise event
        emit ChangedFeeEvent(tag, fee);
    }

    function getPartnerFee(address tag) public view isRegisteredTag(tag) returns (uint256) {
        return walletMap[tag].fee;
    }

    function setPartnerWallet(address tag, address newWallet) public isRegisteredTag(tag) {
        address oldWallet;

        require(newWallet != owner);

        oldWallet = walletMap[tag].wallet;

        //checks
        if (oldWallet == address(0)) {
            //if address not set, owner is the only allowed to change it
            require(isOwner());
        }
        else if (isOwner()) {
            //owner trying to change address, verify access
            require(walletMap[tag].ownerCanChangeAddress);
        }
        else {
            //partner trying to change address, verify access
            require(walletMap[tag].canChangeAddress);

            require(oldWallet != address(0) && msg.sender == oldWallet);
            //only the address owner can change it

            require(newWallet != address(0));
            //partners are not allowed to unlink the tag
        }

        //proceed with the change
        walletMap[tag].wallet = newWallet;

        if (oldWallet != address(0))
            addressTagMap[oldWallet] = 0x0;
        if (newWallet != address(0))
            addressTagMap[newWallet] = tag;

        //raise event
        emit ChangedWalletEvent(tag, oldWallet, newWallet);
    }

    function getPartnerAddress(address tag) public view returns (address) {
        return walletMap[tag].wallet;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        revert();
    }

    function depositEthersTo(address tag) public isRegisteredTag(tag) payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to per-wallet deposited balance
        walletMap[tag].active.add(amount, address(0), 0);
        walletMap[tag].txHistory.addDeposit(amount, address(0), 0);

        //add full history
        walletMap[tag].fullDepositHistory.push(FullDepositHistory(walletMap[tag].txHistory.depositCount() - 1, walletMap[tag].active.get(address(0), 0), block.number));

        //emit event
        emit DepositEvent(tag, msg.sender, amount, address(0), 0);
    }

    //NOTE: 'wallet' must call ERC20.approve first
    function depositTokens(int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        depositTokensTo(partnerFromWallet(msg.sender), amount, currencyCt, currencyId, standard);
    }

    function depositTokensTo(address tag, int256 amount, address currencyCt, uint256 currencyId, string standard) public isRegisteredTag(tag) {
       require(amount.isNonZeroPositiveInt256());

        //execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        require(address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId));

        //add to per-wallet deposited balance
        walletMap[tag].active.add(amount, currencyCt, currencyId);
        walletMap[tag].txHistory.addDeposit(amount, currencyCt, currencyId);

        //add full history
        walletMap[tag].fullDepositHistory.push(FullDepositHistory(walletMap[tag].txHistory.depositCount() - 1, walletMap[tag].active.get(currencyCt, currencyId), block.number));

        //emit event
        emit DepositEvent(tag, msg.sender, amount, currencyCt, currencyId);
    }

    //
    // Deposit history retrieval functions
    // -----------------------------------------------------------------------------------------------------------------
    function deposit(address tag, uint index) public view isRegisteredTag(tag) returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId) {
        require(index < walletMap[tag].fullDepositHistory.length);

        FullDepositHistory storage fdh = walletMap[tag].fullDepositHistory[index];
        (, , currencyCt, currencyId) = walletMap[tag].txHistory.deposit(fdh.listIndex);

        balance = fdh.balance;
        blockNumber = fdh.blockNumber;
    }

    function depositFromAddress(address wallet, uint index) public view returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId) {
        return deposit(partnerFromWallet(wallet), index);
    }

    function depositCount(address tag) public view isRegisteredTag(tag) returns (uint256) {
        return walletMap[tag].fullDepositHistory.length;
    }

    function depositCountFromAddress(address wallet) public view returns (uint256) {
        return depositCount(partnerFromWallet(wallet));
    }


    //
    // Balance retrieval functions
    // -----------------------------------------------------------------------------------------------------------------
    function activeBalance(address tag, address currencyCt, uint256 currencyId) public view isRegisteredTag(tag) returns (int256) {
        return walletMap[tag].active.get(currencyCt, currencyId);
    }

    function activeBalanceFromAddress(address wallet, address currencyCt, uint256 currencyId) public view returns (int256) {
        return activeBalance(partnerFromWallet(wallet), currencyCt, currencyId);
    }

    function stagedBalance(address tag, address currencyCt, uint256 currencyId) public view isRegisteredTag(tag) returns (int256) {
        return walletMap[tag].staged.get(currencyCt, currencyId);
    }

    function stagedBalanceFromAddress(address wallet, address currencyCt, uint256 currencyId) public view returns (int256) {
        return stagedBalance(partnerFromWallet(wallet), currencyCt, currencyId);
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(int256 amount, address currencyCt, uint256 currencyId) public notOwner {
        address tag = partnerFromWallet(msg.sender);

        require(amount.isPositiveInt256());

        //clamp amount to move
        amount = amount.clampMax(walletMap[tag].active.get(currencyCt, currencyId));
        if (amount <= 0)
            return;

        walletMap[tag].active.sub(amount, currencyCt, currencyId);
        walletMap[tag].staged.add(amount, currencyCt, currencyId);

        walletMap[tag].txHistory.addDeposit(amount, currencyCt, currencyId);

        //add full history
        walletMap[tag].fullDepositHistory.push(FullDepositHistory(walletMap[tag].txHistory.depositCount() - 1, walletMap[tag].active.get(currencyCt, currencyId), block.number));

        //emit event
        emit StageEvent(tag, msg.sender, amount, currencyCt, currencyId);
    }

    //
    // Withdrawal functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        address tag = partnerFromWallet(msg.sender);

        amount = amount.clampMax(walletMap[tag].staged.get(currencyCt, currencyId));
        if (amount <= 0)
            return;

        walletMap[tag].staged.sub(amount, currencyCt, currencyId);

        //execute transfer
        if (currencyCt == address(0)) {
            msg.sender.transfer(uint256(amount));
        }
        else {
            TransferController controller = getTransferController(currencyCt, standard);
            require(address(controller).delegatecall(controller.getSendSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId));
        }

        //raise event
        emit WithdrawEvent(tag, msg.sender, amount, currencyCt, currencyId);
    }

    //
    // Helpers
    // -----------------------------------------------------------------------------------------------------------------
    function partnerFromWallet(address wallet) internal view returns (address) {
        address tag = addressTagMap[wallet];
        require(tag != 0);
        require(walletMap[tag].isRegistered);
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
        require(walletMap[tag].isRegistered);
        _;
    }
}
