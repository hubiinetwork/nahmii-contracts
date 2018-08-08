/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SafeMathInt} from "./SafeMathInt.sol";
import {Ownable} from "./Ownable.sol";
import {Modifiable} from "./Modifiable.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {Benefactor} from "./Benefactor.sol";
import {AuthorizableServable} from "./AuthorizableServable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import {CurrencyManager} from "./CurrencyManager.sol";
import {CurrencyController} from "./CurrencyController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
*/
contract ClientFund is Ownable, Modifiable, Beneficiary, Benefactor, AuthorizableServable, SelfDestructible {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using SafeMathInt for int256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct InUseCurrencyItem {
        address currency;
        uint256 currencyId;
    }

    struct Wallet {
        BalanceLib.Balance deposited;
        BalanceLib.Balance staged;
        BalanceLib.Balance settled;

        TxHistoryLib.TxHistory txHistory;

        InUseCurrencyItem[] inUseCurrencyList;
        mapping(address => mapping(uint256 => bool)) inUseCurrencyMap;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;
    CurrencyManager currencyManager;

    mapping(address => uint256) private registeredServicesMap;
    mapping(address => mapping(address => bool)) private disabledServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address from, int256 amount, address currency, uint256 currencyId); //currency==0 for ethers
    event WithdrawEvent(address to, int256 amount, address currency, uint256 currencyId);  //currency==0 for ethers

    event StageEvent(address from, int256 amount, address currency, uint256 currencyId); //currency==0 for ethers
    event UnstageEvent(address from, int256 amount, address currency, uint256 currencyId); //currency==0 for ethers

    event UpdateSettledBalanceEvent(address wallet, int256 amount, address currency, uint256 currencyId); //currency==0 for ethers
    event StageToBeneficiaryEvent(address sourceWallet, address beneficiary, int256 amount, address currency, uint256 currencyId); //currency==0 for ethers
    event StageToBeneficiaryUntargetedEvent(address sourceWallet, address beneficiary, int256 amount, address currency, uint256 currencyId); //currency==0 for ethers

    event SeizeAllBalancesEvent(address sourceWallet, address targetWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) Beneficiary() Benefactor() public {
        serviceActivationTimeout = 1 weeks;
    }

    function setCurrencyManager(address manager) public onlyOwner {
        currencyManager = CurrencyManager(manager);
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        depositEthersTo(msg.sender);
    }

    function depositEthersTo(address wallet) public payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to per-wallet deposited balance
        walletMap[wallet].deposited.add(amount, address(0), 0);
        walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

        //emit event
        emit DepositEvent(wallet, amount, address(0), 0);
    }

    function depositTokens(int256 amount, address token, uint256 currencyId, string standard) public {
        depositTokensTo(msg.sender, amount, token, currencyId, standard);
    }

    function depositTokensTo(address wallet, int256 amount, address currency, uint256 currencyId, string standard) public {
        require(amount.isNonZeroPositiveInt256());

        //execute transfer
        CurrencyController controller = currencyManager.getCurrencyController(currency, standard);
        controller.receive(msg.sender, this, uint256(amount), currency, currencyId);

        //add to per-wallet deposited balance
        walletMap[wallet].deposited.add(amount, currency, currencyId);
        walletMap[wallet].txHistory.addDeposit(amount, currency, currencyId);

        //add currency to in-use list
        if (!walletMap[wallet].inUseCurrencyMap[currency][currencyId]) {
            walletMap[wallet].inUseCurrencyMap[currency][currencyId] = true;
            walletMap[wallet].inUseCurrencyList.push(InUseCurrencyItem(currency, currencyId));
        }

        //emit event
        emit DepositEvent(wallet, amount, currency, currencyId);
    }

    function deposit(address wallet, uint index) public view returns (int256 amount, uint256 timestamp, address token, uint256 id) {
        return walletMap[wallet].txHistory.deposit(index);
    }

    function depositCount(address wallet) public view returns (uint256) {
        return walletMap[wallet].txHistory.depositCount();
    }

    //
    // Balance retrieval functions
    // -----------------------------------------------------------------------------------------------------------------
    function depositedBalance(address wallet, address currency, uint256 currencyId) public view notNullAddress(wallet) returns (int256) {
        return walletMap[wallet].deposited.get(currency, currencyId);
    }

    function stagedBalance(address wallet, address currency, uint256 currencyId) public view notNullAddress(wallet) returns (int256) {
        return walletMap[wallet].staged.get(currency, currencyId);
    }

    function settledBalance(address wallet, address currency, uint256 currencyId) public view notNullAddress(wallet) returns (int256) {
        return walletMap[wallet].settled.get(currency, currencyId);
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(int256 amount, address currency, uint256 currencyId) public notOwner {
        int256 amountCopy;
        int256 deposited;
        int256 settled;

        require(amount.isPositiveInt256());

        deposited = walletMap[msg.sender].deposited.get(currency, currencyId);
        settled = walletMap[msg.sender].settled.get(currency, currencyId);

        //clamp amount to move
        amount = amount.clampMax(deposited.add(settled));
        if (amount <= 0)
            return;
        amountCopy = amount;

        //first move from settled to staged if settled balance is positive
        if (settled > 0) {
            walletMap[msg.sender].settled.sub_allow_neg(settled, currency, currencyId);
            walletMap[msg.sender].staged.add(settled, currency, currencyId);

            amount = amount.sub(settled);
        }

        //move the remaining from deposited to staged
        if (amount > 0) {
            walletMap[msg.sender].deposited.transfer(walletMap[msg.sender].staged, amount, currency, currencyId);
        }

        //emit event
        emit StageEvent(msg.sender, amountCopy, currency, currencyId);
    }

    function unstage(int256 amount, address currency, uint256 currencyId) public notOwner {
        require(amount.isPositiveInt256());

        //clamp amount to move
        amount = amount.clampMax(walletMap[msg.sender].staged.get(currency, currencyId));
        if (amount == 0)
            return;

        //move from staged balance to deposited
        walletMap[msg.sender].staged.transfer(walletMap[msg.sender].deposited, amount, currency, currencyId);

        //emit event
        emit UnstageEvent(msg.sender, amount, currency, currencyId);
    }

    function updateSettledBalance(address wallet, int256 amount, address currency, uint256 currencyId) public onlyRegisteredActiveService notNullAddress(wallet) {
        require(isAuthorizedServiceForWallet(msg.sender, wallet));
        require(amount.isNonZeroPositiveInt256());

        walletMap[msg.sender].settled.sub_allow_neg(amount, currency, currencyId);

        emit UpdateSettledBalanceEvent(wallet, amount, currency, currencyId);
    }

    function stageToBeneficiary(address beneficiary, int256 amount, address currency, uint256 currencyId) public notOwner {
        stageToBeneficiaryPrivate(msg.sender, msg.sender, beneficiary, amount, currency, currencyId);

        //emit event
        emit StageToBeneficiaryEvent(msg.sender, beneficiary, amount, currency, currencyId);
    }

    function stageToBeneficiaryUntargeted(address sourceWallet, address beneficiary, int256 amount, address currency, uint256 currencyId) public onlyRegisteredActiveService notNullAddress(sourceWallet) notNullAddress(beneficiary) {
        require(isAuthorizedServiceForWallet(msg.sender, sourceWallet));
        stageToBeneficiaryPrivate(sourceWallet, address(0), beneficiary, amount, currency, currencyId);

        //emit event
        emit StageToBeneficiaryUntargetedEvent(sourceWallet, beneficiary, amount, currency, currencyId);
    }

    function stageToBeneficiaryPrivate(address sourceWallet, address destWallet, address beneficiary, int256 amount, address currency, uint256 currencyId) private {
        int256 amountCopy;
        int256 deposited;
        int256 settled;

        require(amount.isPositiveInt256());
        require(isRegisteredBeneficiary(beneficiary));
        Beneficiary _beneficiary = Beneficiary(beneficiary);

        deposited = walletMap[sourceWallet].deposited.get(currency, currencyId);
        settled = walletMap[sourceWallet].settled.get(currency, currencyId);

        //clamp amount to move
        amount = amount.clampMax(deposited.add(settled));
        if (amount <= 0)
            return;
        amountCopy = amount;

        //first move from settled to staged if settled balance is positive
        if (settled > 0) {
            walletMap[sourceWallet].settled.sub_allow_neg(settled, currency, currencyId);

            amount = amount.sub(settled);
        }

        //move the remaining from deposited to staged
        if (amount > 0) {
            walletMap[sourceWallet].deposited.sub(amount, currency, currencyId);
        }


        //transfer funds to the beneficiary
        if (currency == address(0)) {
            _beneficiary.depositEthersTo.value(uint256(amountCopy))(destWallet);
        }
        else {
            //execute transfer
            CurrencyController controller = currencyManager.getCurrencyController(currency, "");
            if (!address(controller).delegatecall(controller.approve_signature, _beneficiary, uint256(amountCopy), currency, currencyId)) {
                revert();
            }

            //transfer funds to the beneficiary
            _beneficiary.depositTokensTo(destWallet, amount, currency);
        }
    }

    function seizeAllBalances(address sourceWallet, address targetWallet) public onlyRegisteredActiveService notNullAddress(sourceWallet) notNullAddress(targetWallet) {
        int256 amount;
        uint256 i;
        uint256 len;

        require(isAuthorizedServiceForWallet(msg.sender, sourceWallet));

        //seize ethers
        len = walletMap[sourceWallet].inUseCurrencyList.length;
        for (i = 0; i < len; i++) {
            InUseCurrencyItem storage item = walletMap[sourceWallet].inUseCurrencyList[i];

            amount = walletMap[sourceWallet].deposited.get(item.currency, item.currencyId)
                            .add(walletMap[sourceWallet].settled.get(item.currency, item.currencyId))
                            .add(walletMap[sourceWallet].staged.get(item.currency, item.currencyId));
            assert(amount >= 0);

            walletMap[sourceWallet].deposited.set(0, item.currency, item.currencyId);
            walletMap[sourceWallet].settled.set(0, item.currency, item.currencyId);
            walletMap[sourceWallet].staged.set(0, item.currency, item.currencyId);

            //add to staged balance
            walletMap[targetWallet].staged.add(amount, item.currency, item.currencyId);

            //add currency to in-use list
            if (!walletMap[targetWallet].inUseCurrencyMap[item.currency][item.currencyId]) {
                walletMap[targetWallet].inUseCurrencyMap[item.currency][item.currencyId] = true;
                walletMap[targetWallet].inUseCurrencyList.push(InUseCurrencyItem(item.currency, item.currencyId));
            }
        }

        //emit event
        emit SeizeAllBalancesEvent(sourceWallet, targetWallet);
    }

    //
    // Withdrawal functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdrawEthers(int256 amount) public notOwner {
        require(amount.isNonZeroPositiveInt256());

        //subtract to per-wallet staged balance (will check for sufficient balance)
        walletMap[msg.sender].staged.sub(amount, address(0), 0);
        walletMap[msg.sender].txHistory.addWithdrawal(amount, address(0), 0);

        //execute transfer
        msg.sender.transfer(uint256(amount));

        //emit event
        emit WithdrawEvent(msg.sender, amount, address(0), 0);
    }

    function withdrawTokens(int256 amount, address currency, uint256 currencyId) public notOwner notNullAddress(currency) {
        require(amount.isNonZeroPositiveInt256());

        //subtract to per-wallet staged balance (will check for sufficient balance)
        walletMap[msg.sender].staged.sub(amount, currency, currencyId);
        walletMap[msg.sender].txHistory.addWithdrawal(amount, currency, currencyId);

        //execute transfer
        CurrencyController controller = currencyManager.getCurrencyController(currency, "");
        if (!address(controller).delegatecall(controller.send_signature, msg.sender, uint256(amount), currency, currencyId)) {
            revert();
        }

        //emit event
        emit WithdrawEvent(msg.sender, amount, currency, currencyId);
    }

    function withdrawal(address wallet, uint index) public view onlyOwner returns (int256 amount, uint256 timestamp, address token, uint256 id) {
        return walletMap[wallet].txHistory.withdrawal(index);
    }

    function withdrawalCount(address wallet) public view onlyOwner returns (uint256) {
        return walletMap[wallet].txHistory.withdrawalCount();
    }
}
