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
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {PartnerFund} from "./PartnerFund.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";

/**
 * @title PaymentSettlement
 * @notice Where payment settlements are finalized
 */
contract PaymentSettlement is Ownable, Configurable, Validatable, ClientFundable, CommunityVotable,
FraudChallengable, WalletLockable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Total {
        uint256 nonce;
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public maxDriipNonce;

    DriipSettlementChallengeState public driipSettlementChallengeState;
    RevenueFund public paymentsRevenueFund;
    PartnerFund public partnerFund;

    SettlementTypesLib.Settlement[] public settlements;
    mapping(uint256 => uint256) public nonceSettlementIndex;
    mapping(address => uint256[]) public walletSettlementIndices;
    mapping(address => mapping(uint256 => uint256)) public walletNonceSettlementIndex;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxDriipNonce;

    mapping(address => mapping(address => mapping(address => mapping(address => mapping(uint256 => Total))))) public feeTotalsMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettlePaymentEvent(address wallet, PaymentTypesLib.Payment payment);
    event SettlePaymentByProxyEvent(address proxy, address wallet, PaymentTypesLib.Payment payment);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event SetPaymentsRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
    event SetPartnerFundEvent(PartnerFund oldPartnerFund, PartnerFund newPartnerFund);
    event StageFeesEvent(address wallet, int256 deltaAmount, int256 cumulativeAmount,
        address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the driip settlement challenge contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState) public
    onlyDeployer
    notNullAddress(newDriipSettlementChallengeState)
    {
        DriipSettlementChallengeState oldDriipSettlementChallengeState = driipSettlementChallengeState;
        driipSettlementChallengeState = newDriipSettlementChallengeState;
        emit SetDriipSettlementChallengeStateEvent(oldDriipSettlementChallengeState, driipSettlementChallengeState);
    }

    /// @notice Set the payments revenue fund contract
    /// @param newPaymentsRevenueFund The (address of) payments RevenueFund contract instance
    function setPaymentsRevenueFund(RevenueFund newPaymentsRevenueFund) public
    onlyDeployer
    notNullAddress(newPaymentsRevenueFund)
    {
        RevenueFund oldPaymentsRevenueFund = paymentsRevenueFund;
        paymentsRevenueFund = newPaymentsRevenueFund;
        emit SetPaymentsRevenueFundEvent(oldPaymentsRevenueFund, paymentsRevenueFund);
    }

    /// @notice Set the partner fund contract
    /// @param newPartnerFund The (address of) partner contract instance
    function setPartnerFund(PartnerFund newPartnerFund) public
    onlyDeployer
    notNullAddress(newPartnerFund)
    {
        PartnerFund oldPartnerFund = partnerFund;
        partnerFund = newPartnerFund;
        emit SetPartnerFundEvent(oldPartnerFund, partnerFund);
    }

    /// @notice Get the count of settlements
    function settlementsCount() public view returns (uint256) {
        return settlements.length;
    }

    /// @notice Return boolean indicating whether there is already a settlement for the given (global) nonce
    /// @param nonce The nonce for which to check for settlement
    /// @return true if there exists a settlement for the provided nonce, false otherwise
    function hasSettlementByNonce(uint256 nonce) public view returns (bool) {
        return 0 < nonceSettlementIndex[nonce];
    }

    /// @notice Get the settlement for the given (global) nonce
    /// @param nonce The nonce of the settlement
    /// @return settlement of the provided nonce
    function settlementByNonce(uint256 nonce) public view returns (SettlementTypesLib.Settlement) {
        require(hasSettlementByNonce(nonce));
        return settlements[nonceSettlementIndex[nonce] - 1];
    }

    /// @notice Get the count of settlements for given wallet
    /// @param wallet The address for which to return settlement count
    /// @return count of settlements for the provided wallet
    function settlementsCountByWallet(address wallet) public view returns (uint256) {
        return walletSettlementIndices[wallet].length;
    }

    /// @notice Get settlement of given wallet and index
    /// @param wallet The address for which to return settlement
    /// @param index The wallet's settlement index
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndIndex(address wallet, uint256 index) public view returns (SettlementTypesLib.Settlement) {
        require(walletSettlementIndices[wallet].length > index);
        return settlements[walletSettlementIndices[wallet][index] - 1];
    }

    /// @notice Get settlement of given wallet and (wallet) nonce
    /// @param wallet The address for which to return settlement
    /// @param nonce The wallet's nonce
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndNonce(address wallet, uint256 nonce) public view returns (SettlementTypesLib.Settlement) {
        require(0 < walletNonceSettlementIndex[wallet][nonce]);
        return settlements[walletNonceSettlementIndex[wallet][nonce] - 1];
    }

    /// @notice Update the max driip nonce property from CommunityVote contract
    function updateMaxDriipNonce() public {
        uint256 _maxDriipNonce = communityVote.getMaxDriipNonce();
        if (_maxDriipNonce > 0) {
            maxDriipNonce = _maxDriipNonce;
        }
    }

    /// @notice Settle driip that is a payment
    /// @param payment The payment to be settled
    function settlePayment(PaymentTypesLib.Payment payment)
    public
    {
        // Settle payment
        _settlePayment(msg.sender, payment);

        // Emit event
        emit SettlePaymentEvent(msg.sender, payment);
    }

    /// @notice Settle driip that is a payment
    /// @param wallet The wallet whose side of the payment is to be settled
    /// @param payment The payment to be settled
    function settlePaymentByProxy(address wallet, PaymentTypesLib.Payment payment)
    public
    onlyOperator
    {
        // Settle payment for wallet
        _settlePayment(wallet, payment);

        // Emit event
        emit SettlePaymentByProxyEvent(msg.sender, wallet, payment);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _settlePayment(address wallet, PaymentTypesLib.Payment payment)
    private
    onlySealedPayment(payment)
    {
        require(!fraudChallenge.isFraudulentPaymentHash(payment.seals.operator.hash));
        require(validator.isPaymentParty(payment, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        // Require that wallet is not locked
        require(!walletLocker.isLocked(wallet));

        // Require that proposal has expired
        require(driipSettlementChallengeState.hasProposalExpired(wallet, payment.currency));

        // Require that driip settlement challenge proposal qualified
        require(SettlementTypesLib.Status.Qualified == driipSettlementChallengeState.proposalStatus(
            wallet, payment.currency
        ));

        // Require that the wallet's current driip settlement challenge is wrt this payment
        require(payment.nonce == driipSettlementChallengeState.proposalNonce(wallet, payment.currency));

        // Require that operational mode is normal and data is available, or that nonce is
        // smaller than max null nonce
        require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
            || (payment.nonce < maxDriipNonce));

        // Get settlement, or create one if no such settlement exists for the trade nonce
        SettlementTypesLib.Settlement storage settlement = hasSettlementByNonce(payment.nonce) ?
        getSettlement(payment.nonce, NahmiiTypesLib.DriipType.Payment) :
        createSettlement(payment.nonce, NahmiiTypesLib.DriipType.Payment,
            payment.sender.nonce, payment.sender.wallet, payment.recipient.nonce, payment.recipient.wallet);

        // Get settlement role
        SettlementTypesLib.SettlementRole settlementRole = getSettlementRoleFromPayment(payment, wallet);

        // If exists settlement of nonce then require that wallet has not already settled
        require(
            (SettlementTypesLib.SettlementRole.Origin == settlementRole && !settlement.origin.done) ||
            (SettlementTypesLib.SettlementRole.Target == settlementRole && !settlement.target.done)
        );

        // Set address of origin or target to prevent the same settlement from being resettled by this wallet
        if (SettlementTypesLib.SettlementRole.Origin == settlementRole)
            settlement.origin.done = true;
        else
            settlement.target.done = true;

        NahmiiTypesLib.OriginFigure[] memory totalFees;
        int256 currentBalance;
        if (validator.isPaymentSender(payment, wallet)) {
            totalFees = payment.sender.fees.total;
            currentBalance = payment.sender.balances.current;
        } else {
            totalFees = payment.recipient.fees.total;
            currentBalance = payment.recipient.balances.current;
        }

        // If wallet has previously settled balance of the concerned currency with higher driip nonce, then don't
        // settle balance again
        if (walletCurrencyMaxDriipNonce[wallet][payment.currency.ct][payment.currency.id] < payment.nonce) {
            // Update settled nonce of wallet and currency
            walletCurrencyMaxDriipNonce[wallet][payment.currency.ct][payment.currency.id] = payment.nonce;

            // Update settled balance
            clientFund.updateSettledBalance(
                wallet, currentBalance, payment.currency.ct, payment.currency.id, "", payment.blockNumber
            );

            // Stage (stage function assures positive amount only)
            clientFund.stage(
                wallet, driipSettlementChallengeState.proposalStageAmount(wallet, payment.currency),
                payment.currency.ct, payment.currency.id, ""
            );
        }

        // Stage fees to revenue fund
        if (address(0) != address(paymentsRevenueFund))
            stageFees(wallet, totalFees, paymentsRevenueFund, payment.nonce);

        // If payment nonce is beyond max driip nonce then update max driip nonce
        if (payment.nonce > maxDriipNonce)
            maxDriipNonce = payment.nonce;
    }

    function getSettlementRoleFromPayment(PaymentTypesLib.Payment payment, address wallet)
    private
    pure
    returns (SettlementTypesLib.SettlementRole)
    {
        return (wallet == payment.sender.wallet ?
        SettlementTypesLib.SettlementRole.Origin :
        SettlementTypesLib.SettlementRole.Target);
    }

    function getSettlement(uint256 nonce, NahmiiTypesLib.DriipType driipType)
    private
    view
    returns (SettlementTypesLib.Settlement storage)
    {
        uint256 index = nonceSettlementIndex[nonce];
        SettlementTypesLib.Settlement storage settlement = settlements[index - 1];
        require(driipType == settlement.driipType);
        return settlement;
    }

    function createSettlement(uint256 nonce, NahmiiTypesLib.DriipType driipType,
        uint256 originNonce, address originWallet, uint256 targetNonce, address targetWallet)
    private
    returns (SettlementTypesLib.Settlement storage)
    {
        SettlementTypesLib.Settlement memory settlement;
        settlement.nonce = nonce;
        settlement.driipType = driipType;
        settlement.origin = SettlementTypesLib.SettlementParty(originNonce, originWallet, false);
        settlement.target = SettlementTypesLib.SettlementParty(targetNonce, targetWallet, false);

        settlements.push(settlement);

        // Index is 1 based
        uint256 index = settlements.length;
        nonceSettlementIndex[nonce] = index;
        walletSettlementIndices[originWallet].push(index);
        walletSettlementIndices[targetWallet].push(index);
        walletNonceSettlementIndex[originWallet][originNonce] = index;
        walletNonceSettlementIndex[targetWallet][targetNonce] = index;

        return settlements[index - 1];
    }

    function stageFees(address wallet, NahmiiTypesLib.OriginFigure[] fees,
        Beneficiary protocolBeneficiary, uint256 nonce)
    private
    {
        // For each origin figure...
        for (uint256 i = 0; i < fees.length; i++) {
            // Based on originId determine if this is protocol or partner fee, and if the latter define originId as destination in beneficiary
            (Beneficiary beneficiary, address destination) =
            (0 == fees[i].originId) ? (protocolBeneficiary, address(0)) : (partnerFund, address(fees[i].originId));

            Total storage feeTotal = feeTotalsMap[wallet][address(beneficiary)][destination][fees[i].figure.currency.ct][fees[i].figure.currency.id];

            // If wallet has previously settled fee of the concerned currency with higher driip nonce then don't settle again
            if (feeTotal.nonce < nonce) {
                feeTotal.nonce = nonce;

                // Get the amount previously staged
                int256 deltaAmount = fees[i].figure.amount - feeTotal.amount;

                // Update the fee total amount
                feeTotal.amount = fees[i].figure.amount;

                // Transfer to beneficiary
                clientFund.transferToBeneficiary(
                    destination, beneficiary, deltaAmount, fees[i].figure.currency.ct, fees[i].figure.currency.id, ""
                );

                // Emit event
                emit StageFeesEvent(
                    wallet, deltaAmount, fees[i].figure.amount, fees[i].figure.currency.ct, fees[i].figure.currency.id
                );
            }
        }
    }
}