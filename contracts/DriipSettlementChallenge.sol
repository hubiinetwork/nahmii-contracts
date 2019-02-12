/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {Ownable} from "./Ownable.sol";
import {Challenge} from "./Challenge.sol";
import {ValidatableV2} from "./ValidatableV2.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {DriipSettlementDispute} from "./DriipSettlementDispute.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";

/**
 * @title DriipSettlementChallenge
 * @notice Where driip settlements are started and disputed
 * @dev This contract is deprecated in favor of PaymentSettlementChallenge and
 *    TradeSettlementChallenge
 */
contract DriipSettlementChallenge is Ownable, Challenge, ValidatableV2, WalletLockable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementDispute public driipSettlementDispute;
    DriipSettlementChallengeState public driipSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetDriipSettlementDisputeEvent(DriipSettlementDispute oldDriipSettlementDispute,
        DriipSettlementDispute newDriipSettlementDispute);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event StartChallengeFromTradeEvent(address wallet, bytes32 tradeHash,
        int256 intendedStageAmount, int256 conjugateStageAmount);
    event StartChallengeFromTradeByProxyEvent(address proxy, address wallet, bytes32 tradeHash,
        int256 intendedStageAmount, int256 conjugateStageAmount);
    event StartChallengeFromPaymentEvent(address wallet, bytes32 paymentHash, int256 stageAmount);
    event StartChallengeFromPaymentByProxyEvent(address proxy, address wallet, bytes32 paymentHash,
        int256 stageAmount);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the settlement dispute contract
    /// @param newDriipSettlementDispute The (address of) DriipSettlementDispute contract instance
    function setDriipSettlementDispute(DriipSettlementDispute newDriipSettlementDispute)
    public
    onlyDeployer
    notNullAddress(newDriipSettlementDispute)
    {
        DriipSettlementDispute oldDriipSettlementDispute = driipSettlementDispute;
        driipSettlementDispute = newDriipSettlementDispute;
        emit SetDriipSettlementDisputeEvent(oldDriipSettlementDispute, driipSettlementDispute);
    }

    /// @notice Set the settlement state contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState)
    public
    onlyDeployer
    notNullAddress(newDriipSettlementChallengeState)
    {
        DriipSettlementChallengeState oldDriipSettlementChallengeState = driipSettlementChallengeState;
        driipSettlementChallengeState = newDriipSettlementChallengeState;
        emit SetDriipSettlementChallengeStateEvent(oldDriipSettlementChallengeState, driipSettlementChallengeState);
    }

    /// @notice Start settlement challenge on trade
    /// @param trade The challenged trade
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTrade(TradeTypesLib.Trade trade, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    public
    {
        // Require that wallet is not temporarily disqualified
        require(!walletLocker.isLocked(msg.sender));

        // Start challenge
        _startChallengeFromTrade(msg.sender, trade, intendedStageAmount, conjugateStageAmount, true);

        // Emit event
        emit StartChallengeFromTradeEvent(msg.sender, trade.seal.hash, intendedStageAmount, conjugateStageAmount);
    }

    /// @notice Start settlement challenge on trade by proxy
    /// @param wallet The concerned party
    /// @param trade The challenged trade
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTradeByProxy(address wallet, TradeTypesLib.Trade trade, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    public
    onlyOperator
    {
        // Start challenge for wallet
        _startChallengeFromTrade(wallet, trade, intendedStageAmount, conjugateStageAmount, false);

        // Emit event
        emit StartChallengeFromTradeByProxyEvent(msg.sender, wallet, trade.seal.hash, intendedStageAmount, conjugateStageAmount);
    }

    /// @notice Start settlement challenge on payment
    /// @param payment The challenged payment
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPayment(PaymentTypesLib.Payment payment, int256 stageAmount)
    public
    {
        // Require that wallet is not temporarily disqualified
        require(!walletLocker.isLocked(msg.sender));

        // Start challenge for wallet
        _startChallengeFromPayment(msg.sender, payment, stageAmount, true);

        // Emit event
        emit StartChallengeFromPaymentEvent(msg.sender, payment.seals.operator.hash, stageAmount);
    }

    /// @notice Start settlement challenge on payment
    /// @param wallet The concerned party
    /// @param payment The challenged payment
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPaymentByProxy(address wallet, PaymentTypesLib.Payment payment, int256 stageAmount)
    public
    onlyOperator
    {
        // Start challenge for wallet
        _startChallengeFromPayment(wallet, payment, stageAmount, false);

        // Emit event
        emit StartChallengeFromPaymentByProxyEvent(msg.sender, wallet, payment.seals.operator.hash, stageAmount);
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
    function proposalBlockNumber(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return driipSettlementChallengeState.proposalBlockNumber(
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
    returns (SettlementTypesLib.Status)
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
    function proposalDriipHash(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bytes32)
    {
        return driipSettlementChallengeState.proposalDriipHash(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the settlement proposal driip type of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal driip type
    function proposalDriipType(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (NahmiiTypesLib.DriipType)
    {
        return driipSettlementChallengeState.proposalDriipType(
            wallet, MonetaryTypesLib.Currency(currencyCt, currencyId)
        );
    }

    /// @notice Get the balance reward of the given wallet's settlement proposal
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The balance reward of the settlement proposal
    function proposalBalanceReward(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (bool)
    {
        return driipSettlementChallengeState.proposalBalanceReward(
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

    /// @notice Get the disqualification candidate type of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The candidate type of the settlement disqualification
    function proposalDisqualificationCandidateType(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (SettlementTypesLib.CandidateType)
    {
        return driipSettlementChallengeState.proposalDisqualificationCandidateType(
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

    /// @notice Challenge the settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    function challengeByOrder(TradeTypesLib.Order order)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByOrder(order, msg.sender);
    }

    /// @notice Unchallenge settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(TradeTypesLib.Order order, TradeTypesLib.Trade trade)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.unchallengeOrderCandidateByTrade(order, trade, msg.sender);
    }

    /// @notice Challenge the settlement by providing trade candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param trade The trade candidate that challenges the challenged driip
    function challengeByTrade(address wallet, TradeTypesLib.Trade trade)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByTrade(wallet, trade, msg.sender);
    }

    /// @notice Challenge the settlement by providing payment candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param payment The payment candidate that challenges the challenged driip
    function challengeByPayment(address wallet, PaymentTypesLib.Payment payment)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByPayment(wallet, payment, msg.sender);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _startChallengeFromTrade(address wallet, TradeTypesLib.Trade trade,
        int256 intendedStageAmount, int256 conjugateStageAmount, bool balanceReward)
    private
    onlySealedTrade(trade)
    {
        // Require that current block number is beyond the earliest settlement challenge block number
        require(block.number >= configuration.earliestSettlementBlockNumber());

        // Require that given wallet is a trade party
        require(validator.isTradeParty(trade, wallet));

        // Require that wallet has no overlap with active proposals
        require(
            driipSettlementChallengeState.hasProposalExpired(wallet, trade.currencies.intended)
        );
        require(
            driipSettlementChallengeState.hasProposalExpired(wallet, trade.currencies.conjugate)
        );

        // Create proposals
        _addIntendedProposalFromTrade(wallet, trade, intendedStageAmount, balanceReward);
        _addConjugateProposalFromTrade(wallet, trade, conjugateStageAmount, balanceReward);
    }

    function _startChallengeFromPayment(address wallet, PaymentTypesLib.Payment payment,
        int256 stageAmount, bool balanceReward)
    private
    onlySealedPayment(payment)
    {
        // Require that current block number is beyond the earliest settlement challenge block number
        require(block.number >= configuration.earliestSettlementBlockNumber());

        // Require that given wallet is a payment party
        require(validator.isPaymentParty(payment, wallet));

        // Require that wallet has no overlap with active proposal
        require(driipSettlementChallengeState.hasProposalExpired(wallet, payment.currency));

        // Create proposal
        _addProposalFromPayment(wallet, payment, stageAmount, balanceReward);
    }

    function _addIntendedProposalFromTrade(address wallet, TradeTypesLib.Trade trade, int256 stageAmount, bool balanceReward)
    private
    {
        // Deduce the concerned balance amount
        int256 balanceAmount = _tradeIntendedBalanceAmount(trade, wallet);

        // Require that balance amount is not less than stage amount
        require(balanceAmount >= stageAmount);

        // Add proposal
        driipSettlementChallengeState.addProposalFromDriip(
            wallet, stageAmount, balanceAmount.sub(stageAmount), trade.currencies.intended, trade.nonce,
            trade.blockNumber, balanceReward, trade.seal.hash, NahmiiTypesLib.DriipType.Trade
        );
    }

    function _addConjugateProposalFromTrade(address wallet, TradeTypesLib.Trade trade, int256 stageAmount, bool balanceReward)
    private
    {
        // Deduce the concerned balance amount
        int256 balanceAmount = _tradeConjugateBalanceAmount(trade, wallet);

        // Require that balance amount is not less than stage amount
        require(balanceAmount >= stageAmount);

        // Add proposal
        driipSettlementChallengeState.addProposalFromDriip(
            wallet, stageAmount, balanceAmount.sub(stageAmount), trade.currencies.conjugate, trade.nonce,
            trade.blockNumber, balanceReward, trade.seal.hash, NahmiiTypesLib.DriipType.Trade
        );
    }

    function _addProposalFromPayment(address wallet, PaymentTypesLib.Payment payment, int256 stageAmount,
        bool balanceReward)
    private
    {
        // Deduce the concerned balance amount
        int256 balanceAmount = _paymentBalanceAmount(payment, wallet);

        // Add proposal
        driipSettlementChallengeState.addProposalFromDriip(
            wallet, stageAmount, balanceAmount.sub(stageAmount), payment.currency, payment.nonce,
            payment.blockNumber, balanceReward, payment.seals.operator.hash, NahmiiTypesLib.DriipType.Payment
        );
    }

    function _tradeIntendedBalanceAmount(TradeTypesLib.Trade trade, address wallet)
    private
    view
    returns (int256)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.buyer.balances.intended.current :
        trade.seller.balances.intended.current;
    }

    function _tradeConjugateBalanceAmount(TradeTypesLib.Trade trade, address wallet)
    private
    view
    returns (int256)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.buyer.balances.conjugate.current :
        trade.seller.balances.conjugate.current;
    }

    function _paymentBalanceAmount(PaymentTypesLib.Payment payment, address wallet)
    private
    view
    returns (int256)
    {
        return validator.isPaymentSender(payment, wallet) ?
        payment.sender.balances.current :
        payment.recipient.balances.current;
    }
}
