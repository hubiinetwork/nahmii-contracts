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
import {Configurable} from "./Configurable.sol";
import {Validatable} from "./Validatable.sol";
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {DriipSettlementChallenge} from "./DriipSettlementChallenge.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";
import {NahmiiTypes} from "./NahmiiTypes.sol";
import {SettlementTypes} from "./SettlementTypes.sol";

/**
@title DriipSettlement
@notice Where driip settlements are finalized
*/
contract DriipSettlement is Ownable, Configurable, Validatable, ClientFundable, CommunityVotable, FraudChallengable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public maxDriipNonce;

    address[] public seizedWallets;
    mapping(address => bool) public seizedWalletsMap;

    DriipSettlementChallenge public driipSettlementChallenge;
    RevenueFund public tradesRevenueFund;
    RevenueFund public paymentsRevenueFund;

    NahmiiTypes.Settlement[] public settlements;
    mapping(uint256 => uint256) public nonceSettlementIndex;
    mapping(address => uint256[]) public walletSettlementIndices;
    mapping(address => mapping(uint256 => uint256)) public walletNonceSettlementIndex;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxDriipNonce;

    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyFeeNonce;
    mapping(address => mapping(address => mapping(uint256 => int256))) public walletCurrencyFeeCharged;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettleDriipAsTradeEvent(address wallet, NahmiiTypes.Trade trade,
        SettlementTypes.ProposalStatus proposalStatus);
    event SettleDriipAsTradeByProxyEvent(address proxy, address wallet, NahmiiTypes.Trade trade,
        SettlementTypes.ProposalStatus proposalStatus);
    event SettleDriipAsPaymentEvent(address wallet, NahmiiTypes.Payment payment,
        SettlementTypes.ProposalStatus proposalStatus);
    event SettleDriipAsPaymentByProxyEvent(address proxy, address wallet, NahmiiTypes.Payment payment,
        SettlementTypes.ProposalStatus proposalStatus);
    event ChangeDriipSettlementChallengeEvent(DriipSettlementChallenge oldDriipSettlementChallenge,
        DriipSettlementChallenge newDriipSettlementChallenge);
    event ChangeTradesRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
    event ChangePaymentsRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
    event StageTotalFeeEvent(address wallet, int256 deltaAmount, int256 cumulativeAmount, address currencyCt,
        uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the driip settlement challenge contract
    /// @param newDriipSettlementChallenge The (address of) DriipSettlementChallenge contract instance
    function changeDriipSettlementChallenge(DriipSettlementChallenge newDriipSettlementChallenge) public
    onlyDeployer
    notNullAddress(newDriipSettlementChallenge)
    {
        DriipSettlementChallenge oldDriipSettlementChallenge = driipSettlementChallenge;
        driipSettlementChallenge = newDriipSettlementChallenge;
        emit ChangeDriipSettlementChallengeEvent(oldDriipSettlementChallenge, driipSettlementChallenge);
    }

    /// @notice Change the trades revenue fund contract
    /// @param newTradesRevenueFund The (address of) trades RevenueFund contract instance
    function changeTradesRevenueFund(RevenueFund newTradesRevenueFund) public
    onlyDeployer
    notNullAddress(newTradesRevenueFund)
    {
        RevenueFund oldTradesRevenueFund = tradesRevenueFund;
        tradesRevenueFund = newTradesRevenueFund;
        emit ChangeTradesRevenueFundEvent(oldTradesRevenueFund, tradesRevenueFund);
    }

    /// @notice Change the payments revenue fund contract
    /// @param newPaymentsRevenueFund The (address of) payments RevenueFund contract instance
    function changePaymentsRevenueFund(RevenueFund newPaymentsRevenueFund) public
    onlyDeployer
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

    /// @notice Return boolean indicating whether there is already a settlement for the given (global) nonce
    /// @param nonce The nonce for which to check for settlement
    /// @return true if there exists a settlement for the provided nonce, false otherwise
    function hasSettlementByNonce(uint256 nonce) public view returns (bool) {
        return 0 < nonceSettlementIndex[nonce];
    }

    /// @notice Get the settlement for the given (global) nonce
    /// @param nonce The nonce of the settlement
    /// @return settlement of the provided nonce
    function settlementByNonce(uint256 nonce) public view returns (NahmiiTypes.Settlement) {
        require(hasSettlementByNonce(nonce));
        return settlements[nonceSettlementIndex[nonce] - 1];
    }

    /// @notice Get the count of settlements for given wallet
    /// @param wallet The address for which to return settlement count
    /// @return count of settlements for the provided wallet
    function settlementsCountByWallet(address wallet) public view returns (uint256) {
        return walletSettlementIndices[wallet].length;
    }

    /// @notice Get settlement of given wallet and index
    /// @param wallet The address for which to return settlement
    /// @param index The wallet's settlement index
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndIndex(address wallet, uint256 index) public view returns (NahmiiTypes.Settlement) {
        require(walletSettlementIndices[wallet].length > index);
        return settlements[walletSettlementIndices[wallet][index] - 1];
    }

    /// @notice Get settlement of given wallet and (wallet) nonce
    /// @param wallet The address for which to return settlement
    /// @param nonce The wallet's nonce
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndNonce(address wallet, uint256 nonce) public view returns (NahmiiTypes.Settlement) {
        require(0 < walletNonceSettlementIndex[wallet][nonce]);
        return settlements[walletNonceSettlementIndex[wallet][nonce] - 1];
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
    function settleTrade(NahmiiTypes.Trade trade)
    public
    {
        // Settle trade
        settleTradePrivate(msg.sender, trade);

        // Emit event
        emit SettleDriipAsTradeEvent(msg.sender, trade, driipSettlementChallenge.proposalStatus(msg.sender));
    }

    /// @notice Settle driip that is a trade
    /// @param wallet The wallet whose side of the trade is to be settled
    /// @param trade The trade to be settled
    function settleTradeAsProxy(address wallet, NahmiiTypes.Trade trade)
    public
    onlyDeployer
    {
        // Settle trade for wallet
        settleTradePrivate(wallet, trade);

        // Emit event
        emit SettleDriipAsTradeByProxyEvent(msg.sender, wallet, trade, driipSettlementChallenge.proposalStatus(wallet));
    }

    /// @notice Settle driip that is a payment
    /// @param payment The payment to be settled
    function settlePayment(NahmiiTypes.Payment payment)
    public
    {
        // Settle payment
        settlePaymentPrivate(msg.sender, payment);

        // Emit event
        emit SettleDriipAsPaymentEvent(msg.sender, payment, driipSettlementChallenge.proposalStatus(msg.sender));
    }

    /// @notice Settle driip that is a payment
    /// @param wallet The wallet whose side of the payment is to be settled
    /// @param payment The payment to be settled
    function settlePaymentByProxy(address wallet, NahmiiTypes.Payment payment)
    public
    onlyDeployer
    {
        // Settle payment for wallet
        settlePaymentPrivate(wallet, payment);

        // Emit event
        emit SettleDriipAsPaymentByProxyEvent(msg.sender, wallet, payment, driipSettlementChallenge.proposalStatus(wallet));
    }

    function settleTradePrivate(address wallet, NahmiiTypes.Trade trade)
    private
    validatorInitialized
    fraudChallengeInitialized
    communityVoteInitialized
    configurationInitialized
    clientFundInitialized
    onlySealedTrade(trade)
    {
        require(driipSettlementChallenge != address(0));

        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));
        require(validator.isTradeParty(trade, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        // Require that the wallet's current driip settlement challenge is wrt this trade
        require(driipSettlementChallenge.proposalNonce(wallet) == trade.nonce);

        // The current driip settlement challenge qualified for settlement
        if (driipSettlementChallenge.proposalStatus(wallet) == SettlementTypes.ProposalStatus.Qualified) {

            require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (trade.nonce < maxDriipNonce));

            // Get settlement, or create one if no such settlement exists for the trade nonce
            NahmiiTypes.Settlement storage settlement = hasSettlementByNonce(trade.nonce) ?
            getSettlement(trade.nonce, NahmiiTypes.DriipType.Trade) :
            createSettlement(trade.nonce, NahmiiTypes.DriipType.Trade,
                trade.seller.nonce, trade.seller.wallet, trade.buyer.nonce, trade.buyer.wallet);

            // Get settlement role
            SettlementTypes.SettlementRole settlementRole = getSettlementRoleFromTrade(trade, wallet);

            // If exists settlement of nonce then require that wallet has not already settled
            require(
                (SettlementTypes.SettlementRole.Origin == settlementRole && !settlement.origin.done) ||
                (SettlementTypes.SettlementRole.Target == settlementRole && !settlement.target.done)
            );

            // Set address of origin or target to prevent the same settlement from being resettled by this wallet
            if (SettlementTypes.SettlementRole.Origin == settlementRole)
                settlement.origin.done = true;
            else
                settlement.target.done = true;

            NahmiiTypes.TradeParty memory party = validator.isTradeBuyer(trade, wallet) ? trade.buyer : trade.seller;

            // If wallet has previously settled balance of the intended currency with higher driip nonce, then don't
            // settle its balance again
            if (walletCurrencyMaxDriipNonce[wallet][trade.currencies.intended.ct][trade.currencies.intended.id] < trade.nonce) {
                // Update settled nonce of wallet and currency
                walletCurrencyMaxDriipNonce[wallet][trade.currencies.intended.ct][trade.currencies.intended.id] = trade.nonce;

                // Update settled balance
                clientFund.updateSettledBalance(wallet, party.balances.intended.current, trade.currencies.intended.ct, trade.currencies.intended.id);

                // Stage (stage function assures positive amount only)
                clientFund.stage(
                    wallet,
                    driipSettlementChallenge.proposalStageAmount(wallet, trade.currencies.intended),
                    trade.currencies.intended.ct,
                    trade.currencies.intended.id
                );
            }

            // If wallet has previously settled balance of the conjugate currency with higher driip nonce, then don't
            // settle its balance again
            if (walletCurrencyMaxDriipNonce[wallet][trade.currencies.conjugate.ct][trade.currencies.conjugate.id] < trade.nonce) {
                // Update settled nonce of wallet and currency
                walletCurrencyMaxDriipNonce[wallet][trade.currencies.conjugate.ct][trade.currencies.conjugate.id] = trade.nonce;

                // Update settled balance
                clientFund.updateSettledBalance(wallet, party.balances.conjugate.current, trade.currencies.conjugate.ct, trade.currencies.conjugate.id);

                // Stage (stage function assures positive amount only)
                clientFund.stage(
                    wallet,
                    driipSettlementChallenge.proposalStageAmount(wallet, trade.currencies.conjugate),
                    trade.currencies.conjugate.ct,
                    trade.currencies.conjugate.id
                );
            }

            // Stage fees to revenue fund
            stageFees(wallet, party.fees.total, tradesRevenueFund, trade.nonce);

            // If payment nonce is beyond max driip nonce then update max driip nonce
            if (trade.nonce > maxDriipNonce)
                maxDriipNonce = trade.nonce;
        }

        // The current driip settlement challenge disqualified for settlement
        else if (driipSettlementChallenge.proposalStatus(wallet) == SettlementTypes.ProposalStatus.Disqualified) {
            // Add wallet to store of seized wallets
            addToSeizedWallets(wallet);

            // Slash wallet's funds
            clientFund.seizeAllBalances(wallet, driipSettlementChallenge.proposalChallenger(wallet));
        }
    }

    function settlePaymentPrivate(address wallet, NahmiiTypes.Payment payment)
    private
    validatorInitialized
    fraudChallengeInitialized
    communityVoteInitialized
    configurationInitialized
    clientFundInitialized
    onlySealedPayment(payment)
    {
        require(driipSettlementChallenge != address(0));

        require(!fraudChallenge.isFraudulentPaymentOperatorHash(payment.seals.exchange.hash));
        require(validator.isPaymentParty(payment, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        // Require that the wallet's current driip settlement challenge is wrt this payment
        require(driipSettlementChallenge.proposalNonce(wallet) == payment.nonce);

        // The current driip settlement challenge qualified for settlement
        if (driipSettlementChallenge.proposalStatus(wallet) == SettlementTypes.ProposalStatus.Qualified) {

            require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
                || (payment.nonce < maxDriipNonce));

            // Get settlement, or create one if no such settlement exists for the trade nonce
            NahmiiTypes.Settlement storage settlement = hasSettlementByNonce(payment.nonce) ?
            getSettlement(payment.nonce, NahmiiTypes.DriipType.Payment) :
            createSettlement(payment.nonce, NahmiiTypes.DriipType.Payment,
                payment.sender.nonce, payment.sender.wallet, payment.recipient.nonce, payment.recipient.wallet);

            // Get settlement role
            SettlementTypes.SettlementRole settlementRole = getSettlementRoleFromPayment(payment, wallet);

            // If exists settlement of nonce then require that wallet has not already settled
            require(
                (SettlementTypes.SettlementRole.Origin == settlementRole && !settlement.origin.done) ||
                (SettlementTypes.SettlementRole.Target == settlementRole && !settlement.target.done)
            );

            // Set address of origin or target to prevent the same settlement from being resettled by this wallet
            if (SettlementTypes.SettlementRole.Origin == settlementRole)
                settlement.origin.done = true;
            else
                settlement.target.done = true;

            MonetaryTypes.Figure[] memory totalFees;
            int256 currentBalance;
            if (validator.isPaymentParty(payment, wallet)) {
                totalFees = payment.sender.fees.total;
                currentBalance = payment.sender.balances.current;
            } else {
                totalFees = payment.recipient.fees.total;
                currentBalance = payment.recipient.balances.current;
            }

            // If wallet has previously settled balance of the concerned currency with higher driip nonce, then don't
            // settle balance again
            if (walletCurrencyMaxDriipNonce[wallet][payment.currency.ct][payment.currency.id] < payment.nonce) {
                // Update settled nonce of wallet and currency
                walletCurrencyMaxDriipNonce[wallet][payment.currency.ct][payment.currency.id] = payment.nonce;

                // Update settled balance
                clientFund.updateSettledBalance(wallet, currentBalance, payment.currency.ct, payment.currency.id);

                // Stage (stage function assures positive amount only)
                clientFund.stage(
                    wallet,
                    driipSettlementChallenge.proposalStageAmount(wallet, payment.currency),
                    payment.currency.ct,
                    payment.currency.id
                );
            }

            // Stage fees to revenue fund
            stageFees(wallet, totalFees, paymentsRevenueFund, payment.nonce);

            // If payment nonce is beyond max driip nonce then update max driip nonce
            if (payment.nonce > maxDriipNonce)
                maxDriipNonce = payment.nonce;
        }

        // The current driip settlement challenge disqualified for settlement
        else if (driipSettlementChallenge.proposalStatus(wallet) == SettlementTypes.ProposalStatus.Disqualified) {
            // Add wallet to store of seized wallets
            addToSeizedWallets(wallet);

            // Slash wallet's funds
            clientFund.seizeAllBalances(wallet, driipSettlementChallenge.proposalChallenger(wallet));
        }
    }

    function getSettlementRoleFromTrade(NahmiiTypes.Trade trade, address wallet)
    private
    pure
    returns (SettlementTypes.SettlementRole)
    {
        return (wallet == trade.seller.wallet ?
        SettlementTypes.SettlementRole.Origin :
        SettlementTypes.SettlementRole.Target);
    }

    function getSettlementRoleFromPayment(NahmiiTypes.Payment payment, address wallet)
    private
    pure
    returns (SettlementTypes.SettlementRole)
    {
        return (wallet == payment.sender.wallet ?
        SettlementTypes.SettlementRole.Origin :
        SettlementTypes.SettlementRole.Target);
    }

    function getSettlement(uint256 nonce, NahmiiTypes.DriipType driipType)
    private
    view
    returns (NahmiiTypes.Settlement storage)
    {
        uint256 index = nonceSettlementIndex[nonce];
        NahmiiTypes.Settlement storage settlement = settlements[index - 1];
        require(driipType == settlement.driipType);
        return settlement;
    }

    function createSettlement(uint256 nonce, NahmiiTypes.DriipType driipType,
        uint256 originNonce, address originWallet, uint256 targetNonce, address targetWallet)
    private
    returns (NahmiiTypes.Settlement storage)
    {
        NahmiiTypes.Settlement memory settlement;
        settlement.nonce = nonce;
        settlement.driipType = driipType;
        settlement.origin = NahmiiTypes.SettlementParty(originNonce, originWallet, false);
        settlement.target = NahmiiTypes.SettlementParty(targetNonce, targetWallet, false);

        settlements.push(settlement);

        // Index is 1 based
        uint256 index = settlements.length;
        nonceSettlementIndex[nonce] = index;
        walletSettlementIndices[originWallet].push(index);
        walletSettlementIndices[targetWallet].push(index);
        walletNonceSettlementIndex[originWallet][originNonce] = index;
        walletNonceSettlementIndex[targetWallet][targetNonce] = index;

        return settlements[index - 1];
    }

    function addToSeizedWallets(address _address) private {
        if (!seizedWalletsMap[_address]) {
            seizedWallets.push(_address);
            seizedWalletsMap[_address] = true;
        }
    }

    function stageFees(address wallet, MonetaryTypes.Figure[] fees,
        Beneficiary beneficiary, uint256 nonce)
    private
    {
        // For each fee figure...
        for (uint256 i = 0; i < fees.length; i++) {
            // If wallet has previously settled fee of the concerned currency with higher driip nonce then don't settle again
            if (walletCurrencyFeeNonce[wallet][fees[i].currency.ct][fees[i].currency.id] < nonce) {
                walletCurrencyFeeNonce[wallet][fees[i].currency.ct][fees[i].currency.id] = nonce;

                // Stage delta of fee to beneficiary
                clientFund.stageToBeneficiaryUntargeted(wallet, beneficiary,
                    fees[i].amount - walletCurrencyFeeCharged[wallet][fees[i].currency.ct][fees[i].currency.id],
                    fees[i].currency.ct, fees[i].currency.id);

                // Update fee charged
                walletCurrencyFeeCharged[wallet][fees[i].currency.ct][fees[i].currency.id] = fees[i].amount;

                // Emit event
                emit StageTotalFeeEvent(wallet,
                    fees[i].amount - walletCurrencyFeeCharged[wallet][fees[i].currency.ct][fees[i].currency.id],
                    walletCurrencyFeeCharged[wallet][fees[i].currency.ct][fees[i].currency.id],
                    fees[i].currency.ct, fees[i].currency.id);
            }
        }
    }
}