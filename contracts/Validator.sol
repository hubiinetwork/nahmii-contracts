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
import {SafeMathUint} from "./SafeMathUint.sol";
import {Types} from "./Types.sol";
import {Ownable} from "./Ownable.sol";
import {Configurable} from "./Configurable.sol";
import {Hashable} from "./Hashable.sol";

contract Validator is Ownable, Configurable, Hashable {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function isGenuineTradeMakerFee(Types.Trade trade) public view returns (bool) {
        int256 feePartsPer = configuration.getPartsPer();
        int256 discountTier;
        if (Types.LiquidityRole.Maker == trade.buyer.liquidityRole) {
            discountTier = int256(trade.buyer.rollingVolume);
            return (trade.singleFees.intended <= trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.singleFees.intended == trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.singleFees.intended >= trade.amount.mul(configuration.getTradeMakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        } else {// Types.LiquidityRole.Maker == trade.seller.liquidityRole
            discountTier = int256(trade.seller.rollingVolume);
            return (trade.singleFees.conjugate <= trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(trade.rate.mul(feePartsPer)))
            && (trade.singleFees.conjugate == trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(trade.rate.mul(feePartsPer)))
            && (trade.singleFees.conjugate >= trade.amount.mul(configuration.getTradeMakerMinimumFee(trade.blockNumber)).div(trade.rate.mul(feePartsPer)));
        }
    }

    function isGenuineTradeTakerFee(Types.Trade trade) public view returns (bool) {
        int256 feePartsPer = configuration.getPartsPer();
        int256 discountTier;
        if (Types.LiquidityRole.Taker == trade.buyer.liquidityRole) {
            discountTier = int256(trade.buyer.rollingVolume);
            return (trade.singleFees.intended <= trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.singleFees.intended == trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.singleFees.intended >= trade.amount.mul(configuration.getTradeTakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        } else {// Types.LiquidityRole.Taker == trade.seller.liquidityRole
            discountTier = int256(trade.seller.rollingVolume);
            return (trade.singleFees.conjugate <= trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(trade.rate.mul(feePartsPer)))
            && (trade.singleFees.conjugate == trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(trade.rate.mul(feePartsPer)))
            && (trade.singleFees.conjugate >= trade.amount.mul(configuration.getTradeTakerMinimumFee(trade.blockNumber)).div(trade.rate.mul(feePartsPer)));
        }
    }

    function isGenuineTradeBuyer(Types.Trade trade, address exchange) public pure returns (bool) {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (trade.buyer.wallet != exchange)
        && (trade.buyer.balances.intended.current == trade.buyer.balances.intended.previous.add(trade.transfers.intended.single).sub(trade.singleFees.intended))
        && (trade.buyer.balances.conjugate.current == trade.buyer.balances.conjugate.previous.sub(trade.transfers.conjugate.single))
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.current)
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.previous)
        && (trade.buyer.order.residuals.previous >= trade.buyer.order.residuals.current);
    }

    function isGenuineTradeSeller(Types.Trade trade, address exchange) public pure returns (bool) {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (trade.seller.wallet != exchange)
        && (trade.seller.balances.intended.current == trade.seller.balances.intended.previous.sub(trade.transfers.intended.single))
        && (trade.seller.balances.conjugate.current == trade.seller.balances.conjugate.previous.add(trade.transfers.conjugate.single).sub(trade.singleFees.conjugate))
        && (trade.seller.order.amount >= trade.seller.order.residuals.current)
        && (trade.seller.order.amount >= trade.seller.order.residuals.previous)
        && (trade.seller.order.residuals.previous >= trade.seller.order.residuals.current);
    }

    function isGenuineOrderWalletHash(Types.Order order) public view returns (bool) {
        return hasher.hashOrderAsWallet(order) == order.seals.wallet.hash;
    }

    function isGenuineOrderExchangeHash(Types.Order order) public view returns (bool) {
        return hasher.hashOrderAsExchange(order) == order.seals.exchange.hash;
    }

    function isGenuineOrderWalletSeal(Types.Order order) public view returns (bool) {
        return isGenuineOrderWalletHash(order)
        && Types.isGenuineSignature(order.seals.wallet.hash, order.seals.wallet.signature, order.wallet);
    }

    function isGenuineOrderExchangeSeal(Types.Order order, address exchange) public view returns (bool) {
        return isGenuineOrderExchangeHash(order)
        && Types.isGenuineSignature(order.seals.exchange.hash, order.seals.exchange.signature, exchange);
    }

    function isGenuineOrderSeals(Types.Order order, address exchange) public view returns (bool) {
        return isGenuineOrderWalletSeal(order) && isGenuineOrderExchangeSeal(order, exchange);
    }

    function isGenuineTradeHash(Types.Trade trade) public view returns (bool) {
        return hasher.hashTrade(trade) == trade.seal.hash;
    }

    function isGenuineTradeSeal(Types.Trade trade, address exchange) public view returns (bool) {
        return isGenuineTradeHash(trade)
        && Types.isGenuineSignature(trade.seal.hash, trade.seal.signature, exchange);
    }

    function isGenuinePaymentWalletHash(Types.Payment payment) public view returns (bool) {
        return hasher.hashPaymentAsWallet(payment) == payment.seals.wallet.hash;
    }

    function isGenuinePaymentExchangeHash(Types.Payment payment) public view returns (bool) {
        return hasher.hashPaymentAsExchange(payment) == payment.seals.exchange.hash;
    }

    function isGenuinePaymentWalletSeal(Types.Payment payment) public view returns (bool) {
        return isGenuinePaymentWalletHash(payment)
        && Types.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);
    }

    function isGenuinePaymentExchangeSeal(Types.Payment payment, address exchange) public view returns (bool) {
        return isGenuinePaymentExchangeHash(payment)
        && Types.isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, exchange);
    }

    function isGenuinePaymentSeals(Types.Payment payment, address exchange) public view returns (bool) {
        return isGenuinePaymentWalletSeal(payment) && isGenuinePaymentExchangeSeal(payment, exchange);
    }

    function isGenuinePaymentFee(Types.Payment payment) public view returns (bool) {
        int256 feePartsPer = int256(configuration.getPartsPer());
        return (payment.singleFee <= payment.amount.mul(configuration.getCurrencyPaymentFee(payment.currency, payment.blockNumber, 0)).div(feePartsPer))
        && (payment.singleFee == payment.amount.mul(configuration.getCurrencyPaymentFee(payment.currency, payment.blockNumber, payment.amount)).div(feePartsPer))
        && (payment.singleFee >= payment.amount.mul(configuration.getCurrencyPaymentMinimumFee(payment.currency, payment.blockNumber)).div(feePartsPer));
    }

    function isGenuinePaymentSender(Types.Payment payment) public pure returns (bool) {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.sender.balances.current == payment.sender.balances.previous.sub(payment.transfers.single).sub(payment.singleFee));
    }

    function isGenuinePaymentRecipient(Types.Payment payment) public pure returns (bool) {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.recipient.balances.current == payment.recipient.balances.previous.add(payment.transfers.single));
    }

    function isSuccessiveTradesPartyNonces(
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (Types.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.nonce : firstTrade.seller.nonce);
        uint256 lastNonce = (Types.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.nonce : lastTrade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentsPartyNonces(
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (Types.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.nonce : firstPayment.recipient.nonce);
        uint256 lastNonce = (Types.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.nonce : lastPayment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessiveTradePaymentPartyNonces(
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        uint256 lastNonce = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentTradePartyNonces(
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        uint256 lastNonce = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isGenuineSuccessiveTradesBalances(
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.CurrencyRole firstCurrencyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole,
        Types.CurrencyRole lastCurrencyRole
    )
    public
    pure
    returns (bool)
    {
        Types.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (Types.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.balances : firstTrade.seller.balances);
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.CurrencyRole.Intended == firstCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        Types.IntendedConjugateCurrentPreviousInt256 memory lastIntendedConjugateCurrentPreviousBalances = (Types.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.balances : lastTrade.seller.balances);
        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.CurrencyRole.Intended == lastCurrencyRole ? lastIntendedConjugateCurrentPreviousBalances.intended : lastIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentsBalances(
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.balances : firstPayment.recipient.balances);
        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.balances : lastPayment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradePaymentBalances(
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole currencyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        Types.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentTradeBalances(
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole currencyRole
    )
    public
    pure
    returns (bool)
    {
        Types.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        Types.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        Types.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradesNetFees(
        Types.Trade firstTrade,
        Types.TradePartyRole firstTradePartyRole,
        Types.CurrencyRole firstCurrencyRole,
        Types.Trade lastTrade,
        Types.TradePartyRole lastTradePartyRole,
        Types.CurrencyRole lastCurrencyRole
    )
    public
    pure
    returns (bool)
    {
        Types.IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.netFees : firstTrade.seller.netFees);
        int256 firstNetFee = (Types.CurrencyRole.Intended == firstCurrencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        Types.IntendedConjugateInt256 memory lastIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.netFees : lastTrade.seller.netFees);
        int256 lastNetFee = (Types.CurrencyRole.Intended == lastCurrencyRole ? lastIntendedConjugateNetFees.intended : lastIntendedConjugateNetFees.conjugate);

        int256 lastSingleFee = 0;
        if (Types.TradePartyRole.Buyer == lastTradePartyRole && Types.CurrencyRole.Intended == lastCurrencyRole)
            lastSingleFee = lastTrade.singleFees.intended;
        else if (Types.TradePartyRole.Seller == lastTradePartyRole && Types.CurrencyRole.Conjugate == lastCurrencyRole)
            lastSingleFee = lastTrade.singleFees.conjugate;

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        Types.Trade firstTrade,
        Types.Trade lastTrade,
        Types.TradePartyRole tradePartyRole
    )
    public
    pure
    returns (bool)
    {
        (int256 firstCurrentResiduals, int256 lastPreviousResiduals) = (Types.TradePartyRole.Buyer == tradePartyRole) ?
    (firstTrade.buyer.order.residuals.current, lastTrade.buyer.order.residuals.previous) :
    (firstTrade.seller.order.residuals.current, lastTrade.seller.order.residuals.previous);

        return firstCurrentResiduals == lastPreviousResiduals;
    }

    function isGenuineSuccessivePaymentsNetFees(
        Types.Payment firstPayment,
        Types.PaymentPartyRole firstPaymentPartyRole,
        Types.Payment lastPayment,
        Types.PaymentPartyRole lastPaymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        int256 firstNetFee = (Types.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.netFee : firstPayment.recipient.netFee);

        int256 lastNetFee = (Types.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.netFee : lastPayment.recipient.netFee);

        int256 lastSingleFee = (Types.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.singleFee : 0);

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessiveTradePaymentNetFees(
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole currencyRole,
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        Types.IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.netFees : trade.seller.netFees);
        int256 firstNetFee = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        int256 lastNetFee = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.netFee : payment.recipient.netFee);

        int256 lastSingleFee = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.singleFee : 0);

        return lastNetFee == firstNetFee.add(lastSingleFee);
    }

    function isGenuineSuccessivePaymentTradeNetFees(
        Types.Payment payment,
        Types.PaymentPartyRole paymentPartyRole,
        Types.Trade trade,
        Types.TradePartyRole tradePartyRole,
        Types.CurrencyRole currencyRole
    )
    public
    pure
    returns (bool)
    {
        int256 firstNetFee = (Types.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.netFee : payment.recipient.netFee);

        Types.IntendedConjugateInt256 memory firstIntendedConjugateNetFees = (Types.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.netFees : trade.seller.netFees);
        int256 lastNetFee = (Types.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateNetFees.intended : firstIntendedConjugateNetFees.conjugate);

        int256 lastSingleFee = 0;
        if (Types.TradePartyRole.Buyer == tradePartyRole && Types.CurrencyRole.Intended == currencyRole)
            lastSingleFee = trade.singleFees.intended;
        else if (Types.TradePartyRole.Seller == tradePartyRole && Types.CurrencyRole.Conjugate == currencyRole)
            lastSingleFee = trade.singleFees.conjugate;

        return lastNetFee == firstNetFee.add(lastSingleFee);
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
}