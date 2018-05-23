/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;

import "../contracts/ERC20.sol";

/**
@title Revenue fund
@notice The target of all revenue earned in deal settlements and from which accrued revenue is split amongst
 reserve fund contributors and revenue token holders. There will likely be 2 instances of this smart contract,
 one for revenue from trades and one for revenue from payments.
*/
contract MockedRevenueFund {

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address from, int256 amount, address token); //token==0 for ethers
    event RecordDepositTokensEvent(address from, int256 amount, address token);
    event CloseAccrualPeriodEvent();
    event RegisterBeneficiaryEvent(address beneficiary, uint256 fraction);
    event DeregisterBeneficiaryEvent(address beneficiary);
    event RegisterServiceEvent(address service);
    event DeregisterServiceEvent(address service);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor() public {
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public notOwner payable {
        emit DepositEvent(msg.sender, int256(msg.value), address(0));
    }

    //NOTE: msg.sender must call ERC20.approve first
    function depositTokens(address token, int256 amount) notOwner public {
        emit DepositEvent(msg.sender, amount, token);
    }

    function recordDepositTokens(ERC20 token, int256 amount) public onlyOwnerOrService notNullAddress(token) {
        emit RecordDepositTokensEvent(msg.sender, amount, token);
    }

    //
    // Balance functions
    // -----------------------------------------------------------------------------------------------------------------
    //    function periodAccrualBalance(address token) public pure returns (int256) {
    //        return 0;
    //    }
    //
    //    function aggregateAccrualBalance(address token) public pure returns (int256) {
    //        return 0;
    //    }

    //
    // Accrual closure function
    // -----------------------------------------------------------------------------------------------------------------
    function closeAccrualPeriod() public onlyOwner {
        emit CloseAccrualPeriodEvent();
    }

    //
    // Beneficiary functions
    // -----------------------------------------------------------------------------------------------------------------
    //NOTE: RegisterBeneficiary checks if fulfillment will exceed 100% so unregisted other beneficiaries first if needed.
    function registerBeneficiary(address beneficiary, uint256 fraction) public onlyOwner notNullAddress(beneficiary) {
        emit RegisterBeneficiaryEvent(beneficiary, fraction);
    }

    function deregisterBeneficiary(address beneficiary) public onlyOwner notNullAddress(beneficiary) {
        emit DeregisterBeneficiaryEvent(beneficiary);
    }

    //
    // Service functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerService(address service) public onlyOwner notNullAddress(service) notMySelfAddress(service) {
        emit RegisterServiceEvent(service);
    }

    function deregisterService(address service) public onlyOwner notNullAddress(service) {
        emit DeregisterServiceEvent(service);
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function changeOwner(address newOwner) public onlyOwner notNullAddress(newOwner) {
        emit OwnerChangedEvent(address(0), newOwner);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        _;
    }

    modifier onlyOwner() {
        _;
    }

    modifier onlyOwnerOrService() {
        _;
    }

    modifier notOwner() {
        _;
    }

    modifier notMySelfAddress(address _address) {
        _;
    }
}
