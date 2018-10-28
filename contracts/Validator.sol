/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";
import {Configurable} from "./Configurable.sol";
import {Hashable} from "./Hashable.sol";
import {Ownable} from "./Ownable.sol";
import {SignerManageable} from "./SignerManageable.sol";

/**
@title Validatable
@notice An ownable that validates valuable types (order, trade, payment)
*/
contract Validator is Ownable, SignerManageable, Configurable, Hashable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner, address signerManager) Ownable(owner) SignerManageable(signerManager) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuineTradeBuyerFee(NahmiiTypes.Trade trade) public view returns (bool) {
        int256 feePartsPer = configuration.getPartsPer();
        int256 discountTier = int256(trade.buyer.rollingVolume);
        if (NahmiiTypes.LiquidityRole.Maker == trade.buyer.liquidityRole) {
            return (trade.buyer.fees.single.amount <= trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, 0)).div(feePartsPer))
            && (trade.buyer.fees.single.amount == trade.amount.mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.buyer.fees.single.amount >= trade.amount.mul(configuration.getTradeMakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        } else {// NahmiiTypes.LiquidityRole.Taker == trade.buyer.liquidityRole
            return (trade.buyer.fees.single.amount <= trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, 0)).div(feePartsPer))
            && (trade.buyer.fees.single.amount == trade.amount.mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.buyer.fees.single.amount >= trade.amount.mul(configuration.getTradeTakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        }
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuineTradeSellerFee(NahmiiTypes.Trade trade) public view returns (bool) {
        int256 feePartsPer = configuration.getPartsPer();
        int256 discountTier = int256(trade.seller.rollingVolume);
        if (NahmiiTypes.LiquidityRole.Maker == trade.seller.liquidityRole) {
            return (trade.seller.fees.single.amount <= trade.amount.div(trade.rate).mul(configuration.getTradeMakerFee(trade.blockNumber, 0)).div(feePartsPer))
            && (trade.seller.fees.single.amount == trade.amount.div(trade.rate).mul(configuration.getTradeMakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.seller.fees.single.amount >= trade.amount.div(trade.rate).mul(configuration.getTradeMakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        } else {// NahmiiTypes.LiquidityRole.Taker == trade.seller.liquidityRole
            return (trade.seller.fees.single.amount <= trade.amount.div(trade.rate).mul(configuration.getTradeTakerFee(trade.blockNumber, 0)).div(feePartsPer))
            && (trade.seller.fees.single.amount == trade.amount.div(trade.rate).mul(configuration.getTradeTakerFee(trade.blockNumber, discountTier)).div(feePartsPer))
            && (trade.seller.fees.single.amount >= trade.amount.div(trade.rate).mul(configuration.getTradeTakerMinimumFee(trade.blockNumber)).div(feePartsPer));
        }
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuineTradeBuyer(NahmiiTypes.Trade trade) public view returns (bool) {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (!signerManager.isSigner(trade.buyer.wallet))
        && (trade.buyer.balances.intended.current == trade.buyer.balances.intended.previous.add(trade.transfers.intended.single).sub(trade.buyer.fees.single.amount))
        && (trade.buyer.balances.conjugate.current == trade.buyer.balances.conjugate.previous.sub(trade.transfers.conjugate.single))
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.current)
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.previous)
        && (trade.buyer.order.residuals.previous >= trade.buyer.order.residuals.current);
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuineTradeSeller(NahmiiTypes.Trade trade) public view returns (bool) {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (!signerManager.isSigner(trade.seller.wallet))
        && (trade.seller.balances.intended.current == trade.seller.balances.intended.previous.sub(trade.transfers.intended.single))
        && (trade.seller.balances.conjugate.current == trade.seller.balances.conjugate.previous.add(trade.transfers.conjugate.single).sub(trade.seller.fees.single.amount))
        && (trade.seller.order.amount >= trade.seller.order.residuals.current)
        && (trade.seller.order.amount >= trade.seller.order.residuals.previous)
        && (trade.seller.order.residuals.previous >= trade.seller.order.residuals.current);
    }

    function isGenuineOrderWalletHash(NahmiiTypes.Order order) public view returns (bool) {
        return hasher.hashOrderAsWallet(order) == order.seals.wallet.hash;
    }

    function isGenuineOrderOperatorHash(NahmiiTypes.Order order) public view returns (bool) {
        return hasher.hashOrderAsOperator(order) == order.seals.exchange.hash;
    }

    function isGenuineOperatorSignature(bytes32 hash, NahmiiTypes.Signature signature)
    public
    view
    returns (bool)
    {
        return isSignedByRegisteredSigner(hash, signature.v, signature.r, signature.s);
    }

    function isGenuineWalletSignature(bytes32 hash, NahmiiTypes.Signature signature, address wallet)
    public
    pure
    returns (bool)
    {
        return isSignedBy(hash, signature.v, signature.r, signature.s, wallet);
    }

    function isGenuineOrderWalletSeal(NahmiiTypes.Order order) public view returns (bool) {
        return isGenuineOrderWalletHash(order)
        && isGenuineWalletSignature(order.seals.wallet.hash, order.seals.wallet.signature, order.wallet);
    }

    function isGenuineOrderOperatorSeal(NahmiiTypes.Order order) public view returns (bool) {
        return isGenuineOrderOperatorHash(order)
        && isGenuineOperatorSignature(order.seals.exchange.hash, order.seals.exchange.signature);
    }

    function isGenuineOrderSeals(NahmiiTypes.Order order) public view returns (bool) {
        return isGenuineOrderWalletSeal(order) && isGenuineOrderOperatorSeal(order);
    }

    function isGenuineTradeHash(NahmiiTypes.Trade trade) public view returns (bool) {
        return hasher.hashTrade(trade) == trade.seal.hash;
    }

    function isGenuineTradeSeal(NahmiiTypes.Trade trade) public view returns (bool) {
        return isGenuineTradeHash(trade)
        && isGenuineOperatorSignature(trade.seal.hash, trade.seal.signature);
    }

    function isGenuinePaymentWalletHash(NahmiiTypes.Payment payment) public view returns (bool) {
        return hasher.hashPaymentAsWallet(payment) == payment.seals.wallet.hash;
    }

    function isGenuinePaymentOperatorHash(NahmiiTypes.Payment payment) public view returns (bool) {
        return hasher.hashPaymentAsOperator(payment) == payment.seals.exchange.hash;
    }

    function isGenuinePaymentWalletSeal(NahmiiTypes.Payment payment) public view returns (bool) {
        return isGenuinePaymentWalletHash(payment)
        && isGenuineWalletSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);
    }
    
    function isGenuinePaymentOperatorSeal(NahmiiTypes.Payment payment) public view returns (bool) {
        return isGenuinePaymentOperatorHash(payment)
        && isGenuineOperatorSignature(payment.seals.exchange.hash, payment.seals.exchange.signature);
    }

    function isGenuinePaymentSeals(NahmiiTypes.Payment payment) public view returns (bool) {
        return isGenuinePaymentWalletSeal(payment) && isGenuinePaymentOperatorSeal(payment);
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuinePaymentFee(NahmiiTypes.Payment payment) public view returns (bool) {
        int256 feePartsPer = int256(configuration.getPartsPer());
        return (payment.sender.fees.single.amount <= payment.amount.mul(configuration.getCurrencyPaymentFee(payment.currency.ct, payment.currency.id, payment.blockNumber, 0)).div(feePartsPer))
        && (payment.sender.fees.single.amount == payment.amount.mul(configuration.getCurrencyPaymentFee(payment.currency.ct, payment.currency.id, payment.blockNumber, payment.amount)).div(feePartsPer))
        && (payment.sender.fees.single.amount >= payment.amount.mul(configuration.getCurrencyPaymentMinimumFee(payment.currency.ct, payment.currency.id, payment.blockNumber)).div(feePartsPer));
    }

    // TODO Implement support for NFT. Current logics only applies to FT.
    function isGenuinePaymentSender(NahmiiTypes.Payment payment) public pure returns (bool) {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.sender.balances.current == payment.sender.balances.previous.sub(payment.transfers.single).sub(payment.sender.fees.single.amount));
    }

    function isGenuinePaymentRecipient(NahmiiTypes.Payment payment) public pure returns (bool) {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.recipient.balances.current == payment.recipient.balances.previous.add(payment.transfers.single));
    }

    function isSuccessiveTradesPartyNonces(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.TradePartyRole firstTradePartyRole,
        NahmiiTypes.Trade lastTrade,
        NahmiiTypes.TradePartyRole lastTradePartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (NahmiiTypes.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.nonce : firstTrade.seller.nonce);
        uint256 lastNonce = (NahmiiTypes.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.nonce : lastTrade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentsPartyNonces(
        NahmiiTypes.Payment firstPayment,
        NahmiiTypes.PaymentPartyRole firstPaymentPartyRole,
        NahmiiTypes.Payment lastPayment,
        NahmiiTypes.PaymentPartyRole lastPaymentPartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (NahmiiTypes.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.nonce : firstPayment.recipient.nonce);
        uint256 lastNonce = (NahmiiTypes.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.nonce : lastPayment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessiveTradePaymentPartyNonces(
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole,
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        uint256 lastNonce = (NahmiiTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentTradePartyNonces(
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole,
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole
    )
    public
    pure returns (bool)
    {
        uint256 firstNonce = (NahmiiTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        uint256 lastNonce = (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isGenuineSuccessiveTradesBalances(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.TradePartyRole firstTradePartyRole,
        NahmiiTypes.CurrencyRole firstTradeCurrencyRole,
        NahmiiTypes.Trade lastTrade,
        NahmiiTypes.TradePartyRole lastTradePartyRole,
        NahmiiTypes.CurrencyRole lastTradeCurrencyRole
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypes.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (NahmiiTypes.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.balances : firstTrade.seller.balances);
        NahmiiTypes.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (NahmiiTypes.CurrencyRole.Intended == firstTradeCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        NahmiiTypes.IntendedConjugateCurrentPreviousInt256 memory lastIntendedConjugateCurrentPreviousBalances = (NahmiiTypes.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.balances : lastTrade.seller.balances);
        NahmiiTypes.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (NahmiiTypes.CurrencyRole.Intended == lastTradeCurrencyRole ? lastIntendedConjugateCurrentPreviousBalances.intended : lastIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentsBalances(
        NahmiiTypes.Payment firstPayment,
        NahmiiTypes.PaymentPartyRole firstPaymentPartyRole,
        NahmiiTypes.Payment lastPayment,
        NahmiiTypes.PaymentPartyRole lastPaymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypes.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (NahmiiTypes.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.balances : firstPayment.recipient.balances);
        NahmiiTypes.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (NahmiiTypes.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.balances : lastPayment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradePaymentBalances(
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole,
        NahmiiTypes.CurrencyRole tradeCurrencyRole,
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypes.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        NahmiiTypes.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (NahmiiTypes.CurrencyRole.Intended == tradeCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        NahmiiTypes.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (NahmiiTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessivePaymentTradeBalances(
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole,
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole,
        NahmiiTypes.CurrencyRole tradeCurrencyRole
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypes.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (NahmiiTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        NahmiiTypes.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        NahmiiTypes.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (NahmiiTypes.CurrencyRole.Intended == tradeCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current;
    }

    function isGenuineSuccessiveTradesTotalFees(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.TradePartyRole firstTradePartyRole,
        NahmiiTypes.Trade lastTrade,
        NahmiiTypes.TradePartyRole lastTradePartyRole
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypes.Figure memory lastSingleFee;
        if (NahmiiTypes.TradePartyRole.Buyer == lastTradePartyRole)
            lastSingleFee = lastTrade.buyer.fees.single;
        else if (NahmiiTypes.TradePartyRole.Seller == lastTradePartyRole)
            lastSingleFee = lastTrade.seller.fees.single;

        MonetaryTypes.Figure[] memory firstTotalFees = (NahmiiTypes.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.fees.total : firstTrade.seller.fees.total);
        MonetaryTypes.Figure memory firstTotalFee = MonetaryTypes.getFigureByCurrency(firstTotalFees, lastSingleFee.currency);

        MonetaryTypes.Figure[] memory lastTotalFees = (NahmiiTypes.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.fees.total : lastTrade.seller.fees.total);
        MonetaryTypes.Figure memory lastTotalFee = MonetaryTypes.getFigureByCurrency(lastTotalFees, lastSingleFee.currency);

        return lastTotalFee.amount == firstTotalFee.amount.add(lastSingleFee.amount);
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        NahmiiTypes.Trade firstTrade,
        NahmiiTypes.Trade lastTrade,
        NahmiiTypes.TradePartyRole tradePartyRole
    )
    public
    pure
    returns (bool)
    {
        (int256 firstCurrentResiduals, int256 lastPreviousResiduals) = (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole) ?
        (firstTrade.buyer.order.residuals.current, lastTrade.buyer.order.residuals.previous) :
    (firstTrade.seller.order.residuals.current, lastTrade.seller.order.residuals.previous);

        return firstCurrentResiduals == lastPreviousResiduals;
    }

    function isGenuineSuccessivePaymentsTotalFees(
        NahmiiTypes.Payment firstPayment,
        NahmiiTypes.Payment lastPayment
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypes.Figure memory firstTotalFee = MonetaryTypes.getFigureByCurrency(firstPayment.sender.fees.total, lastPayment.sender.fees.single.currency);
        MonetaryTypes.Figure memory lastTotalFee = MonetaryTypes.getFigureByCurrency(lastPayment.sender.fees.total, lastPayment.sender.fees.single.currency);
        return lastTotalFee.amount == firstTotalFee.amount.add(lastPayment.sender.fees.single.amount);
    }

    function isGenuineSuccessiveTradePaymentTotalFees(
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole,
        NahmiiTypes.Payment payment
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypes.Figure[] memory firstTotalFees = (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.fees.total : trade.seller.fees.total);
        MonetaryTypes.Figure memory firstTotalFee = MonetaryTypes.getFigureByCurrency(firstTotalFees, payment.sender.fees.single.currency);

        MonetaryTypes.Figure memory lastTotalFee = MonetaryTypes.getFigureByCurrency(payment.sender.fees.total, payment.sender.fees.single.currency);

        return lastTotalFee.amount == firstTotalFee.amount.add(payment.sender.fees.single.amount);
    }

    function isGenuineSuccessivePaymentTradeTotalFees(
        NahmiiTypes.Payment payment,
        NahmiiTypes.PaymentPartyRole paymentPartyRole,
        NahmiiTypes.Trade trade,
        NahmiiTypes.TradePartyRole tradePartyRole
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypes.Figure memory lastSingleFee;
        if (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole)
            lastSingleFee = trade.buyer.fees.single;
        else if (NahmiiTypes.TradePartyRole.Seller == tradePartyRole)
            lastSingleFee = trade.seller.fees.single;

        MonetaryTypes.Figure[] memory firstTotalFees = (NahmiiTypes.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.fees.total : payment.recipient.fees.total);
        MonetaryTypes.Figure memory firstTotalFee = MonetaryTypes.getFigureByCurrency(firstTotalFees, lastSingleFee.currency);

        MonetaryTypes.Figure[] memory lastTotalFees = (NahmiiTypes.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.fees.total : trade.seller.fees.total);
        MonetaryTypes.Figure memory lastTotalFee = MonetaryTypes.getFigureByCurrency(lastTotalFees, lastSingleFee.currency);

        return lastTotalFee.amount == firstTotalFee.amount.add(lastSingleFee.amount);
    }

    function isTradeParty(NahmiiTypes.Trade trade, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == trade.buyer.wallet || wallet == trade.seller.wallet;
    }

    function isTradeBuyer(NahmiiTypes.Trade trade, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == trade.buyer.wallet;
    }

    function isTradeSeller(NahmiiTypes.Trade trade, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == trade.seller.wallet;
    }

    function isPaymentParty(NahmiiTypes.Payment payment, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == payment.sender.wallet || wallet == payment.recipient.wallet;
    }

    function isPaymentSender(NahmiiTypes.Payment payment, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == payment.sender.wallet;
    }

    function isPaymentRecipient(NahmiiTypes.Payment payment, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == payment.recipient.wallet;
    }

    function isTradeOrder(NahmiiTypes.Trade trade, NahmiiTypes.Order order)
    public
    pure
    returns (bool)
    {
        return (trade.buyer.order.hashes.exchange == order.seals.exchange.hash ||
        trade.seller.order.hashes.exchange == order.seals.exchange.hash);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }
}