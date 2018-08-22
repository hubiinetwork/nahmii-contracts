/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {Ownable} from "./Ownable.sol";
import {StriimTypes} from "./StriimTypes.sol";
import {Modifiable} from "./Modifiable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {FraudChallenge} from "./FraudChallenge.sol";
import {CancelOrdersChallenge} from "./CancelOrdersChallenge.sol";
import {DriipSettlementChallenge} from "./DriipSettlementChallenge.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title DriipSettlementChallenger
@notice The workhorse of driip settlement challenges, utilized by DriipSettlementChallenge
*/
contract DriipSettlementChallenger is Ownable, Configurable, Validatable, SecurityBondable, SelfDestructible {
    using SafeMathInt for int256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementChallenge public driipSettlementChallenge;
    FraudChallenge public fraudChallenge;
    CancelOrdersChallenge public cancelOrdersChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeDriipSettlementChallengeEvent(DriipSettlementChallenge oldDriipSettlementChallenge, DriipSettlementChallenge newDriipSettlementChallenge);
    event ChangeFraudChallengeEvent(FraudChallenge oldFraudChallenge, FraudChallenge newFraudChallenge);
    event ChangeCancelOrdersChallengeEvent(CancelOrdersChallenge oldCancelOrdersChallenge, CancelOrdersChallenge newCancelOrdersChallenge);
    event ChallengeByOrderEvent(StriimTypes.Order order, uint256 nonce, StriimTypes.DriipType driipType, address reporter);
    event ChallengeByTradeEvent(StriimTypes.Trade trade, address wallet, uint256 nonce, StriimTypes.DriipType driipType, address reporter);
    event ChallengeByPaymentEvent(StriimTypes.Payment payment, address wallet, uint256 nonce, StriimTypes.DriipType driipType, address reporter);
    event UnchallengeOrderCandidateByTradeEvent(StriimTypes.Order order, StriimTypes.Trade trade, uint256 nonce, StriimTypes.DriipType driipType, address reporter);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    /// @notice Change the driip settlement challenge contract
    /// @param newDriipSettlementChallenge The (address of) DriipSettlementChallenge contract instance
    function changeDriipSettlementChallenge(DriipSettlementChallenge newDriipSettlementChallenge)
    public
    onlyOwner
    notNullAddress(newDriipSettlementChallenge)
    {
        DriipSettlementChallenge oldDriipSettlementChallenge = driipSettlementChallenge;
        driipSettlementChallenge = newDriipSettlementChallenge;
        emit ChangeDriipSettlementChallengeEvent(oldDriipSettlementChallenge, driipSettlementChallenge);
    }

    /// @notice Change the fraud challenge contract
    /// @param newFraudChallenge The (address of) FraudChallenge contract instance
    function changeFraudChallenge(FraudChallenge newFraudChallenge)
    public
    onlyOwner
    notNullAddress(newFraudChallenge)
    {
        FraudChallenge oldFraudChallenge = fraudChallenge;
        fraudChallenge = newFraudChallenge;
        emit ChangeFraudChallengeEvent(oldFraudChallenge, fraudChallenge);
    }

    /// @notice Change the cancel orders challenge contract
    /// @param newCancelOrdersChallenge The (address of) CancelOrdersChallenge contract instance
    function changeCancelOrdersChallenge(CancelOrdersChallenge newCancelOrdersChallenge)
    public
    onlyOwner
    notNullAddress(newCancelOrdersChallenge)
    {
        CancelOrdersChallenge oldCancelOrdersChallenge = cancelOrdersChallenge;
        cancelOrdersChallenge = newCancelOrdersChallenge;
        emit ChangeCancelOrdersChallengeEvent(oldCancelOrdersChallenge, cancelOrdersChallenge);
    }

    /// @notice Challenge the driip settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    function challengeByOrder(StriimTypes.Order order, address challenger)
    public
    validatorInitialized
    onlyController
    onlySealedOrder(order)
    {
        require(driipSettlementChallenge != address(0));
        require(fraudChallenge != address(0));
        require(cancelOrdersChallenge != address(0));

        require(!fraudChallenge.isFraudulentOrderExchangeHash(order.seals.exchange.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.exchange.hash));

        DriipSettlementChallenge.Challenge memory challenge = driipSettlementChallenge.getWalletChallenge(order.wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        address orderCurrency;
        int256 orderAmount;
        (orderCurrency, orderAmount) = (StriimTypes.Intention.Sell == order.placement.intention ? (order.placement.currencies.intended, order.placement.amount)
        : (order.placement.currencies.conjugate, order.placement.amount.div(order.placement.rate)));

        int256 balance = (StriimTypes.DriipType.Trade == challenge.driipType ? getTradeBalance(driipSettlementChallenge.getWalletChallengeTrade(order.wallet, challenge.driipIndex), order.wallet, orderCurrency)
        : getPaymentBalance(driipSettlementChallenge.getWalletChallengePayment(order.wallet, challenge.driipIndex), order.wallet, orderCurrency));

        require(orderAmount > balance);

        driipSettlementChallenge.pushChallengeCandidateOrder(order);

        challenge.result = StriimTypes.ChallengeResult.Disqualified;
        challenge.candidateType = DriipSettlementChallenge.ChallengeCandidateType.Order;
        challenge.candidateIndex = driipSettlementChallenge.getChallengeCandidateOrdersLength() - 1;
        challenge.challenger = challenger;
        driipSettlementChallenge.setWalletChallenge(order.wallet, challenge);

        //raise event
        emit ChallengeByOrderEvent(order, challenge.nonce, challenge.driipType, challenger);
    }

    /// @notice Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(StriimTypes.Order order, StriimTypes.Trade trade, address challenger)
    public
    validatorInitialized
    onlyController
    onlySealedOrder(order)
    onlySealedTrade(trade)
    onlyTradeParty(trade, order.wallet)
    onlyTradeOrder(trade, order)
    {
        require(driipSettlementChallenge != address(0));
        require(fraudChallenge != address(0));
        require(configuration != address(0));
        require(securityBond != address(0));

        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));
        require(!fraudChallenge.isFraudulentOrderExchangeHash(trade.buyer.wallet == order.wallet ?
            trade.buyer.order.hashes.exchange :
            trade.seller.order.hashes.exchange));

        DriipSettlementChallenge.Challenge memory challenge = unchallengeOrderCandidatePrivate(order, trade, challenger);

        //raise event
        emit UnchallengeOrderCandidateByTradeEvent(order, trade, challenge.nonce, challenge.driipType, challenger);
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    function challengeByTrade(StriimTypes.Trade trade, address wallet, address challenger)
    public
    validatorInitialized
    onlyController
    onlySealedTrade(trade)
    onlyTradeParty(trade, wallet)
    {
        require(driipSettlementChallenge != address(0));
        require(fraudChallenge != address(0));
        require(cancelOrdersChallenge != address(0));

        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        bytes32 orderExchangeHash = (trade.buyer.wallet == wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange);

        require(!fraudChallenge.isFraudulentOrderExchangeHash(orderExchangeHash));
        require(!cancelOrdersChallenge.isOrderCancelled(wallet, orderExchangeHash));

        DriipSettlementChallenge.Challenge memory challenge = driipSettlementChallenge.getWalletChallenge(wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        StriimTypes.TradePartyRole tradePartyRole = (trade.buyer.wallet == wallet ?
        StriimTypes.TradePartyRole.Buyer :
        StriimTypes.TradePartyRole.Seller);

        address currency;
        int256 candidateTransfer;
        (currency, candidateTransfer) = (StriimTypes.TradePartyRole.Buyer == tradePartyRole ?
        (trade.currencies.conjugate, trade.transfers.conjugate.single.abs()) :
        (trade.currencies.intended, trade.transfers.intended.single.abs()));

        int256 challengeBalance = (StriimTypes.DriipType.Trade == challenge.driipType ?
        getTradeBalance(
            driipSettlementChallenge.getWalletChallengeTrade(wallet, challenge.driipIndex),
            wallet,
            currency
        ) :
        getPaymentBalance(
            driipSettlementChallenge.getWalletChallengePayment(wallet, challenge.driipIndex),
            wallet,
            currency
        ));

        require(candidateTransfer > challengeBalance);

        driipSettlementChallenge.pushChallengeCandidateTrade(trade);

        challenge.result = StriimTypes.ChallengeResult.Disqualified;
        challenge.candidateType = DriipSettlementChallenge.ChallengeCandidateType.Trade;
        challenge.candidateIndex = driipSettlementChallenge.getChallengeCandidateTradesLength() - 1;
        challenge.challenger = challenger;
        driipSettlementChallenge.setWalletChallenge(wallet, challenge);

        //raise event
        emit ChallengeByTradeEvent(trade, wallet, challenge.nonce, challenge.driipType, challenger);
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param wallet The wallet whose driip settlement is being challenged
    function challengeByPayment(StriimTypes.Payment payment, address wallet, address challenger)
    public
    validatorInitialized
    onlyController
    onlySealedPayment(payment)
    onlyPaymentSender(payment, wallet) // Wallet is recipient in (candidate) payment -> nothing to consider
    {
        require(driipSettlementChallenge != address(0));
        require(fraudChallenge != address(0));

        require(!fraudChallenge.isFraudulentPaymentExchangeHash(payment.seals.exchange.hash));

        DriipSettlementChallenge.Challenge memory challenge = driipSettlementChallenge.getWalletChallenge(wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        int256 candidateTransfer = payment.transfers.single.abs();

        int256 challengeBalance = (StriimTypes.DriipType.Trade == challenge.driipType ?
        getTradeBalance(
            driipSettlementChallenge.getWalletChallengeTrade(wallet, challenge.driipIndex),
            wallet,
            payment.currency
        ) :
        getPaymentBalance(
            driipSettlementChallenge.getWalletChallengePayment(wallet, challenge.driipIndex),
            wallet,
            payment.currency
        ));

        require(candidateTransfer > challengeBalance);

        driipSettlementChallenge.pushChallengeCandidatePayment(payment);

        challenge.result = StriimTypes.ChallengeResult.Disqualified;
        challenge.candidateType = DriipSettlementChallenge.ChallengeCandidateType.Payment;
        challenge.candidateIndex = driipSettlementChallenge.getChallengeCandidatePaymentsLength() - 1;
        challenge.challenger = challenger;
        driipSettlementChallenge.setWalletChallenge(wallet, challenge);

        //raise event
        emit ChallengeByPaymentEvent(payment, wallet, challenge.nonce, challenge.driipType, challenger);
    }

    function getTradeBalance(StriimTypes.Trade trade, address wallet, address currency) private pure returns (int256) {
        require(0 < trade.nonce);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);

        StriimTypes.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? StriimTypes.TradePartyRole.Buyer : StriimTypes.TradePartyRole.Seller);
        StriimTypes.CurrencyRole tradeCurrencyRole = (currency == trade.currencies.intended ? StriimTypes.CurrencyRole.Intended : StriimTypes.CurrencyRole.Conjugate);
        if (StriimTypes.TradePartyRole.Buyer == tradePartyRole)
            if (StriimTypes.CurrencyRole.Intended == tradeCurrencyRole)
                return trade.buyer.balances.intended.current;
            else // StriimTypes.CurrencyRole.Conjugate == currencyRole
                return trade.buyer.balances.conjugate.current;
        else // StriimTypes.TradePartyRole.Seller == tradePartyRole
            if (StriimTypes.CurrencyRole.Intended == tradeCurrencyRole)
                return trade.seller.balances.intended.current;
            else // StriimTypes.CurrencyRole.Conjugate == currencyRole
                return trade.seller.balances.conjugate.current;
    }

    function getPaymentBalance(StriimTypes.Payment payment, address wallet, address currency) private pure returns (int256) {
        require(0 < payment.nonce);
        require(currency == payment.currency);

        StriimTypes.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? StriimTypes.PaymentPartyRole.Sender : StriimTypes.PaymentPartyRole.Recipient);
        if (StriimTypes.PaymentPartyRole.Sender == paymentPartyRole)
            return payment.sender.balances.current;
        else //StriimTypes.PaymentPartyRole.Recipient == paymentPartyRole
            return payment.recipient.balances.current;
    }

    function unchallengeOrderCandidatePrivate(StriimTypes.Order order, StriimTypes.Trade trade, address challenger)
    private
    returns (DriipSettlementChallenge.Challenge)
    {
        // TODO Instead of operating on challenge in memory consider operating directly on challenge in storage of driipSettlementChallenge
        DriipSettlementChallenge.Challenge memory challenge = driipSettlementChallenge.getWalletChallenge(order.wallet);
        require(challenge.candidateType == DriipSettlementChallenge.ChallengeCandidateType.Order);

        StriimTypes.Order memory challengeOrder = driipSettlementChallenge.getChallengeCandidateOrder(challenge.candidateIndex);
        require(challengeOrder.seals.exchange.hash == order.seals.exchange.hash);

        require(challengeOrder.seals.exchange.hash == (trade.buyer.wallet == order.wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange));

        driipSettlementChallenge.resetWalletChallenge(order.wallet);

        (int256 stageAmount, address stageCurrencyCt, /*uint256 stageCurrencyId*/) = configuration.getUnchallengeOrderCandidateByTradeStake();
        // TODO Update call with stageCurrencyId argument
        securityBond.stage(stageAmount, stageCurrencyCt, challenger);

        return challenge;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyTradeParty(StriimTypes.Trade trade, address wallet) {
        require(StriimTypes.isTradeParty(trade, wallet));
        _;
    }

    modifier onlyTradeOrder(StriimTypes.Trade trade, StriimTypes.Order order) {
        require(StriimTypes.isTradeOrder(trade, order));
        _;
    }

    modifier onlyPaymentSender(StriimTypes.Payment payment, address wallet) {
        require(StriimTypes.isPaymentSender(payment, wallet));
        _;
    }

    modifier signedBy(bytes32 hash, StriimTypes.Signature signature, address signer) {
        require(StriimTypes.isGenuineSignature(hash, signature, signer));
        _;
    }

    modifier onlyController() {
        require(msg.sender == address(driipSettlementChallenge));
        _;
    }
}