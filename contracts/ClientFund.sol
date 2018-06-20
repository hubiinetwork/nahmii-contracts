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
import {ERC20} from "./ERC20.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {Benefactor} from "./Benefactor.sol";
import {ReserveFund} from "./ReserveFund.sol";
import {Servable} from "./Servable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
*/
contract ClientFund is Ownable, Beneficiary, Benefactor, Servable, SelfDestructible {
    using SafeMathInt for int256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public twoWayTransferServiceAction = "two_way_transfer";

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct DepositInfo {
        int256 amount;
        uint256 timestamp;
        address token;      //0 for ethers
    }

    struct WithdrawalInfo {
        int256 amount;
        uint256 timestamp;
        address token;      //0 for ethers
    }

    struct WalletInfo {
        DepositInfo[] deposits;
        WithdrawalInfo[] withdrawals;

        // Deposited balance of ethers and tokens.
        int256 depositedEtherBalance;
        mapping(address => int256) depositedTokenBalance;

        // Staged balance of ethers and tokens.
        int256 stagedEtherBalance;
        mapping(address => int256) stagedTokenBalance;

        // Settled balance of ethers and tokens.
        int256 settledEtherBalance;
        mapping(address => int256) settledTokenBalance;

        address[] inUseTokenList;
        mapping(address => bool) inUseTokenMap;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => WalletInfo) private walletInfoMap;

    uint256 public serviceActivationTimeout;
    mapping(address => uint256) private registeredServicesMap;
    mapping(address => mapping(address => bool)) private disabledServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address from, int256 amount, address token); //token==0 for ethers
    event TransferFromDepositedToSettledBalanceEvent(address from, address to, int256 amount, address token); //token==0 for ethers
    event WithdrawFromDepositedBalanceEvent(address from, address to, int256 amount, address token); //token==0 for ethers
    event DepositToSettledBalance(address to, int256 amount, address token); //token==0 for ethers
    event StageEvent(address from, int256 amount, address token); //token==0 for ethers
    event StageToEvent(address from, int256 amount, address token, address beneficiary); //token==0 for ethers
    event UnstageEvent(address from, int256 amount, address token); //token==0 for ethers
    event SeizeDepositedAndSettledBalancesEvent(address sourceWallet, address targetWallet);
    event WithdrawEvent(address to, int256 amount, address token);  //token==0 for ethers
    event RegisterServiceEvent(address service);
    event EnableRegisteredServiceEvent(address wallet, address service);
    event DisableRegisteredServiceEvent(address wallet, address service);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) Beneficiary() Benefactor() public {
        serviceActivationTimeout = 1 weeks;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function setServiceActivationTimeout(uint256 timeoutInSeconds) public onlyOwner {
        serviceActivationTimeout = timeoutInSeconds;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        receiveEthers(msg.sender);
    }

    function receiveEthers(address wallet) public payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to per-wallet deposited balance
        walletInfoMap[wallet].depositedEtherBalance = walletInfoMap[wallet].depositedEtherBalance.add_nn(amount);
        walletInfoMap[wallet].deposits.push(DepositInfo(amount, block.timestamp, address(0)));

        //emit event
        emit DepositEvent(wallet, amount, address(0));
    }

    function depositTokens(address token, int256 amount) public {
        receiveTokens(msg.sender, amount, token);
    }

    //NOTE: 'wallet' must call ERC20.approve first
    function receiveTokens(address wallet, int256 amount, address token) public {
        ERC20 erc20_token;

        require(token != address(0));
        require(amount.isNonZeroPositiveInt256());

        //try to execute token transfer
        erc20_token = ERC20(token);
        require(erc20_token.transferFrom(wallet, this, uint256(amount)));

        //add to per-wallet deposited balance
        walletInfoMap[wallet].depositedTokenBalance[token] = walletInfoMap[wallet].depositedTokenBalance[token].add_nn(amount);
        walletInfoMap[wallet].deposits.push(DepositInfo(amount, block.timestamp, token));

        //add token to in-use list
        if (!walletInfoMap[wallet].inUseTokenMap[token]) {
            walletInfoMap[wallet].inUseTokenMap[token] = true;
            walletInfoMap[wallet].inUseTokenList.push(token);
        }

        //emit event
        emit DepositEvent(wallet, amount, token);
    }

    function deposit(address wallet, uint index) public view onlyOwner returns (int256 amount, uint256 timestamp, address token) {
        require(index < walletInfoMap[wallet].deposits.length);

        amount = walletInfoMap[wallet].deposits[index].amount;
        timestamp = walletInfoMap[wallet].deposits[index].timestamp;
        token = walletInfoMap[wallet].deposits[index].token;
    }

    function depositCount(address wallet) public view onlyOwner returns (uint256) {
        return walletInfoMap[wallet].deposits.length;
    }

    //
    // Balance functions
    // -----------------------------------------------------------------------------------------------------------------
    function depositedBalance(address wallet, address token) public view returns (int256) {
        require(wallet != address(0));

        return token == address(0) ? walletInfoMap[wallet].depositedEtherBalance : walletInfoMap[wallet].depositedTokenBalance[token];
    }

    function stagedBalance(address wallet, address token) public view returns (int256) {
        require(wallet != address(0));

        return token == address(0) ? walletInfoMap[wallet].stagedEtherBalance : walletInfoMap[wallet].stagedTokenBalance[token];
    }

    function settledBalance(address wallet, address token) public view returns (int256) {
        require(wallet != address(0));

        return token == address(0) ? walletInfoMap[wallet].settledEtherBalance : walletInfoMap[wallet].settledTokenBalance[token];
    }

    //
    // Transfers functions
    // -----------------------------------------------------------------------------------------------------------------
    function transferFromDepositedToSettledBalance(address sourceWallet, address destWallet, int256 amount, address token) public notOwner {
        require(isAcceptedServiceForWallet(msg.sender, sourceWallet));
        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(sourceWallet != address(0));
        require(destWallet != address(0));
        require(sourceWallet != destWallet);
        require(SafeMathInt.isNonZeroPositiveInt256(amount));

        if (token == address(0)) {
            //move from deposited balance to settled (sub_nn will check for sufficient balance)
            walletInfoMap[sourceWallet].depositedEtherBalance = walletInfoMap[sourceWallet].depositedEtherBalance.sub_nn(amount);
            walletInfoMap[destWallet].settledEtherBalance = walletInfoMap[destWallet].stagedEtherBalance.add(amount);
        } else {
            //move from deposited balance to settled (sub_nn will check for sufficient balance)
            walletInfoMap[sourceWallet].depositedTokenBalance[token] = walletInfoMap[sourceWallet].depositedTokenBalance[token].sub_nn(amount);
            walletInfoMap[destWallet].settledTokenBalance[token] = walletInfoMap[destWallet].settledTokenBalance[token].add(amount);
        }

        //emit event
        emit TransferFromDepositedToSettledBalanceEvent(sourceWallet, destWallet, amount, token);
    }

    function withdrawFromDepositedBalance(address sourceWallet, address destWallet, int256 amount, address token) public notOwner {
        ERC20 erc20_token;

        require(isAcceptedServiceForWallet(msg.sender, sourceWallet));
        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(sourceWallet != address(0));
        require(destWallet != address(0));
        require(sourceWallet != destWallet);
        require(amount.isNonZeroPositiveInt256());

        if (token == address(0)) {
            //(sub_nn will check for sufficient balance)
            walletInfoMap[sourceWallet].depositedEtherBalance = walletInfoMap[sourceWallet].depositedEtherBalance.sub_nn(amount);

            //execute transfer
            destWallet.transfer(uint256(amount));
        } else {
            //(sub_nn will check for sufficient balance)
            walletInfoMap[sourceWallet].depositedTokenBalance[token] = walletInfoMap[sourceWallet].depositedTokenBalance[token].sub_nn(amount);

            //execute transfer
            erc20_token = ERC20(token);
            erc20_token.transfer(destWallet, uint256(amount));
        }

        //emit event
        emit WithdrawFromDepositedBalanceEvent(sourceWallet, destWallet, amount, token);
    }

    function depositEthersToSettledBalance(address destWallet) public payable notOwner {
        int256 amount;

        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(destWallet != address(0));
        amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to per-wallet staged balance
        walletInfoMap[destWallet].settledEtherBalance = walletInfoMap[destWallet].settledEtherBalance.add_nn(amount);

        //emit event
        emit DepositToSettledBalance(destWallet, amount, address(0));
    }

    //NOTE: msg.sender must call ERC20.approve first
    function depositTokensToSettledBalance(address destWallet, address token, int256 amount) public notOwner {
        ERC20 erc20_token;

        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(destWallet != address(0));
        require(amount.isNonZeroPositiveInt256());

        //add to per-wallet settled balance
        walletInfoMap[destWallet].settledTokenBalance[token] = walletInfoMap[destWallet].settledTokenBalance[token].add_nn(amount);

        //add token to in-use list
        if (!walletInfoMap[destWallet].inUseTokenMap[token]) {
            walletInfoMap[destWallet].inUseTokenMap[token] = true;
            walletInfoMap[destWallet].inUseTokenList.push(token);
        }

        //try to execute token transfer
        erc20_token = ERC20(token);
        require(erc20_token.transferFrom(msg.sender, destWallet, uint256(amount)));

        //emit event
        emit DepositToSettledBalance(destWallet, amount, token);
    }

    function stage(int256 amount, address token) public notOwner {
        int256 amount_copy;
        int256 to_move;

        require(amount.isPositiveInt256());

        if (token == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].depositedEtherBalance.add(walletInfoMap[msg.sender].settledEtherBalance));
            if (amount <= 0)
                return;

            amount_copy = amount;

            //move from settled balance to staged, if balance greater than zero
            if (walletInfoMap[msg.sender].settledEtherBalance > 0) {
                to_move = amount.clampMax(walletInfoMap[msg.sender].settledEtherBalance);

                walletInfoMap[msg.sender].settledEtherBalance = walletInfoMap[msg.sender].settledEtherBalance.sub(to_move);
                amount = amount.sub(to_move);
            }

            //move (remaining) from deposited balance to staged
            walletInfoMap[msg.sender].depositedEtherBalance = walletInfoMap[msg.sender].depositedEtherBalance.sub_nn(amount);

            //add to staged balance
            walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.add_nn(amount_copy);
        } else {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].depositedTokenBalance[token].add(walletInfoMap[msg.sender].settledTokenBalance[token]));
            if (amount <= 0)
                return;

            amount_copy = amount;

            //move from settled balance to staged, if balance greater than zero
            if (walletInfoMap[msg.sender].settledTokenBalance[token] > 0) {
                to_move = amount.clampMax(walletInfoMap[msg.sender].settledTokenBalance[token]);

                walletInfoMap[msg.sender].settledTokenBalance[token] = walletInfoMap[msg.sender].settledTokenBalance[token].sub(to_move);
                amount = amount.sub(to_move);
            }

            //move (remaining) from deposited balance to staged
            walletInfoMap[msg.sender].depositedTokenBalance[token] = walletInfoMap[msg.sender].depositedTokenBalance[token].sub_nn(amount);

            //add to staged balance
            walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].add_nn(amount_copy);
        }

        //emit event
        emit StageEvent(msg.sender, amount, token);
    }

    function stageTo(int256 amount, address token, address beneficiary) public notOwner {
        int256 amount_copy;
        int256 to_move;
        Beneficiary beneficiary_sc;

        require(amount.isPositiveInt256());
        require(isRegisteredBeneficiary(beneficiary));

        beneficiary_sc = Beneficiary(beneficiary);

        if (token == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].depositedEtherBalance.add(walletInfoMap[msg.sender].settledEtherBalance));
            if (amount <= 0)
                return;

            amount_copy = amount;

            //move from settled balance to staged, if balance greater than zero
            if (walletInfoMap[msg.sender].settledEtherBalance > 0) {
                to_move = amount.clampMax(walletInfoMap[msg.sender].settledEtherBalance);

                walletInfoMap[msg.sender].settledEtherBalance = walletInfoMap[msg.sender].settledEtherBalance.sub(to_move);
                amount = amount.sub(to_move);
            }

            //move (remaining) from deposited balance
            walletInfoMap[msg.sender].depositedEtherBalance = walletInfoMap[msg.sender].depositedEtherBalance.sub_nn(amount);

            //transfer funds to the beneficiary
            beneficiary_sc.receiveEthers.value(uint256(amount))(msg.sender);
        } else {
            ERC20 erc20_token;

            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].depositedTokenBalance[token].add(walletInfoMap[msg.sender].settledTokenBalance[token]));
            if (amount <= 0)
                return;

            amount_copy = amount;

            //move from settled balance to staged, if balance greater than zero
            if (walletInfoMap[msg.sender].settledTokenBalance[token] > 0) {
                to_move = amount.clampMax(walletInfoMap[msg.sender].settledTokenBalance[token]);

                walletInfoMap[msg.sender].settledTokenBalance[token] = walletInfoMap[msg.sender].settledTokenBalance[token].sub(to_move);
                amount = amount.sub(to_move);
            }

            //move (remaining) from deposited balance to staged
            walletInfoMap[msg.sender].depositedTokenBalance[token] = walletInfoMap[msg.sender].depositedTokenBalance[token].sub_nn(amount);

            //first approve token transfer
            erc20_token = ERC20(token);
            require(erc20_token.approve(beneficiary, uint256(amount)));

            //transfer funds to the beneficiary
            beneficiary_sc.receiveTokens(msg.sender, amount, token);
        }

        //emit event
        emit StageToEvent(msg.sender, amount, token, beneficiary);
    }

    function unstage(int256 amount, address token) public notOwner {
        require(amount.isPositiveInt256());

        if (token == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].stagedEtherBalance);
            if (amount == 0)
                return;

            //move from staged balance to deposited
            walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub_nn(amount);
            walletInfoMap[msg.sender].depositedEtherBalance = walletInfoMap[msg.sender].depositedEtherBalance.add_nn(amount);
        } else {
            //clamp amount to move
            amount = amount.clampMax(walletInfoMap[msg.sender].stagedTokenBalance[token]);
            if (amount == 0)
                return;

            //move between balances
            walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].sub_nn(amount);
            walletInfoMap[msg.sender].depositedTokenBalance[token] = walletInfoMap[msg.sender].depositedTokenBalance[token].add_nn(amount);
        }

        //emit event
        emit UnstageEvent(msg.sender, amount, token);
    }

    function seizeDepositedAndSettledBalances(address sourceWallet, address targetWallet) public onlyRegisteredService notNullAddress(sourceWallet) notNullAddress(targetWallet) {
        int256 amount;
        uint256 i;
        uint256 len;

        //seize ethers
        amount = walletInfoMap[sourceWallet].depositedEtherBalance.add(walletInfoMap[sourceWallet].settledEtherBalance);
        assert(amount >= 0);

        walletInfoMap[sourceWallet].depositedEtherBalance = 0;
        walletInfoMap[sourceWallet].settledEtherBalance = 0;
        //add to staged balance
        walletInfoMap[targetWallet].stagedEtherBalance = walletInfoMap[targetWallet].stagedEtherBalance.add_nn(amount);

        //seize tokens
        len = walletInfoMap[sourceWallet].inUseTokenList.length;
        for (i = 0; i < len; i++) {
            address token = walletInfoMap[sourceWallet].inUseTokenList[i];

            amount = walletInfoMap[sourceWallet].depositedTokenBalance[token].add(walletInfoMap[sourceWallet].settledTokenBalance[token]);
            assert(amount >= 0);

            walletInfoMap[sourceWallet].depositedTokenBalance[token] = 0;
            walletInfoMap[sourceWallet].settledTokenBalance[token] = 0;

            //add to staged balance
            walletInfoMap[targetWallet].stagedTokenBalance[token] = walletInfoMap[targetWallet].stagedTokenBalance[token].add_nn(amount);

            //add token to in-use list
            if (!walletInfoMap[targetWallet].inUseTokenMap[token]) {
                walletInfoMap[targetWallet].inUseTokenMap[token] = true;
                walletInfoMap[targetWallet].inUseTokenList.push(token);
            }
        }

        //emit event
        emit SeizeDepositedAndSettledBalancesEvent(sourceWallet, targetWallet);
    }

    //
    // Reserve funds functions
    // -----------------------------------------------------------------------------------------------------------------
    function reserveFundGetFromDeposited(address wallet, int256 amount, address token) public onlyOwnerOrServiceAction(twoWayTransferServiceAction) {
        ReserveFund sc_reservefund;
        ERC20 erc20_token;

        require(wallet != address(0));
        require(amount.isPositiveInt256());

        sc_reservefund = ReserveFund(msg.sender);

        if (token == address(0)) {
            walletInfoMap[wallet].depositedEtherBalance = walletInfoMap[wallet].depositedEtherBalance.sub_nn(amount);

            msg.sender.transfer(uint256(amount));
        } else {
            walletInfoMap[wallet].depositedTokenBalance[token] = walletInfoMap[wallet].depositedTokenBalance[token].sub_nn(amount);

            erc20_token = ERC20(token);
            erc20_token.transfer(msg.sender, uint256(amount));
        }
    }

    function reserveFundAddToStaged(address wallet, int256 amount, address token) public onlyOwnerOrServiceAction(twoWayTransferServiceAction) {
        require(wallet != address(0));
        require(amount.isPositiveInt256());

        if (token == address(0)) {
            walletInfoMap[wallet].settledEtherBalance = walletInfoMap[wallet].settledEtherBalance.add(amount);
        } else {
            walletInfoMap[wallet].settledTokenBalance[token] = walletInfoMap[wallet].settledTokenBalance[token].add(amount);
        }
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

    function withdrawTokens(int256 amount, address token) public notOwner {
        ERC20 erc20_token;

        require(token != address(0));
        require(amount.isNonZeroPositiveInt256());

        //check for sufficient balance
        require(amount <= walletInfoMap[msg.sender].stagedTokenBalance[token]);

        //subtract to per-wallet staged balance
        walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].sub_nn(amount);
        walletInfoMap[msg.sender].withdrawals.push(WithdrawalInfo(amount, block.timestamp, token));

        //execute transfer
        erc20_token = ERC20(token);
        erc20_token.transfer(msg.sender, uint256(amount));

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

    //
    // Service functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerService(address service) public onlyOwner notNullAddress(service) notMySelfAddress(service) {
        require(service != owner);

        //ensure service is not already registered
        require(registeredServicesMap[service] == 0);

        //register and set activation time
        registeredServicesMap[service] = block.timestamp + serviceActivationTimeout;

        //emit event
        emit RegisterServiceEvent(service);
    }

    function enableRegisteredService(address service) public notOwner notNullAddress(service) {
        require(msg.sender != service);

        //ensure service is registered
        require(registeredServicesMap[service] != 0);

        //enable service for given wallet
        disabledServicesMap[service][msg.sender] = false;

        //emit event
        emit EnableRegisteredServiceEvent(msg.sender, service);
    }

    function disableRegisteredService(address service) public notOwner notNullAddress(service) {
        require(msg.sender != service);

        //ensure service is registered
        require(registeredServicesMap[service] != 0);

        //disable service for given wallet
        disabledServicesMap[service][msg.sender] = true;

        //emit event
        emit DisableRegisteredServiceEvent(msg.sender, service);
    }

    //
    // Private methods
    // -----------------------------------------------------------------------------------------------------------------

    function isWalletServiceDisabled(address wallet, address service) private view returns (bool) {
        return disabledServicesMap[service][wallet];
    }

    function isAcceptedServiceForWallet(address service, address wallet) private view returns (bool) {
        if (service == wallet)
            return false;
        if (registeredServicesMap[service] == 0)
            return false;
        if (block.timestamp < registeredServicesMap[service])
            return false;
        return !disabledServicesMap[service][wallet];
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyRegisteredService() {
        require(registeredServicesMap[msg.sender] != 0);
        _;
    }

    modifier notMySelfAddress(address _address) {
        require(_address != address(this));
        _;
    }
}
