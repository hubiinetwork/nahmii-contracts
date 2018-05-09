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
import "./ERC20.sol";
import "./AccrualBeneficiaryInterface.sol";

/**
@title Revenue fund
@notice The target of all revenue earned in deal settlements and from which accrued revenue is split amongst
 reserve fund contributors and revenue token holders. There will likely be 2 instances of this smart contract,
 one for revenue from trades and one for revenue from payments.
*/
contract RevenueFund {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    uint256 constant public PARTS_PER = 1e18;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Beneficiary {
        bool on_list;
        uint256 fraction;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    address private owner;

    int256 periodAccrualEtherBalance;
    mapping (address => int256) periodAccrualTokenBalance;
    address[] periodAccrualTokenList;
    mapping (address => bool) periodAccrualTokenListMap;

    int256 aggregateAccrualEtherBalance;
    mapping (address => int256) aggregateAccrualTokenBalance;
    address[] aggregateAccrualTokenList;
    mapping (address => bool) aggregateAccrualTokenListMap;

    address[] registeredBeneficiaries;
    mapping (address => Beneficiary) registeredBeneficiariesMap;
    uint256 registeredBeneficiariesFulfilledPercent;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event OwnerChangedEvent(address oldOwner, address newOwner);
    event DepositEvent(address from, int256 amount, address token); //token==0 for ethers
    event CloseAccrualPeriodEvent();
    event RegisterBeneficiaryEvent(address beneficiary, uint256 fraction);
    event DeregisterBeneficiaryEvent(address beneficiary);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) public notNullAddress(_owner) {
        owner = _owner;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function () public notOwner payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to balances
        periodAccrualEtherBalance = periodAccrualEtherBalance.add_nn(amount);

        aggregateAccrualEtherBalance = aggregateAccrualEtherBalance.add_nn(amount);

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

        //emit event
        emit DepositEvent(msg.sender, amount, token);
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
        address beneficiary;
        uint256 to_transfer;
        address token;
        ERC20 erc20_token;

        require(registeredBeneficiariesFulfilledPercent == PARTS_PER);

        //execute ethers transfer
        remaining = periodAccrualEtherBalance.toUInt256();
        for (idx = 0; idx < registeredBeneficiaries.length; idx++) {
            beneficiary = registeredBeneficiaries[idx];

            if (registeredBeneficiariesMap[beneficiary].fraction > 0) {
                to_transfer = uint256(periodAccrualEtherBalance).mul(registeredBeneficiariesMap[beneficiary].fraction).div(PARTS_PER);
                if (to_transfer > remaining)
                    to_transfer = remaining;

                if (to_transfer > 0) {
                    beneficiary.transfer(to_transfer);

                    remaining = remaining.sub(to_transfer);
                }
            }
        }
        //save remaining ethers for next closuse
        periodAccrualEtherBalance = int256(remaining);

        //execute tokens transfer
        for (tokidx = 0; tokidx < periodAccrualTokenList.length; tokidx++) {
            token = periodAccrualTokenList[tokidx];
            erc20_token = ERC20(token);

            remaining = periodAccrualTokenBalance[token].toUInt256();
            for (idx = 0; idx < registeredBeneficiaries.length; idx++) {
                beneficiary = registeredBeneficiaries[idx];

                to_transfer = uint256(periodAccrualTokenBalance[token]).mul(registeredBeneficiariesMap[beneficiary].fraction).div(PARTS_PER);
                if (to_transfer > remaining)
                    to_transfer = remaining;

                if (to_transfer > 0) {
                    erc20_token.transfer(beneficiary, to_transfer);

                    remaining = remaining.sub(to_transfer);
                }
            }

            //save remaining tokens for next closuse
            periodAccrualTokenBalance[token] = int256(remaining);
        }

        //call "closeAccrualPeriod" of beneficiaries
        for (idx = 0; idx < registeredBeneficiaries.length; idx++) {
            beneficiary = registeredBeneficiaries[idx];

            if (registeredBeneficiariesMap[beneficiary].fraction > 0) {
                AccrualBeneficiaryInterface _abi = AccrualBeneficiaryInterface(beneficiary);

                _abi.closeAccrualPeriod();
            }
        }

        //emit event
        emit CloseAccrualPeriodEvent();
    }

    //
    // Beneficiary functions
    // -----------------------------------------------------------------------------------------------------------------
    //NOTE: RegisterBeneficiary checks if fulfillment will exceed 100% so unregisted other beneficiaries first if needed.
    function registerBeneficiary(address beneficiary, uint256 fraction) public onlyOwner notNullAddress(beneficiary) {
        require(fraction > 0);
        require(registeredBeneficiariesFulfilledPercent + fraction <= PARTS_PER);

        require(registeredBeneficiariesMap[beneficiary].fraction == 0); //ensure not registered yet

        //add the beneficiary to the list if not registered previously (deregistering does not remove it from the list)
        if (!registeredBeneficiariesMap[beneficiary].on_list) {
            registeredBeneficiariesMap[beneficiary].on_list = true;
            registeredBeneficiaries.push(beneficiary);
        }

        registeredBeneficiariesMap[beneficiary].fraction = fraction;

        //increment fullfillment percent
        registeredBeneficiariesFulfilledPercent = registeredBeneficiariesFulfilledPercent + fraction;

        emit RegisterBeneficiaryEvent(beneficiary, fraction);
    }

    function deregisterBeneficiary(address beneficiary) public onlyOwner notNullAddress(beneficiary) {
        if (registeredBeneficiariesMap[beneficiary].fraction > 0) {
            //decrement fullfillment percent
            registeredBeneficiariesFulfilledPercent = registeredBeneficiariesFulfilledPercent - registeredBeneficiariesMap[beneficiary].fraction;

            registeredBeneficiariesMap[beneficiary].fraction = 0;
        }

        emit DeregisterBeneficiaryEvent(beneficiary);
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
