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
import {Challenge} from "./Challenge.sol";
import {DriipStorable} from "./DriipStorable.sol";
import {Validatable} from "./Validatable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {DriipSettlementDispute} from "./DriipSettlementDispute.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";

/**
@title DriipSettlementChallenge
@notice Where driip settlements are started and challenged
*/
contract DriipSettlementChallenge is Ownable, Challenge, DriipStorable, Validatable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementDispute public driipSettlementDispute;

    mapping(address => SettlementTypesLib.Proposal) public walletProposalMap;

    mapping(address => NahmiiTypesLib.Trade[]) public walletChallengedTradesMap;
    mapping(address => NahmiiTypesLib.Payment[]) public walletChallengedPaymentsMap;

    NahmiiTypesLib.Order[] public challengeCandidateOrders;
    NahmiiTypesLib.Trade[] public challengeCandidateTrades;
    NahmiiTypesLib.Payment[] public challengeCandidatePayments;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeDriipSettlementDisputeEvent(DriipSettlementDispute oldDriipSettlementDispute,
        DriipSettlementDispute newDriipSettlementDispute);
    event StartChallengeFromTradeEvent(address wallet, NahmiiTypesLib.Trade trade, int256 intendedStageAmount,
        int256 conjugateStageAmount);
    event StartChallengeFromTradeByProxyEvent(address proxy, address wallet, NahmiiTypesLib.Trade trade,
        int256 intendedStageAmount, int256 conjugateStageAmount);
    event StartChallengeFromPaymentEvent(address wallet, NahmiiTypesLib.Payment payment,
        int256 stageAmount);
    event StartChallengeFromPaymentByProxyEvent(address proxy, address wallet, NahmiiTypesLib.Payment payment,
        int256 stageAmount);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the settlement dispute contract
    /// @param newDriipSettlementDispute The (address of) DriipSettlementDispute contract instance
    function changeDriipSettlementDispute(DriipSettlementDispute newDriipSettlementDispute)
    public
    onlyDeployer
    notNullAddress(newDriipSettlementDispute)
    {
        DriipSettlementDispute oldDriipSettlementDispute = driipSettlementDispute;
        driipSettlementDispute = newDriipSettlementDispute;
        emit ChangeDriipSettlementDisputeEvent(oldDriipSettlementDispute, driipSettlementDispute);
    }

    /// @notice Get the number of current and past settlement challenges from trade for given wallet
    /// @param wallet The wallet for which to return count
    /// @return The count of settlement challenges from trade
    function walletChallengedTradesCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletChallengedTradesMap[wallet].length;
    }

    /// @notice Get the number of current and past settlement challenges from payment for given wallet
    /// @param wallet The wallet for which to return count
    /// @return The count of settlement challenges from payment
    function walletChallengedPaymentsCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletChallengedPaymentsMap[wallet].length;
    }

    /// @notice Start settlement challenge on trade
    /// @param trade The challenged trade
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTrade(NahmiiTypesLib.Trade trade, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    public
    {
        // Start challenge
        startChallengeFromTradePrivate(msg.sender, trade, intendedStageAmount, conjugateStageAmount);

        // Emit event
        emit StartChallengeFromTradeEvent(msg.sender, trade, intendedStageAmount, conjugateStageAmount);
    }

    /// @notice Start settlement challenge on trade by proxy
    /// @param wallet The concerned party
    /// @param trade The challenged trade
    /// @param intendedStageAmount Amount of intended currency to be staged
    /// @param conjugateStageAmount Amount of conjugate currency to be staged
    function startChallengeFromTradeByProxy(address wallet, NahmiiTypesLib.Trade trade, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    public
    {
        // Start challenge for wallet
        startChallengeFromTradePrivate(wallet, trade, intendedStageAmount, conjugateStageAmount);

        // Emit event
        emit StartChallengeFromTradeByProxyEvent(msg.sender, wallet, trade, intendedStageAmount, conjugateStageAmount);
    }

    /// @notice Start settlement challenge on payment
    /// @param payment The challenged payment
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPayment(NahmiiTypesLib.Payment payment, int256 stageAmount)
    public
    {
        // Start challenge for wallet
        startChallengeFromPaymentPrivate(msg.sender, payment, stageAmount);

        // Emit event
        emit StartChallengeFromPaymentEvent(msg.sender, payment, stageAmount);
    }

    /// @notice Start settlement challenge on payment
    /// @param wallet The concerned party
    /// @param payment The challenged payment
    /// @param stageAmount Amount of payment currency to be staged
    function startChallengeFromPaymentByProxy(address wallet, NahmiiTypesLib.Payment payment, int256 stageAmount)
    public
    {
        // Start challenge for wallet
        startChallengeFromPaymentPrivate(wallet, payment, stageAmount);

        // Emit event
        emit StartChallengeFromPaymentByProxyEvent(msg.sender, wallet, payment, stageAmount);
    }

    /// @notice Get settlement challenge phase of given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge phase and nonce
    function challengePhase(address wallet)
    public
    view
    returns (NahmiiTypesLib.ChallengePhase)
    {
        if (0 < walletProposalMap[wallet].nonce && block.timestamp < walletProposalMap[wallet].timeout)
            return NahmiiTypesLib.ChallengePhase.Dispute;
        else
            return NahmiiTypesLib.ChallengePhase.Closed;
    }

    /// @notice Get the challenge nonce of the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge nonce
    function proposalNonce(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].nonce;
    }

    /// @notice Get the settlement proposal block number of the given wallet
    /// @param wallet The concerned wallet
    /// @return The settlement proposal block number
    function proposalBlockNumber(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].blockNumber;
    }

    /// @notice Get the settlement proposal timeout of the given wallet
    /// @param wallet The concerned wallet
    /// @return The settlement proposal timeout
    function proposalTimeout(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].timeout;
    }

    /// @notice Get the challenge status of the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge status
    function proposalStatus(address wallet)
    public
    view
    returns (SettlementTypesLib.ProposalStatus)
    {
        return walletProposalMap[wallet].status;
    }

    /// @notice Get the settlement proposal currency count of the given wallet
    /// @param wallet The concerned wallet
    /// @return The settlement proposal currency count
    function proposalCurrencyCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].currencies.length;
    }

    /// @notice Get the settlement proposal currency of the given wallet at the given index
    /// @param wallet The concerned wallet
    /// @param index The index of the concerned currency
    /// @return The settlement proposal currency
    function proposalCurrency(address wallet, uint256 index)
    public
    view
    returns (MonetaryTypesLib.Currency)
    {
        require(index < walletProposalMap[wallet].currencies.length);
        return walletProposalMap[wallet].currencies[index];
    }

    /// @notice Get the settlement proposal stage amount of the given wallet and currency
    /// @param wallet The concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal stage amount
    function proposalStageAmount(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalCurrencyIndex(wallet, currency);
        return walletProposalMap[wallet].stageAmounts[index];
    }

    /// @notice Get the settlement proposal target balance amount of the given wallet and currency
    /// @param wallet The concerned wallet
    /// @param currency The concerned currency
    /// @return The settlement proposal target balance amount
    function proposalTargetBalanceAmount(address wallet, MonetaryTypesLib.Currency currency)
    public
    view
    returns (int256)
    {
        uint256 index = proposalCurrencyIndex(wallet, currency);
        return walletProposalMap[wallet].targetBalanceAmounts[index];
    }

    /// @notice Get the driip type of the given wallet's settlement proposal
    /// @param wallet The concerned wallet
    /// @return The driip type of the settlement proposal
    function proposalDriipType(address wallet)
    public
    view
    returns (NahmiiTypesLib.DriipType)
    {
        return walletProposalMap[wallet].driipType;
    }

    /// @notice Get the driip index of the given wallet's settlement proposal
    /// @param wallet The concerned wallet
    /// @return The driip index of the settlement proposal
    function proposalDriipIndex(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].driipIndex;
    }

    /// @notice Get the candidate type of the given wallet's settlement proposal
    /// @param wallet The concerned wallet
    /// @return The candidate type of the settlement proposal
    function proposalCandidateType(address wallet)
    public
    view
    returns (SettlementTypesLib.CandidateType)
    {
        return walletProposalMap[wallet].candidateType;
    }

    /// @notice Get the candidate index of the given wallet's settlement proposal
    /// @param wallet The concerned wallet
    /// @return The candidate index of the settlement proposal
    function proposalCandidateIndex(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].candidateIndex;
    }

    /// @notice Get the challenger of the given wallet's settlement proposal
    /// @param wallet The concerned wallet
    /// @return The challenger of the settlement proposal
    function proposalChallenger(address wallet)
    public
    view
    returns (address)
    {
        return walletProposalMap[wallet].challenger;
    }

    /// @notice Set settlement proposal status property of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param timeout The timeout value
    function setProposalTimeout(address wallet, uint256 timeout)
    public
    onlyDriipSettlementDispute
    {
        walletProposalMap[wallet].timeout = timeout;
    }

    /// @notice Set settlement proposal status property of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param status The status value
    function setProposalStatus(address wallet, SettlementTypesLib.ProposalStatus status)
    public
    onlyDriipSettlementDispute
    {
        walletProposalMap[wallet].status = status;
    }

    /// @notice Set settlement proposal candidate type property of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param candidateType The candidate type value
    function setProposalCandidateType(address wallet, SettlementTypesLib.CandidateType candidateType)
    public
    onlyDriipSettlementDispute
    {
        walletProposalMap[wallet].candidateType = candidateType;
    }

    /// @notice Set settlement proposal candidate index property of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param candidateIndex The candidate index value
    function setProposalCandidateIndex(address wallet, uint256 candidateIndex)
    public
    onlyDriipSettlementDispute
    {
        walletProposalMap[wallet].candidateIndex = candidateIndex;
    }

    /// @notice Set settlement proposal challenger property of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param challenger The challenger value
    function setProposalChallenger(address wallet, address challenger)
    public
    onlyDriipSettlementDispute
    {
        walletProposalMap[wallet].challenger = challenger;
    }

    /// @notice Challenge the settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    function challengeByOrder(NahmiiTypesLib.Order order)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByOrder(order, msg.sender);
    }

    /// @notice Unchallenge settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(NahmiiTypesLib.Order order, NahmiiTypesLib.Trade trade)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.unchallengeOrderCandidateByTrade(order, trade, msg.sender);
    }

    /// @notice Challenge the settlement by providing trade candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param trade The trade candidate that challenges the challenged driip
    function challengeByTrade(address wallet, NahmiiTypesLib.Trade trade)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByTrade(wallet, trade, msg.sender);
    }

    /// @notice Challenge the settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged driip
    function challengeByPayment(NahmiiTypesLib.Payment payment)
    public
    onlyOperationalModeNormal
    {
        driipSettlementDispute.challengeByPayment(payment, msg.sender);
    }

    /// @notice Push to store the given challenge candidate order
    /// @dev This function can only be called by this contract's dispute instance
    /// @param order The challenge candidate order to push
    function pushChallengeCandidateOrder(NahmiiTypesLib.Order order)
    public
    onlyDriipSettlementDispute
    {
        challengeCandidateOrders.push(order);
    }

    /// @notice Get the count of challenge candidate orders
    /// @return The count of challenge candidate orders
    function challengeCandidateOrdersCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidateOrders.length;
    }

    /// @notice Get the challenge candidate order at the given index
    /// @param index The index of challenge order candidate
    /// @return The challenge candidate order
    function challengeCandidateOrder(uint256 index)
    public
    view
    returns (NahmiiTypesLib.Order)
    {
        return challengeCandidateOrders[index];
    }

    /// @notice Get the count of challenge candidate trades
    /// @return The count of challenge candidate trades
    function challengeCandidateTradesCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidateTrades.length;
    }

    /// @notice Push to store the given challenge candidate trade
    /// @dev This function can only be called by this contract's dispute instance
    /// @param trade The challenge candidate trade to push
    function pushChallengeCandidateTrade(NahmiiTypesLib.Trade trade)
    public
    onlyDriipSettlementDispute
    {
        pushMemoryTradeToStorageArray(trade, challengeCandidateTrades);
    }

    /// @notice Get the count of challenge candidate payments
    /// @return The count of challenge candidate payments
    function challengeCandidatePaymentsCount()
    public
    view
    returns (uint256)
    {
        return challengeCandidatePayments.length;
    }

    /// @notice Push to store the given challenge candidate payment
    /// @dev This function can only be called by this contract's dispute instance
    /// @param payment The challenge candidate payment to push
    function pushChallengeCandidatePayment(NahmiiTypesLib.Payment payment)
    public
    onlyDriipSettlementDispute
    {
        pushMemoryPaymentToStorageArray(payment, challengeCandidatePayments);
    }

    function startChallengeFromTradePrivate(address wallet, NahmiiTypesLib.Trade trade, int256 intendedStageAmount,
        int256 conjugateStageAmount)
    private
    validatorInitialized
    configurationInitialized
    onlySealedTrade(trade)
    {
        require(intendedStageAmount.isPositiveInt256());
        require(conjugateStageAmount.isPositiveInt256());

        require(validator.isTradeParty(trade, wallet));

        // Require that wallet has no overlap with ongoing challenge
        require(NahmiiTypesLib.ChallengePhase.Closed == challengePhase(wallet));

        (int256 intendedBalanceAmount, int256 conjugateBalanceAmount) =
        (validator.isTradeBuyer(trade, wallet) ?
        (trade.buyer.balances.intended.current, trade.buyer.balances.conjugate.current) :
        (trade.seller.balances.intended.current, trade.seller.balances.conjugate.current));

        require(intendedBalanceAmount >= intendedStageAmount);
        require(conjugateBalanceAmount >= conjugateStageAmount);

        pushMemoryTradeToStorageArray(trade, walletChallengedTradesMap[wallet]);

        walletProposalMap[wallet].nonce = trade.nonce;
        walletProposalMap[wallet].blockNumber = trade.blockNumber;
        walletProposalMap[wallet].timeout = block.timestamp.add(configuration.settlementChallengeTimeout());
        walletProposalMap[wallet].status = SettlementTypesLib.ProposalStatus.Qualified;
        walletProposalMap[wallet].currencies.length = 0;
        walletProposalMap[wallet].currencies.push(trade.currencies.intended);
        walletProposalMap[wallet].currencies.push(trade.currencies.conjugate);
        walletProposalMap[wallet].stageAmounts.length = 0;
        walletProposalMap[wallet].stageAmounts.push(intendedStageAmount);
        walletProposalMap[wallet].stageAmounts.push(conjugateStageAmount);
        walletProposalMap[wallet].targetBalanceAmounts.length = 0;
        walletProposalMap[wallet].targetBalanceAmounts.push(intendedBalanceAmount.sub(intendedStageAmount));
        walletProposalMap[wallet].targetBalanceAmounts.push(conjugateBalanceAmount.sub(conjugateStageAmount));
        //        walletProposalMap[wallet].driipOperatorHash = trade.seal.hash;
        walletProposalMap[wallet].driipType = NahmiiTypesLib.DriipType.Trade;
        walletProposalMap[wallet].driipIndex = walletChallengedTradesMap[wallet].length.sub(1);
    }

    function startChallengeFromPaymentPrivate(address wallet, NahmiiTypesLib.Payment payment, int256 stageAmount)
    private
    validatorInitialized
    configurationInitialized
    onlySealedPayment(payment)
    {
        require(stageAmount.isPositiveInt256());

        require(validator.isPaymentParty(payment, wallet));

        // Require that wallet has no overlap with ongoing challenge
        require(NahmiiTypesLib.ChallengePhase.Closed == challengePhase(wallet));

        int256 balanceAmount = (validator.isPaymentSender(payment, wallet) ?
        payment.sender.balances.current :
        payment.recipient.balances.current);

        require(balanceAmount >= stageAmount);

        pushMemoryPaymentToStorageArray(payment, walletChallengedPaymentsMap[wallet]);

        walletProposalMap[wallet].nonce = payment.nonce;
        walletProposalMap[wallet].blockNumber = payment.blockNumber;
        walletProposalMap[wallet].timeout = block.timestamp.add(configuration.settlementChallengeTimeout());
        walletProposalMap[wallet].status = SettlementTypesLib.ProposalStatus.Qualified;
        walletProposalMap[wallet].currencies.length = 0;
        walletProposalMap[wallet].currencies.push(payment.currency);
        walletProposalMap[wallet].stageAmounts.length = 0;
        walletProposalMap[wallet].stageAmounts.push(stageAmount);
        walletProposalMap[wallet].targetBalanceAmounts.length = 0;
        walletProposalMap[wallet].targetBalanceAmounts.push(balanceAmount.sub(stageAmount));
        //        walletProposalMap[wallet].driipOperatorHash = payment.seals.exchange.hash;
        walletProposalMap[wallet].driipType = NahmiiTypesLib.DriipType.Payment;
        walletProposalMap[wallet].driipIndex = walletChallengedPaymentsMap[wallet].length.sub(1);
    }

    function proposalCurrencyIndex(address wallet, MonetaryTypesLib.Currency currency)
    private
    view
    returns (uint256)
    {
        for (uint256 i = 0; i < walletProposalMap[wallet].currencies.length; i++) {
            if (
                walletProposalMap[wallet].currencies[i].ct == currency.ct &&
                walletProposalMap[wallet].currencies[i].id == currency.id
            )
                return i;
        }
        require(false);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyDriipSettlementDispute() {
        require(msg.sender == address(driipSettlementDispute));
        _;
    }
}
