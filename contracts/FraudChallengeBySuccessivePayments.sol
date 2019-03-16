/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";

/**
 * @title FraudChallengeBySuccessivePayments
 * @notice Where driips are challenged wrt fraud by mismatch in successive payments
 */
contract FraudChallengeBySuccessivePayments is Ownable, FraudChallengable, ConfigurableOperational, Validatable,
SecurityBondable, WalletLockable, BalanceTrackable {
    using SafeMathIntLib for int256;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChallengeBySuccessivePaymentsEvent(bytes32 firstPaymentHash,
        bytes32 lastPaymentHash, address challenger, address lockedWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Submit two payment candidates in continuous Fraud Challenge (FC)
    /// to be tested for succession differences
    /// @param firstPayment Reference payment
    /// @param lastPayment Fraudulent payment candidate
    /// @param wallet The address of the concerned wallet
    function challenge(
        PaymentTypesLib.Payment firstPayment,
        PaymentTypesLib.Payment lastPayment,
        address wallet
    )
    public
    onlyOperationalModeNormal
    onlySealedPayment(firstPayment)
    onlySealedPayment(lastPayment)
    {
        require(validator.isPaymentParty(firstPayment, wallet));
        require(validator.isPaymentParty(lastPayment, wallet));
        require(
            firstPayment.currency.ct == lastPayment.currency.ct &&
            firstPayment.currency.id == lastPayment.currency.id
        );

        PaymentTypesLib.PaymentPartyRole firstPaymentPartyRole = (wallet == firstPayment.sender.wallet ? PaymentTypesLib.PaymentPartyRole.Sender : PaymentTypesLib.PaymentPartyRole.Recipient);
        PaymentTypesLib.PaymentPartyRole lastPaymentPartyRole = (wallet == lastPayment.sender.wallet ? PaymentTypesLib.PaymentPartyRole.Sender : PaymentTypesLib.PaymentPartyRole.Recipient);

        require(validator.isSuccessivePaymentsPartyNonces(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole));

        int256 deltaActiveBalance = _getDeltaActiveBalance(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole, wallet);
        //        int256 deltaActiveBalance = _getDeltaActiveBalance(wallet, firstPayment.currency, firstPayment.blockNumber, lastPayment.blockNumber);

        // Require existence of fraud signal
        require(!(
        (validator.isGenuineSuccessivePaymentsBalances(firstPayment, firstPaymentPartyRole, lastPayment, lastPaymentPartyRole, deltaActiveBalance)) &&
        (validator.isGenuineSuccessivePaymentsTotalFees(firstPayment, lastPayment))
        ));

        // Toggle operational mode exit
        configuration.setOperationalModeExit();

        // Tag payment (hash) as fraudulent
        fraudChallenge.addFraudulentPaymentHash(lastPayment.seals.operator.hash);

        // Reward stake fraction
        securityBond.rewardFractional(msg.sender, configuration.fraudStakeFraction(), 0);

        // Lock amount of size equivalent to payment balance
        walletLocker.lockFungibleByProxy(
            wallet, msg.sender,
            PaymentTypesLib.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.balances.current : lastPayment.recipient.balances.current,
            lastPayment.currency.ct, lastPayment.currency.id, 0
        );

        emit ChallengeBySuccessivePaymentsEvent(
            firstPayment.seals.operator.hash, lastPayment.seals.operator.hash, msg.sender, wallet
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _getDeltaActiveBalance(
        PaymentTypesLib.Payment firstPayment,
        PaymentTypesLib.PaymentPartyRole firstPaymentPartyRole,
        PaymentTypesLib.Payment lastPayment,
        PaymentTypesLib.PaymentPartyRole lastPaymentPartyRole,
        address wallet
    )
    private
    view
    returns (int256) {
        uint firstBlockNumber = PaymentTypesLib.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.onChainBlockNumber : firstPayment.recipient.onChainBlockNumber;
        uint lastBlockNumber = PaymentTypesLib.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.onChainBlockNumber : lastPayment.recipient.onChainBlockNumber;

        return _getActiveBalance(wallet, lastPayment.currency, lastBlockNumber).sub(
            _getActiveBalance(wallet, firstPayment.currency, firstBlockNumber)
        );
    }

    //    function _getDeltaActiveBalance(
    //        address wallet,
    //        MonetaryTypesLib.Currency currency,
    //        uint256 firstBlockNumber,
    //        uint256 lastBlockNumber
    //    )
    //    private
    //    view
    //    returns (int256) {
    //        return _getActiveBalance(wallet, currency, lastBlockNumber).sub(_getActiveBalance(wallet, currency, firstBlockNumber));
    //    }
    //
    function _getActiveBalance(
        address wallet,
        MonetaryTypesLib.Currency currency,
        uint256 blockNumber
    )
    private
    view
    returns (int256) {
        // Get log record amount of deposited and settled balances
        (int256 depositedAmount,) = balanceTracker.fungibleRecordByBlockNumber(
            wallet, balanceTracker.depositedBalanceType(), currency.ct, currency.id, blockNumber
        );
        (int256 settledAmount,) = balanceTracker.fungibleRecordByBlockNumber(
            wallet, balanceTracker.settledBalanceType(), currency.ct, currency.id, blockNumber
        );

        // Return the sum of deposited and settled balances
        return depositedAmount.add(settledAmount);
    }
}