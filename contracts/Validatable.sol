/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {Validator} from "./Validator.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title Validatable
@notice An ownable that has a validator property
*/
contract Validatable is Ownable {
    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Validator public validator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeValidatorEvent(Validator oldAddress, Validator newAddress);

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the validator contract
    /// @param newAddress The (address of) Validator contract instance
    function changeValidator(Validator newAddress) public onlyDeployer
        notNullAddress(newAddress)
        notSameAddresses(newAddress, validator)
    {
        //set new validator
        Validator oldAddress = validator;
        validator = newAddress;

        //emit event
        emit ChangeValidatorEvent(oldAddress, newAddress);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier validatorInitialized() {
        require(validator != address(0));
        _;
    }

    modifier onlyExchangeSealedOrder(NahmiiTypes.Order order) {
        require(validator.isGenuineOrderExchangeSeal(order, deployer));
        _;
    }

    modifier onlySealedOrder(NahmiiTypes.Order order) {
        require(validator.isGenuineOrderSeals(order, deployer));
        _;
    }

    modifier onlySealedTrade(NahmiiTypes.Trade trade) {
        require(validator.isGenuineTradeSeal(trade, deployer));
        _;
    }

    modifier onlyExchangeSealedPayment(NahmiiTypes.Payment payment) {
        require(validator.isGenuinePaymentExchangeSeal(payment, deployer));
        _;
    }

    modifier onlySealedPayment(NahmiiTypes.Payment payment) {
        require(validator.isGenuinePaymentSeals(payment, deployer));
        _;
    }
}
