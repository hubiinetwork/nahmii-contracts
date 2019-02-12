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
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";

/**
 * @title DriipSettlementDispute
 * @notice The workhorse of driip settlement challenges, utilized by DriipSettlementChallenge
 * @dev This contract is deprecated in favor of PaymentSettlementDispute and
 *    TradeSettlementDispute
*/
contract DriipSettlementDispute is Ownable, Configurable, ValidatableV2, SecurityBondable, WalletLockable,
FraudChallengable, CancelOrdersChallengable, Servable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CHALLENGE_BY_ORDER_ACTION = "challenge_by_order";
    string constant public UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION = "unchallenge_order_candidate_by_trade";
    string constant public CHALLENGE_BY_TRADE_ACTION = "challenge_by_trade";
    string constant public CHALLENGE_BY_PAYMENT_ACTION = "challenge_by_payment";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementChallengeState public driipSettlementChallengeState;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event ChallengeByOrderEvent(address wallet, uint256 nonce,
        bytes32 driipHash, NahmiiTypesLib.DriipType driipType,
        bytes32 candidateHash, address challenger);
    event UnchallengeOrderCandidateByTradeEvent(address wallet, uint256 nonce,
        bytes32 driipHash, NahmiiTypesLib.DriipType driipType,
        bytes32 challengeCandidateHash, address challenger,
        bytes32 unchallengeCandidateHash, address unchallenger);
    event ChallengeByTradeEvent(address wallet, uint256 nonce,
        bytes32 driipHash, NahmiiTypesLib.DriipType driipType,
        bytes32 candidateHash, address challenger);
    event ChallengeByPaymentEvent(address wallet, uint256 nonce,
        bytes32 driipHash, NahmiiTypesLib.DriipType driipType,
        bytes32 candidateHash, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    /// @notice Set the driip settlement state contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState) public
    onlyDeployer
    notNullAddress(newDriipSettlementChallengeState)
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
    function challengeByOrder(TradeTypesLib.Order order, address challenger) public
    onlyEnabledServiceAction(CHALLENGE_BY_ORDER_ACTION)
    onlySealedOrder(order)
    {
        // Require that candidate order is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderHash(order.seals.operator.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.operator.hash));

        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _orderCurrency(order);

        // Require that proposal has not expired
        require(!driipSettlementChallengeState.hasProposalExpired(order.wallet, currency));

        // TODO Replace by wallet nonce
        // Require that payment's block number is not earlier than proposal's block number or its current
        // disqualification block number
        require(order.blockNumber >= driipSettlementChallengeState.proposalBlockNumber(
            order.wallet, currency
        ));
        require(order.blockNumber >= driipSettlementChallengeState.proposalDisqualificationBlockNumber(
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
            order.seals.operator.hash, SettlementTypesLib.CandidateType.Order
        );

        // Emit event
        emit ChallengeByOrderEvent(
            order.wallet,
            driipSettlementChallengeState.proposalNonce(order.wallet, currency),
            driipSettlementChallengeState.proposalDriipHash(order.wallet, currency),
            driipSettlementChallengeState.proposalDriipType(order.wallet, currency),
            driipSettlementChallengeState.proposalDisqualificationCandidateHash(order.wallet, currency),
            challenger
        );
    }

    /// @notice Unchallenge driip settlement by providing trade that shows that challenge order candidate has been filled
    /// @param order The order candidate that challenged driip
    /// @param trade The trade in which order has been filled
    /// @param unchallenger The address of the unchallenger
    function unchallengeOrderCandidateByTrade(TradeTypesLib.Order order, TradeTypesLib.Trade trade, address unchallenger)
    public
    onlyEnabledServiceAction(UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION)
    onlySealedOrder(order)
    onlySealedTrade(trade)
    onlyTradeParty(trade, order.wallet)
    {
        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _orderCurrency(order);

        // Require that proposal has not expired
        require(!driipSettlementChallengeState.hasProposalExpired(order.wallet, currency));

        // Require that proposal has been disqualified
        require(SettlementTypesLib.Status.Disqualified == driipSettlementChallengeState.proposalStatus(
            order.wallet, currency
        ));

        // Require that candidate type is order
        require(SettlementTypesLib.CandidateType.Order == driipSettlementChallengeState.proposalDisqualificationCandidateType(
            order.wallet, currency
        ));

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
        if (driipSettlementChallengeState.proposalBalanceReward(order.wallet, currency))
            walletLocker.unlockFungibleByProxy(order.wallet, challenger, currency.ct, currency.id);
        else
            securityBond.depriveAbsolute(challenger, currency.ct, currency.id);

        // Requalify proposal
        driipSettlementChallengeState.qualifyProposal(
            order.wallet, currency
        );

        // Reward unchallenger
        securityBond.rewardFractional(unchallenger, configuration.walletSettlementStakeFraction(), 0);

        // TODO Uncomment below and refactor function if contract is needed
        // Emit event
        //        emit UnchallengeOrderCandidateByTradeEvent(
        //            order.wallet,
        //            driipSettlementChallengeState.proposalNonce(order.wallet, currency),
        //            driipSettlementChallengeState.proposalDriipHash(order.wallet, currency),
        //            driipSettlementChallengeState.proposalDriipType(order.wallet, currency),
        //            candidateHash, challenger,
        //            trade.seal.hash, unchallenger
        //        );
    }

    /// @notice Challenge the driip settlement by providing trade candidate
    /// @param wallet The wallet whose driip settlement is being challenged
    /// @param trade The trade candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    /// @dev If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else
    /// if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade
    function challengeByTrade(address wallet, TradeTypesLib.Trade trade, address challenger)
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

        // Require that proposal has not expired
        require(!driipSettlementChallengeState.hasProposalExpired(wallet, currency));

        // TODO Replace by wallet nonce
        // Require that payment's block number is not earlier than proposal's block number or its current
        // disqualification block number
        require(trade.blockNumber >= driipSettlementChallengeState.proposalBlockNumber(
            wallet, currency
        ));
        require(trade.blockNumber >= driipSettlementChallengeState.proposalDisqualificationBlockNumber(
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
            trade.seal.hash, SettlementTypesLib.CandidateType.Trade
        );

        // Emit event
        emit ChallengeByTradeEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, currency),
            driipSettlementChallengeState.proposalDriipHash(wallet, currency),
            driipSettlementChallengeState.proposalDriipType(wallet, currency),
            driipSettlementChallengeState.proposalDisqualificationCandidateHash(wallet, currency),
            challenger
        );
    }

    /// @notice Challenge the driip settlement by providing payment candidate
    /// @dev This challenges the payment sender's side of things
    /// @param wallet The concerned party
    /// @param payment The payment candidate that challenges the challenged driip
    /// @param challenger The address of the challenger
    function challengeByPayment(address wallet, PaymentTypesLib.Payment payment, address challenger)
    public
    onlyEnabledServiceAction(CHALLENGE_BY_PAYMENT_ACTION)
    onlySealedPayment(payment)
    onlyPaymentSender(payment, wallet)
    {
        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentHash(payment.seals.operator.hash));

        // Require that proposal has not expired
        require(!driipSettlementChallengeState.hasProposalExpired(wallet, payment.currency));

        // TODO Replace by wallet nonce
        // Require that payment's block number is not earlier than proposal's block number or its current
        // disqualification block number
        require(payment.blockNumber >= driipSettlementChallengeState.proposalBlockNumber(
            wallet, payment.currency
        ));
        require(payment.blockNumber >= driipSettlementChallengeState.proposalDisqualificationBlockNumber(
            wallet, payment.currency
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for the provided payment to be a valid challenge candidate.
        require(payment.transfers.single > driipSettlementChallengeState.proposalTargetBalanceAmount(
            wallet, payment.currency
        ));

        // Reward challenger
        _settleRewards(wallet, payment.sender.balances.current, payment.currency, challenger, 0);

        // Disqualify proposal, effectively overriding any previous disqualification
        driipSettlementChallengeState.disqualifyProposal(
            wallet, payment.currency, challenger, payment.blockNumber,
            payment.seals.operator.hash, SettlementTypesLib.CandidateType.Payment
        );

        // Emit event
        emit ChallengeByPaymentEvent(
            wallet,
            driipSettlementChallengeState.proposalNonce(wallet, payment.currency),
            driipSettlementChallengeState.proposalDriipHash(wallet, payment.currency),
            driipSettlementChallengeState.proposalDriipType(wallet, payment.currency),
            driipSettlementChallengeState.proposalDisqualificationCandidateHash(wallet, payment.currency),
            challenger
        );
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    // Get the candidate order currency
    // Buy order -> Conjugate currency
    // Sell order -> Intended currency
    function _orderCurrency(TradeTypesLib.Order order)
    private
    pure
    returns (MonetaryTypesLib.Currency)
    {
        return TradeTypesLib.Intention.Sell == order.placement.intention ?
        order.placement.currencies.intended :
        order.placement.currencies.conjugate;
    }

    // Get the candidate order transfer
    // Buy order -> Conjugate transfer
    // Sell order -> Intended transfer
    function _orderTransferAmount(TradeTypesLib.Order order)
    private
    pure
    returns (int256)
    {
        return TradeTypesLib.Intention.Sell == order.placement.intention ?
        order.placement.amount :
        order.placement.amount.div(order.placement.rate);
    }

    function _tradeOrderHash(TradeTypesLib.Trade trade, address wallet)
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
    function _tradeCurrency(TradeTypesLib.Trade trade, address wallet)
    private
    view
    returns (MonetaryTypesLib.Currency)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.currencies.conjugate :
        trade.currencies.intended;
    }

    // Get the candidate trade transfer amount
    // Wallet is buyer in (candidate) trade -> Conjugate transfer
    // Wallet is seller in (candidate) trade -> Intended transfer
    function _tradeTransferAmount(TradeTypesLib.Trade trade, address wallet)
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
    function _tradeBalanceAmount(TradeTypesLib.Trade trade, address wallet)
    private
    view
    returns (int256)
    {
        return validator.isTradeBuyer(trade, wallet) ?
        trade.buyer.balances.conjugate.current :
        trade.seller.balances.intended.current;
    }

    // Lock wallet's balances or reward challenger by stake fraction
    function _settleRewards(address wallet, int256 walletAmount, MonetaryTypesLib.Currency currency,
        address challenger, uint256 unlockTimeoutInSeconds)
    private
    {
        if (driipSettlementChallengeState.proposalBalanceReward(wallet, currency))
            _settleBalanceReward(wallet, walletAmount, currency, challenger);

        else
            _settleSecurityBondReward(wallet, walletAmount, currency, challenger, unlockTimeoutInSeconds);
    }

    function _settleBalanceReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency currency,
        address challenger)
    private
    {
        // Unlock wallet/currency for existing challenger if previously locked
        if (SettlementTypesLib.Status.Disqualified == driipSettlementChallengeState.proposalStatus(
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
        walletLocker.lockFungibleByProxy(wallet, challenger, walletAmount, currency.ct, currency.id);
    }

    // Settle the two-component reward from security bond.
    // The first component is flat figure as obtained from Configuration
    // The second component is progressive and calculated as
    //    min(walletAmount, fraction of SecurityBond's deposited balance)
    // both amounts for the given currency
    function _settleSecurityBondReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency currency,
        address challenger, uint256 unlockTimeoutInSeconds)
    private
    {
        // Deprive existing challenger of reward if previously locked
        if (SettlementTypesLib.Status.Disqualified == driipSettlementChallengeState.proposalStatus(
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
            securityBond.depositedFractionalBalance(currency.ct, currency.id, configuration.operatorSettlementStakeFraction())
        );
        securityBond.rewardAbsolute(
            challenger, progressiveRewardAmount, currency.ct, currency.id, unlockTimeoutInSeconds
        );
    }

    function _flatReward()
    private
    view
    returns (MonetaryTypesLib.Figure)
    {
        (int256 amount, address currencyCt, uint256 currencyId) = configuration.operatorSettlementStake();
        return MonetaryTypesLib.Figure(amount, MonetaryTypesLib.Currency(currencyCt, currencyId));
    }
}