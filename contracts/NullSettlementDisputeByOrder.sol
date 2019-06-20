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
 * @title NullSettlementDisputeByOrder
 * @notice The where order related disputes of null settlement challenge happens
 */
contract NullSettlementDisputeByOrder is Ownable, Configurable, ValidatableV2, SecurityBondable, WalletLockable,
BalanceTrackable, FraudChallengable, CancelOrdersChallengable, Servable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceTrackerLib for BalanceTracker;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CHALLENGE_BY_ORDER_ACTION = "challenge_by_order";

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

    /// @notice Challenge the settlement by providing order candidate
    /// @param order The order candidate that challenges
    /// @param challenger The address of the challenger
    /// @dev If (candidate) order has buy intention consider _conjugate_ currency and amount, else
    /// if (candidate) order has sell intention consider _intended_ currency and amount
    function challengeByOrder(TradeTypesLib.Order memory order, address challenger)
    public
    onlyEnabledServiceAction(CHALLENGE_BY_ORDER_ACTION)
    onlySealedOrder(order)
    {
        // Require that candidate order is not labelled fraudulent
        require(
            !fraudChallenge.isFraudulentOrderHash(order.seals.operator.hash),
            "Order deemed fraudulent [NullSettlementDisputeByOrder.sol:85]"
        );

        // Require that candidate order is not labelled cancelled
        require(
            !cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.operator.hash),
            "Order deemed cancelled [NullSettlementDisputeByOrder.sol:91]"
        );

        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _orderCurrency(order);

        // Require that proposal has been initiated
        require(
            nullSettlementChallengeState.hasProposal(order.wallet, currency),
            "No proposal found [NullSettlementDisputeByOrder.sol:100]"
        );

        // Require that proposal has not expired
        require(
            !nullSettlementChallengeState.hasProposalExpired(order.wallet, currency),
            "Proposal found expired [NullSettlementDisputeByOrder.sol:106]"
        );

        // Require that orders's nonce is strictly greater than proposal's nonce and its current
        // disqualification nonce
        require(
            order.nonce > nullSettlementChallengeState.proposalNonce(order.wallet, currency),
            "Order nonce not strictly greater than proposal nonce [NullSettlementDisputeByOrder.sol:113]"
        );
        require(
            order.nonce > nullSettlementChallengeState.proposalDisqualificationNonce(order.wallet, currency),
            "Order nonce not strictly greater than proposal disqualification nonce [NullSettlementDisputeByOrder.sol:117]"
        );

        // Require overrun for this trade to be a valid challenge candidate
        require(_orderOverrun(order, currency), "No order overrun found [NullSettlementDisputeByOrder.sol:123]");

        // TODO Adjust when TradeTypesLib.OrderParty has been furnished with balances
        // Reward challenger
        _settleRewards(order.wallet, _orderTransferAmount(order), currency, challenger);

        // Disqualify proposal, effectively overriding any previous disqualification
        nullSettlementChallengeState.disqualifyProposal(
            order.wallet, currency, challenger, order.blockNumber,
            order.nonce, order.seals.operator.hash, TradeTypesLib.ORDER_KIND()
        );

        // Emit event
        emit ChallengeByOrderEvent(
            nullSettlementChallengeState.proposalNonce(order.wallet, currency), order, challenger
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _orderOverrun(TradeTypesLib.Order memory order, MonetaryTypesLib.Currency memory currency)
    private
    view
    returns (bool)
    {
        // Get the target balance amount from the proposal
        int targetBalanceAmount = nullSettlementChallengeState.proposalTargetBalanceAmount(
            order.wallet, currency
        );

        // Get the change in active balance since the start of the challenge
        int256 deltaBalanceSinceStart = balanceTracker.fungibleActiveBalanceAmount(
            order.wallet, currency
        ).sub(
            balanceTracker.fungibleActiveBalanceAmountByBlockNumber(
                order.wallet, currency,
                nullSettlementChallengeState.proposalReferenceBlockNumber(order.wallet, currency)
            )
        );

        // Get the cumulative transfer of the trade
        // TODO Remove when TradeTypesLib.OrderParty has been furnished with balances
        int256 orderCumulativeTransfer = _orderTransferAmount(order).mul(- 1);
        // TODO Uncomment when TradeTypesLib.OrderParty has been furnished with balances
        //        int256 orderCumulativeTransfer = _orderBalanceAmount(order.wallet, trade).sub(
        //            balanceTracker.fungibleActiveBalanceAmountByBlockNumber(order.wallet, currency, trade.blockNumber)
        //        );

        return targetBalanceAmount.add(deltaBalanceSinceStart) < orderCumulativeTransfer.mul(- 1);
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

    // TODO Uncomment when TradeTypesLib.OrderParty has been furnished with balances
    // Get the candidate order balance amount
    // Buy order -> Conjugate balance
    // Sell order -> Intended balance
    //    function _orderBalanceAmount(TradeTypesLib.Order memory order)
    //    private
    //    pure
    //    returns (MonetaryTypesLib.Currency memory)
    //    {
    //        return TradeTypesLib.Intention.Sell == order.placement.intention ?
    //        order.party.balances.intended :
    //        order.party.balances.conjugate;
    //    }

    // TODO Remove when TradeTypesLib.OrderParty has been furnished with balances
    // Get the candidate order transfer
    // Buy order -> Conjugate transfer
    // Sell order -> Intended transfer
    function _orderTransferAmount(TradeTypesLib.Order memory order)
    private
    pure
    returns (int256)
    {
        return TradeTypesLib.Intention.Sell == order.placement.intention ?
        order.placement.amount :
        order.placement.amount.div(order.placement.rate);
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