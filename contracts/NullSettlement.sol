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
import {Configurable} from "./Configurable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {NullSettlementState} from "./NullSettlementState.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";

/**
 * @title NullSettlement
 * @notice Where null settlement are finalized
 */
contract NullSettlement is Ownable, Configurable, ClientFundable, CommunityVotable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallengeState public nullSettlementChallengeState;
    NullSettlementState public nullSettlementState;
    DriipSettlementChallengeState public driipSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event SetNullSettlementStateEvent(NullSettlementState oldNullSettlementState,
        NullSettlementState newNullSettlementState);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event SettleNullEvent(address wallet, address currencyCt, uint256 currencyId, string standard);
    event SettleNullByProxyEvent(address proxy, address wallet, address currencyCt,
        uint256 currencyId, string standard);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the null settlement challenge state contract
    /// @param newNullSettlementChallengeState The (address of) NullSettlementChallengeState contract instance
    function setNullSettlementChallengeState(NullSettlementChallengeState newNullSettlementChallengeState)
    public
    onlyDeployer
    notNullAddress(address(newNullSettlementChallengeState))
    {
        NullSettlementChallengeState oldNullSettlementChallengeState = nullSettlementChallengeState;
        nullSettlementChallengeState = newNullSettlementChallengeState;
        emit SetNullSettlementChallengeStateEvent(oldNullSettlementChallengeState, nullSettlementChallengeState);
    }

    /// @notice Set the null settlement state contract
    /// @param newNullSettlementState The (address of) NullSettlementState contract instance
    function setNullSettlementState(NullSettlementState newNullSettlementState)
    public
    onlyDeployer
    notNullAddress(address(newNullSettlementState))
    {
        NullSettlementState oldNullSettlementState = nullSettlementState;
        nullSettlementState = newNullSettlementState;
        emit SetNullSettlementStateEvent(oldNullSettlementState, nullSettlementState);
    }

    /// @notice Set the driip settlement challenge state contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState)
    public
    onlyDeployer
    notNullAddress(address(newDriipSettlementChallengeState))
    {
        DriipSettlementChallengeState oldDriipSettlementChallengeState = driipSettlementChallengeState;
        driipSettlementChallengeState = newDriipSettlementChallengeState;
        emit SetDriipSettlementChallengeStateEvent(oldDriipSettlementChallengeState, driipSettlementChallengeState);
    }

    /// @notice Settle null
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token to be settled (discarded if settling ETH)
    function settleNull(address currencyCt, uint256 currencyId, string memory standard)
    public
    {
        // Settle null
        _settleNull(msg.sender, MonetaryTypesLib.Currency(currencyCt, currencyId), standard);

        // Emit event
        emit SettleNullEvent(msg.sender, currencyCt, currencyId, standard);
    }

    /// @notice Settle null by proxy
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token to be settled (discarded if settling ETH)
    function settleNullByProxy(address wallet, address currencyCt, uint256 currencyId, string memory standard)
    public
    onlyOperator
    {
        // Settle null of wallet
        _settleNull(wallet, MonetaryTypesLib.Currency(currencyCt, currencyId), standard);

        // Emit event
        emit SettleNullByProxyEvent(msg.sender, wallet, currencyCt, currencyId, standard);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _settleNull(address wallet, MonetaryTypesLib.Currency memory currency, string memory standard)
    private
    {
        // Require that there is no overlapping driip settlement challenge
        require(
            !driipSettlementChallengeState.hasProposal(wallet, currency) ||
        driipSettlementChallengeState.hasProposalTerminated(wallet, currency),
            "Overlapping driip settlement challenge proposal found [NullSettlement.sol:134]"
        );

        // Require that null settlement challenge proposal has been initiated
        require(nullSettlementChallengeState.hasProposal(wallet, currency), "No proposal found [NullSettlement.sol:141]");

        // Require that null settlement challenge proposal has not been terminated already
        require(!nullSettlementChallengeState.hasProposalTerminated(wallet, currency), "Proposal found terminated [NullSettlement.sol:144]");

        // Require that null settlement challenge proposal has expired
        require(nullSettlementChallengeState.hasProposalExpired(wallet, currency), "Proposal found not expired [NullSettlement.sol:147]");

        // Require that null settlement challenge qualified
        require(SettlementChallengeTypesLib.Status.Qualified == nullSettlementChallengeState.proposalStatus(
            wallet, currency
        ), "Proposal found not qualified [NullSettlement.sol:150]");

        // Require that operational mode is normal and data is available, or that nonce is
        // smaller than max null nonce
        require(configuration.isOperationalModeNormal(), "Not normal operational mode [NullSettlement.sol:156]");
        require(communityVote.isDataAvailable(), "Data not available [NullSettlement.sol:157]");

        // Get null settlement challenge proposal nonce
        uint256 nonce = nullSettlementChallengeState.proposalNonce(wallet, currency);

        // If wallet has previously settled balance of the concerned currency with higher
        // null settlement nonce, then don't settle again
        require(nonce >= nullSettlementState.maxNonceByWalletAndCurrency(wallet, currency), "Nonce deemed smaller than max nonce by wallet and currency [NullSettlement.sol:164]");

        // Update settled nonce of wallet and currency
        nullSettlementState.setMaxNonceByWalletAndCurrency(wallet, currency, nonce);

        // Stage the proposed amount
        clientFund.stage(
            wallet,
            nullSettlementChallengeState.proposalStageAmount(
                wallet, currency
            ),
            currency.ct, currency.id, standard
        );

        // Remove null settlement challenge proposal
        nullSettlementChallengeState.terminateProposal(wallet, currency);
    }
}