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
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
@dev Factored out from previous Trade smart contract.
*/
contract ClientFund {
    using SafeMathInt for int256;

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
        mapping (address => int256) depositedTokenBalance;

        // Staged balance of ethers and tokens.
        int256 stagedEtherBalance;
        mapping (address => int256) stagedTokenBalance;

        // Settled balance of ethers and tokens.
        int256 settledEtherBalance;
        mapping (address => int256) settledTokenBalance;

        address[] inUseTokenList;
        mapping (address => bool) inUseTokenMap;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;
    mapping (address => WalletInfo) private walletInfoMap;

    uint256 private serviceActivationTimeout;
    mapping (address => uint256) private registeredServicesMap;
    mapping (address => mapping (address => bool)) private disabledServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address from, int256 amount, address token); //token==0 for ethers
    event TransferFromDepositedToSettledBalanceEvent(address from, address to, int256 amount, address token); //token==0 for ethers
    event WithdrawFromDepositedBalanceEvent(address from, address to, int256 amount, address token); //token==0 for ethers
    event DepositToSettledBalance(address to, int256 amount, address token); //token==0 for ethers
    event StageEvent(address from, int256 amount, address token); //token==0 for ethers
    event UnstageEvent(address from, int256 amount, address token); //token==0 for ethers
    event SeizeDepositedAndSettledBalancesEvent(address sourceWallet, address targetWallet);
    event WithdrawEvent(address to, int256 amount, address token);  //token==0 for ethers
    event RegisterServiceEvent(address service);
    event EnableRegisteredServiceEvent(address wallet, address service);
    event DisableRegisteredServiceEvent(address wallet, address service);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public notNullAddress(_owner) {
        owner = _owner;
        serviceActivationTimeout = 30 * 3600; //30 minutes
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

    function setServiceActivationTimeout(uint256 timeoutInSeconds) public onlyOwner {
        serviceActivationTimeout = timeoutInSeconds;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public notOwner payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to per-wallet deposited balance
        walletInfoMap[msg.sender].depositedEtherBalance = walletInfoMap[msg.sender].depositedEtherBalance.add_nn(amount);
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

        //add to per-wallet deposited balance
        walletInfoMap[msg.sender].depositedTokenBalance[token] = walletInfoMap[msg.sender].depositedTokenBalance[token].add_nn(amount);
        walletInfoMap[msg.sender].deposits.push(DepositInfo(amount, block.timestamp, token));

        //add token to in-use list
        if (!walletInfoMap[msg.sender].inUseTokenMap[token]) {
            walletInfoMap[msg.sender].inUseTokenMap[token] = true;
            walletInfoMap[msg.sender].inUseTokenList.push(token);
        }

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
        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(destWallet != address(0));
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

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
        require(amount.isPositiveInt256());
        int256 amount_copy;
        int256 to_move;

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

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyRegisteredService() {
        require(registeredServicesMap[msg.sender] != 0);
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
