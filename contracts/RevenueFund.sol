/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";
import {AccrualBenefactor} from "./AccrualBenefactor.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {TransferController} from "./TransferController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {ConstantsLib} from "./ConstantsLib.sol";

/**
@title RevenueFund
@notice The target of all revenue earned in driip settlements and from which accrued revenue is split amongst
 accrual beneficiaries. There will likely be 2 instances of this smart contract, one for revenue from trades
 and one for revenue from payments.
*/
contract RevenueFund is Ownable, AccrualBeneficiary, AccrualBenefactor, TransferControllerManageable {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public DEPOSIT_BALANCE_TYPE = "deposit";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    BalanceLib.Balance periodAccrual;
    InUseCurrencyLib.InUseCurrency inUsePeriodAccrual;

    BalanceLib.Balance aggregateAccrual;
    InUseCurrencyLib.InUseCurrency inUseAggregateAccrual;

    mapping(address => bool) public registeredServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ReceiveEvent(address from, string balanceType, int256 amount, address currencyCt, uint256 currencyId);
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
        receiveEthersTo(msg.sender, "");
    }

    function receiveEthersTo(address wallet, string balanceType) public payable {
        require(
            0 == bytes(balanceType).length ||
            keccak256(abi.encodePacked(DEPOSIT_BALANCE_TYPE)) == keccak256(abi.encodePacked(balanceType))
        );

        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to balances
        periodAccrual.add(amount, address(0), 0);
        aggregateAccrual.add(amount, address(0), 0);

        // Add currency to in-use list
        inUsePeriodAccrual.addItem(address(0), 0);
        inUseAggregateAccrual.addItem(address(0), 0);

        // Emit event
        emit ReceiveEvent(wallet, balanceType, amount, address(0), 0);
    }

    function receiveTokens(string balanceType, int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        receiveTokensTo(msg.sender, balanceType, amount, currencyCt, currencyId, standard);
    }

    function receiveTokensTo(address wallet, string balanceType, int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        require(
            0 == bytes(balanceType).length ||
            keccak256(abi.encodePacked(DEPOSIT_BALANCE_TYPE)) == keccak256(abi.encodePacked(balanceType))
        );

        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        if (!address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId))
            revert();

        // Add to balances
        periodAccrual.add(amount, currencyCt, currencyId);
        aggregateAccrual.add(amount, currencyCt, currencyId);

        // Add currency to in-use list
        inUsePeriodAccrual.addItem(currencyCt, currencyId);
        inUseAggregateAccrual.addItem(currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, balanceType, amount, currencyCt, currencyId);
    }

    //
    // Balance functions
    // -----------------------------------------------------------------------------------------------------------------
    function periodAccrualBalance(address currencyCt, uint256 currencyId) public view returns (int256) {
        return periodAccrual.get(currencyCt, currencyId);
    }

    function aggregateAccrualBalance(address currencyCt, uint256 currencyId) public view returns (int256) {
        return aggregateAccrual.get(currencyCt, currencyId);
    }

    //
    // Accrual closure function
    // -----------------------------------------------------------------------------------------------------------------
    function closeAccrualPeriod() public onlyDeployer {
        uint256 currencyIndex;
        uint256 beneficiaryIndex;
        int256 remaining;
        int256 transferable;
        address beneficiaryAddress;

        require(totalBeneficiaryFraction == ConstantsLib.PARTS_PER());

        // Execute transfer
        for (currencyIndex = inUsePeriodAccrual.getLength(); currencyIndex > 0; currencyIndex--) {
            MonetaryTypesLib.Currency memory currency = inUsePeriodAccrual.getAt(currencyIndex - 1);

            remaining = periodAccrual.get(currency.ct, currency.id);
            for (beneficiaryIndex = 0; beneficiaryIndex < beneficiaries.length; beneficiaryIndex++) {
                beneficiaryAddress = beneficiaries[beneficiaryIndex];

                if (!isRegisteredBeneficiary(beneficiaryAddress))
                    continue;

                if (getBeneficiaryFraction(beneficiaryAddress) > 0) {
                    transferable = periodAccrual.get(currency.ct, currency.id).mul(
                        getBeneficiaryFraction(beneficiaryAddress)
                    ).div(ConstantsLib.PARTS_PER());

                    if (transferable > remaining)
                        transferable = remaining;

                    if (transferable > 0) {
                        // Transfer funds to the beneficiary

                        //NOTE: Setting address(0) as the target wallet is ok because the beneficiaries actually ignore the target wallet.
                        if (currency.ct == address(0))
                            AccrualBeneficiary(beneficiaryAddress).receiveEthersTo.value(uint256(transferable))(address(0), "");

                        else {
                            // Execute transfer
                            TransferController controller = getTransferController(currency.ct, "");
                            if (!address(controller).delegatecall(controller.getApproveSignature(), beneficiaryAddress, uint256(transferable), currency.ct, currency.id))
                                revert();

                            //transfer funds to the beneficiary
                            AccrualBeneficiary(beneficiaryAddress).receiveTokensTo(address(0), "", transferable, currency.ct, currency.id, "");
                        }

                        remaining = remaining.sub(transferable);
                    }
                }
            }

            // Roll over remaining to next accrual period
            periodAccrual.set(remaining, currency.ct, currency.id);
        }

        // Call "closeAccrualPeriod" of beneficiaries
        for (beneficiaryIndex = 0; beneficiaryIndex < beneficiaries.length; beneficiaryIndex++) {
            beneficiaryAddress = beneficiaries[beneficiaryIndex];

            if (!isRegisteredBeneficiary(beneficiaryAddress) || 0 == getBeneficiaryFraction(beneficiaryAddress))
                continue;

            AccrualBeneficiary(beneficiaryAddress).closeAccrualPeriod();
        }

        // Emit event
        emit CloseAccrualPeriodEvent();
    }

    //
    // Service functions
    // -----------------------------------------------------------------------------------------------------------------
    function registerService(address service) public onlyDeployer notNullAddress(service) notThisAddress(service) {
        require(service != deployer);

        // Ensure service is not already registered
        require(registeredServicesMap[service] == false);

        // Register
        registeredServicesMap[service] = true;

        // Emit event
        emit RegisterServiceEvent(service);
    }

    function deregisterService(address service) public onlyDeployer notNullAddress(service) {
        // Ensure service is registered
        require(registeredServicesMap[service] != false);

        // Remove service
        registeredServicesMap[service] = false;

        // Emit event
        emit DeregisterServiceEvent(service);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyDeployerOrService() {
        require(isDeployer() || registeredServicesMap[msg.sender]);
        _;
    }
}
