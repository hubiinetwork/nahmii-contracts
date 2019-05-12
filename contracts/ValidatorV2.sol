/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {Configurable} from "./Configurable.sol";
import {PaymentHashable} from "./PaymentHashable.sol";
import {TradeHashable} from "./TradeHashable.sol";
import {Ownable} from "./Ownable.sol";
import {SignerManageable} from "./SignerManageable.sol";
import {ConstantsLib} from "./ConstantsLib.sol";

/**
 * @title Validator
 * @notice An ownable that validates valuable types (order, trade, payment)
 */
contract ValidatorV2 is Ownable, SignerManageable, Configurable, PaymentHashable, TradeHashable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer, address signerManager) Ownable(deployer) SignerManageable(signerManager) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @dev Logics of this function only applies to FT
    function isGenuineTradeBuyerFeeOfFungible(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        int256 feePartsPer = ConstantsLib.PARTS_PER();
        int256 discountTier = int256(trade.buyer.rollingVolume);

        int256 feeAmount;
        if (TradeTypesLib.LiquidityRole.Maker == trade.buyer.liquidityRole) {
            feeAmount = trade.amount
            .mul(configuration.tradeMakerFee(trade.blockNumber, discountTier))
            .div(feePartsPer);

            if (1 > feeAmount)
                feeAmount = 1;

            return (trade.buyer.fees.single.amount == feeAmount);

        } else {// TradeTypesLib.LiquidityRole.Taker == trade.buyer.liquidityRole
            feeAmount = trade.amount
            .mul(configuration.tradeTakerFee(trade.blockNumber, discountTier))
            .div(feePartsPer);

            if (1 > feeAmount)
                feeAmount = 1;

            return (trade.buyer.fees.single.amount == feeAmount);
        }
    }

    /// @dev Logics of this function only applies to FT
    function isGenuineTradeSellerFeeOfFungible(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        int256 feePartsPer = ConstantsLib.PARTS_PER();
        int256 discountTier = int256(trade.seller.rollingVolume);

        int256 feeAmount;
        if (TradeTypesLib.LiquidityRole.Maker == trade.seller.liquidityRole) {
            feeAmount = trade.amount
            .mul(configuration.tradeMakerFee(trade.blockNumber, discountTier))
            .div(trade.rate.mul(feePartsPer));

            if (1 > feeAmount)
                feeAmount = 1;

            return (trade.seller.fees.single.amount == feeAmount);

        } else {// TradeTypesLib.LiquidityRole.Taker == trade.seller.liquidityRole
            feeAmount = trade.amount
            .mul(configuration.tradeTakerFee(trade.blockNumber, discountTier))
            .div(trade.rate.mul(feePartsPer));

            if (1 > feeAmount)
                feeAmount = 1;

            return (trade.seller.fees.single.amount == feeAmount);
        }
    }

    /// @dev Logics of this function only applies to NFT
    function isGenuineTradeBuyerFeeOfNonFungible(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        (address feeCurrencyCt, uint256 feeCurrencyId) = configuration.feeCurrency(
            trade.blockNumber, trade.currencies.intended.ct, trade.currencies.intended.id
        );

        return feeCurrencyCt == trade.buyer.fees.single.currency.ct
        && feeCurrencyId == trade.buyer.fees.single.currency.id;
    }

    /// @dev Logics of this function only applies to NFT
    function isGenuineTradeSellerFeeOfNonFungible(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        (address feeCurrencyCt, uint256 feeCurrencyId) = configuration.feeCurrency(
            trade.blockNumber, trade.currencies.conjugate.ct, trade.currencies.conjugate.id
        );

        return feeCurrencyCt == trade.seller.fees.single.currency.ct
        && feeCurrencyId == trade.seller.fees.single.currency.id;
    }

    /// @dev Logics of this function only applies to FT
    function isGenuineTradeBuyerOfFungible(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (!signerManager.isSigner(trade.buyer.wallet))
        && (trade.buyer.balances.intended.current == trade.buyer.balances.intended.previous.add(trade.transfers.intended.single).sub(trade.buyer.fees.single.amount))
        && (trade.buyer.balances.conjugate.current == trade.buyer.balances.conjugate.previous.sub(trade.transfers.conjugate.single))
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.current)
        && (trade.buyer.order.amount >= trade.buyer.order.residuals.previous)
        && (trade.buyer.order.residuals.previous >= trade.buyer.order.residuals.current);
    }

    /// @dev Logics of this function only applies to FT
    function isGenuineTradeSellerOfFungible(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (!signerManager.isSigner(trade.seller.wallet))
        && (trade.seller.balances.intended.current == trade.seller.balances.intended.previous.sub(trade.transfers.intended.single))
        && (trade.seller.balances.conjugate.current == trade.seller.balances.conjugate.previous.add(trade.transfers.conjugate.single).sub(trade.seller.fees.single.amount))
        && (trade.seller.order.amount >= trade.seller.order.residuals.current)
        && (trade.seller.order.amount >= trade.seller.order.residuals.previous)
        && (trade.seller.order.residuals.previous >= trade.seller.order.residuals.current);
    }

    /// @dev Logics of this function only applies to NFT
    function isGenuineTradeBuyerOfNonFungible(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (!signerManager.isSigner(trade.buyer.wallet));
    }

    /// @dev Logics of this function only applies to NFT
    function isGenuineTradeSellerOfNonFungible(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        return (trade.buyer.wallet != trade.seller.wallet)
        && (!signerManager.isSigner(trade.seller.wallet));
    }

    function isGenuineOrderWalletHash(TradeTypesLib.Order memory order)
    public
    view
    returns (bool)
    {
        return tradeHasher.hashOrderAsWallet(order) == order.seals.wallet.hash;
    }

    function isGenuineOrderOperatorHash(TradeTypesLib.Order memory order)
    public
    view
    returns (bool)
    {
        return tradeHasher.hashOrderAsOperator(order) == order.seals.operator.hash;
    }

    function isGenuineOperatorSignature(bytes32 hash, NahmiiTypesLib.Signature memory signature)
    public
    view
    returns (bool)
    {
        return isSignedByRegisteredSigner(hash, signature.v, signature.r, signature.s);
    }

    function isGenuineWalletSignature(bytes32 hash, NahmiiTypesLib.Signature memory signature, address wallet)
    public
    pure
    returns (bool)
    {
        return isSignedBy(hash, signature.v, signature.r, signature.s, wallet);
    }

    function isGenuineOrderWalletSeal(TradeTypesLib.Order memory order)
    public
    view
    returns (bool)
    {
        return isGenuineOrderWalletHash(order)
        && isGenuineWalletSignature(order.seals.wallet.hash, order.seals.wallet.signature, order.wallet);
    }

    function isGenuineOrderOperatorSeal(TradeTypesLib.Order memory order)
    public
    view
    returns (bool)
    {
        return isGenuineOrderOperatorHash(order)
        && isGenuineOperatorSignature(order.seals.operator.hash, order.seals.operator.signature);
    }

    function isGenuineOrderSeals(TradeTypesLib.Order memory order)
    public
    view
    returns (bool)
    {
        return isGenuineOrderWalletSeal(order) && isGenuineOrderOperatorSeal(order);
    }

    function isGenuineTradeHash(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        return tradeHasher.hashTrade(trade) == trade.seal.hash;
    }

    function isGenuineTradeSeal(TradeTypesLib.Trade memory trade)
    public
    view
    returns (bool)
    {
        return isGenuineTradeHash(trade)
        && isGenuineOperatorSignature(trade.seal.hash, trade.seal.signature);
    }

    function isGenuinePaymentWalletHash(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        return paymentHasher.hashPaymentAsWallet(payment) == payment.seals.wallet.hash;
    }

    function isGenuinePaymentOperatorHash(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        return paymentHasher.hashPaymentAsOperator(payment) == payment.seals.operator.hash;
    }

    function isGenuinePaymentWalletSeal(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        return isGenuinePaymentWalletHash(payment)
        && isGenuineWalletSignature(payment.seals.wallet.hash, payment.seals.wallet.signature, payment.sender.wallet);
    }

    function isGenuinePaymentOperatorSeal(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        return isGenuinePaymentOperatorHash(payment)
        && isGenuineOperatorSignature(payment.seals.operator.hash, payment.seals.operator.signature);
    }

    function isGenuinePaymentSeals(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        return isGenuinePaymentWalletSeal(payment) && isGenuinePaymentOperatorSeal(payment);
    }

    /// @dev Logics of this function only applies to FT
    function isGenuinePaymentFeeOfFungible(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        int256 feePartsPer = int256(ConstantsLib.PARTS_PER());

        int256 feeAmount = payment.amount
        .mul(
            configuration.currencyPaymentFee(
                payment.blockNumber, payment.currency.ct, payment.currency.id, payment.amount
            )
        ).div(feePartsPer);

        if (1 > feeAmount)
            feeAmount = 1;

        return (payment.sender.fees.single.amount == feeAmount);
    }

    /// @dev Logics of this function only applies to NFT
    function isGenuinePaymentFeeOfNonFungible(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        (address feeCurrencyCt, uint256 feeCurrencyId) = configuration.feeCurrency(
            payment.blockNumber, payment.currency.ct, payment.currency.id
        );

        return feeCurrencyCt == payment.sender.fees.single.currency.ct
        && feeCurrencyId == payment.sender.fees.single.currency.id;
    }

    /// @dev Logics of this function only applies to FT
    function isGenuinePaymentSenderOfFungible(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (!signerManager.isSigner(payment.sender.wallet))
        && (payment.sender.balances.current == payment.sender.balances.previous.sub(payment.transfers.single).sub(payment.sender.fees.single.amount));
    }

    /// @dev Logics of this function only applies to FT
    function isGenuinePaymentRecipientOfFungible(PaymentTypesLib.Payment memory payment)
    public
    pure
    returns (bool)
    {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (payment.recipient.balances.current == payment.recipient.balances.previous.add(payment.transfers.single));
    }

    /// @dev Logics of this function only applies to NFT
    function isGenuinePaymentSenderOfNonFungible(PaymentTypesLib.Payment memory payment)
    public
    view
    returns (bool)
    {
        return (payment.sender.wallet != payment.recipient.wallet)
        && (!signerManager.isSigner(payment.sender.wallet));
    }

    /// @dev Logics of this function only applies to NFT
    function isGenuinePaymentRecipientOfNonFungible(PaymentTypesLib.Payment memory payment)
    public
    pure
    returns (bool)
    {
        return (payment.sender.wallet != payment.recipient.wallet);
    }

    function isSuccessiveTradesPartyNonces(
        TradeTypesLib.Trade memory firstTrade,
        TradeTypesLib.TradePartyRole firstTradePartyRole,
        TradeTypesLib.Trade memory lastTrade,
        TradeTypesLib.TradePartyRole lastTradePartyRole
    )
    public
    pure
    returns (bool)
    {
        uint256 firstNonce = (TradeTypesLib.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.nonce : firstTrade.seller.nonce);
        uint256 lastNonce = (TradeTypesLib.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.nonce : lastTrade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentsPartyNonces(
        PaymentTypesLib.Payment memory firstPayment,
        PaymentTypesLib.PaymentPartyRole firstPaymentPartyRole,
        PaymentTypesLib.Payment memory lastPayment,
        PaymentTypesLib.PaymentPartyRole lastPaymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        uint256 firstNonce = (PaymentTypesLib.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.nonce : firstPayment.recipient.nonce);
        uint256 lastNonce = (PaymentTypesLib.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.nonce : lastPayment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessiveTradePaymentPartyNonces(
        TradeTypesLib.Trade memory trade,
        TradeTypesLib.TradePartyRole tradePartyRole,
        PaymentTypesLib.Payment memory payment,
        PaymentTypesLib.PaymentPartyRole paymentPartyRole
    )
    public
    pure
    returns (bool)
    {
        uint256 firstNonce = (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        uint256 lastNonce = (PaymentTypesLib.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isSuccessivePaymentTradePartyNonces(
        PaymentTypesLib.Payment memory payment,
        PaymentTypesLib.PaymentPartyRole paymentPartyRole,
        TradeTypesLib.Trade memory trade,
        TradeTypesLib.TradePartyRole tradePartyRole
    )
    public
    pure
    returns (bool)
    {
        uint256 firstNonce = (PaymentTypesLib.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.nonce : payment.recipient.nonce);
        uint256 lastNonce = (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.nonce : trade.seller.nonce);
        return lastNonce == firstNonce.add(1);
    }

    function isGenuineSuccessiveTradesBalances(
        TradeTypesLib.Trade memory firstTrade,
        TradeTypesLib.TradePartyRole firstTradePartyRole,
        TradeTypesLib.CurrencyRole firstTradeCurrencyRole,
        TradeTypesLib.Trade memory lastTrade,
        TradeTypesLib.TradePartyRole lastTradePartyRole,
        TradeTypesLib.CurrencyRole lastTradeCurrencyRole,
        int256 delta
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypesLib.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (TradeTypesLib.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.balances : firstTrade.seller.balances);
        NahmiiTypesLib.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (TradeTypesLib.CurrencyRole.Intended == firstTradeCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        NahmiiTypesLib.IntendedConjugateCurrentPreviousInt256 memory lastIntendedConjugateCurrentPreviousBalances = (TradeTypesLib.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.balances : lastTrade.seller.balances);
        NahmiiTypesLib.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (TradeTypesLib.CurrencyRole.Intended == lastTradeCurrencyRole ? lastIntendedConjugateCurrentPreviousBalances.intended : lastIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current.add(delta);
    }

    function isGenuineSuccessivePaymentsBalances(
        PaymentTypesLib.Payment memory firstPayment,
        PaymentTypesLib.PaymentPartyRole firstPaymentPartyRole,
        PaymentTypesLib.Payment memory lastPayment,
        PaymentTypesLib.PaymentPartyRole lastPaymentPartyRole,
        int256 delta
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypesLib.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (PaymentTypesLib.PaymentPartyRole.Sender == firstPaymentPartyRole ? firstPayment.sender.balances : firstPayment.recipient.balances);
        NahmiiTypesLib.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (PaymentTypesLib.PaymentPartyRole.Sender == lastPaymentPartyRole ? lastPayment.sender.balances : lastPayment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current.add(delta);
    }

    function isGenuineSuccessiveTradePaymentBalances(
        TradeTypesLib.Trade memory trade,
        TradeTypesLib.TradePartyRole tradePartyRole,
        TradeTypesLib.CurrencyRole tradeCurrencyRole,
        PaymentTypesLib.Payment memory payment,
        PaymentTypesLib.PaymentPartyRole paymentPartyRole,
        int256 delta
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypesLib.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        NahmiiTypesLib.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (TradeTypesLib.CurrencyRole.Intended == tradeCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        NahmiiTypesLib.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (PaymentTypesLib.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current.add(delta);
    }

    function isGenuineSuccessivePaymentTradeBalances(
        PaymentTypesLib.Payment memory payment,
        PaymentTypesLib.PaymentPartyRole paymentPartyRole,
        TradeTypesLib.Trade memory trade,
        TradeTypesLib.TradePartyRole tradePartyRole,
        TradeTypesLib.CurrencyRole tradeCurrencyRole,
        int256 delta
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypesLib.CurrentPreviousInt256 memory firstCurrentPreviousBalances = (PaymentTypesLib.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.balances : payment.recipient.balances);

        NahmiiTypesLib.IntendedConjugateCurrentPreviousInt256 memory firstIntendedConjugateCurrentPreviousBalances = (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.balances : trade.seller.balances);
        NahmiiTypesLib.CurrentPreviousInt256 memory lastCurrentPreviousBalances = (TradeTypesLib.CurrencyRole.Intended == tradeCurrencyRole ? firstIntendedConjugateCurrentPreviousBalances.intended : firstIntendedConjugateCurrentPreviousBalances.conjugate);

        return lastCurrentPreviousBalances.previous == firstCurrentPreviousBalances.current.add(delta);
    }

    function isGenuineSuccessiveTradesTotalFees(
        TradeTypesLib.Trade memory firstTrade,
        TradeTypesLib.TradePartyRole firstTradePartyRole,
        TradeTypesLib.Trade memory lastTrade,
        TradeTypesLib.TradePartyRole lastTradePartyRole
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypesLib.Figure memory lastSingleFee;
        if (TradeTypesLib.TradePartyRole.Buyer == lastTradePartyRole)
            lastSingleFee = lastTrade.buyer.fees.single;
        else if (TradeTypesLib.TradePartyRole.Seller == lastTradePartyRole)
            lastSingleFee = lastTrade.seller.fees.single;

        NahmiiTypesLib.OriginFigure[] memory firstTotalFees = (TradeTypesLib.TradePartyRole.Buyer == firstTradePartyRole ? firstTrade.buyer.fees.total : firstTrade.seller.fees.total);
        MonetaryTypesLib.Figure memory firstTotalFee = getProtocolFigureByCurrency(firstTotalFees, lastSingleFee.currency);

        NahmiiTypesLib.OriginFigure[] memory lastTotalFees = (TradeTypesLib.TradePartyRole.Buyer == lastTradePartyRole ? lastTrade.buyer.fees.total : lastTrade.seller.fees.total);
        MonetaryTypesLib.Figure memory lastTotalFee = getProtocolFigureByCurrency(lastTotalFees, lastSingleFee.currency);

        return lastTotalFee.amount == firstTotalFee.amount.add(lastSingleFee.amount);
    }

    function isGenuineSuccessiveTradeOrderResiduals(
        TradeTypesLib.Trade memory firstTrade,
        TradeTypesLib.Trade memory lastTrade,
        TradeTypesLib.TradePartyRole tradePartyRole
    )
    public
    pure
    returns (bool)
    {
        (int256 firstCurrentResiduals, int256 lastPreviousResiduals) = (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole) ?
        (firstTrade.buyer.order.residuals.current, lastTrade.buyer.order.residuals.previous) :
    (firstTrade.seller.order.residuals.current, lastTrade.seller.order.residuals.previous);

        return firstCurrentResiduals == lastPreviousResiduals;
    }

    function isGenuineSuccessivePaymentsTotalFees(
        PaymentTypesLib.Payment memory firstPayment,
        PaymentTypesLib.Payment memory lastPayment
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypesLib.Figure memory firstTotalFee = getProtocolFigureByCurrency(firstPayment.sender.fees.total, lastPayment.sender.fees.single.currency);
        MonetaryTypesLib.Figure memory lastTotalFee = getProtocolFigureByCurrency(lastPayment.sender.fees.total, lastPayment.sender.fees.single.currency);
        return lastTotalFee.amount == firstTotalFee.amount.add(lastPayment.sender.fees.single.amount);
    }

    function isGenuineSuccessiveTradePaymentTotalFees(
        TradeTypesLib.Trade memory trade,
        TradeTypesLib.TradePartyRole tradePartyRole,
        PaymentTypesLib.Payment memory payment
    )
    public
    pure
    returns (bool)
    {
        NahmiiTypesLib.OriginFigure[] memory firstTotalFees = (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.fees.total : trade.seller.fees.total);
        MonetaryTypesLib.Figure memory firstTotalFee = getProtocolFigureByCurrency(firstTotalFees, payment.sender.fees.single.currency);

        MonetaryTypesLib.Figure memory lastTotalFee = getProtocolFigureByCurrency(payment.sender.fees.total, payment.sender.fees.single.currency);

        return lastTotalFee.amount == firstTotalFee.amount.add(payment.sender.fees.single.amount);
    }

    function isGenuineSuccessivePaymentTradeTotalFees(
        PaymentTypesLib.Payment memory payment,
        PaymentTypesLib.PaymentPartyRole paymentPartyRole,
        TradeTypesLib.Trade memory trade,
        TradeTypesLib.TradePartyRole tradePartyRole
    )
    public
    pure
    returns (bool)
    {
        MonetaryTypesLib.Figure memory lastSingleFee;
        if (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole)
            lastSingleFee = trade.buyer.fees.single;
        else if (TradeTypesLib.TradePartyRole.Seller == tradePartyRole)
            lastSingleFee = trade.seller.fees.single;

        NahmiiTypesLib.OriginFigure[] memory firstTotalFees = (PaymentTypesLib.PaymentPartyRole.Sender == paymentPartyRole ? payment.sender.fees.total : payment.recipient.fees.total);
        MonetaryTypesLib.Figure memory firstTotalFee = getProtocolFigureByCurrency(firstTotalFees, lastSingleFee.currency);

        NahmiiTypesLib.OriginFigure[] memory lastTotalFees = (TradeTypesLib.TradePartyRole.Buyer == tradePartyRole ? trade.buyer.fees.total : trade.seller.fees.total);
        MonetaryTypesLib.Figure memory lastTotalFee = getProtocolFigureByCurrency(lastTotalFees, lastSingleFee.currency);

        return lastTotalFee.amount == firstTotalFee.amount.add(lastSingleFee.amount);
    }

    function isTradeParty(TradeTypesLib.Trade memory trade, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == trade.buyer.wallet || wallet == trade.seller.wallet;
    }

    function isTradeBuyer(TradeTypesLib.Trade memory trade, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == trade.buyer.wallet;
    }

    function isTradeSeller(TradeTypesLib.Trade memory trade, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == trade.seller.wallet;
    }

    function isTradeOrder(TradeTypesLib.Trade memory trade, TradeTypesLib.Order memory order)
    public
    pure
    returns (bool)
    {
        return (trade.buyer.order.hashes.operator == order.seals.operator.hash ||
        trade.seller.order.hashes.operator == order.seals.operator.hash);
    }

    function isTradeIntendedCurrency(TradeTypesLib.Trade memory trade, MonetaryTypesLib.Currency memory currency)
    public
    pure
    returns (bool)
    {
        return currency.ct == trade.currencies.intended.ct && currency.id == trade.currencies.intended.id;
    }

    function isTradeConjugateCurrency(TradeTypesLib.Trade memory trade, MonetaryTypesLib.Currency memory currency)
    public
    pure
    returns (bool)
    {
        return currency.ct == trade.currencies.conjugate.ct && currency.id == trade.currencies.conjugate.id;
    }

    function isTradeCurrency(TradeTypesLib.Trade memory trade, MonetaryTypesLib.Currency memory currency)
    public
    pure
    returns (bool)
    {
        return isTradeIntendedCurrency(trade, currency) || isTradeConjugateCurrency(trade, currency);
    }

    function isTradeIntendedCurrencyNonFungible(TradeTypesLib.Trade memory trade)
    public
    pure
    returns (bool)
    {
        return trade.currencies.intended.ct != trade.buyer.fees.single.currency.ct
        || trade.currencies.intended.id != trade.buyer.fees.single.currency.id;
    }

    function isTradeConjugateCurrencyNonFungible(TradeTypesLib.Trade memory trade)
    public
    pure
    returns (bool)
    {
        return trade.currencies.conjugate.ct != trade.seller.fees.single.currency.ct
        || trade.currencies.conjugate.id != trade.seller.fees.single.currency.id;
    }

    function isPaymentParty(PaymentTypesLib.Payment memory payment, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == payment.sender.wallet || wallet == payment.recipient.wallet;
    }

    function isPaymentSender(PaymentTypesLib.Payment memory payment, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == payment.sender.wallet;
    }

    function isPaymentRecipient(PaymentTypesLib.Payment memory payment, address wallet)
    public
    pure
    returns (bool)
    {
        return wallet == payment.recipient.wallet;
    }

    function isPaymentCurrency(PaymentTypesLib.Payment memory payment, MonetaryTypesLib.Currency memory currency)
    public
    pure
    returns (bool)
    {
        return currency.ct == payment.currency.ct && currency.id == payment.currency.id;
    }

    function isPaymentCurrencyNonFungible(PaymentTypesLib.Payment memory payment)
    public
    pure
    returns (bool)
    {
        return payment.currency.ct != payment.sender.fees.single.currency.ct
        || payment.currency.id != payment.sender.fees.single.currency.id;
    }

    //
    // Private unctions
    // -----------------------------------------------------------------------------------------------------------------
    function getProtocolFigureByCurrency(NahmiiTypesLib.OriginFigure[] memory originFigures, MonetaryTypesLib.Currency memory currency)
    private
    pure
    returns (MonetaryTypesLib.Figure memory) {
        for (uint256 i = 0; i < originFigures.length; i++)
            if (originFigures[i].figure.currency.ct == currency.ct && originFigures[i].figure.currency.id == currency.id
            && originFigures[i].originId == 0)
                return originFigures[i].figure;
        return MonetaryTypesLib.Figure(0, currency);
    }
}