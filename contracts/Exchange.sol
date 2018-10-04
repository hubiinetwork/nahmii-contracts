/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {AccessorManageable} from "./AccessorManageable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {DriipSettlementChallenge} from "./DriipSettlementChallenge.sol";
import {FraudChallenge} from "./FraudChallenge.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {StriimTypes} from "./StriimTypes.sol";
import {DriipSettlementTypes} from "./DriipSettlementTypes.sol";

/**
@title Exchange
@notice The orchestrator of driip settlements
*/
contract Exchange is Ownable, AccessorManageable, Configurable, Validatable, ClientFundable, CommunityVotable {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public maxDriipNonce;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    FraudChallenge public fraudChallenge;
    DriipSettlementChallenge public driipSettlementChallenge;
    RevenueFund public tradesRevenueFund;
    RevenueFund public paymentsRevenueFund;

    StriimTypes.Settlement[] public settlements;
    mapping(uint256 => uint256) public nonceSettlementIndex;
    mapping(address => uint256[]) public walletSettlementIndices;
    mapping(address => mapping(uint256 => uint256)) public walletNonceSettlementIndex;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxDriipNonce;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyTradeFeeNonce;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyPaymentFeeNonce;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettleDriipAsTradeEvent(StriimTypes.Trade trade, address wallet,
        DriipSettlementTypes.ChallengeStatus challengeStatus);
    event SettleDriipAsPaymentEvent(StriimTypes.Payment payment, address wallet,
        DriipSettlementTypes.ChallengeStatus challengeStatus);
    event ChangeFraudChallengeEvent(FraudChallenge oldFraudChallenge, FraudChallenge newFraudChallenge);
    event ChangeDriipSettlementChallengeEvent(DriipSettlementChallenge oldDriipSettlementChallenge,
        DriipSettlementChallenge newDriipSettlementChallenge);
    event ChangeTradesRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
    event ChangePaymentsRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address accessorManager) Ownable(owner) AccessorManageable(accessorManager) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the fraud challenge contract
    /// @param newFraudChallenge The (address of) FraudChallenge contract instance
    function changeFraudChallenge(FraudChallenge newFraudChallenge) public
        onlyDeployer 
        notNullAddress(newFraudChallenge)
    {
        FraudChallenge oldFraudChallenge = fraudChallenge;
        fraudChallenge = newFraudChallenge;
        emit ChangeFraudChallengeEvent(oldFraudChallenge, fraudChallenge);
    }

    /// @notice Change the driip settlement challenge contract
    /// @param newDriipSettlementChallenge The (address of) DriipSettlementChallenge contract instance
    function changeDriipSettlementChallenge(DriipSettlementChallenge newDriipSettlementChallenge) public
        onlyDeployer
        notNullAddress(newDriipSettlementChallenge)
    {
        DriipSettlementChallenge oldDriipSettlementChallenge = driipSettlementChallenge;
        driipSettlementChallenge = newDriipSettlementChallenge;
        emit ChangeDriipSettlementChallengeEvent(oldDriipSettlementChallenge, driipSettlementChallenge);
    }

    /// @notice Change the trades revenue fund contract
    /// @param newTradesRevenueFund The (address of) trades RevenueFund contract instance
    function changeTradesRevenueFund(RevenueFund newTradesRevenueFund) public
        onlyDeployer
        notNullAddress(newTradesRevenueFund)
    {
        RevenueFund oldTradesRevenueFund = tradesRevenueFund;
        tradesRevenueFund = newTradesRevenueFund;
        emit ChangeTradesRevenueFundEvent(oldTradesRevenueFund, tradesRevenueFund);
    }

    /// @notice Change the payments revenue fund contract
    /// @param newPaymentsRevenueFund The (address of) payments RevenueFund contract instance
    function changePaymentsRevenueFund(RevenueFund newPaymentsRevenueFund) public
        onlyDeployer
        notNullAddress(newPaymentsRevenueFund)
    {
        RevenueFund oldPaymentsRevenueFund = paymentsRevenueFund;
        paymentsRevenueFund = newPaymentsRevenueFund;
        emit ChangePaymentsRevenueFundEvent(oldPaymentsRevenueFund, paymentsRevenueFund);
    }

    /// @notice Get the seized status of given wallet
    /// @return true if wallet is seized, false otherwise
    function isSeizedWallet(address wallet) public view returns (bool) {
        return seizedWalletsMap[wallet];
    }

    /// @notice Get the number of wallets whose funds have be seized
    /// @return Number of wallets
    function seizedWalletsCount() public view returns (uint256) {
        return seizedWallets.length;
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
    function settlementByNonce(uint256 nonce) public view returns (StriimTypes.Settlement) {
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
    function settlementByWalletAndIndex(address wallet, uint256 index) public view returns (StriimTypes.Settlement) {
        require(walletSettlementIndices[wallet].length > index);
        return settlements[walletSettlementIndices[wallet][index] - 1];
    }

    /// @notice Get settlement of given wallet and (wallet) nonce
    /// @param wallet The address for which to return settlement
    /// @param nonce The wallet's nonce
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndNonce(address wallet, uint256 nonce) public view returns (StriimTypes.Settlement) {
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

    /// @notice Settle driip that is a trade
    /// @param trade The trade to be settled
    /// @param wallet The wallet whose side of the trade is to be settled
    function settleDriipAsTrade(StriimTypes.Trade trade, address wallet)
    public
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(fraudChallenge != address(0));
        require(communityVote != address(0));
        require(driipSettlementChallenge != address(0));
        require(configuration != address(0));
        require(clientFund != address(0));

        if (msg.sender != deployer)
            wallet = msg.sender;

        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));
        require(StriimTypes.isTradeParty(trade, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        // Require that the wallet's current driip settlement challenge is wrt this trade
        require(driipSettlementChallenge.getChallengeNonce(wallet) == trade.nonce);

        // The current driip settlement challenge qualified for settlement
        if (driipSettlementChallenge.getChallengeStatus(wallet) == DriipSettlementTypes.ChallengeStatus.Qualified) {

            require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (trade.nonce < maxDriipNonce));

            // Get settlement
            // If no settlement of nonce then create one
            StriimTypes.Settlement storage settlement = hasSettlementByNonce(trade.nonce) ?
            getSettlement(trade.nonce, StriimTypes.DriipType.Trade) :
            createSettlement(trade.nonce, StriimTypes.DriipType.Trade,
                trade.seller.nonce, trade.seller.wallet, trade.buyer.nonce, trade.buyer.wallet);

            // Get settlement role
            DriipSettlementTypes.SettlementRole settlementRole = getSettlementRoleFromTrade(trade, wallet);

            // (If exists settlement of nonce then) Require that wallet has not already settled
            require(
                (DriipSettlementTypes.SettlementRole.Origin == settlementRole && !settlement.origin.done) ||
                (DriipSettlementTypes.SettlementRole.Target == settlementRole && !settlement.target.done)
            );

            // Set address of origin or target to prevent the same settlement from being resettled by this wallet
            if (DriipSettlementTypes.SettlementRole.Origin == settlementRole)
                settlement.origin.done = true;
            else
                settlement.target.done = true;

            StriimTypes.TradeParty memory party = StriimTypes.isTradeBuyer(trade, wallet) ? trade.buyer : trade.seller;

            // If wallet has previously settled balances with higher driip nonce with any of the concerned currencies then don't settle currency balances
            if (walletCurrencyMaxDriipNonce[wallet][trade.currencies.intended.ct][trade.currencies.intended.id] < trade.nonce) {
                walletCurrencyMaxDriipNonce[wallet][trade.currencies.intended.ct][trade.currencies.intended.id] = trade.nonce;
                clientFund.updateSettledBalance(wallet, party.balances.intended.current, trade.currencies.intended.ct, trade.currencies.intended.id);

                DriipSettlementTypes.OptionalFigure memory intendedStage = driipSettlementChallenge.getChallengeIntendedStage(wallet);
                if (intendedStage.set)
                    clientFund.stage(wallet, intendedStage.amount, intendedStage.currency.ct, intendedStage.currency.id);
            }

            if (walletCurrencyMaxDriipNonce[wallet][trade.currencies.conjugate.ct][trade.currencies.conjugate.id] < trade.nonce) {
                walletCurrencyMaxDriipNonce[wallet][trade.currencies.conjugate.ct][trade.currencies.conjugate.id] = trade.nonce;
                clientFund.updateSettledBalance(wallet, party.balances.conjugate.current, trade.currencies.conjugate.ct, trade.currencies.conjugate.id);

                DriipSettlementTypes.OptionalFigure memory conjugateStage = driipSettlementChallenge.getChallengeConjugateStage(wallet);
                if (conjugateStage.set)
                    clientFund.stage(wallet, conjugateStage.amount, conjugateStage.currency.ct, conjugateStage.currency.id);
            }

            // TODO Complete staging of net fees
            // If wallet has previously settled fees with higher driip nonce then don't settle fees
            //            if (walletCurrencyTradeFeeNonce[wallet][trade.currencies.intended.ct][trade.currencies.intended.id] < trade.nonce) {
            //                walletCurrencyTradeFeeNonce[wallet][trade.currencies.intended.ct][trade.currencies.intended.id] = trade.nonce;
            //                stageFiguresToBeneficiary(wallet, party.fees.net, tradesRevenueFund);
            //            }

            if (trade.nonce > maxDriipNonce)
                maxDriipNonce = trade.nonce;

        }
        // The current driip settlement challenge disqualified for settlement
        else if (driipSettlementChallenge.getChallengeStatus(wallet) == DriipSettlementTypes.ChallengeStatus.Disqualified) {
            addToSeizedWallets(wallet);
            clientFund.seizeAllBalances(wallet, driipSettlementChallenge.getChallengeChallenger(wallet));
        }

        emit SettleDriipAsTradeEvent(trade, wallet, driipSettlementChallenge.getChallengeStatus(wallet));
    }

    /// @notice Settle driip that is a payment
    /// @param payment The payment to be settled
    /// @param wallet The wallet whose side of the payment is to be settled
    function settleDriipAsPayment(StriimTypes.Payment payment, address wallet)
    public
    validatorInitialized
    onlySealedPayment(payment)
    {
        require(fraudChallenge != address(0));
        require(communityVote != address(0));
        require(driipSettlementChallenge != address(0));
        require(configuration != address(0));
        require(clientFund != address(0));

        if (msg.sender != deployer)
            wallet = msg.sender;

        require(!fraudChallenge.isFraudulentPaymentExchangeHash(payment.seals.exchange.hash));
        require(StriimTypes.isPaymentParty(payment, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        // Require that the wallet's current driip settlement challenge is wrt this payment
        require(driipSettlementChallenge.getChallengeNonce(wallet) == payment.nonce);

        // The current driip settlement challenge qualified for settlement
        if (driipSettlementChallenge.getChallengeStatus(wallet) == DriipSettlementTypes.ChallengeStatus.Qualified) {

            require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (payment.nonce < maxDriipNonce));

            // Get settlement
            // If no settlement of nonce then create one
            StriimTypes.Settlement storage settlement = hasSettlementByNonce(payment.nonce) ?
            getSettlement(payment.nonce, StriimTypes.DriipType.Payment) :
            createSettlement(payment.nonce, StriimTypes.DriipType.Payment,
                payment.sender.nonce, payment.sender.wallet, payment.recipient.nonce, payment.recipient.wallet);

            // Get settlement role
            DriipSettlementTypes.SettlementRole settlementRole = getSettlementRoleFromPayment(payment, wallet);

            // (If exists settlement of nonce then) Require that wallet has not already settled
            require(
                (DriipSettlementTypes.SettlementRole.Origin == settlementRole && !settlement.origin.done) ||
                (DriipSettlementTypes.SettlementRole.Target == settlementRole && !settlement.target.done)
            );

            // Set address of origin or target to prevent the same settlement from being resettled by this wallet
            if (DriipSettlementTypes.SettlementRole.Origin == settlementRole)
                settlement.origin.done = true;
            else
                settlement.target.done = true;

            //            MonetaryTypes.Figure[] memory netFees;
            int256 currentBalance;
            if (StriimTypes.isPaymentSender(payment, wallet)) {
                //                netFees = payment.sender.fees.net;
                currentBalance = payment.sender.balances.current;
            } else {
                //                netFees = payment.recipient.fees.net;
                currentBalance = payment.recipient.balances.current;
            }

            // If wallet has previously settled balance with higher driip nonce with the currency, then don't
            // settle balance
            if (walletCurrencyMaxDriipNonce[wallet][payment.currency.ct][payment.currency.id] < payment.nonce) {
                walletCurrencyMaxDriipNonce[wallet][payment.currency.ct][payment.currency.id] = payment.nonce;
                clientFund.updateSettledBalance(wallet, currentBalance, payment.currency.ct, payment.currency.id);

                DriipSettlementTypes.OptionalFigure memory intendedStage = driipSettlementChallenge.getChallengeIntendedStage(wallet);
                if (intendedStage.set)
                    clientFund.stage(wallet, intendedStage.amount, intendedStage.currency.ct, intendedStage.currency.id);
            }

            // TODO Complete staging of net fees
            // If wallet has previously settled fees with higher driip nonce then don't settle fees
            //            if (walletCurrencyPaymentFeeNonce[wallet][payment.currency.ct][payment.currency.id] < payment.nonce) {
            //                walletCurrencyPaymentFeeNonce[wallet][payment.currency.ct][payment.currency.id] = payment.nonce;
            //                stageFiguresToBeneficiary(wallet, netFees, paymentsRevenueFund);
            //            }

            if (payment.nonce > maxDriipNonce)
                maxDriipNonce = payment.nonce;

        }
        // The current driip settlement challenge disqualified for settlement
        else if (driipSettlementChallenge.getChallengeStatus(wallet) == DriipSettlementTypes.ChallengeStatus.Disqualified) {
            addToSeizedWallets(wallet);
            clientFund.seizeAllBalances(wallet, driipSettlementChallenge.getChallengeChallenger(wallet));
        }

        emit SettleDriipAsPaymentEvent(payment, wallet, driipSettlementChallenge.getChallengeStatus(wallet));
    }

    function getSettlementRoleFromTrade(StriimTypes.Trade trade, address wallet)
    private
    pure
    returns (DriipSettlementTypes.SettlementRole)
    {
        return (wallet == trade.seller.wallet ?
        DriipSettlementTypes.SettlementRole.Origin :
        DriipSettlementTypes.SettlementRole.Target);
    }

    function getSettlementRoleFromPayment(StriimTypes.Payment payment, address wallet)
    private
    pure
    returns (DriipSettlementTypes.SettlementRole)
    {
        return (wallet == payment.sender.wallet ?
        DriipSettlementTypes.SettlementRole.Origin :
        DriipSettlementTypes.SettlementRole.Target);
    }

    function getSettlement(uint256 nonce, StriimTypes.DriipType driipType)
    private
    view
    returns (StriimTypes.Settlement storage)
    {
        uint256 index = nonceSettlementIndex[nonce];
        StriimTypes.Settlement storage settlement = settlements[index - 1];
        require(driipType == settlement.driipType);
        return settlement;
    }

    function createSettlement(uint256 nonce, StriimTypes.DriipType driipType,
        uint256 originNonce, address originWallet, uint256 targetNonce, address targetWallet)
    private
    returns (StriimTypes.Settlement storage)
    {
        StriimTypes.Settlement memory settlement;
        settlement.nonce = nonce;
        settlement.driipType = driipType;
        settlement.origin = StriimTypes.SettlementParty(originNonce, originWallet, false);
        settlement.target = StriimTypes.SettlementParty(targetNonce, targetWallet, false);

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

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
        }
    }

    function stageFiguresToBeneficiary(address wallet, MonetaryTypes.Figure[] figures,
        Beneficiary beneficiary)
    private
    {
        for (uint256 i = 0; i < figures.length; i++) {
            clientFund.stageToBeneficiaryUntargeted(wallet, beneficiary, figures[i].amount,
                figures[i].currency.ct, figures[i].currency.id);
        }
    }
}