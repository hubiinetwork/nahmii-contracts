/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "./SafeMathInt.sol";
import "./ERC20.sol";

/**
@title Security bond
@notice Fund that contains crypto incentive for function UnchallengeDealSettlementOrderByTrade().s
*/
contract SecurityBond {
    using SafeMathInt for int256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct DepositInfo {
        int256 amount;
        uint256 timestamp;
        address token;      //0 for ethers
    }

    struct SubStageItem {
        int256 available_amount;
        uint256 start_timestamp;
    }

    struct SubStageInfo {
        uint256 current_index;
        SubStageItem[] list;
    }

    struct WithdrawalInfo {
        int256 amount;
        uint256 timestamp;
        address token;      //0 for ethers
    }

    struct WalletInfo {
        uint256 tradeNonce;

        DepositInfo[] deposits;
        WithdrawalInfo[] withdrawals;

        // Staged balance of ethers and tokens.
        int256 stagedEtherBalance;
        mapping (address => int256) stagedTokenBalance;

        SubStageInfo subStagedEtherBalances;
        mapping (address => SubStageInfo) subStagedTokenBalances;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;
    mapping (address => WalletInfo) private walletInfoMap;

    // Active balance of ethers and tokens shared among all wallets
    int256 activeEtherBalance;
    mapping (address => int256) activeTokenBalance;

    uint256 private withdrawalTimeout;
    mapping (address => bool) private registeredServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address from, int256 amount, address token); //token==0 for ethers
    event StageEvent(address from, int256 amount, address token); //token==0 for ethers
    event WithdrawEvent(address to, int256 amount, address token);  //token==0 for ethers
    event RegisterServiceEvent(address service);
    event DeregisterServiceEvent(address service);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public notNullAddress(_owner) {
        owner = _owner;
        withdrawalTimeout = 30 minutes;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        address oldOwner;

        if (newOwner != owner) {
            // Set new owner
            oldOwner = owner;
            owner = newOwner;

            // Emit event
            emit OwnerChangedEvent(oldOwner, newOwner);
        }
    }

    function setWithdrawalTimeout(uint256 timeoutInSeconds) public onlyOwner {
        withdrawalTimeout = timeoutInSeconds;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to per-wallet active balance
        activeEtherBalance = activeEtherBalance.add_nn(amount);
        walletInfoMap[msg.sender].deposits.push(DepositInfo(amount, block.timestamp, address(0)));

        //emit event
        emit DepositEvent(msg.sender, amount, address(0));
    }

    //NOTE: msg.sender must call ERC20.approve first
    function depositTokens(address token, int256 amount) public {
        ERC20 erc20_token;

        require(token != address(0));
        require(amount.isNonZeroPositiveInt256());

        //try to execute token transfer
        erc20_token = ERC20(token);
        require(erc20_token.transferFrom(msg.sender, this, uint256(amount)));

        //add to per-wallet deposited balance
        activeTokenBalance[token] = activeTokenBalance[token].add_nn(amount);
        walletInfoMap[msg.sender].deposits.push(DepositInfo(amount, block.timestamp, token));

        //emit event
        emit DepositEvent(msg.sender, amount, token);
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
    function activeBalance(address token) public view returns (int256) {
        return token == address(0) ? activeEtherBalance : activeTokenBalance[token];
    }

    function stagedBalance(address wallet, address token) public view returns (int256) {
        require(wallet != address(0));

        return token == address(0) ? walletInfoMap[wallet].stagedEtherBalance : walletInfoMap[wallet].stagedTokenBalance[token];
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(int256 amount, address token, address wallet) public notNullAddress(wallet) {
        uint256 start_time;

        require(msg.sender == owner || registeredServicesMap[msg.sender]);
        require(amount.isPositiveInt256());

        if (token == address(0)) {
            //clamp amount to move
            amount = amount.clampMax(activeEtherBalance);
            if (amount <= 0)
                return;
            
            //move from active balance to staged
            activeEtherBalance = activeEtherBalance.sub_nn(amount);
            walletInfoMap[wallet].stagedEtherBalance = walletInfoMap[wallet].stagedEtherBalance.add_nn(amount);

            //add substage info
            start_time = block.timestamp + ((wallet == owner) ? withdrawalTimeout : 0); 
            walletInfoMap[wallet].subStagedEtherBalances.list.push(SubStageItem(amount, start_time));
        } else {
            //clamp amount to move
            amount = amount.clampMax(activeTokenBalance[token]);
            if (amount <= 0)
                return;

            //move from active balance to staged
            activeTokenBalance[token] = activeTokenBalance[token].sub_nn(amount);
            walletInfoMap[wallet].stagedTokenBalance[token] = walletInfoMap[wallet].stagedTokenBalance[token].add_nn(amount);

            //add substage info
            start_time = block.timestamp + ((wallet == owner) ? withdrawalTimeout : 0); 
            walletInfoMap[wallet].subStagedTokenBalances[token].list.push(SubStageItem(amount, start_time));
        }

        //emit event
        emit StageEvent(msg.sender, amount, token);
    }

    //
    // Withdrawal functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdrawEthers(int256 amount) public {
        uint256 current_index;
        int256 to_send_amount;
        int256 this_round_amount;

        require(amount.isNonZeroPositiveInt256());

        //start withdrawal from current substage
        to_send_amount = 0;
        while (to_send_amount < amount) {
            current_index = walletInfoMap[msg.sender].subStagedEtherBalances.current_index;

            if (current_index >= walletInfoMap[msg.sender].subStagedEtherBalances.list.length) {
                break;
            }
            if (block.timestamp < walletInfoMap[msg.sender].subStagedEtherBalances.list[current_index].start_timestamp) {
                break;
            }

            this_round_amount = (amount - to_send_amount).clampMax(walletInfoMap[msg.sender].subStagedEtherBalances.list[current_index].available_amount);
            
            walletInfoMap[msg.sender].subStagedEtherBalances.list[current_index].available_amount = walletInfoMap[msg.sender].subStagedEtherBalances.list[current_index].available_amount.sub_nn(this_round_amount);
            if (walletInfoMap[msg.sender].subStagedEtherBalances.list[current_index].available_amount == 0) {
                walletInfoMap[msg.sender].subStagedEtherBalances.current_index++;
            }

            to_send_amount = to_send_amount + this_round_amount;
        }
        if (to_send_amount == 0)
            return;
        //check for sufficient balance in total staged
        assert(to_send_amount <= walletInfoMap[msg.sender].stagedEtherBalance);

        //subtract to per-wallet staged balance
        walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub_nn(to_send_amount);
        walletInfoMap[msg.sender].withdrawals.push(WithdrawalInfo(to_send_amount, block.timestamp, address(0)));

        //execute transfer
        msg.sender.transfer(uint256(to_send_amount));

        //emit event
        emit WithdrawEvent(msg.sender, to_send_amount, address(0));
    }

    function withdrawTokens(int256 amount, address token) public {
        ERC20 erc20_token;
        uint256 current_index;
        int256 to_send_amount;
        int256 this_round_amount;

        require(token != address(0));
        require(amount.isNonZeroPositiveInt256());

        //start withdrawal from current substage
        to_send_amount = 0;
        while (to_send_amount < amount) {
            current_index = walletInfoMap[msg.sender].subStagedTokenBalances[token].current_index;

            if (current_index >= walletInfoMap[msg.sender].subStagedTokenBalances[token].list.length) {
                break;
            }
            if (block.timestamp < walletInfoMap[msg.sender].subStagedTokenBalances[token].list[current_index].start_timestamp) {
                break;
            }

            this_round_amount = (amount - to_send_amount).clampMax(walletInfoMap[msg.sender].subStagedTokenBalances[token].list[current_index].available_amount);
            
            walletInfoMap[msg.sender].subStagedTokenBalances[token].list[current_index].available_amount = walletInfoMap[msg.sender].subStagedTokenBalances[token].list[current_index].available_amount.sub_nn(this_round_amount);
            if (walletInfoMap[msg.sender].subStagedTokenBalances[token].list[current_index].available_amount == 0) {
                walletInfoMap[msg.sender].subStagedTokenBalances[token].current_index++;
            }

            to_send_amount = to_send_amount + this_round_amount;
        }
        if (to_send_amount == 0)
            return;
        //check for sufficient balance in total staged
        assert(to_send_amount <= walletInfoMap[msg.sender].stagedTokenBalance[token]);

        //subtract to per-wallet staged balance
        walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].sub_nn(to_send_amount);
        walletInfoMap[msg.sender].withdrawals.push(WithdrawalInfo(to_send_amount, block.timestamp, token));

        //execute transfer
        erc20_token = ERC20(token);
        erc20_token.transfer(msg.sender, uint256(to_send_amount));

        //emit event
        emit WithdrawEvent(msg.sender, to_send_amount, token);
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
        require(registeredServicesMap[service] == false);

        //register
        registeredServicesMap[service] = true;

        //emit event
        emit RegisterServiceEvent(service);
    }

    function deregisterService(address service) public onlyOwner notNullAddress(service) {
        //ensure service is registered
        require(registeredServicesMap[service] != false);

        //remove service
        registeredServicesMap[service] = false;

        //emit event
        emit DeregisterServiceEvent(service);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier notOwner() {
        require(msg.sender != owner);
        _;
    }

    modifier notMySelfAddress(address _address) {
        require(_address != address(this));
        _;
    }
}