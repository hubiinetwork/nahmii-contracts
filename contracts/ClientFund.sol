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
import {TokenManager} from "./TokenManager.sol";
import {TokenController} from "./TokenController.sol";
import {BalanceLib} from "./BalanceLib.sol";

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
*/
contract ClientFund is Ownable, Modifiable, Beneficiary, Benefactor, AuthorizableServable, SelfDestructible {
    using BalanceLib for BalanceLib.Balance;
    using SafeMathInt for int256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct InUseTokenItem {
        address token;
        uint256 nonfungible_id;
    }

    struct Wallet {
        BalanceLib.Balance deposited;
        BalanceLib.Balance staged;
        BalanceLib.Balance settled;

        InUseTokenItem[] inUseTokenList;
        mapping(address => mapping(uint256 => bool)) inUseTokenMap;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;
    TokenManager tokenManager;

    mapping(address => uint256) private registeredServicesMap;
    mapping(address => mapping(address => bool)) private disabledServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address from, int256 amount, address currency, uint256 nonfungible_id); //currency==0 for ethers
    event WithdrawEvent(address to, int256 amount, address currency, uint256 nonfungible_id);  //currency==0 for ethers

    event StageEvent(address from, int256 amount, address currency, uint256 nonfungible_id); //currency==0 for ethers
    event UnstageEvent(address from, int256 amount, address currency, uint256 nonfungible_id); //currency==0 for ethers

    event UpdateSettledBalanceEvent(address wallet, address currency, uint256 nonfungible_id, int256 amount); //currency==0 for ethers
    event StageToBeneficiaryEvent(address sourceWallet, address beneficiary, address currency, int256 amount); //currency==0 for ethers
    event StageToBeneficiaryUntargetedEvent(address sourceWallet, address beneficiary, address currency, int256 amount); //currency==0 for ethers

    event SeizeAllBalancesEvent(address sourceWallet, address targetWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) Beneficiary() Benefactor() public {
        serviceActivationTimeout = 1 weeks;
    }

    function setTokenManager(address manager) public onlyOwner {
        tokenManager = TokenManager(manager);
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
        walletMap[wallet].deposited.add(amount, address(0), 0, true);

        //emit event
        emit DepositEvent(wallet, amount, address(0), 0);
    }

    function depositTokens(int256 amount, address token, uint256 nonfungible_id, string standard) public {
        depositTokensTo(msg.sender, amount, token, nonfungible_id, standard);
    }

    function depositTokensTo(address wallet, int256 amount, address token, uint256 nonfungible_id, string standard) public {
        require(amount.isNonZeroPositiveInt256());

        //execute transfer
        TokenController controller = tokenManager.getTokenController(token, standard);
        controller.receive(msg.sender, this, uint256(amount), token, nonfungible_id);

        //add to per-wallet deposited balance
        walletMap[wallet].deposited.add(amount, token, nonfungible_id, true);

        //add token to in-use list
        if (!walletMap[wallet].inUseTokenMap[token][nonfungible_id]) {
            walletMap[wallet].inUseTokenMap[token][nonfungible_id] = true;
            walletMap[wallet].inUseTokenList.push(InUseTokenItem(token, nonfungible_id));
        }

        //emit event
        emit DepositEvent(wallet, amount, token, nonfungible_id);
    }

    function deposit(address wallet, uint index) public view returns (int256 amount, uint256 timestamp, address token, uint256 id) {
        return walletMap[wallet].deposited.deposit(index);
    }

    function depositCount(address wallet) public view returns (uint256) {
        return walletMap[wallet].deposited.depositCount();
    }

    //
    // Balance retrieval functions
    // -----------------------------------------------------------------------------------------------------------------
    function depositedBalance(address wallet, address currency, uint256 nonfungible_id) public view notNullAddress(wallet) returns (int256) {
        return walletMap[wallet].deposited.get(currency, nonfungible_id);
    }

    function stagedBalance(address wallet, address currency, uint256 nonfungible_id) public view notNullAddress(wallet) returns (int256) {
        return walletMap[wallet].staged.get(currency, nonfungible_id);
    }

    function settledBalance(address wallet, address currency, uint256 nonfungible_id) public view notNullAddress(wallet) returns (int256) {
        return walletMap[wallet].settled.get(currency, nonfungible_id);
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(int256 amount, address currency, uint256 nonfungible_id) public notOwner {
        int256 amountCopy;
        int256 deposited = walletMap[msg.sender].deposited.get(currency, nonfungible_id);
        int256 settled = walletMap[msg.sender].settled.get(currency, nonfungible_id);

        require(amount.isPositiveInt256());

        deposited = walletMap[msg.sender].deposited.get(currency, nonfungible_id);
        settled = walletMap[msg.sender].settled.get(currency, nonfungible_id);

        //clamp amount to move
        amount = amount.clampMax(deposited.add(settled));
        if (amount <= 0)
            return;
        amountCopy = amount;

        //first move from settled to staged if settled balance is positive
        if (settled > 0) {
            walletMap[msg.sender].settled.sub_allow_neg(settled, currency, nonfungible_id, false);
            walletMap[msg.sender].staged.add(settled, currency, nonfungible_id, false);

            amount = amount.sub(settled);
        }

        //move the remaining from deposited to staged
        if (amount > 0) {
            walletMap[msg.sender].deposited.transfer(walletMap[msg.sender].staged, amount, currency, nonfungible_id, false);
        }

        //emit event
        emit StageEvent(msg.sender, amountCopy, currency, nonfungible_id);
    }
    /*
    function unstage(int256 amount, address currency) public notOwner {
        require(amount.isPositiveInt256());

        if (currency == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].stagedEtherBalance);
            if (amount == 0)
                return;

            //move from staged balance to deposited
            walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub_nn(amount);
            walletInfoMap[msg.sender].depositedEtherBalance = walletInfoMap[msg.sender].depositedEtherBalance.add_nn(amount);
        } else {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].stagedTokenBalance[currency]);
            if (amount == 0)
                return;

            //move between balances
            walletInfoMap[msg.sender].stagedTokenBalance[currency] = walletInfoMap[msg.sender].stagedTokenBalance[currency].sub_nn(amount);
            walletInfoMap[msg.sender].depositedTokenBalance[currency] = walletInfoMap[msg.sender].depositedTokenBalance[currency].add_nn(amount);
        }

        //emit event
        emit UnstageEvent(msg.sender, amount, currency);
    }

    function updateSettledBalance(address wallet, address currency, int256 amount) public onlyRegisteredActiveService notNullAddress(wallet) {
        require(isAuthorizedServiceForWallet(msg.sender, wallet));
        require(amount.isNonZeroPositiveInt256());

        if (address(0) == currency)
            walletInfoMap[wallet].settledEtherBalance = amount.sub(walletInfoMap[wallet].depositedEtherBalance);
        else
            walletInfoMap[wallet].settledTokenBalance[currency] = amount.sub(walletInfoMap[wallet].depositedTokenBalance[currency]);

        emit UpdateSettledBalanceEvent(wallet, currency, amount);
    }

    function stageToBeneficiary(address beneficiary, address currency, int256 amount) public notOwner {
        stageToBeneficiaryPrivate(msg.sender, msg.sender, beneficiary, currency, amount);

        //emit event
        emit StageToBeneficiaryEvent(msg.sender, beneficiary, currency, amount);
    }

    function stageToBeneficiaryUntargeted(address sourceWallet, address beneficiary, address currency, int256 amount) public onlyRegisteredActiveService notNullAddress(sourceWallet) notNullAddress(beneficiary) {
        require(isAuthorizedServiceForWallet(msg.sender, sourceWallet));
        stageToBeneficiaryPrivate(sourceWallet, address(0), beneficiary, currency, amount);

        //emit event
        emit StageToBeneficiaryUntargetedEvent(sourceWallet, beneficiary, currency, amount);
    }

    function stageToBeneficiaryPrivate(address sourceWallet, address destWallet, address beneficiary, address currency, int256 amount) private {
        require(amount.isPositiveInt256());
        require(isRegisteredBeneficiary(beneficiary));

        Beneficiary _beneficiary = Beneficiary(beneficiary);

        int256 amountCopy;
        int256 toMove;
        if (currency == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[sourceWallet].depositedEtherBalance.add(walletInfoMap[sourceWallet].settledEtherBalance));
            if (amount <= 0)
                return;

            amountCopy = amount;

            //move from settled balance to staged, if balance greater than zero
            if (walletInfoMap[sourceWallet].settledEtherBalance > 0) {
                toMove = amount.clampMax(walletInfoMap[sourceWallet].settledEtherBalance);

                walletInfoMap[sourceWallet].settledEtherBalance = walletInfoMap[sourceWallet].settledEtherBalance.sub(toMove);
                amount = amount.sub(toMove);
            }

            //move (remaining) from deposited balance
            walletInfoMap[sourceWallet].depositedEtherBalance = walletInfoMap[sourceWallet].depositedEtherBalance.sub_nn(amount);

            //transfer funds to the beneficiary
            _beneficiary.depositEthersTo.value(uint256(amount))(destWallet);

        } else {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[sourceWallet].depositedTokenBalance[currency].add(walletInfoMap[sourceWallet].settledTokenBalance[currency]));
            if (amount <= 0)
                return;

            amountCopy = amount;

            //move from settled balance to staged, if balance greater than zero
            if (walletInfoMap[sourceWallet].settledTokenBalance[currency] > 0) {
                toMove = amount.clampMax(walletInfoMap[sourceWallet].settledTokenBalance[currency]);

                walletInfoMap[sourceWallet].settledTokenBalance[currency] = walletInfoMap[sourceWallet].settledTokenBalance[currency].sub(toMove);
                amount = amount.sub(toMove);
            }

            //move (remaining) from deposited balance to staged
            walletInfoMap[sourceWallet].depositedTokenBalance[currency] = walletInfoMap[sourceWallet].depositedTokenBalance[currency].sub_nn(amount);

            //first approve token transfer
            ERC20 erc20 = ERC20(currency);
            require(erc20.approve(_beneficiary, uint256(amount)));

            //transfer funds to the beneficiary
            _beneficiary.depositTokensTo(destWallet, amount, currency);
        }
    }

    function seizeAllBalances(address sourceWallet, address targetWallet) public onlyRegisteredActiveService notNullAddress(sourceWallet) notNullAddress(targetWallet) {
        require(isAuthorizedServiceForWallet(msg.sender, sourceWallet));

        //seize ethers
        int256 amount = walletInfoMap[sourceWallet].depositedEtherBalance.add(walletInfoMap[sourceWallet].settledEtherBalance).add(walletInfoMap[sourceWallet].stagedEtherBalance);
        assert(amount >= 0);

        walletInfoMap[sourceWallet].depositedEtherBalance = 0;
        walletInfoMap[sourceWallet].settledEtherBalance = 0;
        walletInfoMap[sourceWallet].stagedEtherBalance = 0;
        //add to staged balance
        walletInfoMap[targetWallet].stagedEtherBalance = walletInfoMap[targetWallet].stagedEtherBalance.add_nn(amount);

        //seize tokens
        uint256 len = walletInfoMap[sourceWallet].inUseTokenList.length;
        for (uint256 i = 0; i < len; i++) {
            address token = walletInfoMap[sourceWallet].inUseTokenList[i];

            amount = walletInfoMap[sourceWallet].depositedTokenBalance[token]
            .add(walletInfoMap[sourceWallet].settledTokenBalance[token])
            .add(walletInfoMap[sourceWallet].stagedTokenBalance[token]);

            assert(amount >= 0);

            walletInfoMap[sourceWallet].depositedTokenBalance[token] = 0;
            walletInfoMap[sourceWallet].settledTokenBalance[token] = 0;
            walletInfoMap[sourceWallet].stagedTokenBalance[token] = 0;

            //add to staged balance
            walletInfoMap[targetWallet].stagedTokenBalance[token] = walletInfoMap[targetWallet].stagedTokenBalance[token].add_nn(amount);

            //add token to in-use list
            if (!walletInfoMap[targetWallet].inUseTokenMap[token]) {
                walletInfoMap[targetWallet].inUseTokenMap[token] = true;
                walletInfoMap[targetWallet].inUseTokenList.push(token);
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

        //check for sufficient balance
        require(amount <= walletInfoMap[msg.sender].stagedEtherBalance);

        //subtract to per-wallet staged balance
        walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub_nn(amount);
        walletInfoMap[msg.sender].withdrawals.push(WithdrawalInfo(amount, block.timestamp, address(0)));

        //execute transfer
        msg.sender.transfer(uint256(amount));

        //emit event
        emit WithdrawEvent(msg.sender, amount, address(0));
    }

    function withdrawTokens(int256 amount, address token) public notOwner notNullAddress(token) {
        require(amount.isNonZeroPositiveInt256());

        //check for sufficient balance
        require(amount <= walletInfoMap[msg.sender].stagedTokenBalance[token]);

        //subtract to per-wallet staged balance
        walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].sub_nn(amount);
        walletInfoMap[msg.sender].withdrawals.push(WithdrawalInfo(amount, block.timestamp, token));

        //execute transfer
        ERC20 erc20 = ERC20(token);
        erc20.transfer(msg.sender, uint256(amount));

        //emit event
        emit WithdrawEvent(msg.sender, amount, token);
    }

    function withdrawal(address wallet, uint index) public view onlyOwner returns (int256 amount, uint256 timestamp, address token) {
        require(index < walletInfoMap[wallet].withdrawals.length);

        amount = walletInfoMap[wallet].withdrawals[index].amount;
        timestamp = walletInfoMap[wallet].withdrawals[index].timestamp;
        token = walletInfoMap[wallet].withdrawals[index].token;
    }

    function withdrawalCount(address wallet) public view onlyOwner returns (uint256) {
        return walletInfoMap[wallet].withdrawals.length;
    }
    */
}
