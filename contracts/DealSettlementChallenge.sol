/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import "./Ownable.sol";
import "./Configuration.sol";
import "./RevenueFund.sol";
import "./ClientFund.sol";
import "./CommunityVote.sol";
import "./ERC20.sol";
import "./Types.sol";
import "./SecurityBond.sol";
import "./CancelOrdersChallenge.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract DealSettlementChallenge is Ownable {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    enum ChallengeCandidateType {None, Order, Trade, Payment}

    struct ChallengeInfo {
        uint256 nonce;
        Types.DealType dealType;
        uint256 timeout;
        Types.ChallengeStatus status;
        uint256 dealIndex;
        ChallengeCandidateType challengeCandidateType;
        uint256 candidateIndex;
        address challenger;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Configuration public configuration;
    SecurityBond public securityBond;
    CancelOrdersChallenge public cancelOrdersChallenge;

    mapping(address => ChallengeInfo) public walletChallengeInfoMap;

    mapping(address => Types.Trade[]) public walletChallengedTradesMap;
    mapping(address => Types.Payment[]) public walletChallengedPaymentsMap;

    Types.Order[] public challengeCandidateOrders;
    Types.Trade[] public challengeCandidateTrades;
    Types.Payment[] public challengeCandidatePayments;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeConfigurationEvent(Configuration oldConfiguration, Configuration newConfiguration);
    event ChangeSecurityBondEvent(SecurityBond oldSecurityBond, SecurityBond newSecurityBond);
    event ChangeCancelOrdersChallengeEvent(CancelOrdersChallenge oldCancelOrdersChallenge, CancelOrdersChallenge newCancelOrdersChallenge);
    event StartChallengeFromTradeEvent(Types.Trade trade, address wallet);
    event StartChallengeFromPaymentEvent(Types.Payment payment, address wallet);
    event ChallengeByOrderEvent(Types.Order order, address wallet, uint256 nonce, Types.DealType dealType, address reporter);
    event ChallengeByTradeEvent(Types.Trade trade, address wallet, uint256 nonce, Types.DealType dealType, address reporter);
    event ChallengeByPaymentEvent(Types.Payment payment, address wallet, uint256 nonce, Types.DealType dealType, address reporter);
    event UnchallengeOrderCandidateByTradeEvent(Types.Order order, Types.Trade trade, address wallet, uint256 nonce, Types.DealType dealType, address reporter);

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
    function changeConfiguration(Configuration newConfiguration)
    public
    onlyOwner
    notNullAddress(newConfiguration)
    notEqualAddresses(newConfiguration, configuration)
    {
        Configuration oldConfiguration = configuration;
        configuration = newConfiguration;
        emit ChangeConfigurationEvent(oldConfiguration, configuration);
    }

    /// @notice Change the security bond contract
    /// @param newSecurityBond The (address of) SecurityBond contract instance
    function changeSecurityBond(SecurityBond newSecurityBond)
    public
    onlyOwner
    notNullAddress(newSecurityBond)
    notEqualAddresses(newSecurityBond, securityBond)
    {
        SecurityBond oldSecurityBond = securityBond;
        securityBond = newSecurityBond;
        emit ChangeSecurityBondEvent(oldSecurityBond, securityBond);
    }

    /// @notice Change the cance orders challenge contract
    /// @param newCancelOrdersChallenge The (address of) CancelOrdersChallenge contract instance
    function changeCancelOrdersChallenge(CancelOrdersChallenge newCancelOrdersChallenge)
    public
    onlyOwner
    notNullAddress(newCancelOrdersChallenge)
    notEqualAddresses(newCancelOrdersChallenge, cancelOrdersChallenge)
    {
        CancelOrdersChallenge oldCancelOrdersChallenge = cancelOrdersChallenge;
        cancelOrdersChallenge = newCancelOrdersChallenge;
        emit ChangeCancelOrdersChallengeEvent(oldCancelOrdersChallenge, cancelOrdersChallenge);
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
        if (msg.sender != owner)
            wallet = msg.sender;

        // TODO Create modifier onlyOwnerOrTradeParty
        require(isOwner() || Types.isTradeParty(trade, wallet));

        require(
            0 == walletChallengeInfoMap[wallet].nonce ||
            block.timestamp >= walletChallengeInfoMap[wallet].timeout
        );

        walletChallengedTradesMap[wallet].push(trade);

        ChallengeInfo memory challenge = ChallengeInfo(
            trade.nonce,
            Types.DealType.Trade,
            block.timestamp + configuration.dealSettlementChallengeTimeout(),
            Types.ChallengeStatus.Qualified,
            walletChallengedTradesMap[wallet].length - 1,
            ChallengeCandidateType.None,
            0,
            address(0)
        );
        walletChallengeInfoMap[wallet] = challenge;

        emit StartChallengeFromTradeEvent(trade, wallet);
    }

    /// @notice Start deal settlement challenge on deal of payment type
    /// @param payment The challenged deal
    /// @param wallet The relevant deal party
    function startChallengeFromPayment(Types.Payment payment, address wallet)
    public
    signedBy(payment.seals.exchange.hash, payment.seals.exchange.signature, owner)
    signedBy(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender._address)
    {
        if (msg.sender != owner)
            wallet = msg.sender;

        // TODO Create modifier onlyOwnerOrPaymentParty
        require(isOwner() || Types.isPaymentParty(payment, wallet));

        require(
            0 == walletChallengeInfoMap[wallet].nonce ||
            block.timestamp >= walletChallengeInfoMap[wallet].timeout
        );

        walletChallengedPaymentsMap[wallet].push(payment);

        ChallengeInfo memory challenge = ChallengeInfo(
            payment.nonce,
            Types.DealType.Payment,
            block.timestamp + configuration.dealSettlementChallengeTimeout(),
            Types.ChallengeStatus.Qualified,
            walletChallengedPaymentsMap[wallet].length - 1,
            ChallengeCandidateType.None,
            0,
            address(0)
        );
        walletChallengeInfoMap[wallet] = challenge;

        emit StartChallengeFromPaymentEvent(payment, wallet);
    }

    /// @notice Get challenged deal that is a trade
    /// @param wallet The wallet whose challenged deal will be searched for
    function getChallengedDealAsTrade(address wallet) public view returns (Types.Trade) {
        require(
            0 < walletChallengeInfoMap[wallet].nonce
            && Types.DealType.Trade == walletChallengeInfoMap[wallet].dealType
        );
        uint256 dealIndex = walletChallengeInfoMap[wallet].dealIndex;
        return walletChallengedTradesMap[wallet][dealIndex];
    }

    /// @notice Get challenged deal that is a payment
    /// @param wallet The wallet whose challenged deal will be searched for
    function getChallengedDealAsPayment(address wallet) public view returns (Types.Payment) {
        require(
            0 < walletChallengeInfoMap[wallet].nonce
            && Types.DealType.Payment == walletChallengeInfoMap[wallet].dealType
        );
        uint256 dealIndex = walletChallengeInfoMap[wallet].dealIndex;
        return walletChallengedPaymentsMap[wallet][dealIndex];
    }

    /// @notice Get deal settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    function dealSettlementChallengePhase(address wallet) public view returns (uint, Types.ChallengePhase) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if (0 == walletChallengeInfoMap[wallet].nonce)
            return (0, Types.ChallengePhase.Closed);
        else if (block.timestamp < walletChallengeInfoMap[wallet].timeout)
            return (walletChallengeInfoMap[wallet].nonce, Types.ChallengePhase.Dispute);
        else
            return (walletChallengeInfoMap[wallet].nonce, Types.ChallengePhase.Closed);
    }

    /// @notice Get deal settlement challenge phase of given wallet
    /// @param wallet The wallet whose challenge phase will be returned
    /// @param nonce The nonce of the challenged deal
    function dealSettlementChallengeStatus(address wallet, uint256 nonce) public view returns (Types.ChallengeStatus) {
        if (msg.sender != owner)
            wallet = msg.sender;
        if ((0 == walletChallengeInfoMap[wallet].nonce) ||
            (nonce != walletChallengeInfoMap[wallet].nonce))
            return Types.ChallengeStatus.Unknown;
        else
            return walletChallengeInfoMap[wallet].status;
    }

    /// @notice Challenge the deal settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged deal
    function challengeByOrder(Types.Order order)
    public
    orderSigned(order)
    {
        address wallet = order._address;

        ChallengeInfo storage challenge = walletChallengeInfoMap[wallet];
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        address orderCurrency;
        int256 orderAmount;
        (orderCurrency, orderAmount) = (
        Types.Intention.Sell == order.placement.intention ?
        (order.placement.currencies.intended, order.placement.amount) :
        (order.placement.currencies.conjugate, order.placement.amount.div(order.placement.rate))
        );

        int256 balance = (Types.DealType.Trade == challenge.dealType ?
        getTradeBalance(
            walletChallengedTradesMap[wallet][challenge.dealIndex],
            wallet,
            orderCurrency
        ) :
        getPaymentBalance(
            walletChallengedPaymentsMap[wallet][challenge.dealIndex],
            wallet,
            orderCurrency
        ));

        require(orderAmount > balance);

        challengeCandidateOrders.push(order);

        challenge.status = Types.ChallengeStatus.Disqualified;
        challenge.challengeCandidateType = ChallengeCandidateType.Order;
        challenge.candidateIndex = challengeCandidateOrders.length - 1;

        bool orderCancelled = cancelOrdersChallenge.isOrderCancelled(wallet, order.seals.exchange.hash);
        challenge.challenger = orderCancelled ? address(0) : msg.sender;

        emit ChallengeByOrderEvent(order, wallet, challenge.nonce, challenge.dealType, msg.sender);
    }

    /// @notice Unchallenge deal settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged deal
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(Types.Order order, Types.Trade trade)
    public
    orderSigned(order)
    tradeSigned(trade)
    onlyTradeParty(trade, order._address)
    onlyTradeOrder(trade, order)
    {
        ChallengeInfo storage challenge = walletChallengeInfoMap[order._address];
        require(challenge.challengeCandidateType == ChallengeCandidateType.Order);

        challenge.status = Types.ChallengeStatus.Qualified;
        challenge.challengeCandidateType = ChallengeCandidateType.None;
        challenge.candidateIndex = 0;
        challenge.challenger = address(0);

        // TODO Stage stake obtained from configuration contract for msg.sender in security bond contract

        emit UnchallengeOrderCandidateByTradeEvent(order, trade, order._address,
            challenge.nonce, challenge.dealType, msg.sender);
    }

    /// @notice Challenge the deal settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged deal
    /// @param wallet The wallet whose deal settlement is being challenged
    function challengeByTrade(Types.Trade trade, address wallet)
    public
    tradeSigned(trade)
    onlyTradeParty(trade, wallet)
    {
        ChallengeInfo storage challenge = walletChallengeInfoMap[wallet];
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        Types.TradePartyRole tradePartyRole = (trade.buyer._address == wallet ?
        Types.TradePartyRole.Buyer :
        Types.TradePartyRole.Seller);

        address currency;
        int256 candidateTransfer;
        (currency, candidateTransfer) = (Types.TradePartyRole.Buyer == tradePartyRole ?
        (trade.currencies.conjugate, trade.transfers.conjugate.single.abs()) :
        (trade.currencies.intended, trade.transfers.intended.single.abs()));

        int256 challengeBalance = (Types.DealType.Trade == challenge.dealType ?
        getTradeBalance(
            walletChallengedTradesMap[wallet][challenge.dealIndex],
            wallet,
            currency
        ) :
        getPaymentBalance(
            walletChallengedPaymentsMap[wallet][challenge.dealIndex],
            wallet,
            currency
        ));

        require(candidateTransfer > challengeBalance);

        challengeCandidateTrades.push(trade);

        bytes32 orderExchangeHash = (trade.buyer._address == wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange);

        bool orderCancelled = cancelOrdersChallenge.isOrderCancelled(wallet, orderExchangeHash);
        challenge.status = Types.ChallengeStatus.Disqualified;
        challenge.challengeCandidateType = ChallengeCandidateType.Trade;
        challenge.candidateIndex = challengeCandidateTrades.length - 1;
        challenge.challenger = orderCancelled ? address(0) : msg.sender;

        emit ChallengeByTradeEvent(trade, wallet, challenge.nonce, challenge.dealType, msg.sender);
    }

    /// @notice Challenge the deal settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged deal
    /// @param wallet The wallet whose deal settlement is being challenged
    function challengeByPayment(Types.Payment payment, address wallet)
    public
    paymentSigned(payment)
    onlyPaymentSender(payment, wallet) // Wallet is recipient in (candidate) payment -> nothing to consider
    {
        ChallengeInfo storage challenge = walletChallengeInfoMap[wallet];
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        int256 candidateTransfer = payment.transfers.single.abs();

        int256 challengeBalance = (Types.DealType.Trade == challenge.dealType ?
        getTradeBalance(
            walletChallengedTradesMap[wallet][challenge.dealIndex],
            wallet,
            payment.currency
        ) :
        getPaymentBalance(
            walletChallengedPaymentsMap[wallet][challenge.dealIndex],
            wallet,
            payment.currency
        ));

        require(candidateTransfer > challengeBalance);

        challengeCandidatePayments.push(payment);

        challenge.status = Types.ChallengeStatus.Disqualified;
        challenge.challengeCandidateType = ChallengeCandidateType.Payment;
        challenge.candidateIndex = challengeCandidatePayments.length - 1;
        challenge.challenger = msg.sender;

        emit ChallengeByPaymentEvent(payment, wallet, challenge.nonce, challenge.dealType, msg.sender);
    }

    function getTradeBalance(Types.Trade trade, address wallet, address currency) private pure returns (int256) {
        require(0 < trade.nonce);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);

        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer._address ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
        Types.CurrencyRole tradeCurrencyRole = (currency == trade.currencies.intended ? Types.CurrencyRole.Intended : Types.CurrencyRole.Conjugate);
        if (Types.TradePartyRole.Buyer == tradePartyRole)
            if (Types.CurrencyRole.Intended == tradeCurrencyRole)
                return trade.buyer.balances.intended.current;
            else // Types.CurrencyRole.Conjugate == currencyRole
                return trade.buyer.balances.conjugate.current;
        else // Types.TradePartyRole.Seller == tradePartyRole
            if (Types.CurrencyRole.Intended == tradeCurrencyRole)
                return trade.seller.balances.intended.current;
            else // Types.CurrencyRole.Conjugate == currencyRole
                return trade.seller.balances.conjugate.current;
    }

    function getPaymentBalance(Types.Payment payment, address wallet, address currency) private pure returns (int256) {
        require(0 < payment.nonce);
        require(currency == payment.currency);

        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender._address ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);
        if (Types.PaymentPartyRole.Sender == paymentPartyRole)
            return payment.sender.balances.current;
        else //Types.PaymentPartyRole.Recipient == paymentPartyRole
            return payment.recipient.balances.current;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier notEqualAddresses(address address1, address address2) {
        require(address1 != address2);
        _;
    }

    modifier onlyTradeParty(Types.Trade trade, address wallet) {
        require(Types.isTradeParty(trade, wallet));
        _;
    }

    modifier onlyTradeOrder(Types.Trade trade, Types.Order order) {
        require(Types.isTradeOrder(trade, order));
        _;
    }

    modifier onlyPaymentParty(Types.Payment payment, address wallet) {
        require(Types.isPaymentParty(payment, wallet));
        _;
    }

    modifier onlyPaymentSender(Types.Payment payment, address wallet) {
        require(Types.isPaymentSender(payment, wallet));
        _;
    }

    modifier onlyPaymentRecipient(Types.Payment payment, address wallet) {
        require(Types.isPaymentRecipient(payment, wallet));
        _;
    }

    modifier signedBy(bytes32 hash, Types.Signature signature, address signer) {
        require(Types.isGenuineSignature(hash, signature, signer));
        _;
    }

    modifier orderSigned(Types.Order order) {
        require(Types.isGenuineSignature(order.seals.exchange.hash, order.seals.exchange.signature, owner));
        require(Types.isGenuineSignature(order.seals.wallet.hash, order.seals.wallet.signature, order._address));
        _;
    }

    modifier orderSignedByExchange(Types.Order order) {
        require(Types.isGenuineSignature(order.seals.exchange.hash, order.seals.exchange.signature, owner));
        _;
    }

    modifier orderSignedByWallet(Types.Order order) {
        require(Types.isGenuineSignature(order.seals.wallet.hash, order.seals.wallet.signature, order._address));
        _;
    }

    modifier tradeSigned(Types.Trade trade) {
        require(Types.isGenuineSignature(trade.seal.hash, trade.seal.signature, owner));
        _;
    }

    modifier paymentSigned(Types.Payment payment) {
        require(Types.isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));
        require(Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender._address));
        _;
    }

    modifier paymentSignedByExchange(Types.Payment payment) {
        require(Types.isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, owner));
        _;
    }

    modifier paymentSignedByWallet(Types.Payment payment) {
        require(Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender._address));
        _;
    }
}