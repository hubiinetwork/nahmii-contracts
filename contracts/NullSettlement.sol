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
import {Configurable} from "./Configurable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {NullSettlementChallenge} from "./NullSettlementChallenge.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";

/**
@title NullSettlement
@notice Where null settlement are finalized
*/
contract NullSettlement is Ownable, Configurable, ClientFundable, CommunityVotable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallenge public nullSettlementChallenge;

    uint256 public maxNullNonce;

    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxNullNonce;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeNullSettlementChallengeEvent(NullSettlementChallenge oldNullSettlementChallenge,
        NullSettlementChallenge newNullSettlementChallenge);
    event SettleNullEvent(address wallet, SettlementTypesLib.ProposalStatus proposalStatus);
    event SettleNullByProxyEvent(address proxy, address wallet, SettlementTypesLib.ProposalStatus proposalStatus);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the null settlement challenge contract
    /// @param newNullSettlementChallenge The (address of) NullSettlementChallenge contract instance
    function changeNullSettlementChallenge(NullSettlementChallenge newNullSettlementChallenge)
    public
    onlyDeployer
    notNullAddress(newNullSettlementChallenge)
    {
        NullSettlementChallenge oldNullSettlementChallenge = nullSettlementChallenge;
        nullSettlementChallenge = newNullSettlementChallenge;
        emit ChangeNullSettlementChallengeEvent(oldNullSettlementChallenge, nullSettlementChallenge);
    }

    /// @notice Update the max null settlement nonce property from CommunityVote contract
    function updateMaxNullNonce()
    public
    {
        uint256 _maxNullNonce = communityVote.getMaxNullNonce();
        if (_maxNullNonce > 0)
            maxNullNonce = _maxNullNonce;
    }

    /// @notice Settle null
    function settleNull()
    public
    {
        // Settle null
        settleNullPrivate(msg.sender);

        // Emit event
        emit SettleNullEvent(msg.sender, nullSettlementChallenge.proposalStatus(msg.sender));
    }

    /// @notice Settle null by proxy
    /// @param wallet The concerned wallet
    function settleNullByProxy(address wallet)
    public
    onlyDeployer
    {
        // Settle null of wallet
        settleNullPrivate(wallet);

        // Emit event
        emit SettleNullByProxyEvent(msg.sender, wallet, nullSettlementChallenge.proposalStatus(wallet));
    }

    function settleNullPrivate(address wallet)
    private
    configurationInitialized
    clientFundInitialized
    communityVoteInitialized
    nullSettlementChallengeInitialized
    {
        // Require that driip settlement challenge qualified
        require(nullSettlementChallenge.proposalStatus(wallet) == SettlementTypesLib.ProposalStatus.Qualified);

        uint256 nonce = nullSettlementChallenge.proposalNonce(wallet);

        // Require that operational mode is normal and data is available, or that nonce is
        // smaller than max null nonce
        require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
            || (nonce < maxNullNonce));

        // If wallet has previously settled balance of the concerned currency with higher
        // null settlement nonce, then don't settle again
        require(nonce > walletCurrencyMaxNullNonce[wallet][currency.ct][currency.id]);

        // Update settled nonce of wallet and currency
        walletCurrencyMaxNullNonce[wallet][currency.ct][currency.id] = nonce;

        // Get proposal's currency, target balance amount and stage amount. (Null settlement proposals only have one of each.)
        MonetaryTypesLib.Currency memory currency = nullSettlementChallenge.proposalCurrency(wallet, 0);
        int256 stageAmount = nullSettlementChallenge.proposalStageAmount(wallet, currency);
        int256 targetBalanceAmount = nullSettlementChallenge.proposalTargetBalanceAmount(wallet, currency);

        // Update settled balance
        clientFund.updateSettledBalance(wallet, targetBalanceAmount, currency.ct, currency.id);

        // Stage the proposed amount
        clientFund.stage(wallet, stageAmount, currency.ct, currency.id);

        // If payment nonce is beyond max null settlement nonce then update max null nonce
        if (nonce > maxNullNonce)
            maxNullNonce = nonce;
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier nullSettlementChallengeInitialized() {
        require(nullSettlementChallenge != address(0));
        _;
    }
}