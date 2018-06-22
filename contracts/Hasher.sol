/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import {Types} from "./Types.sol";

contract Hasher is Ownable, SelfDestructible {

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function hashOrderAsWallet(Types.Order order) public pure returns (bytes32) {
        bytes32 globalHash = hashOrderGlobalData(order);
        bytes32 placementHash = hashOrderPlacementData(order);

        return keccak256(abi.encodePacked(globalHash, placementHash));
    }

    function hashOrderAsExchange(Types.Order order) public pure returns (bytes32) {
        bytes32 walletSignatureHash = hashSignature(order.seals.wallet.signature);
        bytes32 placementResidualsHash = hashOrderPlacementResidualsData(order);

        return keccak256(abi.encodePacked(walletSignatureHash, placementResidualsHash));
    }

    function hashTrade(Types.Trade trade) public pure returns (bytes32) {
        bytes32 globalHash = hashTradeGlobalData(trade);
        bytes32 buyerHash = hashTradeBuyerData(trade);
        bytes32 sellerHash = hashTradeSellerData(trade);
        bytes32 transfersHash = hashTradeTransfersData(trade);
        bytes32 singleFeesHash = hashTradeSingleFeesData(trade);

        return keccak256(abi.encodePacked(globalHash, buyerHash, sellerHash, transfersHash, singleFeesHash));
    }

    function hashPaymentAsWallet(Types.Payment payment) public pure returns (bytes32) {
        bytes32 amountHash = hashPaymentAmountData(payment);
        bytes32 senderHash = hashPaymentSenderData(payment);
        bytes32 recipientHash = hashPaymentRecipientData(payment);
        bytes32 transfersHash = hashPaymentTransfersData(payment);
        bytes32 singleFeeHash = hashPaymentSingleFeeData(payment);

        return keccak256(abi.encodePacked(amountHash, senderHash, recipientHash, transfersHash, singleFeeHash));
    }

    function hashPaymentAsExchange(Types.Payment payment) public pure returns (bytes32) {
        bytes32 walletSignatureHash = hashSignature(payment.seals.wallet.signature);
        bytes32 nonceHash = hashPaymentNonce(payment);

        return keccak256(abi.encodePacked(walletSignatureHash, nonceHash));
    }

    function hashSignature(Types.Signature signature) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                signature.v,
                signature.r,
                signature.s
            ));
    }

    function hashOrderGlobalData(Types.Order order) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                order.nonce,
                order.wallet
            ));
    }

    function hashOrderPlacementData(Types.Order order) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                order.placement.intention,
                order.placement.amount,
                order.placement.currencies.intended,
                order.placement.currencies.conjugate,
                order.placement.rate
            ));
    }


    function hashOrderPlacementResidualsData(Types.Order order) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                order.placement.residuals.current,
                order.placement.residuals.previous
            ));
    }

    function hashTradeGlobalData(Types.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.nonce,
                trade.amount,
                trade.currencies.intended,
                trade.currencies.conjugate,
                trade.rate
            ));
    }

    function hashTradeBuyerData(Types.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.buyer.nonce,
                trade.buyer.wallet,
                trade.buyer.order.hashes.wallet,
                trade.buyer.order.hashes.exchange,
                trade.buyer.order.amount,
                trade.buyer.order.residuals.current,
                trade.buyer.order.residuals.previous,
                trade.buyer.balances.intended.current,
                trade.buyer.balances.intended.previous,
                trade.buyer.balances.conjugate.current,
                trade.buyer.balances.conjugate.previous,
                trade.buyer.netFees.intended,
                trade.buyer.netFees.conjugate
            ));
    }

    function hashTradeSellerData(Types.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.seller.nonce,
                trade.seller.wallet,
                trade.seller.order.hashes.wallet,
                trade.seller.order.hashes.exchange,
                trade.seller.order.amount,
                trade.seller.order.residuals.current,
                trade.seller.order.residuals.previous,
                trade.seller.balances.intended.current,
                trade.seller.balances.intended.previous,
                trade.seller.balances.conjugate.current,
                trade.seller.balances.conjugate.previous,
                trade.seller.netFees.intended,
                trade.seller.netFees.conjugate
            ));
    }

    function hashTradeTransfersData(Types.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.transfers.intended.single,
                trade.transfers.intended.net,
                trade.transfers.conjugate.single,
                trade.transfers.conjugate.net
            ));
    }

    function hashTradeSingleFeesData(Types.Trade trade) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                trade.singleFees.intended,
                trade.singleFees.conjugate
            ));
    }

    function hashPaymentAmountData(Types.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(payment.amount));
    }

    function hashPaymentSenderData(Types.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                payment.sender.nonce,
                payment.sender.wallet,
                payment.sender.balances.current,
                payment.sender.balances.previous,
                payment.sender.netFee
            ));
    }

    function hashPaymentRecipientData(Types.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                payment.recipient.nonce,
                payment.recipient.wallet,
                payment.recipient.balances.current,
                payment.recipient.balances.previous,
                payment.recipient.netFee
            ));
    }

    function hashPaymentTransfersData(Types.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
                payment.transfers.single,
                payment.transfers.net
            ));
    }

    function hashPaymentSingleFeeData(Types.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(payment.singleFee));
    }

    function hashPaymentNonce(Types.Payment payment) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(payment.nonce));
    }
}