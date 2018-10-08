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
import {NahmiiChallenge} from "./NahmiiChallenge.sol";
import {SafeMathInt} from "./SafeMathInt.sol";
import {DriipSettlementDispute} from "./DriipSettlementDispute.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";
import {DriipSettlementTypes} from "./DriipSettlementTypes.sol";

/**
@title DriipSettlementChallenge
@notice Where driip settlements are challenged
*/
contract DriipSettlementChallenge is Ownable, NahmiiChallenge, Validatable {
    using SafeMathInt for int256;

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
    /// @notice Change the driip settlement challenger contract
    /// @param newDriipSettlementDispute The (address of) DriipSettlementDispute contract instance
    function changeDriipSettlementDispute(DriipSettlementDispute newDriipSettlementDispute) public
    onlyDeployer
    notNullAddress(newDriipSettlementDispute)
    {
        DriipSettlementDispute oldDriipSettlementDispute = driipSettlementDispute;
        driipSettlementDispute = newDriipSettlementDispute;
        emit ChangeDriipSettlementDisputeEvent(oldDriipSettlementDispute, driipSettlementDispute);
    }

    /// @notice Get the number of current and past driip settlement challenges from trade for given wallet
    /// @param wallet The wallet for which to return count
    function walletChallengedTradesCount(address wallet) public view returns (uint256) {
        return walletChallengedTradesMap[wallet].length;
    }

    /// @notice Get the number of current and past driip settlement challenges from payment for given wallet
    /// @param wallet The wallet for which to return count
    function walletChallengedPaymentsCount(address wallet) public view returns (uint256) {
        return walletChallengedPaymentsMap[wallet].length;
    }

    /// @notice Return the number of (challenge) candidate orders
    function challengeCandidateOrdersCount() public view returns (uint256) {
        return challengeCandidateOrders.length;
    }

    /// @notice Return the challenge candidate order at the given index
    /// @dev This acts as a double of challengeCandidateOrders() which rather then returning NahmiiTypes.Order
    /// returns (uint256, address, NahmiiTypes.OrderPlacement, NahmiiTypes.WalletExchangeSeal, uint256)
    /// @param index The index of challenge order candidate
    function getChallengeCandidateOrder(uint256 index) public view returns (NahmiiTypes.Order) {
        return challengeCandidateOrders[index];
    }

    /// @notice Return the number of (challenge) candidate trades
    function challengeCandidateTradesCount() public view returns (uint256) {
        return challengeCandidateTrades.length;
    }

    /// @notice Return the number of (challenge) candidate payments
    function challengeCandidatePaymentsCount() public view returns (uint256) {
        return challengeCandidatePayments.length;
    }

    /// @notice Start driip settlement challenge on driip of trade type
    /// @param trade The challenged driip
    /// @param wallet The relevant driip party
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTrade(NahmiiTypes.Trade trade, address wallet, int256 intendedStageAmount, int256 conjugateStageAmount)
    public
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(configuration != address(0));
        require(intendedStageAmount.isPositiveInt256());
        require(conjugateStageAmount.isPositiveInt256());

        if (msg.sender != deployer)
            wallet = msg.sender;

        require(isDeployer() || NahmiiTypes.isTradeParty(trade, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        (int256 intendedBalanceAmount, int256 conjugateBalanceAmount) =
        (NahmiiTypes.isTradeBuyer(trade, wallet) ?
        (trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current) :
        (trade.seller.balances.intended.current, trade.seller.balances.conjugate.current));

        require(intendedBalanceAmount >= intendedStageAmount);
        require(conjugateBalanceAmount >= conjugateStageAmount);

        pushMemoryTradeToStorageArray(trade, walletChallengedTradesMap[wallet]);

        DriipSettlementTypes.Challenge memory challenge;
        challenge.nonce = trade.nonce;
        challenge.timeout = block.timestamp + configuration.getDriipSettlementChallengeTimeout();
        challenge.status = DriipSettlementTypes.ChallengeStatus.Qualified;
        //        challenge.driipExchangeHash = trade.seal.hash;
        challenge.driipType = NahmiiTypes.DriipType.Trade;
        challenge.driipIndex = walletChallengedTradesMap[wallet].length - 1;
        challenge.intendedStage = MonetaryTypes.Figure(intendedStageAmount, trade.currencies.intended);
        challenge.conjugateStage = MonetaryTypes.Figure(conjugateStageAmount, trade.currencies.conjugate);
        challenge.intendedTargetBalance = DriipSettlementTypes.OptionalFigure(MonetaryTypes.Figure(intendedBalanceAmount - intendedStageAmount, trade.currencies.intended), true);
        challenge.conjugateTargetBalance = DriipSettlementTypes.OptionalFigure(MonetaryTypes.Figure(conjugateBalanceAmount - conjugateStageAmount, trade.currencies.conjugate), true);

        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromTradeEvent(trade, wallet);
    }

    /// @notice Start driip settlement challenge on driip of payment type
    /// @param payment The challenged driip
    /// @param wallet The relevant driip party
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPayment(NahmiiTypes.Payment payment, address wallet, int256 stageAmount) public
    validatorInitialized
    onlySealedPayment(payment)
    {
        require(configuration != address(0));
        require(stageAmount.isPositiveInt256());

        if (msg.sender != deployer)
            wallet = msg.sender;

        require(isDeployer() || NahmiiTypes.isPaymentParty(payment, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce || block.timestamp >= walletChallengeMap[wallet].timeout
        );

        int256 balanceAmount = (NahmiiTypes.isPaymentSender(payment, wallet) ?
        payment.sender.balances.current :
        payment.recipient.balances.current);

        require(balanceAmount >= stageAmount);

        pushMemoryPaymentToStorageArray(payment, walletChallengedPaymentsMap[wallet]);

        DriipSettlementTypes.Challenge memory challenge;
        challenge.nonce = payment.nonce;
        challenge.timeout = block.timestamp + configuration.getDriipSettlementChallengeTimeout();
        challenge.status = DriipSettlementTypes.ChallengeStatus.Qualified;
        //        challenge.driipExchangeHash = payment.seals.exchange.hash;
        challenge.driipType = NahmiiTypes.DriipType.Payment;
        challenge.driipIndex = walletChallengedPaymentsMap[wallet].length - 1;
        challenge.intendedStage = MonetaryTypes.Figure(stageAmount, payment.currency);
        challenge.intendedTargetBalance = DriipSettlementTypes.OptionalFigure(MonetaryTypes.Figure(balanceAmount - stageAmount, payment.currency), true);

        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromPaymentEvent(payment, wallet);
    }

    /// @notice Get driip settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    function getPhase(address wallet) public view returns (uint, NahmiiTypes.ChallengePhase) {
        if (msg.sender != deployer)
            wallet = msg.sender;
        if (0 == walletChallengeMap[wallet].nonce)
            return (0, NahmiiTypes.ChallengePhase.Closed);
        else if (block.timestamp < walletChallengeMap[wallet].timeout)
            return (walletChallengeMap[wallet].nonce, NahmiiTypes.ChallengePhase.Dispute);
        else
            return (walletChallengeMap[wallet].nonce, NahmiiTypes.ChallengePhase.Closed);
    }

    function getChallengeNonce(address wallet) public view returns (uint256) {
        return walletChallengeMap[wallet].nonce;
    }

    function getChallengeStatus(address wallet)
    public
    view
    returns (DriipSettlementTypes.ChallengeStatus)
    {
        return walletChallengeMap[wallet].status;
    }

    function getChallengeIntendedStage(address wallet)
    public
    view
    returns (MonetaryTypes.Figure)
    {
        return walletChallengeMap[wallet].intendedStage;
    }

    function getChallengeConjugateStage(address wallet)
    public
    view
    returns (MonetaryTypes.Figure)
    {
        return walletChallengeMap[wallet].conjugateStage;
    }

    function getChallengeChallenger(address wallet)
    public
    view
    returns (address)
    {
        return walletChallengeMap[wallet].challenger;
    }

    //
    // Functions implemented in DriipSettlementDispute
    // -----------------------------------------------------------------------------------------------------------------

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

    //
    // Helpers for DriipSettlementDispute
    // -----------------------------------------------------------------------------------------------------------------
    function getWalletChallenge(address wallet) public view onlyDriipSettlementDispute returns (DriipSettlementTypes.Challenge) {
        return walletChallengeMap[wallet];
    }

    function setWalletChallenge(address wallet, DriipSettlementTypes.Challenge challenge) public onlyDriipSettlementDispute {
        walletChallengeMap[wallet] = challenge;
    }

    function resetWalletChallenge(address wallet) public onlyDriipSettlementDispute {
        walletChallengeMap[wallet].status = DriipSettlementTypes.ChallengeStatus.Qualified;
        walletChallengeMap[wallet].candidateType = DriipSettlementTypes.ChallengeCandidateType.None;
        walletChallengeMap[wallet].candidateIndex = 0;
        walletChallengeMap[wallet].challenger = address(0);
    }

    function pushChallengeCandidateOrder(NahmiiTypes.Order order) public onlyDriipSettlementDispute {
        challengeCandidateOrders.push(order);
    }

    function getChallengeCandidateOrdersLength() public view onlyDriipSettlementDispute returns (uint256) {
        return challengeCandidateOrders.length;
    }

    function pushChallengeCandidateTrade(NahmiiTypes.Trade trade) public onlyDriipSettlementDispute {
        pushMemoryTradeToStorageArray(trade, challengeCandidateTrades);
    }

    function getChallengeCandidateTradesLength() public view onlyDriipSettlementDispute returns (uint256) {
        return challengeCandidateTrades.length;
    }

    function pushChallengeCandidatePayment(NahmiiTypes.Payment payment) public onlyDriipSettlementDispute {
        pushMemoryPaymentToStorageArray(payment, challengeCandidatePayments);
    }

    function getChallengeCandidatePaymentsLength() public view onlyDriipSettlementDispute returns (uint256) {
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
