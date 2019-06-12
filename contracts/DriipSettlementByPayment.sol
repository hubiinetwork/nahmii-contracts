/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {PartnerBenefactorable} from "./PartnerBenefactorable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {DriipSettlementState} from "./DriipSettlementState.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {DriipSettlementTypesLib} from "./DriipSettlementTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";

/**
 * @title DriipSettlementByPayment
 * @notice Where driip settlements pertaining to payment are finalized
 */
contract DriipSettlementByPayment is Ownable, Configurable, Validatable, ClientFundable, CommunityVotable,
FraudChallengable, WalletLockable, PartnerBenefactorable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementChallengeState public driipSettlementChallengeState;
    DriipSettlementState public driipSettlementState;
    RevenueFund public revenueFund;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettlePaymentEvent(address wallet, PaymentTypesLib.Payment payment, string standard);
    event SettlePaymentByProxyEvent(address proxy, address wallet, PaymentTypesLib.Payment payment, string standard);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event SetDriipSettlementStateEvent(DriipSettlementState oldDriipSettlementState,
        DriipSettlementState newDriipSettlementState);
    event SetRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
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
    /// @notice Set the driip settlement challenge state contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState)
    public
    onlyDeployer
    notNullAddress(address(newDriipSettlementChallengeState))
    {
        DriipSettlementChallengeState oldDriipSettlementChallengeState = driipSettlementChallengeState;
        driipSettlementChallengeState = newDriipSettlementChallengeState;
        emit SetDriipSettlementChallengeStateEvent(oldDriipSettlementChallengeState, driipSettlementChallengeState);
    }

    /// @notice Set the driip settlement state contract
    /// @param newDriipSettlementState The (address of) DriipSettlementState contract instance
    function setDriipSettlementState(DriipSettlementState newDriipSettlementState)
    public
    onlyDeployer
    notNullAddress(address(newDriipSettlementState))
    {
        DriipSettlementState oldDriipSettlementState = driipSettlementState;
        driipSettlementState = newDriipSettlementState;
        emit SetDriipSettlementStateEvent(oldDriipSettlementState, driipSettlementState);
    }

    /// @notice Set the revenue fund contract
    /// @param newRevenueFund The (address of) RevenueFund contract instance
    function setRevenueFund(RevenueFund newRevenueFund)
    public
    onlyDeployer
    notNullAddress(address(newRevenueFund))
    {
        RevenueFund oldRevenueFund = revenueFund;
        revenueFund = newRevenueFund;
        emit SetRevenueFundEvent(oldRevenueFund, revenueFund);
    }

    /// @notice Get the count of settlements
    function settlementsCount()
    public
    view
    returns (uint256)
    {
        return driipSettlementState.settlementsCount();
    }

    /// @notice Get the count of settlements for given wallet
    /// @param wallet The address for which to return settlement count
    /// @return count of settlements for the provided wallet
    function settlementsCountByWallet(address wallet)
    public
    view
    returns (uint256)
    {
        return driipSettlementState.settlementsCountByWallet(wallet);
    }

    /// @notice Get settlement of given wallet and index
    /// @param wallet The address for which to return settlement
    /// @param index The wallet's settlement index
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndIndex(address wallet, uint256 index)
    public
    view
    returns (DriipSettlementTypesLib.Settlement memory)
    {
        return driipSettlementState.settlementByWalletAndIndex(wallet, index);
    }

    /// @notice Get settlement of given wallet and wallet nonce
    /// @param wallet The address for which to return settlement
    /// @param nonce The wallet's nonce
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndNonce(address wallet, uint256 nonce)
    public
    view
    returns (DriipSettlementTypesLib.Settlement memory)
    {
        return driipSettlementState.settlementByWalletAndNonce(wallet, nonce);
    }

    /// @notice Settle driip that is a payment
    /// @param payment The payment to be settled
    /// @param standard The standard of the token to be settled (discarded if settling ETH)
    function settlePayment(PaymentTypesLib.Payment memory payment, string memory standard)
    public
    {
        // Settle payment
        _settlePayment(msg.sender, payment, standard);

        // Emit event
        emit SettlePaymentEvent(msg.sender, payment, standard);
    }

    /// @notice Settle driip that is a payment
    /// @param wallet The wallet whose side of the payment is to be settled
    /// @param payment The payment to be settled
    /// @param standard The standard of the token to be settled (discarded if settling ETH)
    function settlePaymentByProxy(address wallet, PaymentTypesLib.Payment memory payment, string memory standard)
    public
    onlyOperator
    {
        // Settle payment for wallet
        _settlePayment(wallet, payment, standard);

        // Emit event
        emit SettlePaymentByProxyEvent(msg.sender, wallet, payment, standard);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _settlePayment(address wallet, PaymentTypesLib.Payment memory payment, string memory standard)
    private
    onlySealedPayment(payment)
    onlyPaymentParty(payment, wallet)
    {
        require(!fraudChallenge.isFraudulentPaymentHash(payment.seals.operator.hash), "Payment deemed fraudulent [DriipSettlementByPayment.sol:186]");
        require(!communityVote.isDoubleSpenderWallet(wallet), "Wallet deemed double spender [DriipSettlementByPayment.sol:187]");

        // Require that wallet is not locked
        require(!walletLocker.isLocked(wallet), "Wallet found locked [DriipSettlementByPayment.sol:190]");

        // Require that the wallet's current driip settlement challenge proposal is defined wrt this payment
        require(payment.seals.operator.hash == driipSettlementChallengeState.proposalChallengedHash(
            wallet, payment.currency
        ), "Payment not challenged [DriipSettlementByPayment.sol:193]");

        // Extract properties depending on settlement role
        (
        DriipSettlementTypesLib.SettlementRole settlementRole, uint256 walletNonce,
        NahmiiTypesLib.OriginFigure[] memory totalFees, int256 currentBalance
        ) = _getRoleProperties(payment, wallet);

        // Require that driip settlement challenge proposal has been initiated
        require(driipSettlementChallengeState.hasProposal(wallet, walletNonce, payment.currency), "No proposal found [DriipSettlementByPayment.sol:204]");

        // Require that driip settlement challenge proposal has not been terminated already
        require(!driipSettlementChallengeState.hasProposalTerminated(wallet, payment.currency), "Proposal found terminated [DriipSettlementByPayment.sol:207]");

        // Require that driip settlement challenge proposal has expired
        require(driipSettlementChallengeState.hasProposalExpired(wallet, payment.currency), "Proposal found not expired [DriipSettlementByPayment.sol:210]");

        // Require that driip settlement challenge proposal qualified
        require(SettlementChallengeTypesLib.Status.Qualified == driipSettlementChallengeState.proposalStatus(
            wallet, payment.currency
        ), "Proposal found not qualified [DriipSettlementByPayment.sol:213]");

        // Require that operational mode is normal and data is available
        require(configuration.isOperationalModeNormal(), "Not normal operational mode [DriipSettlementByPayment.sol:218]");
        require(communityVote.isDataAvailable(), "Data not available [DriipSettlementByPayment.sol:219]");

        // Init settlement, i.e. create one if no such settlement exists for the double pair of wallets and nonces
        driipSettlementState.initSettlement(
            PaymentTypesLib.PAYMENT_KIND(), payment.seals.operator.hash,
            payment.sender.wallet, payment.sender.nonce,
            payment.recipient.wallet, payment.recipient.nonce
        );

        // If exists settlement of nonce then require that wallet has not already settled
        require(!driipSettlementState.isSettlementPartyDone(
            wallet, walletNonce, settlementRole
        ), "Settlement party already done [DriipSettlementByPayment.sol:229]");

        // Set address of origin or target to prevent the same settlement from being resettled by this wallet
        driipSettlementState.completeSettlementParty(
            wallet, walletNonce, settlementRole, true
        );

        // If wallet has previously settled balance of the concerned currency with higher wallet nonce, then don't
        // settle balance again
        if (driipSettlementState.maxNonceByWalletAndCurrency(wallet, payment.currency) < walletNonce) {
            // Update settled nonce of wallet and currency
            driipSettlementState.setMaxNonceByWalletAndCurrency(wallet, payment.currency, walletNonce);

            // Update settled balance
            clientFund.updateSettledBalance(
                wallet, currentBalance, payment.currency.ct, payment.currency.id, standard, payment.blockNumber
            );

            // Stage (stage function assures positive amount only)
            clientFund.stage(
                wallet, driipSettlementChallengeState.proposalStageAmount(wallet, payment.currency),
                payment.currency.ct, payment.currency.id, standard
            );
        }

        // Stage fees to revenue fund
        if (address(0) != address(revenueFund))
            _stageFees(wallet, totalFees, revenueFund, walletNonce, standard);

        // Remove driip settlement challenge proposal
        driipSettlementChallengeState.terminateProposal(wallet, payment.currency, false);
    }

    function _getRoleProperties(PaymentTypesLib.Payment memory payment, address wallet)
    private
    view
    returns (
        DriipSettlementTypesLib.SettlementRole settlementRole, uint256 walletNonce,
        NahmiiTypesLib.OriginFigure[] memory totalFees, int256 currentBalance
    )
    {
        if (validator.isPaymentSender(payment, wallet)) {
            settlementRole = DriipSettlementTypesLib.SettlementRole.Origin;
            walletNonce = payment.sender.nonce;
            totalFees = payment.sender.fees.total;
            currentBalance = payment.sender.balances.current;

        } else {
            settlementRole = DriipSettlementTypesLib.SettlementRole.Target;
            walletNonce = payment.recipient.nonce;
            totalFees = payment.recipient.fees.total;
            currentBalance = payment.recipient.balances.current;
        }
    }

    function _stageFees(address wallet, NahmiiTypesLib.OriginFigure[] memory fees,
        Beneficiary protocolBeneficiary, uint256 nonce, string memory standard)
    private
    {
        // For each origin figure...
        for (uint256 i = 0; i < fees.length; i++) {
            // Based on originId determine the fee beneficiary
            Beneficiary beneficiary;
            if (0 == fees[i].originId)
                beneficiary = protocolBeneficiary;
            else if (
                0 < partnerBenefactor.registeredBeneficiariesCount() &&
                fees[i].originId <= partnerBenefactor.registeredBeneficiariesCount()
            )
                beneficiary = partnerBenefactor.beneficiaries(fees[i].originId - 1);

            // Continue if there is no beneficiary corresponding to the origin ID
            if (address(0) == address(beneficiary))
                continue;

            // Define destination from origin ID
            address destination = address(fees[i].originId);

            if (driipSettlementState.totalFee(wallet, beneficiary, destination, fees[i].figure.currency).nonce < nonce) {
                // Get the amount previously staged
                int256 deltaAmount = fees[i].figure.amount - driipSettlementState.totalFee(wallet, beneficiary, destination, fees[i].figure.currency).amount;

                // Update fee total
                driipSettlementState.setTotalFee(wallet, beneficiary, destination, fees[i].figure.currency, MonetaryTypesLib.NoncedAmount(nonce, fees[i].figure.amount));

                // Stage to beneficiary
                clientFund.transferToBeneficiary(
                    wallet, beneficiary, deltaAmount, fees[i].figure.currency.ct, fees[i].figure.currency.id, standard
                );

                // Emit event
                emit StageFeesEvent(
                    wallet, deltaAmount, fees[i].figure.amount, fees[i].figure.currency.ct, fees[i].figure.currency.id
                );
            }
        }
    }
}