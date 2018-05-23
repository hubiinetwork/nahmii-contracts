/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
@dev Factored out from previous Trade smart contract.
*/
contract MockedClientFund {

    struct Shift {
        address source;
        address destination;
        int256 amount;
        address currency;
    }

    Shift[] public transfers;
    Shift[] public withdrawals;

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
    event WithdrawEvent(address to, int256 amount, address token);  //token==0 for ethers
    event RegisterServiceEvent(address service);
    event EnableRegisteredServiceEvent(address wallet, address service);
    event DisableRegisteredServiceEvent(address wallet, address service);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    function reset() public {
        transfers.length = 0;
        withdrawals.length = 0;
    }

//    //
//    // Functions
//    // -----------------------------------------------------------------------------------------------------------------
//    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
//        emit OwnerChangedEvent(address(0), newOwner);
//    }
//
//    function setServiceActivationTimeout(uint256 timeoutInSeconds) public pure onlyOwner {
//    }
//
//    //
//    // Deposit functions
//    // -----------------------------------------------------------------------------------------------------------------
//    function() public notOwner payable {
//        emit DepositEvent(msg.sender, int256(msg.value), address(0));
//    }
//
//    //NOTE: msg.sender must call ERC20.approve first
//    function depositTokens(address token, int256 amount) public notOwner {
//        emit DepositEvent(msg.sender, amount, token);
//    }
//
//    function deposit(address wallet, uint index) public pure onlyOwner returns (int256 amount, uint256 timestamp, address token) {
//        return (0, 0, address(0));
//    }
//
//    function depositCount(address wallet) public pure onlyOwner returns (uint256) {
//        return 0;
//    }
//
//    //
//    // Balance functions
//    // -----------------------------------------------------------------------------------------------------------------
//    function depositedBalance(address wallet, address token) public pure returns (int256) {
//        return 0;
//    }
//
//    function stagedBalance(address wallet, address token) public pure returns (int256) {
//        return 0;
//    }
//
//    function settledBalance(address wallet, address token) public pure returns (int256) {
//        return 0;
//    }

    //
    // Transfers functions
    // -----------------------------------------------------------------------------------------------------------------
    function transferFromDepositedToSettledBalance(address sourceWallet, address destWallet, int256 amount, address token) public notOwner {
        transfers.push(Shift(sourceWallet, destWallet, amount, token));
        emit TransferFromDepositedToSettledBalanceEvent(sourceWallet, destWallet, amount, token);
    }

    function withdrawFromDepositedBalance(address sourceWallet, address destWallet, int256 amount, address token) public notOwner {
        withdrawals.push(Shift(sourceWallet, destWallet, amount, token));
        emit WithdrawFromDepositedBalanceEvent(sourceWallet, destWallet, amount, token);
    }

//    function depositEthersToSettledBalance(address destWallet) public payable notOwner {
//        emit DepositToSettledBalance(destWallet, int256(msg.value), address(0));
//    }
//
//    //NOTE: msg.sender must call ERC20.approve first
//    function depositTokensToSettledBalance(address destWallet, address token, int256 amount) public notOwner {
//        emit DepositToSettledBalance(destWallet, int256(amount), token);
//    }
//
//    function stage(int256 amount, address token) public notOwner {
//        emit StageEvent(msg.sender, amount, token);
//    }
//
//    function unstage(int256 amount, address token) public notOwner {
//        emit UnstageEvent(msg.sender, amount, token);
//    }
//
//    //
//    // Withdrawal functions
//    // -----------------------------------------------------------------------------------------------------------------
//    function withdrawEthers(int256 amount) public notOwner {
//        emit WithdrawEvent(msg.sender, amount, address(0));
//    }
//
//    function withdrawTokens(int256 amount, address token) public notOwner {
//        emit WithdrawEvent(msg.sender, amount, token);
//    }
//
//    function withdrawal(address wallet, uint index) public pure onlyOwner returns (int256 amount, uint256 timestamp, address token) {
//        return (0, 0, address(0));
//    }
//
//    function withdrawalCount(address wallet) public pure onlyOwner returns (uint256) {
//        return 0;
//    }
//
//    //
//    // Service functions
//    // -----------------------------------------------------------------------------------------------------------------
//    function registerService(address service) public onlyOwner notNullAddress(service) notMySelfAddress(service) {
//        emit RegisterServiceEvent(service);
//    }
//
//    function enableRegisteredService(address service) public notOwner notNullAddress(service) {
//        emit EnableRegisteredServiceEvent(msg.sender, service);
//    }
//
//    function disableRegisteredService(address service) public notOwner notNullAddress(service) {
//        emit DisableRegisteredServiceEvent(msg.sender, service);
//    }
//
//    //
//    // Private methods
//    // -----------------------------------------------------------------------------------------------------------------
//
//    function isWalletServiceDisabled(address wallet, address service) private pure returns (bool) {
//        return false;
//    }
//
//    function isAcceptedServiceForWallet(address service, address wallet) private pure returns (bool) {
//        return true;
//    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        _;
    }

    modifier onlyOwner() {
        _;
    }

    modifier notOwner() {
        _;
    }

    modifier notMySelfAddress(address _address) {
        _;
    }
}
