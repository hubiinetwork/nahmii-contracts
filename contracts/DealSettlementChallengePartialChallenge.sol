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
import "./Ownable.sol";
import "./Types.sol";
import {Modifiable} from "./Modifiable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {CancelOrdersChallenge} from "./CancelOrdersChallenge.sol";
import {DealSettlementChallenge} from "./DealSettlementChallenge.sol";

/**
@title Exchange
@notice The orchestrator of trades and payments on-chain.
*/
contract DealSettlementChallengePartialChallenge is Ownable, Modifiable, Configurable, Validatable, SecurityBondable {
    using SafeMathInt for int256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    CancelOrdersChallenge public cancelOrdersChallenge;

    address private dealSettlementChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeCancelOrdersChallengeEvent(CancelOrdersChallenge oldCancelOrdersChallenge, CancelOrdersChallenge newCancelOrdersChallenge);
    event ChallengeByOrderEvent(Types.Order order, uint256 nonce, Types.DealType dealType, address reporter);
    event ChallengeByTradeEvent(Types.Trade trade, address wallet, uint256 nonce, Types.DealType dealType, address reporter);
    event ChallengeByPaymentEvent(Types.Payment payment, address wallet, uint256 nonce, Types.DealType dealType, address reporter);
    event UnchallengeOrderCandidateByTradeEvent(Types.Order order, Types.Trade trade, uint256 nonce, Types.DealType dealType, address reporter);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner, DealSettlementChallenge _dealSettlementChallenge) Ownable(_owner) notNullAddress(_dealSettlementChallenge) public {
        dealSettlementChallenge = _dealSettlementChallenge;
    }

    /// @notice Change the cancel orders challenge contract
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

    /// @notice Challenge the deal settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged deal
    function challengeByOrder(Types.Order order, address original_sender)
    public
    onlyController
    onlySealedOrder(order)
    {
        require(cancelOrdersChallenge != address(0));

        DealSettlementChallenge.Challenge memory challenge = DealSettlementChallenge(dealSettlementChallenge).getWalletChallengeMap(order.wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Buy order -> Conjugate currency and amount
        // Sell order -> Intended currency and amount
        address orderCurrency;
        int256 orderAmount;
        (orderCurrency, orderAmount) = (Types.Intention.Sell == order.placement.intention ? (order.placement.currencies.intended, order.placement.amount)
                                                                                          : (order.placement.currencies.conjugate, order.placement.amount.div(order.placement.rate)));

        int256 balance = (Types.DealType.Trade == challenge.dealType ? getTradeBalance(DealSettlementChallenge(dealSettlementChallenge).getWalletChallengeTradesMap(order.wallet, challenge.dealIndex), order.wallet, orderCurrency)
                                                                     : getPaymentBalance(DealSettlementChallenge(dealSettlementChallenge).getWalletChallengePaymentsMap(order.wallet, challenge.dealIndex), order.wallet, orderCurrency));

        require(orderAmount > balance);

        DealSettlementChallenge(dealSettlementChallenge).pushChallengeCandidateOrders(order);

        challenge.result = Types.ChallengeResult.Disqualified;
        challenge.candidateType = DealSettlementChallenge.ChallengeCandidateType.Order;
        challenge.candidateIndex = DealSettlementChallenge(dealSettlementChallenge).getChallengeCandidateOrdersLength() - 1;
        challenge.challenger = cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.exchange.hash) ? address(0) : original_sender;
        DealSettlementChallenge(dealSettlementChallenge).setWalletChallengeMap(order.wallet, challenge);

        //raise event
        emit ChallengeByOrderEvent(order, challenge.nonce, challenge.dealType, original_sender);
    }

    /// @notice Unchallenge deal settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged deal
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(Types.Order order, Types.Trade trade, address original_sender)
    public
    validatorInitialized
    onlyController
    onlySealedOrder(order)
    onlySealedTrade(trade)
    onlyTradeParty(trade, order.wallet)
    onlyTradeOrder(trade, order)
    {
        require(configuration != address(0));
        require(securityBond != address(0));

        DealSettlementChallenge.Challenge memory challenge = DealSettlementChallenge(dealSettlementChallenge).getWalletChallengeMap(order.wallet);
        require(challenge.candidateType == DealSettlementChallenge.ChallengeCandidateType.Order);

        challenge.result = Types.ChallengeResult.Qualified;
        challenge.candidateType = DealSettlementChallenge.ChallengeCandidateType.None;
        challenge.candidateIndex = 0;
        challenge.challenger = address(0);
        DealSettlementChallenge(dealSettlementChallenge).setWalletChallengeMap(order.wallet, challenge);

        securityBond.stage(configuration.getUnchallengeOrderCandidateByTradeStakeAmount(), configuration.getUnchallengeOrderCandidateByTradeStakeCurrency(), original_sender);

        //raise event
        emit UnchallengeOrderCandidateByTradeEvent(order, trade, challenge.nonce, challenge.dealType, original_sender);
    }

    /// @notice Challenge the deal settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged deal
    /// @param wallet The wallet whose deal settlement is being challenged
    function challengeByTrade(Types.Trade trade, address wallet, address original_sender)
    public
    validatorInitialized
    onlyController
    onlySealedTrade(trade)
    onlyTradeParty(trade, wallet)
    {
        require(cancelOrdersChallenge != address(0));

        DealSettlementChallenge.Challenge memory challenge = DealSettlementChallenge(dealSettlementChallenge).getWalletChallengeMap(wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        // Wallet is buyer in (candidate) trade -> consider single conjugate transfer in (candidate) trade
        // Wallet is seller in (candidate) trade -> consider single intended transfer in (candidate) trade
        Types.TradePartyRole tradePartyRole = (trade.buyer.wallet == wallet ?
        Types.TradePartyRole.Buyer :
        Types.TradePartyRole.Seller);

        address currency;
        int256 candidateTransfer;
        (currency, candidateTransfer) = (Types.TradePartyRole.Buyer == tradePartyRole ?
        (trade.currencies.conjugate, trade.transfers.conjugate.single.abs()) :
        (trade.currencies.intended, trade.transfers.intended.single.abs()));

        int256 challengeBalance = (Types.DealType.Trade == challenge.dealType ?
        getTradeBalance(
            DealSettlementChallenge(dealSettlementChallenge).getWalletChallengeTradesMap(wallet, challenge.dealIndex),
            wallet,
            currency
        ) :
        getPaymentBalance(
            DealSettlementChallenge(dealSettlementChallenge).getWalletChallengePaymentsMap(wallet, challenge.dealIndex),
            wallet,
            currency
        ));

        require(candidateTransfer > challengeBalance);

        DealSettlementChallenge(dealSettlementChallenge).pushChallengeCandidateTrades(trade);

        bytes32 orderExchangeHash = (trade.buyer.wallet == wallet ?
        trade.buyer.order.hashes.exchange :
        trade.seller.order.hashes.exchange);

        bool orderCancelled = cancelOrdersChallenge.isOrderCancelled(wallet, orderExchangeHash);
        challenge.result = Types.ChallengeResult.Disqualified;
        challenge.candidateType = DealSettlementChallenge.ChallengeCandidateType.Trade;
        challenge.candidateIndex = DealSettlementChallenge(dealSettlementChallenge).getChallengeCandidateTradesLength() - 1;
        challenge.challenger = orderCancelled ? address(0) : original_sender;
        DealSettlementChallenge(dealSettlementChallenge).setWalletChallengeMap(wallet, challenge);

        //raise event
        emit ChallengeByTradeEvent(trade, wallet, challenge.nonce, challenge.dealType, original_sender);
    }

    /// @notice Challenge the deal settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged deal
    /// @param wallet The wallet whose deal settlement is being challenged
    function challengeByPayment(Types.Payment payment, address wallet, address original_sender)
    public
    validatorInitialized
    onlyController
    onlySealedPayment(payment)
    onlyPaymentSender(payment, wallet) // Wallet is recipient in (candidate) payment -> nothing to consider
    {
        DealSettlementChallenge.Challenge memory challenge = DealSettlementChallenge(dealSettlementChallenge).getWalletChallengeMap(wallet);
        require(
            0 < challenge.nonce
            && block.timestamp < challenge.timeout
        );

        int256 candidateTransfer = payment.transfers.single.abs();

        int256 challengeBalance = (Types.DealType.Trade == challenge.dealType ?
        getTradeBalance(
            DealSettlementChallenge(dealSettlementChallenge).getWalletChallengeTradesMap(wallet, challenge.dealIndex),
            wallet,
            payment.currency
        ) :
        getPaymentBalance(
            DealSettlementChallenge(dealSettlementChallenge).getWalletChallengePaymentsMap(wallet, challenge.dealIndex),
            wallet,
            payment.currency
        ));

        require(candidateTransfer > challengeBalance);

        DealSettlementChallenge(dealSettlementChallenge).pushChallengeCandidatePayments(payment);

        challenge.result = Types.ChallengeResult.Disqualified;
        challenge.candidateType = DealSettlementChallenge.ChallengeCandidateType.Payment;
        challenge.candidateIndex = DealSettlementChallenge(dealSettlementChallenge).getChallengeCandidatePaymentsLength() - 1;
        challenge.challenger = original_sender;
        DealSettlementChallenge(dealSettlementChallenge).setWalletChallengeMap(wallet, challenge);

        //raise event
        emit ChallengeByPaymentEvent(payment, wallet, challenge.nonce, challenge.dealType, original_sender);
    }

    function getTradeBalance(Types.Trade trade, address wallet, address currency) private pure returns (int256) {
        require(0 < trade.nonce);
        require(currency == trade.currencies.intended || currency == trade.currencies.conjugate);

        Types.TradePartyRole tradePartyRole = (wallet == trade.buyer.wallet ? Types.TradePartyRole.Buyer : Types.TradePartyRole.Seller);
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

        Types.PaymentPartyRole paymentPartyRole = (wallet == payment.sender.wallet ? Types.PaymentPartyRole.Sender : Types.PaymentPartyRole.Recipient);
        if (Types.PaymentPartyRole.Sender == paymentPartyRole)
            return payment.sender.balances.current;
        else //Types.PaymentPartyRole.Recipient == paymentPartyRole
            return payment.recipient.balances.current;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyTradeParty(Types.Trade trade, address wallet) {
        require(Types.isTradeParty(trade, wallet));
        _;
    }

    modifier onlyTradeOrder(Types.Trade trade, Types.Order order) {
        require(Types.isTradeOrder(trade, order));
        _;
    }

    modifier onlyPaymentSender(Types.Payment payment, address wallet) {
        require(Types.isPaymentSender(payment, wallet));
        _;
    }

    modifier signedBy(bytes32 hash, Types.Signature signature, address signer) {
        require(Types.isGenuineSignature(hash, signature, signer));
        _;
    }

    modifier onlyController() {
        require(msg.sender == dealSettlementChallenge);
        _;
    }
}