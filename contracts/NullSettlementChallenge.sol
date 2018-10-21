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
import {ClientFundable} from "./ClientFundable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {NullSettlementDispute} from "./NullSettlementDispute.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";
import {SettlementTypes} from "./SettlementTypes.sol";

/**
@title NullSettlementChallenge
@notice Where null settlements are challenged
*/
contract NullSettlementChallenge is Ownable, Challenge, DriipStorable, ClientFundable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementDispute public nullSettlementDispute;

    mapping(address => SettlementTypes.Proposal) public walletProposalMap;

    mapping(address => NahmiiTypes.Trade[]) public walletChallengedTradesMap;
    mapping(address => NahmiiTypes.Payment[]) public walletChallengedPaymentsMap;

    NahmiiTypes.Order[] public challengeCandidateOrders;
    NahmiiTypes.Trade[] public challengeCandidateTrades;
    NahmiiTypes.Payment[] public challengeCandidatePayments;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeNullSettlementDisputeEvent(NullSettlementDispute oldNullSettlementDispute, NullSettlementDispute newNullSettlementDispute);
    event StartChallengeEvent(address wallet, int256 amount, address stageCurrencyCt, uint stageCurrencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the null settlement dispute contract
    /// @param newNullSettlementDispute The (address of) NullSettlementDispute contract instance
    function changeNullSettlementDispute(NullSettlementDispute newNullSettlementDispute)
    public
    onlyDeployer
    notNullAddress(newNullSettlementDispute)
    {
        NullSettlementDispute oldNullSettlementDispute = nullSettlementDispute;
        nullSettlementDispute = newNullSettlementDispute;
        emit ChangeNullSettlementDisputeEvent(oldNullSettlementDispute, nullSettlementDispute);
    }

    /// @notice Get the number of current and past null settlement challenges for given wallet
    /// @param wallet The wallet for which to return count
    /// @return The count of null settlement challenges
    function walletChallengeCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].nonce;
    }

    /// @notice Start null settlement challenge
    /// @param amount The concerned amount to stage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function startChallenge(int256 amount, address currencyCt, uint256 currencyId)
    public
    configurationInitialized
    {
        require(amount.isPositiveInt256());

        require(
            0 == walletProposalMap[msg.sender].nonce || block.timestamp >= walletProposalMap[msg.sender].timeout
        );

        uint256 activeAccumulationsCount = clientFund.activeAccumulationsCount(msg.sender, currencyCt, currencyId);
        require(activeAccumulationsCount > 0);

        (int256 activeBalanceAmount, uint256 activeAccumulationBlockNumber) = clientFund.activeAccumulation(
            msg.sender, currencyCt, currencyId, activeAccumulationsCount.sub(1)
        );
        require(activeBalanceAmount >= amount);

        walletProposalMap[msg.sender].nonce = walletProposalMap[msg.sender].nonce.add(1);
        walletProposalMap[msg.sender].blockNumber = activeAccumulationBlockNumber;
        walletProposalMap[msg.sender].timeout = block.timestamp.add(configuration.settlementChallengeTimeout());
        walletProposalMap[msg.sender].status = SettlementTypes.ChallengeStatus.Qualified;
        walletProposalMap[msg.sender].currencies.length = 0;
        walletProposalMap[msg.sender].currencies.push(MonetaryTypes.Currency(currencyCt, currencyId));
        walletProposalMap[msg.sender].stageAmounts.length = 0;
        walletProposalMap[msg.sender].stageAmounts.push(amount);
        walletProposalMap[msg.sender].targetBalanceAmounts.length = 0;
        walletProposalMap[msg.sender].targetBalanceAmounts.push(activeBalanceAmount.sub(amount));

        emit StartChallengeEvent(msg.sender, amount, currencyCt, currencyId);
    }

    /// @notice Get null settlement challenge phase of the given wallet
    /// @param wallet The concerned wallet
    /// @return The settlement challenge phase
    function challengePhase(address wallet)
    public
    view
    returns (NahmiiTypes.ChallengePhase) {
        if (msg.sender != deployer)
            wallet = msg.sender;
        if (0 < walletProposalMap[wallet].nonce && block.timestamp < walletProposalMap[wallet].timeout)
            return NahmiiTypes.ChallengePhase.Dispute;
        else
            return NahmiiTypes.ChallengePhase.Closed;
    }

    /// @notice Get the settlement proposal nonce of the given wallet
    /// @param wallet The concerned wallet
    /// @return The settlement proposal nonce
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

    /// @notice Get the settlement proposal status of the given wallet
    /// @param wallet The concerned wallet
    /// @return The settlement proposal status
    function proposalStatus(address wallet)
    public
    view
    returns (SettlementTypes.ChallengeStatus)
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
    returns (MonetaryTypes.Currency)
    {
        require(index < walletProposalMap[wallet].currencies.length);
        return walletProposalMap[wallet].currencies[index];
    }

    /// @notice Get the settlement proposal stage amount of the given wallet and currency
    /// @param wallet The concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal stage amount
    function proposalStageAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        uint256 index = proposalCurrencyIndex(wallet, currencyCt, currencyId);
        return walletProposalMap[wallet].stageAmounts[index];
    }

    /// @notice Get the settlement proposal target balance amount of the given wallet and currency
    /// @param wallet The concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settlement proposal target balance amount
    function proposalTargetBalanceAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        uint256 index = proposalCurrencyIndex(wallet, currencyCt, currencyId);
        return walletProposalMap[wallet].targetBalanceAmounts[index];
    }

    /// @notice Get the candidate type of the given wallet's settlement proposal
    /// @param wallet The concerned wallet
    /// @return The candidate type of the settlement proposal
    function proposalCandidateType(address wallet)
    public
    view
    returns (SettlementTypes.ChallengeCandidateType)
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
    /// @param status The status value
    function setProposalStatus(address wallet, SettlementTypes.ChallengeStatus status)
    public
    onlyNullSettlementDispute
    {
        walletProposalMap[wallet].status = status;
    }

    /// @notice Set settlement proposal candidate type property of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param candidateType The candidate type value
    function setProposalCandidateType(address wallet, SettlementTypes.ChallengeCandidateType candidateType)
    public
    onlyNullSettlementDispute
    {
        walletProposalMap[wallet].candidateType = candidateType;
    }

    /// @notice Set settlement proposal candidate index property of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param candidateIndex The candidate index value
    function setProposalCandidateIndex(address wallet, uint256 candidateIndex)
    public
    onlyNullSettlementDispute
    {
        walletProposalMap[wallet].candidateIndex = candidateIndex;
    }

    /// @notice Set settlement proposal challenger property of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param challenger The challenger value
    function setProposalChallenger(address wallet, address challenger)
    public
    onlyNullSettlementDispute
    {
        walletProposalMap[wallet].challenger = challenger;
    }

    /// @notice Challenge the null settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    function challengeByOrder(NahmiiTypes.Order order)
    public
    onlyOperationalModeNormal
    {
        nullSettlementDispute.challengeByOrder(order, msg.sender);
    }

    /// @notice Challenge the null settlement by providing trade candidate
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param wallet The wallet whose null settlement is being challenged
    function challengeByTrade(NahmiiTypes.Trade trade, address wallet)
    public
    onlyOperationalModeNormal
    {
        nullSettlementDispute.challengeByTrade(trade, wallet, msg.sender);
    }

    /// @notice Challenge the null settlement by providing payment candidate
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param wallet The wallet whose null settlement is being challenged
    function challengeByPayment(NahmiiTypes.Payment payment, address wallet)
    public
    onlyOperationalModeNormal
    {
        nullSettlementDispute.challengeByPayment(payment, wallet, msg.sender);
    }

    /// @notice Push to store the given challenge candidate order
    /// @dev This function can only be called by this contract's dispute instance
    /// @param order The challenge candidate order to push
    function pushChallengeCandidateOrder(NahmiiTypes.Order order)
    public
    onlyNullSettlementDispute
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

    /// @notice Push to store the given challenge candidate trade
    /// @dev This function can only be called by this contract's dispute instance
    /// @param trade The challenge candidate trade to push
    function pushChallengeCandidateTrade(NahmiiTypes.Trade trade)
    public
    onlyNullSettlementDispute
    {
        pushMemoryTradeToStorageArray(trade, challengeCandidateTrades);
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

    /// @notice Push to store the given challenge candidate payment
    /// @dev This function can only be called by this contract's dispute instance
    /// @param payment The challenge candidate payment to push
    function pushChallengeCandidatePayment(NahmiiTypes.Payment payment)
    public
    onlyNullSettlementDispute
    {
        pushMemoryPaymentToStorageArray(payment, challengeCandidatePayments);
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

    function proposalCurrencyIndex(address wallet, address currencyCt, uint256 currencyId)
    private
    view
    returns (uint256)
    {
        for (uint256 i = 0; i < walletProposalMap[wallet].currencies.length; i++) {
            if (
                walletProposalMap[wallet].currencies[i].ct == currencyCt &&
                walletProposalMap[wallet].currencies[i].id == currencyId
            )
                return i;
        }
        require(false);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyNullSettlementDispute() {
        require(msg.sender == address(nullSettlementDispute));
        _;
    }
}
