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
import {Strings} from "solidity-util/lib/Strings.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";

/**
 * @title DriipSettlementDisputeByTrade
 * @notice The where trade related disputes of driip settlement challenge happens
 */
contract DriipSettlementDisputeByTrade is Ownable, Configurable, ValidatableV2, SecurityBondable, WalletLockable,
FraudChallengable, CancelOrdersChallengable, Servable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using Strings for string;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CHALLENGE_BY_ORDER_ACTION = "challenge_by_order";
    string constant public UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION = "unchallenge_order_candidate_by_trade";
    string constant public CHALLENGE_BY_TRADE_ACTION = "challenge_by_trade";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementChallengeState public driipSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event ChallengeByOrderEvent(uint256 nonce, TradeTypesLib.Order order, address challenger);
    event UnchallengeOrderCandidateByTradeEvent(uint256 nonce, TradeTypesLib.Order order,
        TradeTypesLib.Trade trade, address unchallenger);
    event ChallengeByTradeEvent(address wallet, uint256 nonce, TradeTypesLib.Trade trade,
        address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    /// @notice Set the driip settlement state contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState) public
    onlyDeployer
    notNullAddress(address(newDriipSettlementChallengeState))
    {
        DriipSettlementChallengeState oldDriipSettlementChallengeState = driipSettlementChallengeState;
        driipSettlementChallengeState = newDriipSettlementChallengeState;
        emit SetDriipSettlementChallengeStateEvent(oldDriipSettlementChallengeState, driipSettlementChallengeState);
    }

    /// @notice Challenge the driip settlement by providing order candidate
    /// @param order The order candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    /// @dev If (candidate) order has buy intention consider _conjugate_ currency and amount, else
    /// if (candidate) order has sell intention consider _intended_ currency and amount
    function challengeByOrder(TradeTypesLib.Order memory order, address challenger) public
    onlyEnabledServiceAction(CHALLENGE_BY_ORDER_ACTION)
    onlySealedOrder(order)
    {
        // Require that candidate order is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderHash(order.seals.operator.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.operator.hash));

        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _orderCurrency(order);

        // Require that proposal has been initiated
        require(driipSettlementChallengeState.hasProposal(order.wallet, currency));

        // Require that proposal has not expired
        require(!driipSettlementChallengeState.hasProposalExpired(order.wallet, currency));

        // Require that orders's nonce is strictly greater than proposal's nonce and its current
        // disqualification nonce
        require(order.nonce > driipSettlementChallengeState.proposalNonce(
            order.wallet, currency
        ));
        require(order.nonce > driipSettlementChallengeState.proposalDisqualificationNonce(
            order.wallet, currency
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for this order to be a valid challenge candidate
        require(_orderTransferAmount(order) > driipSettlementChallengeState.proposalTargetBalanceAmount(
            order.wallet, currency
        ));

        // Reward challenger
        // TODO Need balance as part of order to replace transfer amount (_orderTransferAmount(order)) in call below
        _settleRewards(
            order.wallet, _orderTransferAmount(order), currency, challenger,
            configuration.settlementChallengeTimeout()
        );

        // Disqualify proposal, effectively overriding any previous disqualification
        driipSettlementChallengeState.disqualifyProposal(
            order.wallet, currency, challenger, order.blockNumber,
            order.nonce, order.seals.operator.hash, TradeTypesLib.ORDER_KIND()
        );

        // Emit event
        emit ChallengeByOrderEvent(
            driipSettlementChallengeState.proposalNonce(order.wallet, currency), order, challenger
        );
    }

    /// @notice Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    /// @param unchallenger The address of the unchallenger
    function unchallengeOrderCandidateByTrade(TradeTypesLib.Order memory order, TradeTypesLib.Trade memory trade, address unchallenger)
    public
    onlyEnabledServiceAction(UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION)
    onlySealedOrder(order)
    onlySealedTrade(trade)
    onlyTradeParty(trade, order.wallet)
    {
        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _orderCurrency(order);

        // Require that proposal has been initiated
        require(driipSettlementChallengeState.hasProposal(order.wallet, currency));

        // Require that proposal has not expired
        require(!driipSettlementChallengeState.hasProposalExpired(order.wallet, currency));

        // Require that proposal has been disqualified
        require(SettlementChallengeTypesLib.Status.Disqualified == driipSettlementChallengeState.proposalStatus(
            order.wallet, currency
        ));

        // Require that candidate kind is order
        require(
            TradeTypesLib.ORDER_KIND().compareTo(driipSettlementChallengeState.proposalDisqualificationCandidateKind(
                order.wallet, currency
            ))
        );

        // Require that trade and order are not labelled fraudulent
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));
        require(!fraudChallenge.isFraudulentOrderHash(order.seals.operator.hash));

        bytes32 candidateHash = driipSettlementChallengeState.proposalDisqualificationCandidateHash(
            order.wallet, currency
        );

        // Require that the order's and trade' order hashes equal the candidate (order's) hash,
        // and implicitly that order's and trade order's hashes equal
        // Order wallet is buyer -> require candidate hash to match buyer's order hash
        // Order wallet is seller -> require candidate hash to match seller's order hash
        require(candidateHash == order.seals.operator.hash);
        require(candidateHash == _tradeOrderHash(trade, order.wallet));

        // Store old challenger
        address challenger = driipSettlementChallengeState.proposalDisqualificationChallenger(
            order.wallet, currency
        );

        // Unlock wallet's balances or deprive challenger
        if (driipSettlementChallengeState.proposalWalletInitiated(order.wallet, currency))
            walletLocker.unlockFungibleByProxy(order.wallet, challenger, currency.ct, currency.id);
        else
            securityBond.depriveAbsolute(challenger, currency.ct, currency.id);

        // Requalify proposal
        driipSettlementChallengeState.qualifyProposal(
            order.wallet, currency
        );

        // Reward unchallenger
        securityBond.rewardFractional(unchallenger, configuration.walletSettlementStakeFraction(), 0);

        // Emit event
        emit UnchallengeOrderCandidateByTradeEvent(
            driipSettlementChallengeState.proposalNonce(order.wallet, currency), order, trade, unchallenger
        );
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param wallet The wallet whose driip settlement is being challenged
    /// @param trade The trade candidate that challenges the challenged driip
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
        require(driipSettlementChallengeState.hasProposal(wallet, currency));

        // Require that proposal has not expired
        require(!driipSettlementChallengeState.hasProposalExpired(wallet, currency));

        // Get the relevant nonce
        uint256 nonce = _tradeNonce(trade, wallet);

        // Require that trade party's nonce is strictly greater than proposal's nonce and its current
        // disqualification nonce
        require(nonce > driipSettlementChallengeState.proposalNonce(
            wallet, currency
        ));
        require(nonce > driipSettlementChallengeState.proposalDisqualificationNonce(
            wallet, currency
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for this trade to be a valid challenge candidate
        require(_tradeTransferAmount(trade, wallet) > driipSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, currency
        ));

        // Reward challenger
        _settleRewards(wallet, _tradeBalanceAmount(trade, wallet), currency, challenger, 0);

        // Disqualify proposal, effectively overriding any previous disqualification
        driipSettlementChallengeState.disqualifyProposal(
            wallet, currency, challenger, trade.blockNumber,
            nonce, trade.seal.hash, TradeTypesLib.TRADE_KIND()
        );

        // Emit event
        emit ChallengeByTradeEvent(
            wallet, driipSettlementChallengeState.proposalNonce(wallet, currency), trade, challenger
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

    // Lock wallet's balances or reward challenger by stake fraction
    function _settleRewards(address wallet, int256 walletAmount, MonetaryTypesLib.Currency memory currency,
        address challenger, uint256 unlockTimeoutInSeconds)
    private
    {
        if (driipSettlementChallengeState.proposalWalletInitiated(wallet, currency))
            _settleBalanceReward(wallet, walletAmount, currency, challenger);

        else
            _settleSecurityBondReward(wallet, walletAmount, currency, challenger, unlockTimeoutInSeconds);
    }

    function _settleBalanceReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency memory currency,
        address challenger)
    private
    {
        // Unlock wallet/currency for existing challenger if previously locked
        if (SettlementChallengeTypesLib.Status.Disqualified == driipSettlementChallengeState.proposalStatus(
            wallet, currency
        ))
            walletLocker.unlockFungibleByProxy(
                wallet,
                driipSettlementChallengeState.proposalDisqualificationChallenger(
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
        address challenger, uint256 unlockTimeoutInSeconds)
    private
    {
        // Deprive existing challenger of reward if previously locked
        if (SettlementChallengeTypesLib.Status.Disqualified == driipSettlementChallengeState.proposalStatus(
            wallet, currency
        ))
            securityBond.depriveAbsolute(
                driipSettlementChallengeState.proposalDisqualificationChallenger(
                    wallet, currency
                ),
                currency.ct, currency.id
            );

        // Reward the flat component
        MonetaryTypesLib.Figure memory flatReward = _flatReward();
        securityBond.rewardAbsolute(
            challenger, flatReward.amount, flatReward.currency.ct, flatReward.currency.id, unlockTimeoutInSeconds
        );

        // Reward the progressive component
        int256 progressiveRewardAmount = walletAmount.clampMax(
            securityBond.depositedFractionalBalance(
                currency.ct, currency.id, configuration.operatorSettlementStakeFraction()
            )
        );
        securityBond.rewardAbsolute(
            challenger, progressiveRewardAmount, currency.ct, currency.id, unlockTimeoutInSeconds
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