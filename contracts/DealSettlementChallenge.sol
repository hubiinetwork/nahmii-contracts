/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import "./Ownable.sol";
import "./Types.sol";
import {AbstractConfiguration} from "./Configuration.sol";
import {SecurityBond} from "./SecurityBond.sol";
import {AbstractCancelOrdersChallenge} from "./CancelOrdersChallenge.sol";
import {DealSettlementChallengePartialChallenge} from "./DealSettlementChallengePartialChallenge.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract DealSettlementChallenge is Ownable {
    using SafeMathInt for int256;

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    enum ChallengeCandidateType {None, Order, Trade, Payment}

    struct Challenge {
        uint256 nonce;
        Types.DealType dealType;
        uint256 timeout;
        Types.ChallengeResult result;
        uint256 dealIndex;
        ChallengeCandidateType candidateType;
        uint256 candidateIndex;
        address challenger;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    AbstractConfiguration public configuration;
    SecurityBond public securityBond;
    AbstractCancelOrdersChallenge public cancelOrdersChallenge;

    mapping(address => Challenge) public walletChallengeMap;

    mapping(address => Types.Trade[]) public walletChallengedTradesMap;
    mapping(address => Types.Payment[]) public walletChallengedPaymentsMap;

    Types.Order[] public challengeCandidateOrders;
    Types.Trade[] public challengeCandidateTrades;
    Types.Payment[] public challengeCandidatePayments;

    address private dealSettlementChallengePartialChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeConfigurationEvent(AbstractConfiguration oldConfiguration, AbstractConfiguration newConfiguration);
    event ChangeSecurityBondEvent(SecurityBond oldSecurityBond, SecurityBond newSecurityBond);
    event ChangeCancelOrdersChallengeEvent(AbstractCancelOrdersChallenge oldCancelOrdersChallenge, AbstractCancelOrdersChallenge newCancelOrdersChallenge);
    event StartChallengeFromTradeEvent(Types.Trade trade, address wallet);
    event StartChallengeFromPaymentEvent(Types.Payment payment, address wallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the configuration contract
    /// @param newConfiguration The (address of) Configuration contract instance
    function changeConfiguration(AbstractConfiguration newConfiguration) public onlyOwner notNullAddress(newConfiguration) notEqualAddresses(newConfiguration, configuration) {
        AbstractConfiguration oldConfiguration = configuration;
        configuration = newConfiguration;

        //update implementers
        DealSettlementChallengePartialChallenge(dealSettlementChallengePartialChallenge).changeConfiguration(configuration);

        //raise event
        emit ChangeConfigurationEvent(oldConfiguration, configuration);
    }

    /// @notice Change the security bond contract
    /// @param newSecurityBond The (address of) SecurityBond contract instance
    function changeSecurityBond(SecurityBond newSecurityBond) public onlyOwner notNullAddress(newSecurityBond) notEqualAddresses(newSecurityBond, securityBond) {
        SecurityBond oldSecurityBond = securityBond;
        securityBond = newSecurityBond;

        //update implementers
        DealSettlementChallengePartialChallenge(dealSettlementChallengePartialChallenge).changeSecurityBond(securityBond);

        //raise event
        emit ChangeSecurityBondEvent(oldSecurityBond, securityBond);
    }

    /// @notice Change the cance orders challenge contract
    /// @param newCancelOrdersChallenge The (address of) CancelOrdersChallenge contract instance
    function changeCancelOrdersChallenge(AbstractCancelOrdersChallenge newCancelOrdersChallenge) public onlyOwner notNullAddress(newCancelOrdersChallenge) notEqualAddresses(newCancelOrdersChallenge, cancelOrdersChallenge) {
        AbstractCancelOrdersChallenge oldCancelOrdersChallenge = cancelOrdersChallenge;
        cancelOrdersChallenge = newCancelOrdersChallenge;

        //update implementers
        DealSettlementChallengePartialChallenge(dealSettlementChallengePartialChallenge).changeCancelOrdersChallenge(cancelOrdersChallenge);

        //raise event
        emit ChangeCancelOrdersChallengeEvent(oldCancelOrdersChallenge, cancelOrdersChallenge);
    }

    /// @notice Set the child implementers
    /// @param _dealSettlementChallengePartialChallenge The (address of) DealSettlementChallengePartialChallenge contract instance
    function setImplementers(address _dealSettlementChallengePartialChallenge) public onlyOwner notNullAddress(_dealSettlementChallengePartialChallenge) {
        require(dealSettlementChallengePartialChallenge == address(0));

        dealSettlementChallengePartialChallenge = _dealSettlementChallengePartialChallenge;
    }

    /// @notice Get the number of current and past deal settlement challenges from trade for given wallet
    /// @param wallet The wallet for which to return count
    function walletChallengedTradesCount(address wallet) public view returns (uint256) {
        return walletChallengedTradesMap[wallet].length;
    }

    /// @notice Get the number of current and past deal settlement challenges from payment for given wallet
    /// @param wallet The wallet for which to return count
    function walletChallengedPaymentsCount(address wallet) public view returns (uint256) {
        return walletChallengedPaymentsMap[wallet].length;
    }

    /// @notice Return the number of (challenge) candidate orders
    function challengeCandidateOrdersCount() public view returns (uint256) {
        return challengeCandidateOrders.length;
    }

    /// @notice Return the number of (challenge) candidate trades
    function challengeCandidateTradesCount() public view returns (uint256) {
        return challengeCandidateTrades.length;
    }

    /// @notice Return the number of (challenge) candidate payments
    function challengeCandidatePaymentsCount() public view returns (uint256) {
        return challengeCandidatePayments.length;
    }

    /// @notice Start deal settlement challenge on deal of trade type
    /// @param trade The challenged deal
    /// @param wallet The relevant deal party
    function startChallengeFromTrade(Types.Trade trade, address wallet)
    public
    signedBy(trade.seal.hash, trade.seal.signature, owner)
    {
        require(configuration != address(0), "Configuration is missing");

        if (msg.sender != owner)
            wallet = msg.sender;

        // TODO Create modifier onlyOwnerOrTradeParty
        require(isOwner() || Types.isTradeParty(trade, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        walletChallengedTradesMap[wallet].push(trade);

        Challenge memory challenge = Challenge(
            trade.nonce,
            Types.DealType.Trade,
            block.timestamp + configuration.getDealSettlementChallengeTimeout(),
            Types.ChallengeResult.Qualified,
            walletChallengedTradesMap[wallet].length - 1,
            ChallengeCandidateType.None,
            0,
            address(0)
        );
        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromTradeEvent(trade, wallet);
    }

    /// @notice Start deal settlement challenge on deal of payment type
    /// @param payment The challenged deal
    /// @param wallet The relevant deal party
    function startChallengeFromPayment(Types.Payment payment, address wallet)
    public
    signedBy(payment.seals.exchange.hash, payment.seals.exchange.signature, owner)
    signedBy(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet)
    {
        require(configuration != address(0), "Configuration is missing");

        if (msg.sender != owner)
            wallet = msg.sender;

        // TODO Create modifier onlyOwnerOrPaymentParty
        require(isOwner() || Types.isPaymentParty(payment, wallet));

        require(
            0 == walletChallengeMap[wallet].nonce ||
            block.timestamp >= walletChallengeMap[wallet].timeout
        );

        walletChallengedPaymentsMap[wallet].push(payment);

        Challenge memory challenge = Challenge(
            payment.nonce,
            Types.DealType.Payment,
            block.timestamp + configuration.getDealSettlementChallengeTimeout(),
            Types.ChallengeResult.Qualified,
            walletChallengedPaymentsMap[wallet].length - 1,
            ChallengeCandidateType.None,
            0,
            address(0)
        );
        walletChallengeMap[wallet] = challenge;

        emit StartChallengeFromPaymentEvent(payment, wallet);
    }

    /// @notice Get challenged deal that is a trade
    /// @param wallet The wallet whose challenged deal will be searched for
    //    function getChallengedDealAsTrade(address wallet) public view returns (Types.Trade) {
    //        require(
    //            0 < walletChallengeMap[wallet].nonce
    //            && Types.DealType.Trade == walletChallengeMap[wallet].dealType
    //        );
    //        uint256 dealIndex = walletChallengeMap[wallet].dealIndex;
    //        return walletChallengedTradesMap[wallet][dealIndex];
    //    }

    /// @notice Get challenged deal that is a payment
    /// @param wallet The wallet whose challenged deal will be searched for
    //    function getChallengedDealAsPayment(address wallet) public view returns (Types.Payment) {
    //        require(
    //            0 < walletChallengeMap[wallet].nonce
    //            && Types.DealType.Payment == walletChallengeMap[wallet].dealType
    //        );
    //        uint256 dealIndex = walletChallengeMap[wallet].dealIndex;
    //        return walletChallengedPaymentsMap[wallet][dealIndex];
    //    }

    /// @notice Get deal settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    function dealSettlementChallengePhase(address wallet) public view returns (uint, Types.ChallengePhase) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if (0 == walletChallengeMap[wallet].nonce)
            return (0, Types.ChallengePhase.Closed);
        else if (block.timestamp < walletChallengeMap[wallet].timeout)
            return (walletChallengeMap[wallet].nonce, Types.ChallengePhase.Dispute);
        else
            return (walletChallengeMap[wallet].nonce, Types.ChallengePhase.Closed);
    }

    /// @notice Get deal settlement challenge result and challenger (wallet) of given (challenge) wallet
    /// @param wallet The wallet whose challenge status will be returned
    /// @param nonce The nonce of the challenged deal
    function dealSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeResult, address) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if ((0 == walletChallengeMap[wallet].nonce) ||
            (nonce != walletChallengeMap[wallet].nonce))
            return (Types.ChallengeResult.Unknown, address(0));
        else
            return (walletChallengeMap[wallet].result, walletChallengeMap[wallet].challenger);
    }

    //
    // Functions implemented in DealSettlementChallengePartialChallenge
    // -----------------------------------------------------------------------------------------------------------------

        /// @notice Challenge the deal settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged deal
    function challengeByOrder(Types.Order order) public {
        DealSettlementChallengePartialChallenge(dealSettlementChallengePartialChallenge).challengeByOrder(order, msg.sender);
    }

    /// @notice Unchallenge deal settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged deal
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(Types.Order order, Types.Trade trade) public {
        DealSettlementChallengePartialChallenge(dealSettlementChallengePartialChallenge).unchallengeOrderCandidateByTrade(order, trade, msg.sender);
    }

    /// @notice Challenge the deal settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged deal
    /// @param wallet The wallet whose deal settlement is being challenged
    function challengeByTrade(Types.Trade trade, address wallet) public {
        DealSettlementChallengePartialChallenge(dealSettlementChallengePartialChallenge).challengeByTrade(trade, wallet, msg.sender);
    }

    /// @notice Challenge the deal settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged deal
    /// @param wallet The wallet whose deal settlement is being challenged
    function challengeByPayment(Types.Payment payment, address wallet) public {
        DealSettlementChallengePartialChallenge(dealSettlementChallengePartialChallenge).challengeByPayment(payment, wallet, msg.sender);
    }

    //
    // DealSettlementChallenge implementers helpers
    // -----------------------------------------------------------------------------------------------------------------
    function getWalletChallengeMap(address wallet) public view onlyDealSettlementChallengeImplementers returns (Challenge) {
        return walletChallengeMap[wallet];
    }

    function setWalletChallengeMap(address wallet, Challenge challenge) public onlyDealSettlementChallengeImplementers {
        walletChallengeMap[wallet] = challenge;
    }

    function getWalletChallengeTradesMap(address wallet, uint256 dealIndex) public view onlyDealSettlementChallengeImplementers returns (Types.Trade) {
        return walletChallengedTradesMap[wallet][dealIndex];
    }

    function getWalletChallengePaymentsMap(address wallet, uint256 dealIndex) public view onlyDealSettlementChallengeImplementers returns (Types.Payment) {
        return walletChallengedPaymentsMap[wallet][dealIndex];
    }

    function pushChallengeCandidateOrders(Types.Order order) public onlyDealSettlementChallengeImplementers {
        challengeCandidateOrders.push(order);
    }

    function getChallengeCandidateOrdersLength() public view onlyDealSettlementChallengeImplementers returns (uint256) {
        return challengeCandidateOrders.length;
    }

    function pushChallengeCandidateTrades(Types.Trade trade) public onlyDealSettlementChallengeImplementers {
        challengeCandidateTrades.push(trade);
    }

    function getChallengeCandidateTradesLength() public view onlyDealSettlementChallengeImplementers returns (uint256) {
        return challengeCandidateTrades.length;
    }

    function pushChallengeCandidatePayments(Types.Payment payment) public onlyDealSettlementChallengeImplementers {
        challengeCandidatePayments.push(payment);
    }

    function getChallengeCandidatePaymentsLength() public view onlyDealSettlementChallengeImplementers returns (uint256) {
        return challengeCandidatePayments.length;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier onlyDealSettlementChallengeImplementers() {
        require(msg.sender == dealSettlementChallengePartialChallenge);
        _;
    }

    modifier notEqualAddresses(address address1, address address2) {
        require(address1 != address2);
        _;
    }

    modifier signedBy(bytes32 hash, Types.Signature signature, address signer) {
        require(Types.isGenuineSignature(hash, signature, signer));
        _;
    }
}
