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
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {PaymentTypesLib} from "./PaymentTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";
import {CancelOrdersChallenge} from "./CancelOrdersChallenge.sol";
import {NullSettlementChallenge} from "./NullSettlementChallenge.sol";

/**
 * @title NullSettlementDispute
 * @notice The workhorse of null settlement challenges, utilized by NullSettlementChallenge
 * @dev This contract is deprecated in favor of NullSettlementDisputeByPayment and
 *    NullSettlementDisputeByTrade
 */
contract NullSettlementDispute is Ownable, Configurable, ValidatableV2, SecurityBondable, WalletLockable,
FraudChallengable, CancelOrdersChallengable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    NullSettlementChallenge public nullSettlementChallenge;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetNullSettlementChallengeEvent(NullSettlementChallenge oldNullSettlementChallenge,
        NullSettlementChallenge newNullSettlementChallenge);
    event ChallengeByOrderEvent(address wallet, uint256 nonce,
        bytes32 candidateHash, address challenger);
    event ChallengeByTradeEvent(address wallet, uint256 nonce,
        bytes32 candidateHash, address challenger);
    event ChallengeByPaymentEvent(address wallet, uint256 nonce,
        bytes32 candidateHash, address challenger);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    /// @notice Set the settlement challenge contract
    /// @param newNullSettlementChallenge The (address of) NullSettlementChallenge contract instance
    function setNullSettlementChallenge(NullSettlementChallenge newNullSettlementChallenge) public
    onlyDeployer
    notNullAddress(newNullSettlementChallenge)
    {
        NullSettlementChallenge oldNullSettlementChallenge = nullSettlementChallenge;
        nullSettlementChallenge = newNullSettlementChallenge;
        emit SetNullSettlementChallengeEvent(oldNullSettlementChallenge, nullSettlementChallenge);
    }

    /// @notice Challenge the settlement by providing order candidate
    /// @param order The order candidate that challenges
    /// @param challenger The address of the challenger
    /// @dev If (candidate) order has buy intention consider _conjugate_ currency and amount, else
    /// if (candidate) order has sell intention consider _intended_ currency and amount
    function challengeByOrder(TradeTypesLib.Order order, address challenger)
    public
    onlyNullSettlementChallenge
    onlySealedOrder(order)
    {
        // Require that order candidate is not labelled fraudulent or cancelled
        require(!fraudChallenge.isFraudulentOrderHash(order.seals.operator.hash));
        require(!cancelOrdersChallenge.isOrderCancelled(order.wallet, order.seals.operator.hash));

        // Get the relevant currency
        MonetaryTypesLib.Currency memory currency = _orderCurrency(order);

        // Require that proposal has not expired
        require(!nullSettlementChallenge.hasProposalExpired(order.wallet, currency.ct, currency.id));

        // TODO Replace by wallet nonce
        // Require that payment's block number is not earlier than proposal's block number or its current
        // disqualification block number
        require(order.blockNumber >= nullSettlementChallenge.proposalBlockNumber(
            order.wallet, currency.ct, currency.id
        ));
        require(order.blockNumber >= nullSettlementChallenge.proposalDisqualificationBlockNumber(
            order.wallet, currency.ct, currency.id
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for this order to be a valid challenge candidate
        require(_orderTransferAmount(order) > nullSettlementChallenge.proposalTargetBalanceAmount(
            order.wallet, currency.ct, currency.id
        ));

        // Reward challenger
        // TODO Need balance as part of order to replace transfer amount (_orderTransferAmount(order)) in call below
        _settleRewards(order.wallet, _orderTransferAmount(order), currency, challenger, 0);

        // Disqualify proposal, effectively overriding any previous disqualification
        nullSettlementChallenge.disqualifyProposal(
            order.wallet, currency.ct, currency.id, challenger, order.blockNumber,
            order.seals.operator.hash, TradeTypesLib.ORDER_TYPE()
        );

        // Emit event
        emit ChallengeByOrderEvent(
            order.wallet,
            nullSettlementChallenge.proposalNonce(order.wallet, currency.ct, currency.id),
            nullSettlementChallenge.proposalDisqualificationCandidateHash(order.wallet, currency.ct, currency.id),
            challenger
        );
    }

    /// @notice Challenge the settlement by providing trade candidate
    /// @param wallet The wallet whose settlement is being challenged
    /// @param trade The trade candidate that challenges
    /// @param challenger The address of the challenger
    /// @dev If wallet is buyer in (candidate) trade consider single _conjugate_ transfer in (candidate) trade. Else
    /// if wallet is seller in (candidate) trade consider single _intended_ transfer in (candidate) trade
    function challengeByTrade(address wallet, TradeTypesLib.Trade trade, address challenger)
    public
    onlyNullSettlementChallenge
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
        require(!nullSettlementChallenge.hasProposalExpired(wallet, currency.ct, currency.id));

        // TODO Replace by wallet nonce
        // Require that payment's block number is not earlier than proposal's block number or its current
        // disqualification block number
        require(trade.blockNumber >= nullSettlementChallenge.proposalBlockNumber(
            wallet, currency.ct, currency.id
        ));
        require(trade.blockNumber >= nullSettlementChallenge.proposalDisqualificationBlockNumber(
            wallet, currency.ct, currency.id
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for this trade to be a valid challenge candidate
        require(_tradeTransferAmount(trade, wallet) > nullSettlementChallenge.proposalTargetBalanceAmount(
            wallet, currency.ct, currency.id
        ));

        // Reward challenger
        _settleRewards(wallet, _tradeBalanceAmount(trade, wallet), currency, challenger, 0);

        // Disqualify proposal, effectively overriding any previous disqualification
        nullSettlementChallenge.disqualifyProposal(
            wallet, currency.ct, currency.id, challenger, trade.blockNumber,
            trade.seal.hash, TradeTypesLib.TRADE_TYPE()
        );

        // Emit event
        emit ChallengeByTradeEvent(
            wallet,
            nullSettlementChallenge.proposalNonce(wallet, currency.ct, currency.id),
            nullSettlementChallenge.proposalDisqualificationCandidateHash(wallet, currency.ct, currency.id),
            challenger
        );
    }

    /// @notice Challenge the settlement by providing payment candidate
    /// @dev This challenges the payment sender's side of things
    /// @param wallet The wallet whose settlement is being challenged
    /// @param payment The payment candidate that challenges
    /// @param challenger The address of the challenger
    function challengeByPayment(address wallet, PaymentTypesLib.Payment payment, address challenger)
    public
    onlyNullSettlementChallenge
    onlySealedPayment(payment)
    onlyPaymentParty(payment, wallet)
    {
        // Require that payment candidate is not labelled fraudulent
        require(!fraudChallenge.isFraudulentPaymentHash(payment.seals.operator.hash));

        // Require that proposal has not expired
        require(!nullSettlementChallenge.hasProposalExpired(wallet, payment.currency.ct, payment.currency.id));

        // TODO Replace by wallet nonce
        // Require that payment's block number is not earlier than proposal's block number or its current
        // disqualification block number
        require(payment.blockNumber >= nullSettlementChallenge.proposalBlockNumber(
            wallet, payment.currency.ct, payment.currency.id
        ));
        require(payment.blockNumber >= nullSettlementChallenge.proposalDisqualificationBlockNumber(
            wallet, payment.currency.ct, payment.currency.id
        ));

        // Require that transfer amount is strictly greater than the proposal's target balance amount
        // for this payment to be a valid challenge candidate
        require(payment.transfers.single > nullSettlementChallenge.proposalTargetBalanceAmount(
            wallet, payment.currency.ct, payment.currency.id
        ));

        // Reward challenger
        _settleRewards(wallet, payment.sender.balances.current, payment.currency, challenger, 0);

        // Disqualify proposal, effectively overriding any previous disqualification
        nullSettlementChallenge.disqualifyProposal(
            wallet, payment.currency.ct, payment.currency.id, challenger, payment.blockNumber,
            payment.seals.operator.hash, PaymentTypesLib.PAYMENT_TYPE()
        );

        // Emit event
        emit ChallengeByPaymentEvent(
            wallet,
            nullSettlementChallenge.proposalNonce(wallet, payment.currency.ct, payment.currency.id),
            nullSettlementChallenge.proposalDisqualificationCandidateHash(wallet, payment.currency.ct, payment.currency.id),
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

    function _settleRewards(address wallet, int256 walletAmount, MonetaryTypesLib.Currency currency,
        address challenger, uint256 unlockTimeoutInSeconds)
    private
    {
        if (nullSettlementChallenge.proposalBalanceReward(wallet, currency.ct, currency.id))
            _settleBalanceReward(wallet, walletAmount, currency, challenger);

        else
            _settleSecurityBondReward(wallet, walletAmount, currency, challenger, unlockTimeoutInSeconds);
    }

    function _settleBalanceReward(address wallet, int256 walletAmount, MonetaryTypesLib.Currency currency,
        address challenger)
    private
    {
        // Unlock wallet/currency for existing challenger if previously locked
        if (SettlementTypesLib.Status.Disqualified == nullSettlementChallenge.proposalStatus(
            wallet, currency.ct, currency.id
        ))
            walletLocker.unlockFungibleByProxy(
                wallet,
                nullSettlementChallenge.proposalDisqualificationChallenger(
                    wallet, currency.ct, currency.id
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
        if (SettlementTypesLib.Status.Disqualified == nullSettlementChallenge.proposalStatus(
            wallet, currency.ct, currency.id
        ))
            securityBond.depriveAbsolute(
                nullSettlementChallenge.proposalDisqualificationChallenger(
                    wallet, currency.ct, currency.id
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

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyNullSettlementChallenge() {
        require(msg.sender == address(nullSettlementChallenge));
        _;
    }
}