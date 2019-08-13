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
import {ConfigurableOperational} from "./ConfigurableOperational.sol";
import {ValidatableV2} from "./ValidatableV2.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {NullSettlementDisputeByTrade} from "./NullSettlementDisputeByTrade.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title NullSettlementChallengeByTrade
 * @notice Where null settlements pertaining to trade are started and disputed
 */
contract NullSettlementChallengeByTrade is Ownable, ConfigurableOperational, ValidatableV2, BalanceTrackable, WalletLockable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementDisputeByTrade public nullSettlementDisputeByTrade;
    NullSettlementChallengeState public nullSettlementChallengeState;
    DriipSettlementChallengeState public driipSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementDisputeByTradeEvent(NullSettlementDisputeByTrade oldNullSettlementDisputeByTrade,
        NullSettlementDisputeByTrade newNullSettlementDisputeByTrade);
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event StartChallengeEvent(address wallet, int256 amount, address stageCurrencyCt,
        uint stageCurrencyId);
    event StartChallengeByProxyEvent(address proxy, address wallet, int256 amount,
        address stageCurrencyCt, uint stageCurrencyId);
    event StopChallengeEvent(address wallet, address currencyCt, uint256 currencyId);
    event StopChallengeByProxyEvent(address proxy, address wallet, address currencyCt, uint256 currencyId);
    event ChallengeByTradeEvent(address challengedWallet, uint256 nonce, int256 stageAmount,
        int256 targetBalanceAmount, address currencyCt, uint256 currencyId, address challengerWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the settlement dispute contract
    /// @param newNullSettlementDisputeByTrade The (address of) NullSettlementDisputeByTrade contract instance
    function setNullSettlementDisputeByTrade(NullSettlementDisputeByTrade newNullSettlementDisputeByTrade)
    public
    onlyDeployer
    notNullAddress(address(newNullSettlementDisputeByTrade))
    {
        NullSettlementDisputeByTrade oldNullSettlementDisputeByTrade = nullSettlementDisputeByTrade;
        nullSettlementDisputeByTrade = newNullSettlementDisputeByTrade;
        emit SetNullSettlementDisputeByTradeEvent(oldNullSettlementDisputeByTrade, nullSettlementDisputeByTrade);
    }

    /// @notice Set the settlement challenge state contract
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

    /// @notice Start settlement challenge
    /// @param amount The concerned amount to stage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function startChallenge(int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        // Require that wallet is not locked
        require(!walletLocker.isLocked(msg.sender), "[NullSettlementChallengeByTrade.sol:115]");

        // Start challenge for wallet
        _startChallenge(msg.sender, amount, MonetaryTypesLib.Currency(currencyCt, currencyId), true);

        // Emit event
        emit StartChallengeEvent(msg.sender, amount, currencyCt, currencyId);
    }

    /// @notice Start settlement challenge for the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param amount The concerned amount to stage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function startChallengeByProxy(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyOperator
    {
        // Start challenge for wallet
        _startChallenge(wallet, amount, MonetaryTypesLib.Currency(currencyCt, currencyId), false);

        // Emit event
        emit StartChallengeByProxyEvent(msg.sender, wallet, amount, currencyCt, currencyId);
    }

    /// @notice Stop settlement challenge
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallenge(address currencyCt, uint256 currencyId)
    public
    {
        // Stop challenge
        _stopChallenge(msg.sender, MonetaryTypesLib.Currency(currencyCt, currencyId), true);

        // Emit event
        emit StopChallengeEvent(msg.sender, currencyCt, currencyId);
    }

    /// @notice Stop settlement challenge
    /// @param wallet The concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallengeByProxy(address wallet, address currencyCt, uint256 currencyId)
    public
    onlyOperator
    {
        // Stop challenge
        _stopChallenge(wallet, MonetaryTypesLib.Currency(currencyCt, currencyId), false);

        // Emit event
        emit StopChallengeByProxyEvent(msg.sender, wallet, currencyCt, currencyId);
    }

    /// @notice Gauge whether the proposal for the given wallet and currency has expired
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return true if proposal has expired, else false
    function hasProposalExpired(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return nullSettlementChallengeState.hasProposalExpired(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the challenge nonce of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The challenge nonce
    function proposalNonce(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return nullSettlementChallengeState.proposalNonce(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal block number of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal block number
    function proposalReferenceBlockNumber(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return nullSettlementChallengeState.proposalReferenceBlockNumber(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal end time of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal end time
    function proposalExpirationTime(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return nullSettlementChallengeState.proposalExpirationTime(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the challenge status of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The challenge status
    function proposalStatus(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (SettlementChallengeTypesLib.Status)
    {
        return nullSettlementChallengeState.proposalStatus(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal stage amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal stage amount
    function proposalStageAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return nullSettlementChallengeState.proposalStageAmount(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal target balance amount of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal target balance amount
    function proposalTargetBalanceAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return nullSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the balance reward of the given wallet's settlement proposal
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The balance reward of the settlement proposal
    function proposalWalletInitiated(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return nullSettlementChallengeState.proposalWalletInitiated(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the disqualification challenger of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The challenger of the settlement disqualification
    function proposalDisqualificationChallenger(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (address)
    {
        return nullSettlementChallengeState.proposalDisqualificationChallenger(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the disqualification block number of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The block number of the settlement disqualification
    function proposalDisqualificationBlockNumber(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return nullSettlementChallengeState.proposalDisqualificationBlockNumber(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the disqualification candidate kind of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The candidate kind of the settlement disqualification
    function proposalDisqualificationCandidateKind(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (string memory)
    {
        return nullSettlementChallengeState.proposalDisqualificationCandidateKind(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the disqualification candidate hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The candidate hash of the settlement disqualification
    function proposalDisqualificationCandidateHash(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bytes32)
    {
        return nullSettlementChallengeState.proposalDisqualificationCandidateHash(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Challenge the settlement by providing trade candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param trade The trade candidate that challenges the null
    function challengeByTrade(address wallet, TradeTypesLib.Trade memory trade)
    public
    onlyOperationalModeNormal
    {
        // Challenge by trade
        nullSettlementDisputeByTrade.challengeByTrade(wallet, trade, msg.sender);

        // Get concerned currency
        MonetaryTypesLib.Currency memory currency = _tradeCurrency(trade, wallet);

        // Emit event
        emit ChallengeByTradeEvent(
            wallet,
            nullSettlementChallengeState.proposalNonce(wallet, currency),
            nullSettlementChallengeState.proposalStageAmount(wallet, currency),
            nullSettlementChallengeState.proposalTargetBalanceAmount(wallet, currency),
            currency.ct, currency.id,
            msg.sender
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _startChallenge(address wallet, int256 stageAmount, MonetaryTypesLib.Currency memory currency,
        bool walletInitiated)
    private
    {
        // Require that current block number is beyond the earliest settlement challenge block number
        require(
            block.number >= configuration.earliestSettlementBlockNumber(),
            "Current block number below earliest settlement block number [NullSettlementChallengeByTrade.sol:380]"
        );

        // Require that there is no ongoing overlapping null settlement challenge
        require(
            !nullSettlementChallengeState.hasProposal(wallet, currency) ||
        nullSettlementChallengeState.hasProposalExpired(wallet, currency),
            "Overlapping null settlement challenge proposal found [NullSettlementChallengeByTrade.sol:386]"
        );

        // Get the last logged active balance amount and block number, properties of overlapping DSC
        // and the baseline nonce
        (
        int256 activeBalanceAmount, uint256 activeBalanceBlockNumber,
        int256 dscCumulativeTransferAmount, int256 dscStageAmount,
        uint256 nonce
        ) = _externalProperties(
            wallet, currency
        );

        // Initiate proposal, including assurance that there is no overlap with active proposal
        // Target balance amount is calculated as current balance - DSC cumulativeTransferAmount - DSC stage amount - NSC stageAmount
        nullSettlementChallengeState.initiateProposal(
            wallet, nonce, stageAmount,
            activeBalanceAmount.sub(
                dscCumulativeTransferAmount.add(dscStageAmount).add(stageAmount)
            ),
            currency,
            activeBalanceBlockNumber, walletInitiated
        );
    }

    function _stopChallenge(address wallet, MonetaryTypesLib.Currency memory currency, bool walletTerminated)
    private
    {
        // Terminate proposal
        nullSettlementChallengeState.terminateProposal(wallet, currency, walletTerminated);
    }

    function _externalProperties(address wallet, MonetaryTypesLib.Currency memory currency)
    private
    view
    returns (
        int256 activeBalanceAmount, uint256 activeBalanceBlockNumber,
        int256 dscCumulativeTransferAmount, int256 dscStageAmount,
        uint256 nonce
    ) {
        (activeBalanceAmount, activeBalanceBlockNumber) = balanceTracker.fungibleActiveRecord(
            wallet, currency
        );

        if (driipSettlementChallengeState.hasProposal(wallet, currency)) {
            if (!driipSettlementChallengeState.hasProposalTerminated(wallet, currency)) {
                dscCumulativeTransferAmount = driipSettlementChallengeState.proposalCumulativeTransferAmount(wallet, currency);
                dscStageAmount = driipSettlementChallengeState.proposalStageAmount(wallet, currency);
            }

            nonce = driipSettlementChallengeState.proposalNonce(wallet, currency);
        }

        if (nullSettlementChallengeState.hasProposal(wallet, currency))
            nonce = nonce.clampMin(nullSettlementChallengeState.proposalNonce(wallet, currency));
    }

    // Get the candidate trade currency
    // Wallet is buyer in (candidate) trade -> Conjugate currency
    // Wallet is seller in (candidate) trade -> Intended currency
    function _tradeCurrency(TradeTypesLib.Trade memory trade, address wallet)
    private
    view
    returns (MonetaryTypesLib.Currency memory)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.currencies.conjugate :
        trade.currencies.intended;
    }
}