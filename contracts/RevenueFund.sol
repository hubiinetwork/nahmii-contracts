/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import {Ownable} from "./Ownable.sol";
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";
import {AccrualBenefactor} from "./AccrualBenefactor.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import {ERC20} from "./ERC20.sol";

/**
@title RevenueFund
@notice The target of all revenue earned in driip settlements and from which accrued revenue is split amongst
 accrual beneficiaries. There will likely be 2 instances of this smart contract, one for revenue from trades
 and one for revenue from payments.
*/
contract RevenueFund is Ownable, AccrualBeneficiary, AccrualBenefactor, SelfDestructible {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    int256 periodAccrualEtherBalance;
    mapping(address => int256) periodAccrualTokenBalance;
    address[] periodAccrualTokenList;
    mapping(address => bool) periodAccrualTokenListMap;

    int256 aggregateAccrualEtherBalance;
    mapping(address => int256) aggregateAccrualTokenBalance;
    address[] aggregateAccrualTokenList;
    mapping(address => bool) aggregateAccrualTokenListMap;

    mapping(address => bool) registeredServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address from, int256 amount, address token); //token==0 for ethers
    event RecordDepositTokensEvent(address from, int256 amount, address token);
    event CloseAccrualPeriodEvent();
    event RegisterServiceEvent(address service);
    event DeregisterServiceEvent(address service);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        receiveEthers(msg.sender);
    }

    function receiveEthers(address wallet) public payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to balances
        periodAccrualEtherBalance = periodAccrualEtherBalance.add_nn(amount);

        aggregateAccrualEtherBalance = aggregateAccrualEtherBalance.add_nn(amount);

        //emit event
        emit DepositEvent(wallet, amount, address(0));
    }

    function depositTokens(address token, int256 amount) public {
        receiveTokens(msg.sender, amount, token);
    }

    //NOTE: 'wallet' must call ERC20.approve first
    function receiveTokens(address wallet, int256 amount, address token) public {
        ERC20 erc20_token = ERC20(token);

        //record deposit
        recordDepositTokensPrivate(erc20_token, amount);

        //try to execute token transfer
        require(erc20_token.transferFrom(wallet, this, uint256(amount)));

        //emit event
        emit DepositEvent(wallet, amount, token);
    }

    function recordDepositTokens(ERC20 token, int256 amount) public onlyOwnerOrService notNullAddress(token) {
        recordDepositTokensPrivate(token, amount);
        emit RecordDepositTokensEvent(msg.sender, amount, token);
    }

    function recordDepositTokensPrivate(ERC20 token, int256 amount) private notNullAddress(token) {
        require(amount.isNonZeroPositiveInt256());

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

    //
    // Accrual closure function
    // -----------------------------------------------------------------------------------------------------------------
    function closeAccrualPeriod() public onlyOwner {
        uint256 idx;
        uint256 tokidx;
        uint256 remaining;
        address beneficiaryAddress;
        AccrualBeneficiary beneficiary;
        uint256 to_transfer;
        address token;

        require(totalBeneficiaryFraction == PARTS_PER);

        //execute ethers transfer
        remaining = periodAccrualEtherBalance.toUInt256();
        for (idx = 0; idx < beneficiaries.length; idx++) {
            beneficiaryAddress = beneficiaries[idx];

            if (!isRegisteredBeneficiary(beneficiaryAddress))
                continue;

            if (getBeneficiaryFraction(beneficiaryAddress) > 0) {
                to_transfer = uint256(periodAccrualEtherBalance).mul(getBeneficiaryFraction(beneficiaryAddress)).div(PARTS_PER);
                if (to_transfer > remaining)
                    to_transfer = remaining;

                if (to_transfer > 0) {
                    beneficiary = AccrualBeneficiary(beneficiaryAddress);
                    beneficiary.receiveEthers.value(to_transfer)(address(0));

                    remaining = remaining.sub(to_transfer);
                }
            }
        }
        //roll over remaining to next accrual period
        periodAccrualEtherBalance = int256(remaining);

        //execute tokens transfer
        for (tokidx = 0; tokidx < periodAccrualTokenList.length; tokidx++) {
            token = periodAccrualTokenList[tokidx];

            remaining = periodAccrualTokenBalance[token].toUInt256();
            for (idx = 0; idx < beneficiaries.length; idx++) {
                beneficiaryAddress = beneficiaries[idx];

                if (!isRegisteredBeneficiary(beneficiaryAddress))
                    continue;

                if (getBeneficiaryFraction(beneficiaryAddress) > 0) {

                    to_transfer = uint256(periodAccrualTokenBalance[token])
                    .mul(getBeneficiaryFraction(beneficiaryAddress))
                    .div(PARTS_PER);
                    if (to_transfer > remaining)
                        to_transfer = remaining;

                    if (to_transfer > 0) {
                        ERC20 tokenContract = ERC20(token);
                        tokenContract.approve(beneficiaryAddress, to_transfer);

                        beneficiary = AccrualBeneficiary(beneficiaryAddress);
                        beneficiary.receiveTokens(address(0), int256(to_transfer), token);

                        remaining = remaining.sub(to_transfer);
                    }
                }
            }

            //roll over remaining to next accrual period
            periodAccrualTokenBalance[token] = int256(remaining);
        }

        //call "closeAccrualPeriod" of beneficiaries
        for (idx = 0; idx < beneficiaries.length; idx++) {
            beneficiaryAddress = beneficiaries[idx];

            if (!isRegisteredBeneficiary(beneficiaryAddress) || 0 == getBeneficiaryFraction(beneficiaryAddress))
                continue;

            beneficiary = AccrualBeneficiary(beneficiaryAddress);
            beneficiary.closeAccrualPeriod();
        }

        //emit event
        emit CloseAccrualPeriodEvent();
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

    modifier onlyOwnerOrService() {
        require(msg.sender == owner || registeredServicesMap[msg.sender]);
        _;
    }

    modifier notMySelfAddress(address _address) {
        require(_address != address(this));
        _;
    }
}
