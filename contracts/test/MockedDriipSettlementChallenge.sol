/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

//import {DriipSettlementChallenge} from "../DriipSettlementChallenge.sol";
import {StriimTypes} from "../StriimTypes.sol";
import {DriipSettlementTypes} from "../DriipSettlementTypes.sol";

/**
@title MockedDriipSettlementChallenge
@notice Mocked implementation of driip settlement challenge contract
*/
contract MockedDriipSettlementChallenge /*is DriipSettlementChallenge*/ {

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => DriipSettlementTypes.Challenge) public walletChallengeMap;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*DriipSettlementChallenge(owner)*/{
    }

    function updateDriipSettlementChallenge(address wallet, uint256 nonce, DriipSettlementTypes.ChallengeStatus status,
        int256 intendedAmount, address intendedCurrencyCt, uint intendedCurrencyId,
        int256 conjugateAmount, address conjugateCurrencyCt, uint conjugateCurrencyId,
        address challenger)
    public
    {
        walletChallengeMap[wallet].nonce = nonce;
        walletChallengeMap[wallet].status = status;
        walletChallengeMap[wallet].intendedStage.amount = intendedAmount;
        walletChallengeMap[wallet].intendedStage.currency.ct = intendedCurrencyCt;
        walletChallengeMap[wallet].intendedStage.currency.id = intendedCurrencyId;
        walletChallengeMap[wallet].intendedStage.set = 0 != intendedAmount;
        walletChallengeMap[wallet].conjugateStage.amount = conjugateAmount;
        walletChallengeMap[wallet].conjugateStage.currency.ct = conjugateCurrencyCt;
        walletChallengeMap[wallet].conjugateStage.currency.id = conjugateCurrencyId;
        walletChallengeMap[wallet].conjugateStage.set = 0 != conjugateAmount;
        walletChallengeMap[wallet].challenger = challenger;
    }

    function getChallengeNonce(address wallet)
    public
    view
    returns (uint256)
    {
        return walletChallengeMap[wallet].nonce;
    }

    function getChallengeStatus(address wallet)
    public
    view
    returns (DriipSettlementTypes.ChallengeStatus)
    {
        return walletChallengeMap[wallet].status;
    }

    function getChallengeIntendedStage(address wallet)
    public
    view
    returns (DriipSettlementTypes.OptionalFigure)
    {
        return walletChallengeMap[wallet].intendedStage;
    }

    function getChallengeConjugateStage(address wallet)
    public
    view
    returns (DriipSettlementTypes.OptionalFigure)
    {
        return walletChallengeMap[wallet].conjugateStage;
    }

    function getChallengeChallenger(address wallet)
    public
    view
    returns (address)
    {
        return walletChallengeMap[wallet].challenger;
    }
}