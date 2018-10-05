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
import {NahmiiTypes} from "./NahmiiTypes.sol";

/**
@title Hasher
@notice Contract that hashes types in NahmiiTypes contract
*/
contract Hasher is Ownable {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function hashOrderAsWallet(NahmiiTypes.Order order) public pure returns (bytes32) {
        bytes32 globalHash = hashOrderGlobalData(order);
        bytes32 placementHash = hashOrderPlacementData(order);

        return keccak256(abi.encodePacked(globalHash, placementHash));
    }

    function hashOrderAsOperator(NahmiiTypes.Order order) public pure returns (bytes32) {
        bytes32 walletSignatureHash = hashSignature(order.seals.wallet.signature);
        bytes32 placementResidualsHash = hashOrderPlacementResidualsData(order);

        return keccak256(abi.encodePacked(walletSignatureHash, placementResidualsHash));
    }

    function hashTrade(NahmiiTypes.Trade trade) public pure returns (bytes32) {
        bytes32 globalHash = hashTradeGlobalData(trade);
        bytes32 buyerHash = hashTradeBuyerData(trade);
        bytes32 sellerHash = hashTradeSellerData(trade);
        bytes32 transfersHash = hashTradeTransfersData(trade);

        return keccak256(abi.encodePacked(globalHash, buyerHash, sellerHash, transfersHash));
    }

    function hashPaymentAsWallet(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        bytes32 amountCurrencyHash = hashPaymentAmountCurrencyData(payment);
        bytes32 senderHash = hashPaymentSenderDataAsWallet(payment);
        bytes32 recipientHash = hashPaymentRecipientDataAsWallet(payment);

        return keccak256(abi.encodePacked(amountCurrencyHash, senderHash, recipientHash));
    }

    function hashPaymentAsOperator(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        bytes32 walletSignatureHash = hashSignature(payment.seals.wallet.signature);
        bytes32 nonceHash = hashPaymentNonce(payment);
        bytes32 senderHash = hashPaymentSenderDataAsExchange(payment);
        bytes32 recipientHash = hashPaymentRecipientDataAsExchange(payment);
        bytes32 transfersHash = hashPaymentTransfersData(payment);

        return keccak256(abi.encodePacked(walletSignatureHash, nonceHash, senderHash, recipientHash, transfersHash));
    }

    function hashSignature(NahmiiTypes.Signature signature) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                signature.v,
                signature.r,
                signature.s
            ));
    }

    function hashOrderGlobalData(NahmiiTypes.Order order) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                order.nonce,
                order.wallet
            ));
    }

    function hashOrderPlacementData(NahmiiTypes.Order order) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                order.placement.intention,
                order.placement.amount,
                order.placement.currencies.intended.ct,
                order.placement.currencies.intended.id,
                order.placement.currencies.conjugate.ct,
                order.placement.currencies.conjugate.id,
                order.placement.rate
            ));
    }

    function hashOrderPlacementResidualsData(NahmiiTypes.Order order) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                order.placement.residuals.current,
                order.placement.residuals.previous
            ));
    }

    function hashTradeGlobalData(NahmiiTypes.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.nonce,
                trade.amount,
                trade.currencies.intended.ct,
                trade.currencies.intended.id,
                trade.currencies.conjugate.ct,
                trade.currencies.conjugate.id,
                trade.rate
            ));
    }

    function hashTradeBuyerData(NahmiiTypes.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.buyer.nonce,
                trade.buyer.wallet,
            // TODO Consider adding 'trade.buyer.rollingVolume' and 'trade.buyer.liquidityRole' to hash
            //                trade.buyer.rollingVolume,
            //                trade.buyer.liquidityRole,
                trade.buyer.order.hashes.wallet,
                trade.buyer.order.hashes.exchange,
                trade.buyer.order.amount,
                trade.buyer.order.residuals.current,
                trade.buyer.order.residuals.previous,
                trade.buyer.balances.intended.current,
                trade.buyer.balances.intended.previous,
                trade.buyer.balances.conjugate.current,
                trade.buyer.balances.conjugate.previous,
                trade.buyer.fees.single.amount,
                trade.buyer.fees.single.currency.ct,
                trade.buyer.fees.single.currency.id
            // TODO Consider adding dynamic size 'trade.buyer.fees.net' to hash
            // trade.buyer.fees.net
            ));
    }

    function hashTradeSellerData(NahmiiTypes.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.seller.nonce,
                trade.seller.wallet,
            // TODO Consider adding 'trade.seller.rollingVolume' and 'trade.seller.liquidityRole' to hash
            //                trade.seller.rollingVolume,
            //                trade.seller.liquidityRole,
                trade.seller.order.hashes.wallet,
                trade.seller.order.hashes.exchange,
                trade.seller.order.amount,
                trade.seller.order.residuals.current,
                trade.seller.order.residuals.previous,
                trade.seller.balances.intended.current,
                trade.seller.balances.intended.previous,
                trade.seller.balances.conjugate.current,
                trade.seller.balances.conjugate.previous,
                trade.seller.fees.single.amount,
                trade.seller.fees.single.currency.ct,
                trade.seller.fees.single.currency.id
            // TODO Consider adding dynamic size 'trade.seller.fees.net' to hash
            // trade.seller.fees.net
            ));
    }

    function hashTradeTransfersData(NahmiiTypes.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.transfers.intended.single,
                trade.transfers.intended.net,
                trade.transfers.conjugate.single,
                trade.transfers.conjugate.net
            ));
    }

    function hashPaymentAmountCurrencyData(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                payment.amount,
                payment.currency.ct,
                payment.currency.id
            ));
    }

    function hashPaymentSenderDataAsWallet(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(payment.sender.wallet));
    }

    function hashPaymentSenderDataAsExchange(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                payment.sender.nonce,
                payment.sender.balances.current,
                payment.sender.balances.previous,
                payment.sender.fees.single.amount,
                payment.sender.fees.single.currency.ct,
                payment.sender.fees.single.currency.id
            ));
    }

    function hashPaymentRecipientDataAsWallet(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(payment.recipient.wallet));
    }

    function hashPaymentRecipientDataAsExchange(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                payment.recipient.nonce,
                payment.recipient.balances.current,
                payment.recipient.balances.previous
            ));
    }

    function hashPaymentTransfersData(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                payment.transfers.single,
                payment.transfers.net
            ));
    }

    function hashPaymentNonce(NahmiiTypes.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(payment.nonce));
    }
}