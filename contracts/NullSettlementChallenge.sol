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
import {DriipChallenge} from "./DriipChallenge.sol";
import {Validatable} from "./Validatable.sol";
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
contract NullSettlementChallenge is Ownable, DriipChallenge, Validatable, ClientFundable {
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
    event StartChallenge(address wallet, int256 amount, address stageCurrencyCt, uint stageCurrencyId);

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
    validatorInitialized
    {
        require(configuration != address(0));
        require(amount.isPositiveInt256());

        require(
            0 == walletProposalMap[msg.sender].nonce || block.timestamp >= walletProposalMap[msg.sender].timeout
        );

        int256 balanceAmount = clientFund.activeBalance(msg.sender, currencyCt, currencyId);
        require(balanceAmount >= amount);

        walletProposalMap[msg.sender].nonce = walletProposalMap[msg.sender].nonce.add(1);
        walletProposalMap[msg.sender].timeout = block.timestamp + configuration.settlementChallengeTimeout();
        walletProposalMap[msg.sender].status = SettlementTypes.ChallengeStatus.Qualified;
        walletProposalMap[msg.sender].currencies.length = 0;
        walletProposalMap[msg.sender].currencies.push(MonetaryTypes.Currency(currencyCt, currencyId));
        walletProposalMap[msg.sender].stageAmounts.length = 0;
        walletProposalMap[msg.sender].stageAmounts.push(amount);
        walletProposalMap[msg.sender].targetBalanceAmounts.length = 0;
        walletProposalMap[msg.sender].targetBalanceAmounts.push(balanceAmount - amount);

        emit StartChallenge(msg.sender, amount, currencyCt, currencyId);
    }

    /// @notice Get null settlement challenge phase of given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge phase and nonce
    function challengePhase(address wallet) public view returns (NahmiiTypes.ChallengePhase, uint) {
        if (msg.sender != deployer)
            wallet = msg.sender;
        if (0 == walletProposalMap[wallet].nonce)
            return (NahmiiTypes.ChallengePhase.Closed, 0);
        else if (block.timestamp < walletProposalMap[wallet].timeout)
            return (NahmiiTypes.ChallengePhase.Dispute, walletProposalMap[wallet].nonce);
        else
            return (NahmiiTypes.ChallengePhase.Closed, walletProposalMap[wallet].nonce);
    }

    /// @notice Get the challenge nonce of the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge nonce
    function challengeNonce(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].nonce;
    }

    /// @notice Get the challenge status of the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge status
    function challengeStatus(address wallet)
    public
    view
    returns (SettlementTypes.ChallengeStatus)
    {
        return walletProposalMap[wallet].status;
    }

    /// @notice Get the challenge currency count of the given wallet
    /// @param wallet The concerned wallet
    /// @return The challenge currency count
    function challengeCurrencyCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletProposalMap[wallet].currencies.length;
    }

    /// @notice Get the challenge currency of the given wallet at the given index
    /// @param wallet The concerned wallet
    /// @param index The index of the concerned currency
    /// @return The challenge currency
    function challengeCurrency(address wallet, uint256 index)
    public
    view
    returns (MonetaryTypes.Currency)
    {
        return walletProposalMap[wallet].currencies[index];
    }

    /// @notice Get the challenge stage amount of the given wallet and currency
    /// @param wallet The concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The challenge stage amount
    function challengeStageAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        for (uint256 i = 0; i < walletProposalMap[wallet].currencies.length; i++) {
            if (
                walletProposalMap[wallet].currencies[i].ct == currencyCt &&
                walletProposalMap[wallet].currencies[i].id == currencyId
            )
                return walletProposalMap[wallet].stageAmounts[i];
        }
        return 0;
    }

    /// @notice Get the challenge target balance amount of the given wallet and currency
    /// @param wallet The concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The challenge target balance amount
    function challengeTargetBalanceAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        for (uint256 i = 0; i < walletProposalMap[wallet].currencies.length; i++) {
            if (
                walletProposalMap[wallet].currencies[i].ct == currencyCt &&
                walletProposalMap[wallet].currencies[i].id == currencyId
            )
                return walletProposalMap[wallet].targetBalanceAmounts[i];
        }
        return 0;
    }

    /// @notice Get the challenger of the given wallet's challenge
    /// @param wallet The concerned wallet
    /// @return The challenger of the challenge
    function challengeChallenger(address wallet)
    public
    view
    returns (address)
    {
        return walletProposalMap[wallet].challenger;
    }

    /// @notice Challenge the null settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    function challengeByOrder(NahmiiTypes.Order order)
    public
    onlyOperationalModeNormal
    {
        nullSettlementDispute.challengeByOrder(order, msg.sender);
    }

    /// @notice Unchallenge null settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    function unchallengeOrderCandidateByTrade(NahmiiTypes.Order order, NahmiiTypes.Trade trade)
    public
    onlyOperationalModeNormal
    {
        nullSettlementDispute.unchallengeOrderCandidateByTrade(order, trade, msg.sender);
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

    /// @notice Get the settlement proposal of the given wallet
    /// @param wallet The concerned wallet
    /// @return The settlement proposal of the wallet
    function walletProposal(address wallet)
    public
    view
    returns (SettlementTypes.Proposal)
    {
        return walletProposalMap[wallet];
    }

    /// @notice Set the settlement proposal of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    /// @param proposal The settlement proposal to be set
    function setWalletProposal(address wallet, SettlementTypes.Proposal proposal)
    public
    onlyNullSettlementDispute
    {
        walletProposalMap[wallet].nonce = proposal.nonce;
        walletProposalMap[wallet].timeout = proposal.timeout;
        walletProposalMap[wallet].status = proposal.status;
        walletProposalMap[wallet].currencies.length = 0;
        walletProposalMap[wallet].stageAmounts.length = 0;
        walletProposalMap[wallet].targetBalanceAmounts.length = 0;
        for (uint i = 0; i < proposal.currencies.length; i++) {
            walletProposalMap[wallet].currencies.push(proposal.currencies[i]);
            walletProposalMap[wallet].stageAmounts.push(proposal.stageAmounts[i]);
            walletProposalMap[wallet].targetBalanceAmounts.push(proposal.targetBalanceAmounts[i]);
        }
        walletProposalMap[wallet].driipType = proposal.driipType;
        walletProposalMap[wallet].driipIndex = proposal.driipIndex;
        walletProposalMap[wallet].candidateType = proposal.candidateType;
        walletProposalMap[wallet].candidateIndex = proposal.candidateIndex;
        walletProposalMap[wallet].challenger = proposal.challenger;
    }

    /// @notice Reset the settlement proposal of the given wallet
    /// @dev This function can only be called by this contract's dispute instance
    /// @param wallet The concerned wallet
    function resetWalletProposal(address wallet)
    public
    onlyNullSettlementDispute
    {
        walletProposalMap[wallet].status = SettlementTypes.ChallengeStatus.Qualified;
        walletProposalMap[wallet].candidateType = SettlementTypes.ChallengeCandidateType.None;
        walletProposalMap[wallet].candidateIndex = 0;
        walletProposalMap[wallet].challenger = address(0);
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

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyNullSettlementDispute() {
        require(msg.sender == address(nullSettlementDispute));
        _;
    }
}
