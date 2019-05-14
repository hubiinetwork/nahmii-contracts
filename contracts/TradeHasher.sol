/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";

/**
 * @title TradeHasher
 * @notice Contract that hashes types related to trade
 */
contract TradeHasher is Ownable {
    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function hashOrderAsWallet(TradeTypesLib.Order memory order)
    public
    pure
    returns (bytes32)
    {
        bytes32 rootHash = hashAddress(order.wallet);
        bytes32 placementHash = hashOrderPlacement(order.placement);

        return keccak256(abi.encodePacked(rootHash, placementHash));
    }

    function hashOrderAsOperator(TradeTypesLib.Order memory order)
    public
    pure
    returns (bytes32)
    {
        bytes32 rootHash = hashUint256(order.nonce);
        bytes32 walletSignatureHash = hashSignature(order.seals.wallet.signature);
        bytes32 placementResidualsHash = hashCurrentPreviousInt256(order.placement.residuals);

        return keccak256(abi.encodePacked(rootHash, walletSignatureHash, placementResidualsHash));
    }

    function hashTrade(TradeTypesLib.Trade memory trade)
    public
    pure
    returns (bytes32)
    {
        bytes32 rootHash = hashTradeRoot(trade);
        bytes32 buyerHash = hashTradeParty(trade.buyer);
        bytes32 sellerHash = hashTradeParty(trade.seller);
        bytes32 transfersHash = hashIntendedConjugateSingleTotalInt256(trade.transfers);

        return keccak256(abi.encodePacked(rootHash, buyerHash, sellerHash, transfersHash));
    }

    function hashOrderPlacement(TradeTypesLib.OrderPlacement memory orderPlacement)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                orderPlacement.intention,
                orderPlacement.amount,
                orderPlacement.currencies.intended.ct,
                orderPlacement.currencies.intended.id,
                orderPlacement.currencies.conjugate.ct,
                orderPlacement.currencies.conjugate.id,
                orderPlacement.rate
            ));
    }

    function hashTradeRoot(TradeTypesLib.Trade memory trade)
    public
    pure
    returns (bytes32)
    {
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

    function hashTradeParty(TradeTypesLib.TradeParty memory tradeParty)
    public
    pure
    returns (bytes32)
    {
        bytes32 rootHash = hashTradePartyRoot(tradeParty);
        bytes32 orderHash = hashTradeOrder(tradeParty.order);
        bytes32 balancesHash = hashIntendedConjugateCurrentPreviousInt256(tradeParty.balances);
        bytes32 singleFeeHash = hashFigure(tradeParty.fees.single);
        bytes32 totalFeesHash = hashOriginFigures(tradeParty.fees.total);

        return keccak256(abi.encodePacked(
                rootHash, orderHash, balancesHash, singleFeeHash, totalFeesHash
            ));
    }

    function hashTradePartyRoot(TradeTypesLib.TradeParty memory tradeParty)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                tradeParty.nonce,
                tradeParty.wallet,
                tradeParty.rollingVolume,
                tradeParty.liquidityRole
            ));
    }

    function hashTradeOrder(TradeTypesLib.TradeOrder memory tradeOrder)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                tradeOrder.hashes.wallet,
                tradeOrder.hashes.operator,
                tradeOrder.amount,
                tradeOrder.residuals.current,
                tradeOrder.residuals.previous
            ));
    }

    function hashIntendedConjugateSingleTotalInt256(
        NahmiiTypesLib.IntendedConjugateSingleTotalInt256 memory intededConjugateSingleTotalInt256)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                intededConjugateSingleTotalInt256.intended.single,
                intededConjugateSingleTotalInt256.intended.total,
                intededConjugateSingleTotalInt256.conjugate.single,
                intededConjugateSingleTotalInt256.conjugate.total
            ));
    }

    function hashCurrentPreviousInt256(
        NahmiiTypesLib.CurrentPreviousInt256 memory currentPreviousInt256)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                currentPreviousInt256.current,
                currentPreviousInt256.previous
            ));
    }

    function hashIntendedConjugateCurrentPreviousInt256(
        NahmiiTypesLib.IntendedConjugateCurrentPreviousInt256 memory intendedConjugateCurrentPreviousInt256)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                intendedConjugateCurrentPreviousInt256.intended.current,
                intendedConjugateCurrentPreviousInt256.intended.previous,
                intendedConjugateCurrentPreviousInt256.conjugate.current,
                intendedConjugateCurrentPreviousInt256.conjugate.previous
            ));
    }

    function hashFigure(MonetaryTypesLib.Figure memory figure)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                figure.amount,
                figure.currency.ct,
                figure.currency.id
            ));
    }

    function hashOriginFigures(NahmiiTypesLib.OriginFigure[] memory originFigures)
    public
    pure
    returns (bytes32)
    {
        bytes32 hash;
        for (uint256 i = 0; i < originFigures.length; i++) {
            hash = keccak256(abi.encodePacked(
                    hash,
                    originFigures[i].originId,
                    originFigures[i].figure.amount,
                    originFigures[i].figure.currency.ct,
                    originFigures[i].figure.currency.id
                )
            );
        }
        return hash;
    }

    function hashUint256(uint256 _uint256)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(_uint256));
    }

    function hashAddress(address _address)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(_address));
    }

    function hashSignature(NahmiiTypesLib.Signature memory signature)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                signature.v,
                signature.r,
                signature.s
            ));
    }
}