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
import {WalletLockable} from "./WalletLockable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {DriipSettlementDisputeByTrade} from "./DriipSettlementDisputeByTrade.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {DriipSettlementState} from "./DriipSettlementState.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title DriipSettlementChallengeByTrade
 * @notice Where driip settlements pertaining to trades are started and disputed
 */
contract DriipSettlementChallengeByTrade is Ownable, ConfigurableOperational, ValidatableV2, WalletLockable,
BalanceTrackable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementDisputeByTrade public driipSettlementDisputeByTrade;
    DriipSettlementChallengeState public driipSettlementChallengeState;
    NullSettlementChallengeState public nullSettlementChallengeState;
    DriipSettlementState public driipSettlementState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetDriipSettlementDisputeByTradeEvent(DriipSettlementDisputeByTrade oldDriipSettlementDisputeByTrade,
        DriipSettlementDisputeByTrade newDriipSettlementDisputeByTrade);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event SetDriipSettlementStateEvent(DriipSettlementState oldDriipSettlementState,
        DriipSettlementState newDriipSettlementState);
    event StartChallengeFromTradeEvent(address wallet, uint256 intendedNonce, int256 intendedStageAmount,
        int256 intendedTargetBalanceAmount, address intendedCurrencyCt, uint256 intendedCurrencyId,
        uint256 conjugateNonce, int256 conjugateStageAmount, int256 conjugateTargetBalanceAmount,
        address conjugateCurrencyCt, uint256 conjugateCurrencyId);
    event StartChallengeFromTradeByProxyEvent(address wallet, uint256 intendedNonce, int256 intendedStageAmount,
        int256 intendedTargetBalanceAmount, address intendedCurrencyCt, uint256 intendedCurrencyId,
        uint256 conjugateNonce, int256 conjugateStageAmount, int256 conjugateTargetBalanceAmount,
        address conjugateCurrencyCt, uint256 conjugateCurrencyId, address proxy);
    event StopChallengeEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount,
        int256 stageAmount, int256 targetBalanceAmount, address currencyCt, uint256 currencyId);
    event StopChallengeByProxyEvent(address wallet, uint256 nonce, int256 cumulativeTransferAmount,
        int256 stageAmount, int256 targetBalanceAmount, address currencyCt, uint256 currencyId, address proxy);
    event UnchallengeOrderByTradeEvent(address challengedWallet, uint256 nonce, int256 cumulativeTransferAmount,
        int256 stageAmount, int256 targetBalanceAmount, address currencyCt, uint256 currencyId,
        address challengerWallet);
    event ChallengeByTradeEvent(address challengedWallet, uint256 nonce, int256 cumulativeTransferAmount,
        int256 stageAmount, int256 targetBalanceAmount, address currencyCt, uint256 currencyId,
        address challengerWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the settlement dispute contract
    /// @param newDriipSettlementDisputeByTrade The (address of) DriipSettlementDisputeByTrade contract instance
    function setDriipSettlementDisputeByTrade(DriipSettlementDisputeByTrade newDriipSettlementDisputeByTrade)
    public
    onlyDeployer
    notNullAddress(address(newDriipSettlementDisputeByTrade))
    {
        DriipSettlementDisputeByTrade oldDriipSettlementDisputeByTrade = driipSettlementDisputeByTrade;
        driipSettlementDisputeByTrade = newDriipSettlementDisputeByTrade;
        emit SetDriipSettlementDisputeByTradeEvent(oldDriipSettlementDisputeByTrade, driipSettlementDisputeByTrade);
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

    /// @notice Set the driip settlement state contract
    /// @param newDriipSettlementState The (address of) DriipSettlementState contract instance
    function setDriipSettlementState(DriipSettlementState newDriipSettlementState)
    public
    onlyDeployer
    notNullAddress(address(newDriipSettlementState))
    {
        DriipSettlementState oldDriipSettlementState = driipSettlementState;
        driipSettlementState = newDriipSettlementState;
        emit SetDriipSettlementStateEvent(oldDriipSettlementState, driipSettlementState);
    }

    /// @notice Start settlement challenge on trade
    /// @param trade The challenged trade
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTrade(TradeTypesLib.Trade memory trade, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    public
    {
        // Require that wallet is not temporarily disqualified
        require(!walletLocker.isLocked(msg.sender), "Wallet found locked [DriipSettlementChallengeByTrade.sol:144]");

        // Start challenge
        _startChallengeFromTrade(msg.sender, trade, intendedStageAmount, conjugateStageAmount, true);

        // Emit event
        emit StartChallengeFromTradeEvent(
            msg.sender,
            driipSettlementChallengeState.proposalNonce(msg.sender, trade.currencies.intended),
            intendedStageAmount,
            driipSettlementChallengeState.proposalTargetBalanceAmount(msg.sender, trade.currencies.intended),
            trade.currencies.intended.ct, trade.currencies.intended.id,
            driipSettlementChallengeState.proposalNonce(msg.sender, trade.currencies.conjugate),
            conjugateStageAmount,
            driipSettlementChallengeState.proposalTargetBalanceAmount(msg.sender, trade.currencies.conjugate),
            trade.currencies.conjugate.ct, trade.currencies.conjugate.id
        );
    }

    /// @notice Start settlement challenge on trade by proxy
    /// @param wallet The concerned party
    /// @param trade The challenged trade
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTradeByProxy(address wallet, TradeTypesLib.Trade memory trade, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    public
    onlyOperator
    {
        // Start challenge for wallet
        _startChallengeFromTrade(wallet, trade, intendedStageAmount, conjugateStageAmount, false);

        // Emit event
        emit StartChallengeFromTradeByProxyEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, trade.currencies.intended),
            driipSettlementChallengeState.proposalStageAmount(wallet, trade.currencies.intended),
            driipSettlementChallengeState.proposalTargetBalanceAmount(wallet, trade.currencies.intended),
            trade.currencies.intended.ct, trade.currencies.intended.id,
            driipSettlementChallengeState.proposalNonce(wallet, trade.currencies.conjugate),
            driipSettlementChallengeState.proposalStageAmount(wallet, trade.currencies.conjugate),
            driipSettlementChallengeState.proposalTargetBalanceAmount(wallet, trade.currencies.conjugate),
            trade.currencies.conjugate.ct, trade.currencies.conjugate.id, msg.sender
        );
    }

    /// @notice Stop settlement challenge
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallenge(address currencyCt, uint256 currencyId)
    public
    {
        // Define currency
        MonetaryTypesLib.Currency memory currency = MonetaryTypesLib.Currency(currencyCt, currencyId);

        // Stop challenge
        _stopChallenge(msg.sender, currency, true, true);

        // Emit event
        emit StopChallengeEvent(
            msg.sender,
            driipSettlementChallengeState.proposalNonce(msg.sender, currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(msg.sender, currency),
            driipSettlementChallengeState.proposalStageAmount(msg.sender, currency),
            driipSettlementChallengeState.proposalTargetBalanceAmount(msg.sender, currency),
            currencyCt, currencyId
        );
    }

    /// @notice Stop settlement challenge
    /// @param wallet The concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stopChallengeByProxy(address wallet, address currencyCt, uint256 currencyId)
    public
    onlyOperator
    {
        // Define currency
        MonetaryTypesLib.Currency memory currency = MonetaryTypesLib.Currency(currencyCt, currencyId);

        // Stop challenge
        _stopChallenge(wallet, currency, true, false);

        // Emit event
        emit StopChallengeByProxyEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(wallet, currency),
            driipSettlementChallengeState.proposalStageAmount(wallet, currency),
            driipSettlementChallengeState.proposalTargetBalanceAmount(wallet, currency),
            currencyCt, currencyId, msg.sender
        );
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
        return driipSettlementChallengeState.hasProposalExpired(
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
        return driipSettlementChallengeState.proposalNonce(
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
        return driipSettlementChallengeState.proposalReferenceBlockNumber(
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
        return driipSettlementChallengeState.proposalExpirationTime(
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
        return driipSettlementChallengeState.proposalStatus(
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
        return driipSettlementChallengeState.proposalStageAmount(
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
        return driipSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal driip hash of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal driip hash
    function proposalChallengedHash(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bytes32)
    {
        return driipSettlementChallengeState.proposalChallengedHash(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal driip type of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal driip type
    function proposalChallengedKind(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (string memory)
    {
        return driipSettlementChallengeState.proposalChallengedKind(
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
        return driipSettlementChallengeState.proposalWalletInitiated(
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
        return driipSettlementChallengeState.proposalDisqualificationChallenger(
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
        return driipSettlementChallengeState.proposalDisqualificationBlockNumber(
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
        return driipSettlementChallengeState.proposalDisqualificationCandidateKind(
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
        return driipSettlementChallengeState.proposalDisqualificationCandidateHash(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Unchallenge settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(TradeTypesLib.Order memory order, TradeTypesLib.Trade memory trade)
    public
    onlyOperationalModeNormal
    {
        // Unchallenge by trade
        driipSettlementDisputeByTrade.unchallengeOrderCandidateByTrade(order, trade, msg.sender);

        // Get concerned currency
        MonetaryTypesLib.Currency memory currency = _orderCurrency(order);

        // Emit event
        emit UnchallengeOrderByTradeEvent(
            order.wallet,
            driipSettlementChallengeState.proposalNonce(order.wallet, currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(order.wallet, currency),
            driipSettlementChallengeState.proposalStageAmount(order.wallet, currency),
            driipSettlementChallengeState.proposalTargetBalanceAmount(order.wallet, currency),
            currency.ct, currency.id,
            msg.sender
        );
    }

    /// @notice Challenge the settlement by providing trade candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param trade The trade candidate that challenges the challenged driip
    function challengeByTrade(address wallet, TradeTypesLib.Trade memory trade)
    public
    onlyOperationalModeNormal
    {
        // Challenge by trade
        driipSettlementDisputeByTrade.challengeByTrade(wallet, trade, msg.sender);

        // Get concerned currency
        MonetaryTypesLib.Currency memory currency = _tradeCurrency(trade, wallet);

        // Emit event
        emit ChallengeByTradeEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, currency),
            driipSettlementChallengeState.proposalCumulativeTransferAmount(wallet, currency),
            driipSettlementChallengeState.proposalStageAmount(wallet, currency),
            driipSettlementChallengeState.proposalTargetBalanceAmount(wallet, currency),
            currency.ct, currency.id,
            msg.sender
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _startChallengeFromTrade(address wallet, TradeTypesLib.Trade memory trade,
        int256 intendedStageAmount, int256 conjugateStageAmount, bool walletInitiated)
    private
    onlySealedTrade(trade)
    {
        // Require that current block number is beyond the earliest settlement challenge block number
        require(
            block.number >= configuration.earliestSettlementBlockNumber(),
            "Current block number below earliest settlement block number [DriipSettlementChallengeByTrade.sol:506]"
        );

        // Require that given wallet is a trade party
        require(
            validator.isTradeParty(trade, wallet),
            "Wallet is not trade party [DriipSettlementChallengeByTrade.sol:512]"
        );

        // Create proposals
        _addIntendedProposalFromTrade(wallet, trade, intendedStageAmount, walletInitiated);
        _addConjugateProposalFromTrade(wallet, trade, conjugateStageAmount, walletInitiated);
    }

    function _stopChallenge(address wallet, MonetaryTypesLib.Currency memory currency, bool clearNonce, bool walletTerminated)
    private
    {
        // Require that there is an unterminated driip settlement challenge proposal
        require(
            driipSettlementChallengeState.hasProposal(wallet, currency),
            "No proposal found [DriipSettlementChallengeByTrade.sol:526]"
        );
        require(
            !driipSettlementChallengeState.hasProposalTerminated(wallet, currency),
            "Proposal found terminated [DriipSettlementChallengeByTrade.sol:530]"
        );

        // Terminate driip settlement challenge proposal
        driipSettlementChallengeState.terminateProposal(wallet, currency, clearNonce, walletTerminated);

        // Terminate dependent null settlement challenge proposal if existent
        nullSettlementChallengeState.terminateProposal(wallet, currency);
    }

    function _addIntendedProposalFromTrade(address wallet, TradeTypesLib.Trade memory trade, int256 stageAmount, bool walletInitiated)
    private
    {
        // Require that there is no ongoing overlapping driip settlement challenge
        require(
            !driipSettlementChallengeState.hasProposal(wallet, trade.currencies.intended) ||
        driipSettlementChallengeState.hasProposalTerminated(wallet, trade.currencies.intended),
            "Overlapping driip settlement challenge proposal in intended currency found [DriipSettlementChallengeByTrade.sol:546]"
        );

        // Require that there is no ongoing overlapping null settlement challenge
        require(
            !nullSettlementChallengeState.hasProposal(wallet, trade.currencies.intended) ||
        nullSettlementChallengeState.hasProposalTerminated(wallet, trade.currencies.intended),
            "Overlapping null settlement challenge proposal in intended currency found [DriipSettlementChallengeByTrade.sol:553]"
        );

        // Deduce the concerned nonce and cumulative relative transfer
        (uint256 nonce, int256 cumulativeTransferAmount, int256 targetBalanceAmount) =
        _tradePartyIntendedProperties(trade, wallet, stageAmount);

        // Require that the wallet nonce of the trade is higher than the highest settled wallet nonce
        require(
            driipSettlementState.maxNonceByWalletAndCurrency(wallet, trade.currencies.intended) < nonce,
            "Wallet's nonce below highest settled nonce in intended currency [DriipSettlementChallengeByTrade.sol:564]"
        );

        // Initiate proposal, including assurance that there is no overlap with active proposal,
        // cumulative transfer amount with negative sign
        driipSettlementChallengeState.initiateProposal(
            wallet, nonce, cumulativeTransferAmount.mul(- 1), stageAmount, targetBalanceAmount,
            trade.currencies.intended, trade.blockNumber,
            walletInitiated, trade.seal.hash, TradeTypesLib.TRADE_KIND()
        );
    }

    function _addConjugateProposalFromTrade(address wallet, TradeTypesLib.Trade memory trade, int256 stageAmount, bool walletInitiated)
    private
    {
        // Require that there is no ongoing overlapping driip settlement challenge
        require(
            !driipSettlementChallengeState.hasProposal(wallet, trade.currencies.conjugate) ||
        driipSettlementChallengeState.hasProposalTerminated(wallet, trade.currencies.conjugate),
            "Overlapping driip settlement challenge proposal in conjugate currency found [DriipSettlementChallengeByTrade.sol:582]"
        );

        // Require that there is no ongoing overlapping null settlement challenge
        require(
            !nullSettlementChallengeState.hasProposal(wallet, trade.currencies.conjugate) ||
        nullSettlementChallengeState.hasProposalTerminated(wallet, trade.currencies.conjugate),
            "Overlapping null settlement challenge proposal in conjugate currency found [DriipSettlementChallengeByTrade.sol:589]"
        );

        // Deduce the concerned nonce and cumulative relative transfer
        (uint256 nonce, int256 cumulativeTransferAmount, int256 targetBalanceAmount) =
        _tradePartyConjugateProperties(trade, wallet, stageAmount);

        // Require that the wallet nonce of the trade is higher than the highest settled wallet nonce
        require(
            driipSettlementState.maxNonceByWalletAndCurrency(wallet, trade.currencies.conjugate) < nonce,
            "Wallet's nonce below highest settled nonce in conjugate currency [DriipSettlementChallengeByTrade.sol:600]"
        );

        // Initiate proposal, including assurance that there is no overlap with active proposal,
        // cumulative transfer amount with negative sign
        driipSettlementChallengeState.initiateProposal(
            wallet, nonce, cumulativeTransferAmount.mul(- 1), stageAmount, targetBalanceAmount,
            trade.currencies.conjugate, trade.blockNumber,
            walletInitiated, trade.seal.hash, TradeTypesLib.TRADE_KIND()
        );
    }

    function _tradePartyIntendedProperties(TradeTypesLib.Trade memory trade, address wallet, int256 stageAmount)
    private
    view
    returns (uint nonce, int256 correctedCumulativeTransferAmount, int256 targetBalanceAmount)
    {
        // Obtain unsynchronized stage amount from previous driip settlement if existent.
        int256 unsynchronizedStageAmount = 0;
        if (driipSettlementChallengeState.hasProposal(wallet, trade.currencies.intended)) {
            uint256 previousChallengeNonce = driipSettlementChallengeState.proposalNonce(wallet, trade.currencies.intended);

            // Get settlement party done block number. The function returns 0 if the settlement party has not effectuated
            // its side of the settlement.
            uint256 settlementPartyDoneBlockNumber = driipSettlementState.settlementPartyDoneBlockNumber(
                wallet, previousChallengeNonce
            );

            // If trade is not up to date wrt events affecting the wallet's balance then obtain
            // the unsynchronized stage amount from the previous driip settlement challenge.
            if (trade.blockNumber < settlementPartyDoneBlockNumber)
                unsynchronizedStageAmount = driipSettlementChallengeState.proposalStageAmount(
                    wallet, trade.currencies.intended
                );
        }

        // Obtain the active balance amount at the trade block
        int256 balanceAmountAtTradeBlock = balanceTracker.fungibleActiveBalanceAmountByBlockNumber(
            wallet, trade.currencies.intended, trade.blockNumber
        );

        // Obtain nonce and (base of) cumulative (relative) transfer amount.
        if (validator.isTradeBuyer(trade, wallet)) {
            nonce = trade.buyer.nonce;
            correctedCumulativeTransferAmount = trade.buyer.balances.intended.current;
        } else {
            nonce = trade.seller.nonce;
            correctedCumulativeTransferAmount = trade.seller.balances.intended.current;
        }

        // Correct the cumulative transfer amount for wrong value occurring from
        // race condition of off-chain wallet rebalance resulting from completed settlement
        correctedCumulativeTransferAmount = correctedCumulativeTransferAmount.sub(
            balanceAmountAtTradeBlock.add(unsynchronizedStageAmount)
        );

        // Calculate target balance amount from current active balance, corrected cumulative transfer amount
        // and stage amount
        targetBalanceAmount = balanceTracker.fungibleActiveBalanceAmount(wallet, trade.currencies.intended)
        .add(correctedCumulativeTransferAmount).sub(stageAmount);
    }

    function _tradePartyConjugateProperties(TradeTypesLib.Trade memory trade, address wallet, int256 stageAmount)
    private
    view
    returns (uint nonce, int256 correctedCumulativeTransferAmount, int256 targetBalanceAmount)
    {
        // Obtain unsynchronized stage amount from previous driip settlement if existent.
        int256 unsynchronizedStageAmount = 0;
        if (driipSettlementChallengeState.hasProposal(wallet, trade.currencies.conjugate)) {
            uint256 previousChallengeNonce = driipSettlementChallengeState.proposalNonce(wallet, trade.currencies.conjugate);

            // Get settlement party done block number. The function returns 0 if the settlement party has not effectuated
            // its side of the settlement.
            uint256 settlementPartyDoneBlockNumber = driipSettlementState.settlementPartyDoneBlockNumber(
                wallet, previousChallengeNonce
            );

            // If trade is not up to date wrt events affecting the wallet's balance then obtain
            // the unsynchronized stage amount from the previous driip settlement challenge.
            if (trade.blockNumber < settlementPartyDoneBlockNumber)
                unsynchronizedStageAmount = driipSettlementChallengeState.proposalStageAmount(
                    wallet, trade.currencies.conjugate
                );
        }

        // Obtain the active balance amount at the trade block
        int256 balanceAmountAtTradeBlock = balanceTracker.fungibleActiveBalanceAmountByBlockNumber(
            wallet, trade.currencies.conjugate, trade.blockNumber
        );

        // Obtain nonce and (base of) cumulative (relative) transfer amount.
        if (validator.isTradeBuyer(trade, wallet)) {
            nonce = trade.buyer.nonce;
            correctedCumulativeTransferAmount = trade.buyer.balances.conjugate.current;
        } else {
            nonce = trade.seller.nonce;
            correctedCumulativeTransferAmount = trade.seller.balances.conjugate.current;
        }

        // Correct the cumulative transfer amount for wrong value occurring from
        // race condition of off-chain wallet rebalance resulting from completed settlement
        correctedCumulativeTransferAmount = correctedCumulativeTransferAmount.sub(
            balanceAmountAtTradeBlock.add(unsynchronizedStageAmount)
        );

        // Calculate target balance amount from current active balance, corrected cumulative transfer amount
        // and stage amount
        targetBalanceAmount = balanceTracker.fungibleActiveBalanceAmount(wallet, trade.currencies.conjugate)
        .add(correctedCumulativeTransferAmount).sub(stageAmount);
    }

    // Get the candidate order currency
    // Buy order -> Conjugate currency
    // Sell order -> Intended currency
    function _orderCurrency(TradeTypesLib.Order memory order)
    private
    pure
    returns (MonetaryTypesLib.Currency memory)
    {
        return TradeTypesLib.Intention.Sell == order.placement.intention ?
        order.placement.currencies.intended :
        order.placement.currencies.conjugate;
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