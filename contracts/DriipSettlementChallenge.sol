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
import {Validatable} from "./Validatable.sol";
import {Challenge} from "./Challenge.sol";
import {DriipStorable} from "./DriipStorable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {DriipSettlementDispute} from "./DriipSettlementDispute.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";
import {DriipSettlementTypes} from "./DriipSettlementTypes.sol";

/**
@title DriipSettlementChallenge
@notice Where driip settlements are challenged
*/
contract DriipSettlementChallenge is Ownable, Challenge, DriipStorable, Validatable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementDispute public driipSettlementDispute;

    mapping(address => DriipSettlementTypes.Challenge) public walletChallengeMap;

    mapping(address => NahmiiTypes.Trade[]) public walletChallengedTradesMap;
    mapping(address => NahmiiTypes.Payment[]) public walletChallengedPaymentsMap;

    NahmiiTypes.Order[] public challengeCandidateOrders;
    NahmiiTypes.Trade[] public challengeCandidateTrades;
    NahmiiTypes.Payment[] public challengeCandidatePayments;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeDriipSettlementDisputeEvent(DriipSettlementDispute oldDriipSettlementDispute, DriipSettlementDispute newDriipSettlementDispute);
    event StartChallengeFromTradeEvent(NahmiiTypes.Trade trade, address wallet);
    event StartChallengeFromPaymentEvent(NahmiiTypes.Payment payment, address wallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the driip settlement dispute contract
    /// @param newDriipSettlementDispute The (address of) DriipSettlementDispute contract instance
    function changeDriipSettlementDispute(DriipSettlementDispute newDriipSettlementDispute)
    public
    onlyDeployer
    notNullAddress(newDriipSettlementDispute)
    {
        DriipSettlementDispute oldDriipSettlementDispute = driipSettlementDispute;
        driipSettlementDispute = newDriipSettlementDispute;
        emit ChangeDriipSettlementDisputeEvent(oldDriipSettlementDispute, driipSettlementDispute);
    }

    /// @notice Get the number of current and past driip settlement challenges from trade for given wallet
    /// @param wallet The wallet for which to return count
    /// @return The count of driip settlement challenges from trade
    function walletChallengedTradesCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletChallengedTradesMap[wallet].length;
    }

    /// @notice Get the number of current and past driip settlement challenges from payment for given wallet
    /// @param wallet The wallet for which to return count
    /// @return The count of driip settlement challenges from payment
    function walletChallengedPaymentsCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletChallengedPaymentsMap[wallet].length;
    }

    /// @notice Get the challenge candidate order at the given index
    /// @param index The index of challenge order candidate
    /// @return The challenge candidate order
    function challengeCandidateOrder(uint256 index)
    public
    view
    returns (NahmiiTypes.Order)
    {
        return challengeCandidateOrders[index];
    }

    /// @notice Start driip settlement challenge on driip of trade type
    /// @param trade The challenged driip
    /// @param wallet The relevant driip party
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTrade(NahmiiTypes.Trade trade, address wallet, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    public
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(configuration != address(0));
        require(intendedStageAmount.isPositiveInt256());
        require(conjugateStageAmount.isPositiveInt256());

        if (msg.sender != deployer)
            wallet = msg.sender;

        require(isDeployer() || validator.isTradeParty(trade, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        (int256 intendedBalanceAmount, int256 conjugateBalanceAmount) =
        (validator.isTradeBuyer(trade, wallet) ?
        (trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current) :
        (trade.seller.balances.intended.current, trade.seller.balances.conjugate.current));

        require(intendedBalanceAmount >= intendedStageAmount);
        require(conjugateBalanceAmount >= conjugateStageAmount);

        pushMemoryTradeToStorageArray(trade, walletChallengedTradesMap[wallet]);

        DriipSettlementTypes.Challenge memory challenge;
        challenge.nonce = trade.nonce;
        challenge.timeout = block.timestamp.add(configuration.settlementChallengeTimeout());
        challenge.status = DriipSettlementTypes.ChallengeStatus.Qualified;
        //        challenge.driipOperatorHash = trade.seal.hash;
        challenge.driipType = NahmiiTypes.DriipType.Trade;
        challenge.driipIndex = walletChallengedTradesMap[wallet].length.sub(1);
        challenge.intendedStage = MonetaryTypes.Figure(intendedStageAmount, trade.currencies.intended);
        challenge.conjugateStage = MonetaryTypes.Figure(conjugateStageAmount, trade.currencies.conjugate);
        challenge.intendedTargetBalance = DriipSettlementTypes.OptionalFigure(MonetaryTypes.Figure(intendedBalanceAmount.sub(intendedStageAmount), trade.currencies.intended), true);
        challenge.conjugateTargetBalance = DriipSettlementTypes.OptionalFigure(MonetaryTypes.Figure(conjugateBalanceAmount.sub(conjugateStageAmount), trade.currencies.conjugate), true);

        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromTradeEvent(trade, wallet);
    }

    /// @notice Start driip settlement challenge on driip of payment type
    /// @param payment The challenged driip
    /// @param wallet The relevant driip party
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPayment(NahmiiTypes.Payment payment, address wallet, int256 stageAmount)
    public
    validatorInitialized
    onlySealedPayment(payment)
    {
        require(configuration != address(0));
        require(stageAmount.isPositiveInt256());

        if (msg.sender != deployer)
            wallet = msg.sender;

        require(isDeployer() || validator.isPaymentParty(payment, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce || block.timestamp >= walletChallengeMap[wallet].timeout
        );

        int256 balanceAmount = (validator.isPaymentParty(payment, wallet) ?
        payment.sender.balances.current :
        payment.recipient.balances.current);

        require(balanceAmount >= stageAmount);

        pushMemoryPaymentToStorageArray(payment, walletChallengedPaymentsMap[wallet]);

        DriipSettlementTypes.Challenge memory challenge;
        challenge.nonce = payment.nonce;
        challenge.timeout = block.timestamp.add(configuration.settlementChallengeTimeout());
        challenge.status = DriipSettlementTypes.ChallengeStatus.Qualified;
        //        challenge.driipOperatorHash = payment.seals.exchange.hash;
        challenge.driipType = NahmiiTypes.DriipType.Payment;
        challenge.driipIndex = walletChallengedPaymentsMap[wallet].length.sub(1);
        challenge.intendedStage = MonetaryTypes.Figure(stageAmount, payment.currency);
        challenge.intendedTargetBalance = DriipSettlementTypes.OptionalFigure(MonetaryTypes.Figure(balanceAmount.sub(stageAmount), payment.currency), true);

        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromPaymentEvent(payment, wallet);
    }

    /// @notice Get driip settlement challenge phase of given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge phase and nonce
    function challengePhase(address wallet) public view returns (NahmiiTypes.ChallengePhase, uint) {
        if (msg.sender != deployer)
            wallet = msg.sender;
        if (0 == walletChallengeMap[wallet].nonce)
            return (NahmiiTypes.ChallengePhase.Closed, 0);
        else if (block.timestamp < walletChallengeMap[wallet].timeout)
            return (NahmiiTypes.ChallengePhase.Dispute, walletChallengeMap[wallet].nonce);
        else
            return (NahmiiTypes.ChallengePhase.Closed, walletChallengeMap[wallet].nonce);
    }

    /// @notice Get the challenge nonce of the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge nonce
    function challengeNonce(address wallet)
    public
    view
    returns (uint256)
    {
        return walletChallengeMap[wallet].nonce;
    }

    /// @notice Get the challenge status of the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge status
    function challengeStatus(address wallet)
    public
    view
    returns (DriipSettlementTypes.ChallengeStatus)
    {
        return walletChallengeMap[wallet].status;
    }

    /// @notice Get the intended stage, i.e. the amount of intended currency that is suggested staged, of
    /// the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge intended stage
    function challengeIntendedStage(address wallet)
    public
    view
    returns (MonetaryTypes.Figure)
    {
        return walletChallengeMap[wallet].intendedStage;
    }

    /// @notice Get the conjugate stage, i.e. the amount of conjugate currency that is suggested staged, of
    /// the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge conjugate stage
    function challengeConjugateStage(address wallet)
    public
    view
    returns (MonetaryTypes.Figure)
    {
        return walletChallengeMap[wallet].conjugateStage;
    }

    /// @notice Get the challenger of the given wallet's challenge
    /// @param wallet The concerned wallet
    /// @return The challenger of the challenge
    function challengeChallenger(address wallet)
    public
    view
    returns (address)
    {
        return walletChallengeMap[wallet].challenger;
    }

    /// @notice Challenge the driip settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    function challengeByOrder(NahmiiTypes.Order order)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByOrder(order, msg.sender);
    }

    /// @notice Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(NahmiiTypes.Order order, NahmiiTypes.Trade trade)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.unchallengeOrderCandidateByTrade(order, trade, msg.sender);
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    function challengeByTrade(NahmiiTypes.Trade trade, address wallet)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByTrade(trade, wallet, msg.sender);
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    function challengeByPayment(NahmiiTypes.Payment payment, address wallet)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByPayment(payment, wallet, msg.sender);
    }

    /// @notice Get the challenge of the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge of the wallet
    function walletChallenge(address wallet)
    public
    view
    returns (DriipSettlementTypes.Challenge)
    {
        return walletChallengeMap[wallet];
    }

    /// @notice Set the challenge of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param challenge The challenge to be set
    function setWalletChallenge(address wallet, DriipSettlementTypes.Challenge challenge)
    public
    onlyDriipSettlementDispute
    {
        walletChallengeMap[wallet] = challenge;
    }

    /// @notice Reset the challenge of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    function resetWalletChallenge(address wallet)
    public
    onlyDriipSettlementDispute
    {
        walletChallengeMap[wallet].status = DriipSettlementTypes.ChallengeStatus.Qualified;
        walletChallengeMap[wallet].candidateType = DriipSettlementTypes.ChallengeCandidateType.None;
        walletChallengeMap[wallet].candidateIndex = 0;
        walletChallengeMap[wallet].challenger = address(0);
    }

    /// @notice Push to store the given challenge candidate order
    /// @dev This function can only be called by this contract's dispute instance
    /// @param order The challenge candidate order to push
    function pushChallengeCandidateOrder(NahmiiTypes.Order order)
    public
    onlyDriipSettlementDispute
    {
        challengeCandidateOrders.push(order);
    }

    /// @notice Get the count of challenge candidate orders
    /// @return The count of challenge candidate orders
    function challengeCandidateOrdersCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidateOrders.length;
    }

    /// @notice Push to store the given challenge candidate trade
    /// @dev This function can only be called by this contract's dispute instance
    /// @param trade The challenge candidate trade to push
    function pushChallengeCandidateTrade(NahmiiTypes.Trade trade)
    public
    onlyDriipSettlementDispute
    {
        pushMemoryTradeToStorageArray(trade, challengeCandidateTrades);
    }

    /// @notice Get the count of challenge candidate trades
    /// @return The count of challenge candidate trades
    function challengeCandidateTradesCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidateTrades.length;
    }

    /// @notice Push to store the given challenge candidate payment
    /// @dev This function can only be called by this contract's dispute instance
    /// @param payment The challenge candidate payment to push
    function pushChallengeCandidatePayment(NahmiiTypes.Payment payment)
    public
    onlyDriipSettlementDispute
    {
        pushMemoryPaymentToStorageArray(payment, challengeCandidatePayments);
    }

    /// @notice Get the count of challenge candidate payments
    /// @return The count of challenge candidate payments
    function challengeCandidatePaymentsCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidatePayments.length;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyDriipSettlementDispute() {
        require(msg.sender == address(driipSettlementDispute));
        _;
    }
}
