/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "./SafeMathInt.sol";
import "./SafeMathUint.sol";
import "./RevenueToken.sol";

/**
@title Token holder revenue fund
@notice Fund that manages the revenue earned by revenue token holders.
*/
contract TokenHolderRevenueFund {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

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

        // Staged balance of ethers and tokens.
        int256 stagedEtherBalance;
        mapping (address => int256) stagedTokenBalance;

        // Claim accrual tracking
        uint256[] etherClaimAccrualBlockNumbers;
        mapping(address => uint256[]) tokenClaimAccrualBlockNumbers;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;
    address private revenueToken;

    int256 periodAccrualEtherBalance;
    mapping (address => int256) periodAccrualTokenBalance;
    address[] periodAccrualTokenList;
    mapping (address => bool) periodAccrualTokenListMap;

    int256 aggregateAccrualEtherBalance;
    mapping (address => int256) aggregateAccrualTokenBalance;
    address[] aggregateAccrualTokenList;
    mapping (address => bool) aggregateAccrualTokenListMap;

    mapping (address => WalletInfo) private walletInfoMap;

    uint256[] accrualBlockNumbers;

    mapping (address => bool) private registeredServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event RevenueTokenChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address from, int256 amount, address token); //token==0 for ethers
    event WithdrawEvent(address to, int256 amount, address token);  //token==0 for ethers
    event RegisterServiceEvent(address service);
    event DeregisterServiceEvent(address service);
    event CloseAccrualPeriodEvent();
    event ClaimAccrualEvent(address from, address token);  //token==0 for ethers

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public notNullAddress(_owner) {
        owner = _owner;
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

    function setRevenueTokenAddress(address newAddress) public onlyOwner notNullAddress(newAddress) {
        address oldAddress;

        if (newAddress != revenueToken) {
            // Set new revenue token address
            oldAddress = revenueToken;
            revenueToken = newAddress;

            // Emit event
            emit RevenueTokenChangedEvent(oldAddress, newAddress);
        }
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public notOwner payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to balances
        periodAccrualEtherBalance = periodAccrualEtherBalance.add_nn(amount);

        aggregateAccrualEtherBalance = aggregateAccrualEtherBalance.add_nn(amount);

        //add deposit info
        walletInfoMap[msg.sender].deposits.push(DepositInfo(amount, block.timestamp, address(0)));

        //emit event
        emit DepositEvent(msg.sender, amount, address(0));
    }

    //NOTE: msg.sender must call ERC20.approve first
    function depositTokens(address token, int256 amount) notOwner public {
        ERC20 erc20_token;

        require(token != address(0));
        require(amount.isNonZeroPositiveInt256());

        //try to execute token transfer
        erc20_token = ERC20(token);
        require(erc20_token.transferFrom(msg.sender, this, uint256(amount)));

        //add to balances
        periodAccrualTokenBalance[token] = periodAccrualTokenBalance[token].add_nn(amount);
        if (!periodAccrualTokenListMap[token]) {
            periodAccrualTokenListMap[token] = true;
            periodAccrualTokenList.push(token);
        }

        aggregateAccrualTokenBalance[token] = aggregateAccrualTokenBalance[token].add_nn(amount);
        if (!aggregateAccrualTokenListMap[token]) {
            aggregateAccrualTokenListMap[token] = true;
            aggregateAccrualTokenList.push(token);
        }

        //add deposit info
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
    function periodAccrualBalance(address token) public view returns (int256) {
        return token == address(0) ? periodAccrualEtherBalance : periodAccrualTokenBalance[token];
    }

    function aggregateAccrualBalance(address token) public view returns (int256) {
        return token == address(0) ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[token];
    }

    function stagedBalance(address wallet, address token) public view returns (int256) {
        require(wallet != address(0));

        return token == address(0) ? walletInfoMap[wallet].stagedEtherBalance : walletInfoMap[wallet].stagedTokenBalance[token];
    }

    //
    // Accrual functions
    // -----------------------------------------------------------------------------------------------------------------
    function closeAccrualPeriod() public onlyOwnerOrService {
        uint256 i;

        //register this block
        accrualBlockNumbers.push(block.number);

        //clear accruals
        periodAccrualEtherBalance = 0;
        for (i = 0; i < periodAccrualTokenList.length; i++) {
            periodAccrualTokenBalance[periodAccrualTokenList[i]] = 0;
        }

        //raise event
        emit CloseAccrualPeriodEvent();
    }

    /*
    int256[6] public claim_values;

    function getClaimValues() public view returns (int256[6]) {
        return claim_values;
    }
    */

    function claimAccrual(address token) public {
        RevenueToken revenue_token;
        int256 balance;
        int256 amount;
        int256 fraction;
        int256 bb;
        uint256 bn_low;
        uint256 bn_up;
        uint256 len;

        require(revenueToken != address(0));
        revenue_token = RevenueToken(revenueToken);

        balance = (token == address(0)) ? aggregateAccrualEtherBalance : aggregateAccrualTokenBalance[token];
        require(balance.isNonZeroPositiveInt256());

        // lower bound = last accrual block number claimed for currency c by msg.sender OR 0
        // upper bound = last accrual block number

        require(accrualBlockNumbers.length > 0);
        bn_up = accrualBlockNumbers[accrualBlockNumbers.length - 1];

        if (token == address(0)) {
            len = walletInfoMap[msg.sender].etherClaimAccrualBlockNumbers.length;
            if (len == 0) {
                bn_low = 0; // no block numbers for claimed accruals yet
            }
            else {
                bn_low = walletInfoMap[msg.sender].etherClaimAccrualBlockNumbers[len - 1];
            }
        }
        else {
            len = walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[token].length;
            if (len == 0) {
                bn_low = 0; // no block numbers for claimed accruals yet
            }
            else {
                bn_low = walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[token][len - 1];
            }
        }

        require (bn_low != bn_up); // avoid division by 0

        bb = int256(revenue_token.balanceBlocksIn(msg.sender, bn_low, bn_up));

        fraction = bb.mul_nn(1e18).mul_nn(balance).div_nn( balance.mul_nn( int256(bn_up.sub(bn_low)) ).mul_nn(1e18) );
        amount = fraction.mul_nn(balance).div_nn(1e18);
        if (amount <= 0)
            return;

        /*
        claim_values[0] = int256(bn_low);
        claim_values[1] = int256(bn_up);
        claim_values[2] = balance;
        claim_values[3] = bb;
        claim_values[4] = amount;
        claim_values[5] = fraction;
        */

        // Move calculated amount a of currency c from aggregate active balance of currency c to msg.sender’s staged balance of currency c
        if (token == address(0)) {
            aggregateAccrualEtherBalance = aggregateAccrualEtherBalance.sub_nn(amount);
            walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.add_nn(amount);
        } else {
            aggregateAccrualTokenBalance[token] = aggregateAccrualTokenBalance[token].sub_nn(amount);
            walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].add_nn(amount);
        }

        // Store upperbound as the last claimed accrual block number for currency
        if (token == address(0)) {
            walletInfoMap[msg.sender].etherClaimAccrualBlockNumbers.push(bn_up);
        }
        else {
            walletInfoMap[msg.sender].tokenClaimAccrualBlockNumbers[token].push(bn_up);
        }

        //raise event
        emit ClaimAccrualEvent(msg.sender, token);
    }

    //
    // Withdrawal functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdrawEthers(int256 amount) public {
        require(amount.isNonZeroPositiveInt256());

        amount = amount.clampMax(walletInfoMap[msg.sender].stagedEtherBalance);
        if (amount <= 0)
            return;

        //subtract to per-wallet staged balance
        walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub_nn(amount);
        walletInfoMap[msg.sender].withdrawals.push(WithdrawalInfo(amount, block.timestamp, address(0)));

        //execute transfer
        msg.sender.transfer(uint256(amount));

        //emit event
        emit WithdrawEvent(msg.sender, amount, address(0));
    }

    function withdrawTokens(int256 amount, address token) public {
        ERC20 erc20_token;

        require(token != address(0));
        require(amount.isNonZeroPositiveInt256());

        amount = amount.clampMax(walletInfoMap[msg.sender].stagedTokenBalance[token]);
        if (amount <= 0)
            return;

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

    modifier onlyOwnerOrService {
        require(msg.sender == owner || registeredServicesMap[msg.sender] == true);
        _;
    }
}
