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
import {ValidatableV2} from "./ValidatableV2.sol";
import {SecurityBondable} from "./SecurityBondable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {CancelOrdersChallengable} from "./CancelOrdersChallengable.sol";
import {Servable} from "./Servable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {BalanceTrackerLib} from "./BalanceTrackerLib.sol";

/**
 * @title NullSettlementDisputeByTrade
 * @notice The where trade related disputes of null settlement challenge happens
 */
contract NullSettlementDisputeByTrade is Ownable, Configurable, ValidatableV2, SecurityBondable, WalletLockable,
BalanceTrackable, FraudChallengable, CancelOrdersChallengable, Servable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CHALLENGE_BY_TRADE_ACTION = "challenge_by_trade";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallengeState public nullSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementChallengeStateEvent(NullSettlementChallengeState oldNullSettlementChallengeState,
        NullSettlementChallengeState newNullSettlementChallengeState);
    event ChallengeByOrderEvent(uint256 nonce, TradeTypesLib.Order order, address challenger);
    event ChallengeByTradeEvent(address wallet, uint256 nonce, TradeTypesLib.Trade trade,
        address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    /// @notice Set the settlement challenge state contract
    /// @param newNullSettlementChallengeState The (address of) NullSettlementChallengeState contract instance
    function setNullSettlementChallengeState(NullSettlementChallengeState newNullSettlementChallengeState) public
    onlyDeployer
    notNullAddress(address(newNullSettlementChallengeState))
    {
        NullSettlementChallengeState oldNullSettlementChallengeState = nullSettlementChallengeState;
        nullSettlementChallengeState = newNullSettlementChallengeState;
        emit SetNullSettlementChallengeStateEvent(oldNullSettlementChallengeState, nullSettlementChallengeState);
    }

    /// @notice Challenge the settlement by providing trade candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param trade The trade candidate that challenges
    /// @param challenger The address of the challenger
    /// @dev If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else
    /// if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade
    function challengeByTrade(address wallet, TradeTypesLib.Trade memory trade, address challenger)
    public
    onlyEnabledServiceAction(CHALLENGE_BY_TRADE_ACTION)
    onlySealedTrade(trade)
    onlyTradeParty(trade, wallet)
    {
        // Require that trade candidate is not labelled fraudulent
        require(
            !fraudChallenge.isFraudulentTradeHash(trade.seal.hash),
            "Trade deemed fraudulent [NullSettlementDisputeByTrade.sol:89]"
        );

        // Require that wallet's order in trade is not labelled fraudulent
        require(
            !fraudChallenge.isFraudulentOrderHash(_tradeOrderHash(wallet, trade)),
            "Order deemed fraudulent [NullSettlementDisputeByTrade.sol:95]"
        );

        // Require that wallet's order in trade is not labelled cancelled
        require(
            !cancelOrdersChallenge.isOrderCancelled(wallet, _tradeOrderHash(wallet, trade)),
            "Order deemed cancelled [NullSettlementDisputeByTrade.sol:101]"
        );

        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _tradeCurrency(wallet, trade);

        // Require that proposal has been initiated
        require(
            nullSettlementChallengeState.hasProposal(wallet, currency),
            "No proposal found [NullSettlementDisputeByTrade.sol:110]"
        );

        // Require that proposal has not expired
        require(
            !nullSettlementChallengeState.hasProposalExpired(wallet, currency),
            "Proposal found expired [NullSettlementDisputeByTrade.sol:116]"
        );

        // Get the relevant nonce
        uint256 nonce = _tradeNonce(wallet, trade);

        // Require that trade party's nonce is strictly greater than proposal's nonce and its current
        // disqualification nonce
        require(
            nonce > nullSettlementChallengeState.proposalNonce(wallet, currency),
            "Trade nonce not strictly greater than proposal nonce [NullSettlementDisputeByTrade.sol:126]"
        );
        require(
            nonce > nullSettlementChallengeState.proposalDisqualificationNonce(wallet, currency),
            "Trade nonce not strictly greater than proposal disqualification nonce [NullSettlementDisputeByTrade.sol:130]"
        );

        // Require overrun for this trade to be a valid challenge candidate
        require(_tradeOverrun(wallet, trade, currency), "No trade overrun found [NullSettlementDisputeByTrade.sol:136]");

        // Reward challenger
        _settleRewards(wallet, _tradeCurrentBalanceAmount(wallet, trade), currency, challenger);

        // Disqualify proposal, effectively overriding any previous disqualification
        nullSettlementChallengeState.disqualifyProposal(
            wallet, currency, challenger, trade.blockNumber,
            nonce, trade.seal.hash, TradeTypesLib.TRADE_KIND()
        );

        // Emit event
        emit ChallengeByTradeEvent(
            wallet, nullSettlementChallengeState.proposalNonce(wallet, currency), trade, challenger
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _tradeOverrun(address wallet, TradeTypesLib.Trade memory trade, MonetaryTypesLib.Currency memory currency)
    private
    view
    returns (bool)
    {
        // Get the target balance amount from the proposal
        int targetBalanceAmount = nullSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, currency
        );

        // Get the change in active balance since the start of the challenge
        int256 deltaBalanceSinceStart = balanceTracker.fungibleActiveBalanceAmount(
            wallet, currency
        ).sub(
            balanceTracker.fungibleActiveBalanceAmountByBlockNumber(
                wallet, currency,
                nullSettlementChallengeState.proposalReferenceBlockNumber(wallet, currency)
            )
        );

        // Get the cumulative transfer of the trade
        int256 cumulativeTransfer = _tradeCurrentBalanceAmount(wallet, trade).sub(
            balanceTracker.fungibleActiveBalanceAmountByBlockNumber(wallet, currency, trade.blockNumber)
        );

        return targetBalanceAmount.add(deltaBalanceSinceStart) < cumulativeTransfer.mul(- 1);
    }

    function _tradeOrderHash(address wallet, TradeTypesLib.Trade memory trade)
    private
    view
    returns (bytes32)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.buyer.order.hashes.operator :
        trade.seller.order.hashes.operator;
    }

    // Get the candidate trade currency
    // Wallet is buyer in (candidate) trade -> Conjugate currency
    // Wallet is seller in (candidate) trade -> Intended currency
    function _tradeCurrency(address wallet, TradeTypesLib.Trade memory trade)
    private
    view
    returns (MonetaryTypesLib.Currency memory)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.currencies.conjugate :
        trade.currencies.intended;
    }

    // Get the candidate trade nonce
    // Wallet is buyer in (candidate) trade -> Buyer's nonce
    // Wallet is seller in (candidate) trade -> Seller's nonce
    function _tradeNonce(address wallet, TradeTypesLib.Trade memory trade)
    private
    view
    returns (uint256)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.buyer.nonce :
        trade.seller.nonce;
    }

    // Get the candidate trade current balance amount
    // Wallet is buyer in (candidate) trade -> Buyer's conjugate balance
    // Wallet is seller in (candidate) trade -> Seller's intended balance
    function _tradeCurrentBalanceAmount(address wallet, TradeTypesLib.Trade memory trade)
    private
    view
    returns (int256)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.buyer.balances.conjugate.current :
        trade.seller.balances.intended.current;
    }

    function _settleRewards(address wallet, int256 walletAmount, MonetaryTypesLib.Currency memory currency,
        address challenger)
    private
    {
        if (nullSettlementChallengeState.proposalWalletInitiated(wallet, currency))
            _settleBalanceReward(wallet, walletAmount, currency, challenger);

        else
            _settleSecurityBondReward(wallet, walletAmount, currency, challenger);
    }

    function _settleBalanceReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency memory currency,
        address challenger)
    private
    {
        // Unlock wallet/currency for existing challenger if previously locked
        if (SettlementChallengeTypesLib.Status.Disqualified == nullSettlementChallengeState.proposalStatus(
            wallet, currency
        ))
            walletLocker.unlockFungibleByProxy(
                wallet,
                nullSettlementChallengeState.proposalDisqualificationChallenger(
                    wallet, currency
                ),
                currency.ct, currency.id
            );

        // Lock wallet for new challenger
        walletLocker.lockFungibleByProxy(
            wallet, challenger, walletAmount, currency.ct, currency.id, configuration.settlementChallengeTimeout()
        );
    }

    // Settle the two-component reward from security bond.
    // The first component is flat figure as obtained from Configuration
    // The second component is progressive and calculated as
    //    min(walletAmount, fraction of SecurityBond's deposited balance)
    // both amounts for the given currency
    function _settleSecurityBondReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency memory currency,
        address challenger)
    private
    {
        // Deprive existing challenger of reward if previously locked
        if (SettlementChallengeTypesLib.Status.Disqualified == nullSettlementChallengeState.proposalStatus(
            wallet, currency
        ))
            securityBond.depriveAbsolute(
                nullSettlementChallengeState.proposalDisqualificationChallenger(
                    wallet, currency
                ),
                currency.ct, currency.id
            );

        // Reward the flat component
        MonetaryTypesLib.Figure memory flatReward = _flatReward();
        securityBond.rewardAbsolute(
            challenger, flatReward.amount, flatReward.currency.ct, flatReward.currency.id, 0
        );

        // Reward the progressive component
        int256 progressiveRewardAmount = walletAmount.clampMax(
            securityBond.depositedFractionalBalance(
                currency.ct, currency.id, configuration.operatorSettlementStakeFraction()
            )
        );
        securityBond.rewardAbsolute(
            challenger, progressiveRewardAmount, currency.ct, currency.id, 0
        );
    }

    function _flatReward()
    private
    view
    returns (MonetaryTypesLib.Figure memory)
    {
        (int256 amount, address currencyCt, uint256 currencyId) = configuration.operatorSettlementStake();
        return MonetaryTypesLib.Figure(amount, MonetaryTypesLib.Currency(currencyCt, currencyId));
    }
}