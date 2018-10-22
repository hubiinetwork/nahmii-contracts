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
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {NullSettlementChallenge} from "./NullSettlementChallenge.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";
import {SettlementTypes} from "./SettlementTypes.sol";

/**
@title NullSettlement
@notice Where null settlement are finalized
*/
contract NullSettlement is Ownable, Configurable, Validatable, ClientFundable, CommunityVotable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallenge public nullSettlementChallenge;

    //    uint256 public maxDriipNonce;
    //
    //    address[] public seizedWallets;
    //    mapping(address => bool) public seizedWalletsMap;
    //
    //    RevenueFund public tradesRevenueFund;
    //    RevenueFund public paymentsRevenueFund;
    //
    //    NahmiiTypes.Settlement[] public settlements;
    //    mapping(uint256 => uint256) public nonceSettlementIndex;
    //    mapping(address => uint256[]) public walletSettlementIndices;
    //    mapping(address => mapping(uint256 => uint256)) public walletNonceSettlementIndex;
    //    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxDriipNonce;
    //
    //    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyFeeNonce;
    //    mapping(address => mapping(address => mapping(uint256 => int256))) public walletCurrencyFeeCharged;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettleNullEvent(NahmiiTypes.Payment payment, address wallet,
        SettlementTypes.ChallengeStatus challengeStatus);
    event ChangeNullSettlementChallengeEvent(NullSettlementChallenge oldNullSettlementChallenge,
        NullSettlementChallenge newNullSettlementChallenge);

    //    //
    //    // Constructor
    //    // -----------------------------------------------------------------------------------------------------------------
    //    constructor(address owner) Ownable(owner) public {
    //    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the driip settlement challenge contract
    /// @param newNullSettlementChallenge The (address of) NullSettlementChallenge contract instance
    function changeNullSettlementChallenge(NullSettlementChallenge newNullSettlementChallenge) public
    onlyDeployer
    notNullAddress(newNullSettlementChallenge)
    {
        NullSettlementChallenge oldNullSettlementChallenge = nullSettlementChallenge;
        nullSettlementChallenge = newNullSettlementChallenge;
        emit ChangeNullSettlementChallengeEvent(oldNullSettlementChallenge, nullSettlementChallenge);
    }

    //    /// @notice Change the trades revenue fund contract
    //    /// @param newTradesRevenueFund The (address of) trades RevenueFund contract instance
    //    function changeTradesRevenueFund(RevenueFund newTradesRevenueFund) public
    //    onlyDeployer
    //    notNullAddress(newTradesRevenueFund)
    //    {
    //        RevenueFund oldTradesRevenueFund = tradesRevenueFund;
    //        tradesRevenueFund = newTradesRevenueFund;
    //        emit ChangeTradesRevenueFundEvent(oldTradesRevenueFund, tradesRevenueFund);
    //    }
    //
    //    /// @notice Change the payments revenue fund contract
    //    /// @param newPaymentsRevenueFund The (address of) payments RevenueFund contract instance
    //    function changePaymentsRevenueFund(RevenueFund newPaymentsRevenueFund) public
    //    onlyDeployer
    //    notNullAddress(newPaymentsRevenueFund)
    //    {
    //        RevenueFund oldPaymentsRevenueFund = paymentsRevenueFund;
    //        paymentsRevenueFund = newPaymentsRevenueFund;
    //        emit ChangePaymentsRevenueFundEvent(oldPaymentsRevenueFund, paymentsRevenueFund);
    //    }
    //
    //    /// @notice Get the seized status of given wallet
    //    /// @return true if wallet is seized, false otherwise
    //    function isSeizedWallet(address wallet) public view returns (bool) {
    //        return seizedWalletsMap[wallet];
    //    }
    //
    //    /// @notice Get the number of wallets whose funds have be seized
    //    /// @return Number of wallets
    //    function seizedWalletsCount() public view returns (uint256) {
    //        return seizedWallets.length;
    //    }
    //
    //    /// @notice Get the count of settlements
    //    function settlementsCount() public view returns (uint256) {
    //        return settlements.length;
    //    }
    //
    //    /// @notice Return boolean indicating whether there is already a settlement for the given (global) nonce
    //    /// @param nonce The nonce for which to check for settlement
    //    /// @return true if there exists a settlement for the provided nonce, false otherwise
    //    function hasSettlementByNonce(uint256 nonce) public view returns (bool) {
    //        return 0 < nonceSettlementIndex[nonce];
    //    }
    //
    //    /// @notice Get the settlement for the given (global) nonce
    //    /// @param nonce The nonce of the settlement
    //    /// @return settlement of the provided nonce
    //    function settlementByNonce(uint256 nonce) public view returns (NahmiiTypes.Settlement) {
    //        require(hasSettlementByNonce(nonce));
    //        return settlements[nonceSettlementIndex[nonce] - 1];
    //    }
    //
    //    /// @notice Get the count of settlements for given wallet
    //    /// @param wallet The address for which to return settlement count
    //    /// @return count of settlements for the provided wallet
    //    function settlementsCountByWallet(address wallet) public view returns (uint256) {
    //        return walletSettlementIndices[wallet].length;
    //    }
    //
    //    /// @notice Get settlement of given wallet and index
    //    /// @param wallet The address for which to return settlement
    //    /// @param index The wallet's settlement index
    //    /// @return settlement for the provided wallet and index
    //    function settlementByWalletAndIndex(address wallet, uint256 index) public view returns (NahmiiTypes.Settlement) {
    //        require(walletSettlementIndices[wallet].length > index);
    //        return settlements[walletSettlementIndices[wallet][index] - 1];
    //    }
    //
    //    /// @notice Get settlement of given wallet and (wallet) nonce
    //    /// @param wallet The address for which to return settlement
    //    /// @param nonce The wallet's nonce
    //    /// @return settlement for the provided wallet and index
    //    function settlementByWalletAndNonce(address wallet, uint256 nonce) public view returns (NahmiiTypes.Settlement) {
    //        require(0 < walletNonceSettlementIndex[wallet][nonce]);
    //        return settlements[walletNonceSettlementIndex[wallet][nonce] - 1];
    //    }
    //
    //    /// @notice Update the max driip nonce property from CommunityVote contract
    //    function updateMaxDriipNonce() public {
    //        uint256 _maxDriipNonce = communityVote.getMaxDriipNonce();
    //        if (_maxDriipNonce > 0) {
    //            maxDriipNonce = _maxDriipNonce;
    //        }
    //    }
    //
    //    /// @notice Settle null
    //    /// @param wallet The wallet whose side of the payment is to be settled
    //    function settle(address wallet)
    //    public
    //    validatorInitialized
    //    fraudChallengeInitialized
    //    communityVoteInitialized
    //    configurationInitialized
    //    clientFundInitialized
    //    {
    //        require(nullSettlementChallenge != address(0));
    //
    //        if (msg.sender != deployer)
    //            wallet = msg.sender;
    //
    //        require(!fraudChallenge.isFraudulentPaymentOperatorHash(payment.seals.exchange.hash));
    //        require(NahmiiTypes.isPaymentParty(payment, wallet));
    //        require(!communityVote.isDoubleSpenderWallet(wallet));
    //
    //        // Require that the wallet's current driip settlement challenge is wrt this payment
    //        require(nullSettlementChallenge.challengeNonce(wallet) == payment.nonce);
    //
    //        // The current driip settlement challenge qualified for settlement
    //        if (nullSettlementChallenge.challengeStatus(wallet) == NullSettlementTypes.ChallengeStatus.Qualified) {
    //
    //            require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
    //                || (payment.nonce < maxDriipNonce));
    //
    //            // Get settlement, or create one if no such settlement exists for the trade nonce
    //            NahmiiTypes.Settlement storage settlement = hasSettlementByNonce(payment.nonce) ?
    //            getSettlement(payment.nonce, NahmiiTypes.DriipType.Payment) :
    //            createSettlement(payment.nonce, NahmiiTypes.DriipType.Payment,
    //                payment.sender.nonce, payment.sender.wallet, payment.recipient.nonce, payment.recipient.wallet);
    //
    //            // Get settlement role
    //            NullSettlementTypes.SettlementRole settlementRole = getSettlementRoleFromPayment(payment, wallet);
    //
    //            // If exists settlement of nonce then require that wallet has not already settled
    //            require(
    //                (NullSettlementTypes.SettlementRole.Origin == settlementRole && !settlement.origin.done) ||
    //                (NullSettlementTypes.SettlementRole.Target == settlementRole && !settlement.target.done)
    //            );
    //
    //            // Set address of origin or target to prevent the same settlement from being resettled by this wallet
    //            if (NullSettlementTypes.SettlementRole.Origin == settlementRole)
    //                settlement.origin.done = true;
    //            else
    //                settlement.target.done = true;
    //
    //            MonetaryTypes.Figure[] memory totalFees;
    //            int256 currentBalance;
    //            if (NahmiiTypes.isPaymentSender(payment, wallet)) {
    //                totalFees = payment.sender.fees.total;
    //                currentBalance = payment.sender.balances.current;
    //            } else {
    //                totalFees = payment.recipient.fees.total;
    //                currentBalance = payment.recipient.balances.current;
    //            }
    //
    //            // If wallet has previously settled balance of the concerned currency with higher driip nonce, then don't
    //            // settle balance again
    //            if (walletCurrencyMaxDriipNonce[wallet][payment.currency.ct][payment.currency.id] < payment.nonce) {
    //                // Update settled nonce of wallet and currency
    //                walletCurrencyMaxDriipNonce[wallet][payment.currency.ct][payment.currency.id] = payment.nonce;
    //
    //                // Update settled balance
    //                clientFund.updateSettledBalance(wallet, currentBalance, payment.currency.ct, payment.currency.id);
    //
    //                // Stage
    //                MonetaryTypes.Figure memory intendedStage = nullSettlementChallenge.challengeIntendedStage(wallet);
    //                if (intendedStage.amount.isNonZeroPositiveInt256())
    //                    clientFund.stage(wallet, intendedStage.amount, intendedStage.currency.ct, intendedStage.currency.id);
    //            }
    //
    //            // Stage fees to revenue fund
    //            stageFees(wallet, totalFees, paymentsRevenueFund, payment.nonce);
    //
    //            // If payment nonce is beyond max driip nonce then update max driip nonce
    //            if (payment.nonce > maxDriipNonce)
    //                maxDriipNonce = payment.nonce;
    //        }
    //
    //        // The current driip settlement challenge disqualified for settlement
    //        else if (nullSettlementChallenge.challengeStatus(wallet) == NullSettlementTypes.ChallengeStatus.Disqualified) {
    //            // Add wallet to store of seized wallets
    //            addToSeizedWallets(wallet);
    //
    //            // Slash wallet's funds
    //            clientFund.seizeAllBalances(wallet, nullSettlementChallenge.challengeChallenger(wallet));
    //        }
    //
    //        // Emit event
    //        emit SettleNullEvent(payment, wallet, nullSettlementChallenge.challengeStatus(wallet));
    //    }
    //
    //    function getSettlementRoleFromTrade(NahmiiTypes.Trade trade, address wallet)
    //    private
    //    pure
    //    returns (NullSettlementTypes.SettlementRole)
    //    {
    //        return (wallet == trade.seller.wallet ?
    //        NullSettlementTypes.SettlementRole.Origin :
    //        NullSettlementTypes.SettlementRole.Target);
    //    }
    //
    //    function getSettlementRoleFromPayment(NahmiiTypes.Payment payment, address wallet)
    //    private
    //    pure
    //    returns (NullSettlementTypes.SettlementRole)
    //    {
    //        return (wallet == payment.sender.wallet ?
    //        NullSettlementTypes.SettlementRole.Origin :
    //        NullSettlementTypes.SettlementRole.Target);
    //    }
    //
    //    function getSettlement(uint256 nonce, NahmiiTypes.DriipType driipType)
    //    private
    //    view
    //    returns (NahmiiTypes.Settlement storage)
    //    {
    //        uint256 index = nonceSettlementIndex[nonce];
    //        NahmiiTypes.Settlement storage settlement = settlements[index - 1];
    //        require(driipType == settlement.driipType);
    //        return settlement;
    //    }
    //
    //    function createSettlement(uint256 nonce, NahmiiTypes.DriipType driipType,
    //        uint256 originNonce, address originWallet, uint256 targetNonce, address targetWallet)
    //    private
    //    returns (NahmiiTypes.Settlement storage)
    //    {
    //        NahmiiTypes.Settlement memory settlement;
    //        settlement.nonce = nonce;
    //        settlement.driipType = driipType;
    //        settlement.origin = NahmiiTypes.SettlementParty(originNonce, originWallet, false);
    //        settlement.target = NahmiiTypes.SettlementParty(targetNonce, targetWallet, false);
    //
    //        settlements.push(settlement);
    //
    //        // Index is 1 based
    //        uint256 index = settlements.length;
    //        nonceSettlementIndex[nonce] = index;
    //        walletSettlementIndices[originWallet].push(index);
    //        walletSettlementIndices[targetWallet].push(index);
    //        walletNonceSettlementIndex[originWallet][originNonce] = index;
    //        walletNonceSettlementIndex[targetWallet][targetNonce] = index;
    //
    //        return settlements[index - 1];
    //    }
    //
    //    function addToSeizedWallets(address _address) private {
    //        if (!seizedWalletsMap[_address]) {
    //            seizedWallets.push(_address);
    //            seizedWalletsMap[_address] = true;
    //        }
    //    }
    //
    //    function stageFees(address wallet, MonetaryTypes.Figure[] fees,
    //        Beneficiary beneficiary, uint256 nonce)
    //    private
    //    {
    //        // For each fee figure...
    //        for (uint256 i = 0; i < fees.length; i++) {
    //            // If wallet has previously settled fee of the concerned currency with higher driip nonce then don't settle again
    //            if (walletCurrencyFeeNonce[wallet][fees[i].currency.ct][fees[i].currency.id] < nonce) {
    //                walletCurrencyFeeNonce[wallet][fees[i].currency.ct][fees[i].currency.id] = nonce;
    //
    //                // Stage delta of fee to beneficiary
    //                clientFund.stageToBeneficiaryUntargeted(wallet, beneficiary,
    //                    fees[i].amount - walletCurrencyFeeCharged[wallet][fees[i].currency.ct][fees[i].currency.id],
    //                    fees[i].currency.ct, fees[i].currency.id);
    //
    //                // Update fee charged
    //                walletCurrencyFeeCharged[wallet][fees[i].currency.ct][fees[i].currency.id] = fees[i].amount;
    //
    //                // Emit event
    //                emit StageTotalFeeEvent(wallet,
    //                    fees[i].amount - walletCurrencyFeeCharged[wallet][fees[i].currency.ct][fees[i].currency.id],
    //                    walletCurrencyFeeCharged[wallet][fees[i].currency.ct][fees[i].currency.id],
    //                    fees[i].currency.ct, fees[i].currency.id);
    //            }
    //        }
    //    }
}