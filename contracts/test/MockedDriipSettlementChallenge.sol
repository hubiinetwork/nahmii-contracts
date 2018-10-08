/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

//import {DriipSettlementChallenge} from "../DriipSettlementChallenge.sol";
import {MonetaryTypes} from "../MonetaryTypes.sol";
import {NahmiiTypes} from "../NahmiiTypes.sol";
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
        walletChallengeMap[wallet].conjugateStage.amount = conjugateAmount;
        walletChallengeMap[wallet].conjugateStage.currency.ct = conjugateCurrencyCt;
        walletChallengeMap[wallet].conjugateStage.currency.id = conjugateCurrencyId;
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
    returns (MonetaryTypes.Figure)
    {
        return walletChallengeMap[wallet].intendedStage;
    }

    function getChallengeConjugateStage(address wallet)
    public
    view
    returns (MonetaryTypes.Figure)
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