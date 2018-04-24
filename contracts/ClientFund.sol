/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

import "./SafeMath.sol";
import "./ERC20.sol";

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
@dev Factored out from previous Trade smart contract.
*/
contract ClientFund {
    using SafeMath for uint256; 

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct DepositInfo {
        uint256 amount;
        uint256 timestamp;
        address token;      //0 for ethers
    }

    struct WalletInfo {
        uint256 tradeNonce;

        DepositInfo[] deposits;

        // Active balance of ethers and tokens.
        uint256 activeEtherBalance;
        mapping (address => uint256) activeTokenBalance;

        // Staged balance of ethers and tokens.
        uint256 stagedEtherBalance;
        mapping (address => uint256) stagedTokenBalance;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;
    mapping (address => WalletInfo) private walletInfoMap;

    uint256 serviceActivationTimeout;
    mapping (address => uint256) registeredServicesMap;
    mapping (uint256 => bool) disabledServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address from, uint256 amount, address token); //token==0 for ethers
    event TransferFromActiveToStagedBalanceEvent(address from, address to, uint256 amount, address token); //token==0 for ethers
    event WithdrawFromActiveBalanceEvent(address from, address to, uint256 amount, address token); //token==0 for ethers
    event DepositToStagedBalance(address to, uint256 amount, address token); //token==0 for ethers
    event UnstageEvent(address from, uint256 amount, address token); //token==0 for ethers
    event WithdrawEvent(address to, uint256 amount, address token);  //token==0 for ethers
    event RegisterServiceEvent(address service);
    event EnableRegisteredServiceEvent(address wallet, address service);
    event DisableRegisteredServiceEvent(address wallet, address service);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function ClientFund(address _owner) public notNullAddress(_owner) {
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

    function setServiceActivationTimeout(uint256 timeout) public onlyOwner {
        serviceActivationTimeout = timeout;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public notOwner payable {
        require(msg.value > 0);

        //add to per-wallet active balance
        walletInfoMap[msg.sender].activeEtherBalance = walletInfoMap[msg.sender].activeEtherBalance.add(msg.value);
        walletInfoMap[msg.sender].deposits.push(DepositInfo(msg.value, block.timestamp, address(0)));

        //emit event
        emit DepositEvent(msg.sender, msg.value, address(0));
    }

    //NOTE: msg.sender must call ERC20.approve first
    function depositTokens(address token, uint256 amount) notOwner public {
        ERC20 erc20_token;

        require(token != address(0));
        require(amount > 0);

        //try to execute token transfer
        erc20_token = ERC20(token);
        require(erc20_token.transferFrom(msg.sender, this, amount));

        //add to per-wallet active balance
        walletInfoMap[msg.sender].activeTokenBalance[token] = walletInfoMap[msg.sender].activeTokenBalance[token].add(amount);
        walletInfoMap[msg.sender].deposits.push(DepositInfo(amount, block.timestamp, token));

        //emit event
        emit DepositEvent(msg.sender, amount, token);
    }

    function deposit(address wallet, uint index) public view onlyOwner returns (uint256 amount, uint256 timestamp, address token) {
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
    function activeBalance(address wallet, address token) public view returns (uint256) {
        require(wallet != address(0));

        return token == address(0) ? walletInfoMap[wallet].activeEtherBalance : walletInfoMap[wallet].activeTokenBalance[token];
    }

    function stagedBalance(address wallet, address token) public view returns (uint256) {
        require(wallet != address(0));

        return token == address(0) ? walletInfoMap[wallet].stagedEtherBalance : walletInfoMap[wallet].stagedTokenBalance[token];
    }

    function transferFromActiveToStagedBalance(address sourceWallet, address destWallet, uint256 amount, address token) public notOwner {
        require(isAcceptedServiceForWallet(msg.sender, sourceWallet));
        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(sourceWallet != address(0));
        require(destWallet != address(0));
        require(sourceWallet != destWallet);
        require(amount > 0);

        if (token == address(0)) {
            //check for sufficient balance
            require(amount <= walletInfoMap[sourceWallet].activeEtherBalance);

            //move from active balance to staged
            walletInfoMap[sourceWallet].activeEtherBalance = walletInfoMap[sourceWallet].activeEtherBalance.sub(amount);
            walletInfoMap[destWallet].stagedEtherBalance = walletInfoMap[destWallet].stagedEtherBalance.add(amount);
        } else {
            //check for sufficient balance
            require(amount <= walletInfoMap[sourceWallet].activeTokenBalance[token]);

            //move from active balance to staged
            walletInfoMap[sourceWallet].activeTokenBalance[token] = walletInfoMap[sourceWallet].activeTokenBalance[token].sub(amount);
            walletInfoMap[destWallet].stagedTokenBalance[token] = walletInfoMap[destWallet].stagedTokenBalance[token].add(amount);
        }

        //emit event
        emit TransferFromActiveToStagedBalanceEvent(sourceWallet, destWallet, amount, token);
    }

    function withdrawFromActiveBalance(address sourceWallet, address destWallet, uint256 amount, address token) public notOwner {
        ERC20 erc20_token;

        require(isAcceptedServiceForWallet(msg.sender, sourceWallet));
        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(sourceWallet != address(0));
        require(destWallet != address(0));
        require(sourceWallet != destWallet);
        require(amount > 0);

        if (token == address(0)) {
            //check for sufficient balance
            require(amount <= walletInfoMap[sourceWallet].activeEtherBalance);
            walletInfoMap[sourceWallet].activeEtherBalance = walletInfoMap[sourceWallet].activeEtherBalance.sub(amount);

            //execute transfer
            destWallet.transfer(amount);
        } else {
            //check for sufficient balance
            require(amount <= walletInfoMap[sourceWallet].activeTokenBalance[token]);
            walletInfoMap[sourceWallet].activeTokenBalance[token] = walletInfoMap[sourceWallet].activeTokenBalance[token].sub(amount);

            //execute transfer
            erc20_token = ERC20(token);
            erc20_token.transfer(destWallet, amount);
        }

        //emit event
        emit WithdrawFromActiveBalanceEvent(sourceWallet, destWallet, amount, token);
    }

    function depositEthersToStagedBalance(address destWallet) public payable notOwner {
        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(destWallet != address(0));
        require(msg.value > 0);

        //add to per-wallet staged balance
        walletInfoMap[destWallet].stagedEtherBalance = walletInfoMap[destWallet].stagedEtherBalance.add(msg.value);

        //emit event
        emit DepositToStagedBalance(destWallet, msg.value, address(0));
    }

    //NOTE: msg.sender must call ERC20.approve first
    function depositTokensToStagedBalance(address destWallet, address token, uint256 amount) public notOwner {
        ERC20 erc20_token;

        require(isAcceptedServiceForWallet(msg.sender, destWallet));
        require(destWallet != address(0));
        require(amount > 0);

        //add to per-wallet staged balance
        walletInfoMap[destWallet].stagedTokenBalance[token] = walletInfoMap[destWallet].stagedTokenBalance[token].add(amount);

        //try to execute token transfer
        erc20_token = ERC20(token);
        require(erc20_token.transferFrom(msg.sender, destWallet, amount));

        //emit event
        emit DepositToStagedBalance(destWallet, amount, token);
    }

    function unstage(uint256 amount, address token) public notOwner {
        if (token == address(0)) {
            //clamp amount to move
            if (amount > walletInfoMap[msg.sender].stagedEtherBalance)
                amount = walletInfoMap[msg.sender].stagedEtherBalance;
            if (amount == 0)
                return;

            //move from staged balance to active
            walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub(amount);
            walletInfoMap[msg.sender].activeEtherBalance = walletInfoMap[msg.sender].activeEtherBalance.add(amount);
        } else {
            //clamp amount to move
            if (amount > walletInfoMap[msg.sender].stagedTokenBalance[token])
                amount = walletInfoMap[msg.sender].stagedTokenBalance[token];
            if (amount == 0)
                return;

            //move between balances
            walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].sub(amount);
            walletInfoMap[msg.sender].activeTokenBalance[token] = walletInfoMap[msg.sender].activeTokenBalance[token].add(amount);
        }

        //emit event
        emit UnstageEvent(msg.sender, amount, token);
    }

    //
    // Withdrawal functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdrawEthers(uint256 amount) public notOwner {
        require(amount > 0);

        //check for sufficient balance
        require(amount <= walletInfoMap[msg.sender].stagedEtherBalance);
        walletInfoMap[msg.sender].stagedEtherBalance = walletInfoMap[msg.sender].stagedEtherBalance.sub(amount);

        //execute transfer
        msg.sender.transfer(amount);

        //emit event
        emit WithdrawEvent(msg.sender, amount, address(0));
    }

    function withdrawTokens(uint256 amount, address token) public notOwner {
        ERC20 erc20_token;

        require(token != address(0));
        require(amount > 0);

        //check for sufficient balance
        require(amount <= walletInfoMap[msg.sender].stagedTokenBalance[token]);
        walletInfoMap[msg.sender].stagedTokenBalance[token] = walletInfoMap[msg.sender].stagedTokenBalance[token].sub(amount);

        //execute transfer
        erc20_token = ERC20(token);
        erc20_token.transfer(msg.sender, amount);

        //emit event
        emit WithdrawEvent(msg.sender, amount, token);
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
        disabledServicesMap[indexFromWalletService(msg.sender, service)] = false;

        //emit event
        emit EnableRegisteredServiceEvent(msg.sender, service);
    }

    function disableRegisteredService(address service) public notOwner notNullAddress(service) {
        require(msg.sender != service);

        //ensure service is registered
        require(registeredServicesMap[service] != 0);

        //disable service for given wallet
        disabledServicesMap[indexFromWalletService(msg.sender, service)] = true;

        //emit event
        emit DisableRegisteredServiceEvent(msg.sender, service);
    }

    //
    // Private methods
    // -----------------------------------------------------------------------------------------------------------------
    function indexFromWalletService(address wallet, address service) private pure returns (uint256) {
        return uint256(keccak256(wallet, service));
    }

    function isWalletServiceDisabled(address wallet, address service) private view returns (bool) {
        return disabledServicesMap[indexFromWalletService(wallet, service)];
    }

    function isAcceptedServiceForWallet(address service, address wallet) private view returns (bool) {
        if (service == wallet)
            return false;
        if (registeredServicesMap[service] == 0)
            return false;
        if (block.timestamp < registeredServicesMap[service])
            return false;
        return !disabledServicesMap[indexFromWalletService(wallet, service)];
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
