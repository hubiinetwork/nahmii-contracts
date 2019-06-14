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
import {FraudChallengable} from "./FraudChallengable.sol";
import {CancelOrdersChallengable} from "./CancelOrdersChallengable.sol";
import {Servable} from "./Servable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {NullSettlementChallengeState} from "./NullSettlementChallengeState.sol";

/**
 * @title NullSettlementDisputeByTrade
 * @notice The where trade related disputes of null settlement challenge happens
 */
contract NullSettlementDisputeByTrade is Ownable, Configurable, ValidatableV2, SecurityBondable, WalletLockable,
FraudChallengable, CancelOrdersChallengable, Servable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CHALLENGE_BY_ORDER_ACTION = "challenge_by_order";
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
        // Require that order candidate is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderHash(order.seals.operator.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.operator.hash));

        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _orderCurrency(order);

        // Require that proposal has been initiated
        require(nullSettlementChallengeState.hasProposal(order.wallet, currency));

        // Require that proposal has not expired
        require(!nullSettlementChallengeState.hasProposalExpired(order.wallet, currency));

        // Require that orders's nonce is strictly greater than proposal's nonce and its current
        // disqualification nonce
        require(order.nonce > nullSettlementChallengeState.proposalNonce(
            order.wallet, currency
        ));
        require(order.nonce > nullSettlementChallengeState.proposalDisqualificationNonce(
            order.wallet, currency
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for this order to be a valid challenge candidate
        require(_orderTransferAmount(order) > nullSettlementChallengeState.proposalTargetBalanceAmount(
            order.wallet, currency
        ));

        // Reward challenger
        // TODO Need balance as part of order to replace transfer amount (_orderTransferAmount(order)) in call below
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
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));

        // Require that wallet's order in trade is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderHash(_tradeOrderHash(trade, wallet)));
        require(!cancelOrdersChallenge.isOrderCancelled(wallet, _tradeOrderHash(trade, wallet)));

        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _tradeCurrency(trade, wallet);

        // Require that proposal has been initiated
        require(nullSettlementChallengeState.hasProposal(wallet, currency));

        // Require that proposal has not expired
        require(!nullSettlementChallengeState.hasProposalExpired(wallet, currency));

        // Get the relevant nonce
        uint256 nonce = _tradeNonce(trade, wallet);

        // Require that trade party's nonce is strictly greater than proposal's nonce and its current
        // disqualification nonce
        require(nonce > nullSettlementChallengeState.proposalNonce(
            wallet, currency
        ));
        require(nonce > nullSettlementChallengeState.proposalDisqualificationNonce(
            wallet, currency
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for this trade to be a valid challenge candidate
        require(_tradeTransferAmount(trade, wallet) > nullSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, currency
        ));

        // Reward challenger
        _settleRewards(wallet, _tradeBalanceAmount(trade, wallet), currency, challenger);

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

    function _tradeOrderHash(TradeTypesLib.Trade memory trade, address wallet)
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
    function _tradeCurrency(TradeTypesLib.Trade memory trade, address wallet)
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
    function _tradeNonce(TradeTypesLib.Trade memory trade, address wallet)
    private
    view
    returns (uint256)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.buyer.nonce :
        trade.seller.nonce;
    }

    // Get the candidate trade transfer amount
    // Wallet is buyer in (candidate) trade -> Conjugate transfer
    // Wallet is seller in (candidate) trade -> Intended transfer
    function _tradeTransferAmount(TradeTypesLib.Trade memory trade, address wallet)
    private
    view
    returns (int256)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.transfers.conjugate.single :
        trade.transfers.intended.single;
    }

    // Get the candidate trade balance amount
    // Wallet is buyer in (candidate) trade -> Buyer's conjugate balance
    // Wallet is seller in (candidate) trade -> Seller's intended balance
    function _tradeBalanceAmount(TradeTypesLib.Trade memory trade, address wallet)
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