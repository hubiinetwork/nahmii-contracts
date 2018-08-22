/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import {Ownable} from "./Ownable.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {StriimTypes} from "./StriimTypes.sol";
import {ERC20} from "./ERC20.sol";
import {Modifiable} from "./Modifiable.sol";
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {DriipSettlementChallenge} from "./DriipSettlementChallenge.sol";
import {FraudChallenge} from "./FraudChallenge.sol";
import {SelfDestructible} from "./SelfDestructible.sol";

/**
@title Exchange
@notice The orchestrator of driip settlements
*/
contract Exchange is Ownable, Configurable, Validatable, ClientFundable, CommunityVotable, SelfDestructible {
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public maxDriipNonce;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    FraudChallenge public fraudChallenge;
    DriipSettlementChallenge public driipSettlementChallenge;
    RevenueFund public tradesRevenueFund;
    RevenueFund public paymentsRevenueFund;

    StriimTypes.Settlement[] public settlements;
    mapping(uint256 => uint256) driipNonceSettlementIndexMap;
    mapping(address => uint256[]) walletSettlementIndexMap;
    mapping(address => mapping(address => uint256)) walletCurrencyMaxDriipNonce;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettleDriipAsTradeEvent(StriimTypes.Trade trade, address wallet);
    event SettleDriipAsPaymentEvent(StriimTypes.Payment payment, address wallet);
    event ChangeFraudChallengeEvent(FraudChallenge oldFraudChallenge, FraudChallenge newFraudChallenge);
    event ChangeDriipSettlementChallengeEvent(DriipSettlementChallenge oldDriipSettlementChallenge, DriipSettlementChallenge newDriipSettlementChallenge);
    event ChangeTradesRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
    event ChangePaymentsRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the fraud challenge contract
    /// @param newFraudChallenge The (address of) FraudChallenge contract instance
    function changeFraudChallenge(FraudChallenge newFraudChallenge)
    public
    onlyOwner
    notNullAddress(newFraudChallenge)
    {
        FraudChallenge oldFraudChallenge = fraudChallenge;
        fraudChallenge = newFraudChallenge;
        emit ChangeFraudChallengeEvent(oldFraudChallenge, fraudChallenge);
    }

    /// @notice Change the driip settlement challenge contract
    /// @param newDriipSettlementChallenge The (address of) DriipSettlementChallenge contract instance
    function changeDriipSettlementChallenge(DriipSettlementChallenge newDriipSettlementChallenge)
    public
    onlyOwner
    notNullAddress(newDriipSettlementChallenge)
    {
        DriipSettlementChallenge oldDriipSettlementChallenge = driipSettlementChallenge;
        driipSettlementChallenge = newDriipSettlementChallenge;
        emit ChangeDriipSettlementChallengeEvent(oldDriipSettlementChallenge, driipSettlementChallenge);
    }

    /// @notice Change the trades revenue fund contract
    /// @param newTradesRevenueFund The (address of) trades RevenueFund contract instance
    function changeTradesRevenueFund(RevenueFund newTradesRevenueFund)
    public
    onlyOwner
    notNullAddress(newTradesRevenueFund)
    {
        RevenueFund oldTradesRevenueFund = tradesRevenueFund;
        tradesRevenueFund = newTradesRevenueFund;
        emit ChangeTradesRevenueFundEvent(oldTradesRevenueFund, tradesRevenueFund);
    }

    /// @notice Change the payments revenue fund contract
    /// @param newPaymentsRevenueFund The (address of) payments RevenueFund contract instance
    function changePaymentsRevenueFund(RevenueFund newPaymentsRevenueFund)
    public
    onlyOwner
    notNullAddress(newPaymentsRevenueFund)
    {
        RevenueFund oldPaymentsRevenueFund = paymentsRevenueFund;
        paymentsRevenueFund = newPaymentsRevenueFund;
        emit ChangePaymentsRevenueFundEvent(oldPaymentsRevenueFund, paymentsRevenueFund);
    }

    /// @notice Get the seized status of given wallet
    /// @return true if wallet is seized, false otherwise
    function isSeizedWallet(address wallet) public view returns (bool) {
        return seizedWalletsMap[wallet];
    }

    /// @notice Get the number of wallets whose funds have be seized
    /// @return Number of wallets
    function seizedWalletsCount() public view returns (uint256) {
        return seizedWallets.length;
    }

    /// @notice Get the count of settlements
    function settlementsCount() public view returns (uint256) {
        return settlements.length;
    }

    /// @notice Get the count of settlements for given wallet
    /// @param wallet The address for which to return settlement count
    function walletSettlementsCount(address wallet) public view returns (uint256) {
        return walletSettlementIndexMap[wallet].length;
    }

    /// @notice Get settlement of given wallet
    /// @param wallet The address for which to return settlement
    /// @param index The wallet's settlement index
    function walletSettlement(address wallet, uint256 index) public view returns (StriimTypes.Settlement) {
        require(walletSettlementIndexMap[wallet].length > index);
        return settlements[walletSettlementIndexMap[wallet][index]];
    }

    /// @notice Update the max driip nonce property from CommunityVote contract
    function updateMaxDriipNonce() public {
        uint256 _maxDriipNonce = communityVote.getMaxDriipNonce();
        if (_maxDriipNonce > 0) {
            maxDriipNonce = _maxDriipNonce;
        }
    }

    /// @notice Settle driip that is a trade
    /// @param trade The trade to be settled
    /// @param wallet The wallet whose side of the trade is to be settled
    // TODO Update to two-component currency descriptor
    function settleDriipAsTrade(StriimTypes.Trade trade, address wallet)
    public
    validatorInitialized
    onlySealedTrade(trade)
    {
        require(fraudChallenge != address(0));
        require(communityVote != address(0));
        require(driipSettlementChallenge != address(0));
        require(configuration != address(0));
        require(clientFund != address(0));

        if (msg.sender != owner)
            wallet = msg.sender;

        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));
        require(StriimTypes.isTradeParty(trade, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        (StriimTypes.ChallengeResult result, address challenger) = driipSettlementChallenge.driipSettlementChallengeStatus(wallet, trade.nonce);

        if (StriimTypes.ChallengeResult.Qualified == result) {

            require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (trade.nonce < maxDriipNonce));

            // Get settlement
            // If no settlement of nonce then create one
            StriimTypes.Settlement storage settlement = hasSettlement(trade.nonce) ?
            getSettlement(trade.nonce, StriimTypes.DriipType.Trade) :
            createSettlementFromTrade(trade, wallet);

            StriimTypes.SettlementRole settlementRole = getSettlementRoleFromTrade(trade, wallet);

            // (If exists settlement of nonce then) Require that wallet has not already settled
            require(
                (StriimTypes.SettlementRole.Origin == settlementRole && address(0) == settlement.origin) ||
                (StriimTypes.SettlementRole.Target == settlementRole && address(0) == settlement.target)
            );

            if (StriimTypes.SettlementRole.Origin == settlementRole)
                settlement.origin = wallet;
            else
                settlement.target = wallet;

            StriimTypes.TradeParty memory party = StriimTypes.isTradeBuyer(trade, wallet) ? trade.buyer : trade.seller;

            // If wallet has previously settled with higher driip nonce with any of the concerned currencies then don't settle currency balances
            if (walletCurrencyMaxDriipNonce[wallet][trade.currencies.intended] < trade.nonce) {
                clientFund.stageToBeneficiaryUntargeted(wallet, tradesRevenueFund, party.netFees.intended, trade.currencies.intended, 0);
                clientFund.updateSettledBalance(wallet, party.balances.intended.current, trade.currencies.intended, 0);
                walletCurrencyMaxDriipNonce[wallet][trade.currencies.intended] = trade.nonce;
            }

            if (walletCurrencyMaxDriipNonce[wallet][trade.currencies.conjugate] < trade.nonce) {
                clientFund.stageToBeneficiaryUntargeted(wallet, tradesRevenueFund, party.netFees.conjugate, trade.currencies.conjugate, 0);
                clientFund.updateSettledBalance(wallet, party.balances.conjugate.current, trade.currencies.conjugate, 0);
                walletCurrencyMaxDriipNonce[wallet][trade.currencies.conjugate] = trade.nonce;
            }

            if (trade.nonce > maxDriipNonce)
                maxDriipNonce = trade.nonce;

        } else if (StriimTypes.ChallengeResult.Disqualified == result) {
            clientFund.seizeAllBalances(wallet, challenger);
            addToSeizedWallets(wallet);
        }

        emit SettleDriipAsTradeEvent(trade, wallet);
    }

    /// @notice Settle driip that is a payment
    /// @param payment The payment to be settled
    /// @param wallet The wallet whose side of the payment is to be settled
    // TODO Update to two-component currency descriptor
    function settleDriipAsPayment(StriimTypes.Payment payment, address wallet)
    public
    validatorInitialized
    onlySealedPayment(payment)
    {
        require(fraudChallenge != address(0));
        require(communityVote != address(0));
        require(driipSettlementChallenge != address(0));
        require(configuration != address(0));
        require(clientFund != address(0));

        if (msg.sender != owner)
            wallet = msg.sender;

        require(!fraudChallenge.isFraudulentPaymentExchangeHash(payment.seals.exchange.hash));
        require(StriimTypes.isPaymentParty(payment, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        (StriimTypes.ChallengeResult result, address challenger) = driipSettlementChallenge.driipSettlementChallengeStatus(wallet, payment.nonce);

        if (StriimTypes.ChallengeResult.Qualified == result) {

            require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (payment.nonce < maxDriipNonce));

            // Get settlement
            // If no settlement of nonce then create one
            StriimTypes.Settlement storage settlement = hasSettlement(payment.nonce) ?
            getSettlement(payment.nonce, StriimTypes.DriipType.Payment) :
            createSettlementFromPayment(payment, wallet);

            StriimTypes.SettlementRole settlementRole = getSettlementRoleFromPayment(payment, wallet);

            // (If exists settlement of nonce then) Require that wallet has not already settled
            require(
                (StriimTypes.SettlementRole.Origin == settlementRole && address(0) == settlement.origin) ||
                (StriimTypes.SettlementRole.Target == settlementRole && address(0) == settlement.target)
            );

            if (StriimTypes.SettlementRole.Origin == settlementRole)
                settlement.origin = wallet;
            else
                settlement.target = wallet;

            MonetaryTypes.Figure[] memory netFees;
            int256 currentBalance;
            if (StriimTypes.isPaymentSender(payment, wallet)) {
                netFees = payment.sender.fees.net;
                currentBalance = payment.sender.balances.current;
            } else {
                netFees = payment.recipient.fees.net;
                currentBalance = payment.recipient.balances.current;
            }

            // If wallet has previously settled with higher driip nonce with the currency, then don't settle the balance
            if (walletCurrencyMaxDriipNonce[wallet][payment.currency] < payment.nonce) {
                clientFund.stageToBeneficiaryUntargeted(wallet, paymentsRevenueFund, netFees, payment.currency, 0);
                clientFund.updateSettledBalance(wallet, currentBalance, payment.currency, 0);
                walletCurrencyMaxDriipNonce[wallet][payment.currency] = payment.nonce;
            }

            if (payment.nonce > maxDriipNonce)
                maxDriipNonce = payment.nonce;

        }
        else if (StriimTypes.ChallengeResult.Disqualified == result) {
            clientFund.seizeAllBalances(wallet, challenger);
            addToSeizedWallets(wallet);
        }

        emit SettleDriipAsPaymentEvent(payment, wallet);
    }

    function getSettlementRoleFromTrade(StriimTypes.Trade trade, address wallet) private pure returns (StriimTypes.SettlementRole) {
        return (wallet == trade.seller.wallet ? StriimTypes.SettlementRole.Origin : StriimTypes.SettlementRole.Target);
    }

    function getSettlementRoleFromPayment(StriimTypes.Payment payment, address wallet) private pure returns (StriimTypes.SettlementRole) {
        return (wallet == payment.sender.wallet ? StriimTypes.SettlementRole.Origin : StriimTypes.SettlementRole.Target);
    }

    function hasSettlement(uint256 nonce) private view returns (bool) {
        return 0 < driipNonceSettlementIndexMap[nonce];
    }

    function getSettlement(uint256 nonce, StriimTypes.DriipType driipType) private view returns (StriimTypes.Settlement storage) {
        uint256 index = driipNonceSettlementIndexMap[nonce];
        StriimTypes.Settlement storage settlement = settlements[index - 1];

        require(driipType == settlement.driipType);

        return settlement;
    }

    function createSettlementFromTrade(StriimTypes.Trade trade, address wallet) private returns (StriimTypes.Settlement storage) {
        bool origin = (wallet == trade.seller.wallet);

        StriimTypes.Settlement memory settlement = StriimTypes.Settlement(
            trade.nonce,
            StriimTypes.DriipType.Trade,
            origin ? wallet : address(0),
            origin ? address(0) : wallet
        );
        settlements.push(settlement);

        // Index is 1 based
        uint256 index = settlements.length;
        driipNonceSettlementIndexMap[trade.nonce] = index;
        walletSettlementIndexMap[trade.buyer.wallet].push(index);
        walletSettlementIndexMap[trade.seller.wallet].push(index);

        return settlements[index - 1];
    }

    function createSettlementFromPayment(StriimTypes.Payment payment, address wallet) private returns (StriimTypes.Settlement storage) {
        bool origin = (wallet == payment.sender.wallet);

        StriimTypes.Settlement memory settlement = StriimTypes.Settlement(
            payment.nonce,
            StriimTypes.DriipType.Payment,
            origin ? wallet : address(0),
            origin ? address(0) : wallet
        );
        settlements.push(settlement);

        // Index is 1 based
        uint256 index = settlements.length;
        driipNonceSettlementIndexMap[payment.nonce] = index;
        walletSettlementIndexMap[payment.sender.wallet].push(index);
        walletSettlementIndexMap[payment.recipient.wallet].push(index);

        return settlements[index - 1];
    }

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
        }
    }
}