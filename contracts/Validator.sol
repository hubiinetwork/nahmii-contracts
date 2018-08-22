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
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {StriimTypes} from "./StriimTypes.sol";
import {Ownable} from "./Ownable.sol";
import {Configurable} from "./Configurable.sol";
import {Hashable} from "./Hashable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title Validatable
@notice An ownable that validates valuable types (order, trade, payment)
*/
contract Validator is Ownable, Configurable, Hashable, SelfDestructible {
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
    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuineTradeBuyerFee(StriimTypes.Trade trade) public view returns (bool) {
        int256 feePartsPer = configuration.getPartsPer();
        int256 discountTier = int256(trade.buyer.rollingVolume);
        if (StriimTypes.LiquidityRole.Maker == trade.buyer.liquidityRole) {
            return (trade.buyer.fees.single.amount <= trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, 0)).div(feePartsPer))
            && (trade.buyer.fees.single.amount == trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.buyer.fees.single.amount >= trade.amount.mul(configuration.getTradeMakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        } else {// StriimTypes.LiquidityRole.Taker == trade.buyer.liquidityRole
            return (trade.buyer.fees.single.amount <= trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, 0)).div(feePartsPer))
            && (trade.buyer.fees.single.amount == trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.buyer.fees.single.amount >= trade.amount.mul(configuration.getTradeTakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        }
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuineTradeSellerFee(StriimTypes.Trade trade) public view returns (bool) {
        int256 feePartsPer = configuration.getPartsPer();
        int256 discountTier = int256(trade.seller.rollingVolume);
        if (StriimTypes.LiquidityRole.Maker == trade.seller.liquidityRole) {
            return (trade.seller.fees.single.amount <= trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, 0)).div(feePartsPer))
            && (trade.seller.fees.single.amount == trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.seller.fees.single.amount >= trade.amount.mul(configuration.getTradeMakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        } else {// StriimTypes.LiquidityRole.Taker == trade.seller.liquidityRole
            return (trade.seller.fees.single.amount <= trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, 0)).div(feePartsPer))
            && (trade.seller.fees.single.amount == trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.seller.fees.single.amount >= trade.amount.mul(configuration.getTradeTakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        }
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuineTradeBuyer(StriimTypes.Trade trade, address exchange) public pure returns (bool) {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (trade.buyer.wallet != exchange)
        && (trade.buyer.balances.intended.current == trade.buyer.balances.intended.previous.add(trade.transfers.intended.single).sub(trade.buyer.fees.single.amount))
        && (trade.buyer.balances.conjugate.current == trade.buyer.balances.conjugate.previous.sub(trade.transfers.conjugate.single))
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.current)
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.previous)
        && (trade.buyer.order.residuals.previous >= trade.buyer.order.residuals.current);
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuineTradeSeller(StriimTypes.Trade trade, address exchange) public pure returns (bool) {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (trade.seller.wallet != exchange)
        && (trade.seller.balances.intended.current == trade.seller.balances.intended.previous.sub(trade.transfers.intended.single))
        && (trade.seller.balances.conjugate.current == trade.seller.balances.conjugate.previous.add(trade.transfers.conjugate.single).sub(trade.seller.fees.single.amount))
        && (trade.seller.order.amount >= trade.seller.order.residuals.current)
        && (trade.seller.order.amount >= trade.seller.order.residuals.previous)
        && (trade.seller.order.residuals.previous >= trade.seller.order.residuals.current);
    }

    function isGenuineOrderWalletHash(StriimTypes.Order order) public view returns (bool) {
        return hasher.hashOrderAsWallet(order) == order.seals.wallet.hash;
    }

    function isGenuineOrderExchangeHash(StriimTypes.Order order) public view returns (bool) {
        return hasher.hashOrderAsExchange(order) == order.seals.exchange.hash;
    }

    function isGenuineOrderWalletSeal(StriimTypes.Order order) public view returns (bool) {
        return isGenuineOrderWalletHash(order)
        && StriimTypes.isGenuineSignature(order.seals.wallet.hash, order.seals.wallet.signature, order.wallet);
    }

    function isGenuineOrderExchangeSeal(StriimTypes.Order order, address exchange) public view returns (bool) {
        return isGenuineOrderExchangeHash(order)
        && StriimTypes.isGenuineSignature(order.seals.exchange.hash, order.seals.exchange.signature, exchange);
    }

    function isGenuineOrderSeals(StriimTypes.Order order, address exchange) public view returns (bool) {
        return isGenuineOrderWalletSeal(order) && isGenuineOrderExchangeSeal(order, exchange);
    }

    function isGenuineTradeHash(StriimTypes.Trade trade) public view returns (bool) {
        return hasher.hashTrade(trade) == trade.seal.hash;
    }

    function isGenuineTradeSeal(StriimTypes.Trade trade, address exchange) public view returns (bool) {
        return isGenuineTradeHash(trade)
        && StriimTypes.isGenuineSignature(trade.seal.hash, trade.seal.signature, exchange);
    }

    function isGenuinePaymentWalletHash(StriimTypes.Payment payment) public view returns (bool) {
        return hasher.hashPaymentAsWallet(payment) == payment.seals.wallet.hash;
    }

    function isGenuinePaymentExchangeHash(StriimTypes.Payment payment) public view returns (bool) {
        return hasher.hashPaymentAsExchange(payment) == payment.seals.exchange.hash;
    }

    function isGenuinePaymentWalletSeal(StriimTypes.Payment payment) public view returns (bool) {
        return isGenuinePaymentWalletHash(payment)
        && StriimTypes.isGenuineSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);
    }

    function isGenuinePaymentExchangeSeal(StriimTypes.Payment payment, address exchange) public view returns (bool) {
        return isGenuinePaymentExchangeHash(payment)
        && StriimTypes.isGenuineSignature(payment.seals.exchange.hash, payment.seals.exchange.signature, exchange);
    }

    function isGenuinePaymentSeals(StriimTypes.Payment payment, address exchange) public view returns (bool) {
        return isGenuinePaymentWalletSeal(payment) && isGenuinePaymentExchangeSeal(payment, exchange);
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuinePaymentFee(StriimTypes.Payment payment) public view returns (bool) {
        int256 feePartsPer = int256(configuration.getPartsPer());
        return (payment.sender.fees.single.amount <= payment.amount.mul(configuration.getCurrencyPaymentFee(payment.currency.ct, payment.currency.id, payment.blockNumber, 0)).div(feePartsPer))
        && (payment.sender.fees.single.amount == payment.amount.mul(configuration.getCurrencyPaymentFee(payment.currency.ct, payment.currency.id, payment.blockNumber, payment.amount)).div(feePartsPer))
        && (payment.sender.fees.single.amount >= payment.amount.mul(configuration.getCurrencyPaymentMinimumFee(payment.currency.ct, payment.currency.id, payment.blockNumber)).div(feePartsPer));
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuinePaymentSender(StriimTypes.Payment payment) public pure returns (bool) {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.sender.balances.current == payment.sender.balances.previous.sub(payment.transfers.single).sub(payment.sender.fees.single));
    }

    function isGenuinePaymentRecipient(StriimTypes.Payment payment) public pure returns (bool) {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.recipient.balances.current == payment.recipient.balances.previous.add(payment.transfers.single));
    }

    function isSuccessiveTradesPartyNonces(
        StriimTypes.Trade firstTrade,
        StriimTypes.TradePartyRole firstTradePartyRole,
        StriimTypes.Trade lastTrade,
        StriimTypes.TradePartyRole lastTradePartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (StriimTypes.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.nonce : firstTrade.seller.nonce);
        uint256 lastNonce = (StriimTypes.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.nonce : lastTrade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentsPartyNonces(
        StriimTypes.Payment firstPayment,
        StriimTypes.PaymentPartyRole firstPaymentPartyRole,
        StriimTypes.Payment lastPayment,
        StriimTypes.PaymentPartyRole lastPaymentPartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (StriimTypes.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.nonce : firstPayment.recipient.nonce);
        uint256 lastNonce = (StriimTypes.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.nonce : lastPayment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessiveTradePaymentPartyNonces(
        StriimTypes.Trade trade,
        StriimTypes.TradePartyRole tradePartyRole,
        StriimTypes.Payment payment,
        StriimTypes.PaymentPartyRole paymentPartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (StriimTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        uint256 lastNonce = (StriimTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentTradePartyNonces(
        StriimTypes.Payment payment,
        StriimTypes.PaymentPartyRole paymentPartyRole,
        StriimTypes.Trade trade,
        StriimTypes.TradePartyRole tradePartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (StriimTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        uint256 lastNonce = (StriimTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isGenuineSuccessiveTradesBalances(
        StriimTypes.Trade firstTrade,
        StriimTypes.TradePartyRole firstTradePartyRole,
        StriimTypes.CurrencyRole firstCurrencyRole,
        StriimTypes.Trade lastTrade,
        StriimTypes.TradePartyRole lastTradePartyRole,
        StriimTypes.CurrencyRole lastCurrencyRole
    )
    public
    pure
    returns (bool)
    {
        StriimTypes.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (StriimTypes.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.balances : firstTrade.seller.balances);
        StriimTypes.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (StriimTypes.CurrencyRole.Intended == firstCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        StriimTypes.IntendedConjugateCurrentPreviousInt256 memory lastIntendedConjugateCurrentPreviousBalances = (StriimTypes.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.balances : lastTrade.seller.balances);
        StriimTypes.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (StriimTypes.CurrencyRole.Intended == lastCurrencyRole ? lastIntendedConjugateCurrentPreviousBalances.intended : lastIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentsBalances(
        StriimTypes.Payment firstPayment,
        StriimTypes.PaymentPartyRole firstPaymentPartyRole,
        StriimTypes.Payment lastPayment,
        StriimTypes.PaymentPartyRole lastPaymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        StriimTypes.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (StriimTypes.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.balances : firstPayment.recipient.balances);
        StriimTypes.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (StriimTypes.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.balances : lastPayment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradePaymentBalances(
        StriimTypes.Trade trade,
        StriimTypes.TradePartyRole tradePartyRole,
        StriimTypes.CurrencyRole currencyRole,
        StriimTypes.Payment payment,
        StriimTypes.PaymentPartyRole paymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        StriimTypes.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (StriimTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        StriimTypes.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (StriimTypes.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        StriimTypes.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (StriimTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentTradeBalances(
        StriimTypes.Payment payment,
        StriimTypes.PaymentPartyRole paymentPartyRole,
        StriimTypes.Trade trade,
        StriimTypes.TradePartyRole tradePartyRole,
        StriimTypes.CurrencyRole currencyRole
    )
    public
    pure
    returns (bool)
    {
        StriimTypes.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (StriimTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        StriimTypes.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (StriimTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        StriimTypes.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (StriimTypes.CurrencyRole.Intended == currencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradesNetFees(
        StriimTypes.Trade firstTrade,
        StriimTypes.TradePartyRole firstTradePartyRole,
        StriimTypes.Trade lastTrade,
        StriimTypes.TradePartyRole lastTradePartyRole
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypes.Figure memory lastSingleFee = 0;
        if (StriimTypes.TradePartyRole.Buyer == lastTradePartyRole)
            lastSingleFee = lastTrade.buyer.fees.single;
        else if (StriimTypes.TradePartyRole.Seller == lastTradePartyRole)
            lastSingleFee = lastTrade.seller.fees.single;

        MonetaryTypes.Figure[] memory firstNetFees = (StriimTypes.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.fees.net : firstTrade.seller.fees.net);
        MonetaryTypes.Figure memory firstNetFee = MonetaryTypes.getFigureByCurrency(firstNetFees, lastSingleFee.currency);

        MonetaryTypes.Figure[] memory lastNetFees = (StriimTypes.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.fees.net : lastTrade.seller.fees.net);
        MonetaryTypes.Figure memory lastNetFee = MonetaryTypes.getFigureByCurrency(lastNetFees, lastSingleFee.currency);

        return lastNetFee.amount == firstNetFee.amount.add(lastSingleFee.amount);
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        StriimTypes.Trade firstTrade,
        StriimTypes.Trade lastTrade,
        StriimTypes.TradePartyRole tradePartyRole
    )
    public
    pure
    returns (bool)
    {
        (int256 firstCurrentResiduals, int256 lastPreviousResiduals) = (StriimTypes.TradePartyRole.Buyer == tradePartyRole) ?
        (firstTrade.buyer.order.residuals.current, lastTrade.buyer.order.residuals.previous) :
    (firstTrade.seller.order.residuals.current, lastTrade.seller.order.residuals.previous);

        return firstCurrentResiduals == lastPreviousResiduals;
    }

    function isGenuineSuccessivePaymentsNetFees(
        StriimTypes.Payment firstPayment,
        StriimTypes.Payment lastPayment
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypes.Figure memory firstNetFee = MonetaryTypes.getFigureByCurrency(firstPayment.sender.fees.net, lastPayment.sender.fees.single.currency);
        MonetaryTypes.Figure memory lastNetFee = MonetaryTypes.getFigureByCurrency(lastPayment.sender.fees.net, lastPayment.sender.fees.single.currency);
        return lastNetFee.amount == firstNetFee.amount.add(lastPayment.sender.fees.single.amount);
    }

    function isGenuineSuccessiveTradePaymentNetFees(
        StriimTypes.Trade trade,
        StriimTypes.TradePartyRole tradePartyRole,
        StriimTypes.Payment payment
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypes.Figure[] memory firstNetFees = (StriimTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.fees.net : trade.seller.fees.net);
        MonetaryTypes.Figure memory firstNetFee = MonetaryTypes.getFigureByCurrency(firstNetFees, payment.sender.fees.single.currency);

        MonetaryTypes.Figure memory lastNetFee = MonetaryTypes.getFigureByCurrency(payment.sender.fees.net, payment.sender.fees.single.currency);

        return lastNetFee.amount == firstNetFee.amount.add(payment.sender.fees.single.amount);
    }

    function isGenuineSuccessivePaymentTradeNetFees(
        StriimTypes.Payment payment,
        StriimTypes.PaymentPartyRole paymentPartyRole,
        StriimTypes.Trade trade,
        StriimTypes.TradePartyRole tradePartyRole
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypes.Figure memory lastSingleFee = 0;
        if (StriimTypes.TradePartyRole.Buyer == tradePartyRole)
            lastSingleFee = trade.buyer.fees.single;
        else if (StriimTypes.TradePartyRole.Seller == tradePartyRole)
            lastSingleFee = trade.seller.fees.single;

        MonetaryTypes.Figure[] memory firstNetFees = (StriimTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.fees.net : payment.recipient.fees.net);
        MonetaryTypes.Figure memory firstNetFee = MonetaryTypes.getFigureByCurrency(firstNetFees, lastSingleFee.currency);

        MonetaryTypes.Figure[] memory lastNetFees = (StriimTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.fees.net : trade.seller.fees.net);
        MonetaryTypes.Figure memory lastNetFee = MonetaryTypes.getFigureByCurrency(lastNetFees, lastSingleFee.currency);

        return lastNetFee.amount == firstNetFee.amount.add(lastSingleFee.amount);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }
}