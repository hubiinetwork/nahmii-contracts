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
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {PartnerFund} from "./PartnerFund.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {SettlementTypesLib} from "./SettlementTypesLib.sol";

/**
 * @title TradeSettlement
 * @notice Where trade settlements are finalized
 */
contract TradeSettlement is Ownable, Configurable, ValidatableV2, ClientFundable, CommunityVotable,
FraudChallengable, WalletLockable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Total {
        uint256 nonce;
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public maxDriipNonce;

    DriipSettlementChallengeState public driipSettlementChallengeState;
    RevenueFund public tradesRevenueFund;
    PartnerFund public partnerFund;

    SettlementTypesLib.Settlement[] public settlements;
    mapping(uint256 => uint256) public nonceSettlementIndex;
    mapping(address => uint256[]) public walletSettlementIndices;
    mapping(address => mapping(uint256 => uint256)) public walletNonceSettlementIndex;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxDriipNonce;

    mapping(address => mapping(address => mapping(address => mapping(address => mapping(uint256 => Total))))) public feeTotalsMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettleTradeEvent(address wallet, TradeTypesLib.Trade trade);
    event SettleTradeByProxyEvent(address proxy, address wallet, TradeTypesLib.Trade trade);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event SetTradesRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
    event SetPartnerFundEvent(PartnerFund oldPartnerFund, PartnerFund newPartnerFund);
    event StageFeesEvent(address wallet, int256 deltaAmount, int256 cumulativeAmount,
        address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the driip settlement challenge contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState) public
    onlyDeployer
    notNullAddress(newDriipSettlementChallengeState)
    {
        DriipSettlementChallengeState oldDriipSettlementChallengeState = driipSettlementChallengeState;
        driipSettlementChallengeState = newDriipSettlementChallengeState;
        emit SetDriipSettlementChallengeStateEvent(oldDriipSettlementChallengeState, driipSettlementChallengeState);
    }

    /// @notice Set the trades revenue fund contract
    /// @param newTradesRevenueFund The (address of) trades RevenueFund contract instance
    function setTradesRevenueFund(RevenueFund newTradesRevenueFund) public
    onlyDeployer
    notNullAddress(newTradesRevenueFund)
    {
        RevenueFund oldTradesRevenueFund = tradesRevenueFund;
        tradesRevenueFund = newTradesRevenueFund;
        emit SetTradesRevenueFundEvent(oldTradesRevenueFund, tradesRevenueFund);
    }

    /// @notice Set the partner fund contract
    /// @param newPartnerFund The (address of) partner contract instance
    function setPartnerFund(PartnerFund newPartnerFund) public
    onlyDeployer
    notNullAddress(newPartnerFund)
    {
        PartnerFund oldPartnerFund = partnerFund;
        partnerFund = newPartnerFund;
        emit SetPartnerFundEvent(oldPartnerFund, partnerFund);
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
    function settlementByNonce(uint256 nonce) public view returns (SettlementTypesLib.Settlement) {
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
    function settlementByWalletAndIndex(address wallet, uint256 index) public view returns (SettlementTypesLib.Settlement) {
        require(walletSettlementIndices[wallet].length > index);
        return settlements[walletSettlementIndices[wallet][index] - 1];
    }

    /// @notice Get settlement of given wallet and (wallet) nonce
    /// @param wallet The address for which to return settlement
    /// @param nonce The wallet's nonce
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndNonce(address wallet, uint256 nonce) public view returns (SettlementTypesLib.Settlement) {
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
    function settleTrade(TradeTypesLib.Trade trade)
    public
    {
        // Settle trade
        _settleTrade(msg.sender, trade);

        // Emit event
        emit SettleTradeEvent(msg.sender, trade);
    }

    /// @notice Settle driip that is a trade
    /// @param wallet The wallet whose side of the trade is to be settled
    /// @param trade The trade to be settled
    function settleTradeByProxy(address wallet, TradeTypesLib.Trade trade)
    public
    onlyOperator
    {
        // Settle trade for wallet
        _settleTrade(wallet, trade);

        // Emit event
        emit SettleTradeByProxyEvent(msg.sender, wallet, trade);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _settleTrade(address wallet, TradeTypesLib.Trade trade)
    private
    onlySealedTrade(trade)
    {
        require(!fraudChallenge.isFraudulentTradeHash(trade.seal.hash));
        require(validator.isTradeParty(trade, wallet));
        require(!communityVote.isDoubleSpenderWallet(wallet));

        // Require that wallet is not locked
        require(!walletLocker.isLocked(wallet));

        // Require that proposal has expired
        require(driipSettlementChallengeState.hasProposalExpired(wallet, trade.currencies.intended));
        require(driipSettlementChallengeState.hasProposalExpired(wallet, trade.currencies.conjugate));

        // Require that driip settlement challenge proposals qualified
        require(SettlementTypesLib.Status.Qualified == driipSettlementChallengeState.proposalStatus(
            wallet, trade.currencies.intended
        ));
        require(SettlementTypesLib.Status.Qualified == driipSettlementChallengeState.proposalStatus(
            wallet, trade.currencies.conjugate
        ));

        // Require that the wallet's current driip settlement challenge is wrt this trade
        require(trade.nonce == driipSettlementChallengeState.proposalNonce(wallet, trade.currencies.intended));
        require(trade.nonce == driipSettlementChallengeState.proposalNonce(wallet, trade.currencies.conjugate));

        // Require that operational mode is normal and data is available, or that nonce is
        // smaller than max null nonce
        require((configuration.isOperationalModeNormal() && communityVote.isDataAvailable())
            || (trade.nonce < maxDriipNonce));

        // Get settlement, or create one if no such settlement exists for the trade nonce
        SettlementTypesLib.Settlement storage settlement = hasSettlementByNonce(trade.nonce) ?
        getSettlement(
            trade.nonce, NahmiiTypesLib.DriipType.Trade
        ) :
        createSettlement(
            trade.nonce, NahmiiTypesLib.DriipType.Trade, trade.seller.nonce,
            trade.seller.wallet, trade.buyer.nonce, trade.buyer.wallet
        );

        // Get settlement role
        SettlementTypesLib.SettlementRole settlementRole = getSettlementRoleFromTrade(trade, wallet);

        // If exists settlement of nonce then require that wallet has not already settled
        require(
            (SettlementTypesLib.SettlementRole.Origin == settlementRole && !settlement.origin.done) ||
            (SettlementTypesLib.SettlementRole.Target == settlementRole && !settlement.target.done)
        );

        // Set address of origin or target to prevent the same settlement from being resettled by this wallet
        if (SettlementTypesLib.SettlementRole.Origin == settlementRole)
            settlement.origin.done = true;
        else
            settlement.target.done = true;

        TradeTypesLib.TradeParty memory party = validator.isTradeBuyer(trade, wallet) ? trade.buyer : trade.seller;

        // If wallet has previously settled balance of the intended currency with higher driip nonce, then don't
        // settle its balance again
        if (walletCurrencyMaxDriipNonce[wallet][trade.currencies.intended.ct][trade.currencies.intended.id] < trade.nonce) {
            // Update settled nonce of wallet and currency
            walletCurrencyMaxDriipNonce[wallet][trade.currencies.intended.ct][trade.currencies.intended.id] = trade.nonce;

            // Update settled balance
            clientFund.updateSettledBalance(
                wallet, party.balances.intended.current, trade.currencies.intended.ct,
                trade.currencies.intended.id, "", trade.blockNumber
            );

            // Stage (stage function assures positive amount only)
            clientFund.stage(
                wallet,
                driipSettlementChallengeState.proposalStageAmount(wallet, trade.currencies.intended),
                trade.currencies.intended.ct, trade.currencies.intended.id, ""
            );
        }

        // If wallet has previously settled balance of the conjugate currency with higher driip nonce, then don't
        // settle its balance again
        if (walletCurrencyMaxDriipNonce[wallet][trade.currencies.conjugate.ct][trade.currencies.conjugate.id] < trade.nonce) {
            // Update settled nonce of wallet and currency
            walletCurrencyMaxDriipNonce[wallet][trade.currencies.conjugate.ct][trade.currencies.conjugate.id] = trade.nonce;

            // Update settled balance
            clientFund.updateSettledBalance(
                wallet, party.balances.conjugate.current, trade.currencies.conjugate.ct,
                trade.currencies.conjugate.id, "", trade.blockNumber
            );

            // Stage (stage function assures positive amount only)
            clientFund.stage(
                wallet,
                driipSettlementChallengeState.proposalStageAmount(wallet, trade.currencies.conjugate),
                trade.currencies.conjugate.ct, trade.currencies.conjugate.id, ""
            );
        }

        // Stage fees to revenue fund
        if (address(0) != address(tradesRevenueFund))
            stageFees(wallet, party.fees.total, tradesRevenueFund, trade.nonce);

        // If trade nonce is beyond max driip nonce then update max driip nonce
        if (trade.nonce > maxDriipNonce)
            maxDriipNonce = trade.nonce;
    }

    function getSettlementRoleFromTrade(TradeTypesLib.Trade trade, address wallet)
    private
    pure
    returns (SettlementTypesLib.SettlementRole)
    {
        return (wallet == trade.seller.wallet ?
        SettlementTypesLib.SettlementRole.Origin :
        SettlementTypesLib.SettlementRole.Target);
    }

    function getSettlement(uint256 nonce, NahmiiTypesLib.DriipType driipType)
    private
    view
    returns (SettlementTypesLib.Settlement storage)
    {
        uint256 index = nonceSettlementIndex[nonce];
        SettlementTypesLib.Settlement storage settlement = settlements[index - 1];
        require(driipType == settlement.driipType);
        return settlement;
    }

    function createSettlement(uint256 nonce, NahmiiTypesLib.DriipType driipType,
        uint256 originNonce, address originWallet, uint256 targetNonce, address targetWallet)
    private
    returns (SettlementTypesLib.Settlement storage)
    {
        SettlementTypesLib.Settlement memory settlement;
        settlement.nonce = nonce;
        settlement.driipType = driipType;
        settlement.origin = SettlementTypesLib.SettlementParty(originNonce, originWallet, false);
        settlement.target = SettlementTypesLib.SettlementParty(targetNonce, targetWallet, false);

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

    function stageFees(address wallet, NahmiiTypesLib.OriginFigure[] fees,
        Beneficiary protocolBeneficiary, uint256 nonce)
    private
    {
        // For each origin figure...
        for (uint256 i = 0; i < fees.length; i++) {
            // Based on originId determine if this is protocol or partner fee, and if the latter define originId as destination in beneficiary
            (Beneficiary beneficiary, address destination) =
            (0 == fees[i].originId) ? (protocolBeneficiary, address(0)) : (partnerFund, address(fees[i].originId));

            Total storage feeTotal = feeTotalsMap[wallet][address(beneficiary)][destination][fees[i].figure.currency.ct][fees[i].figure.currency.id];

            // If wallet has previously settled fee of the concerned currency with higher driip nonce then don't settle again
            if (feeTotal.nonce < nonce) {
                feeTotal.nonce = nonce;

                // Get the amount previously staged
                int256 deltaAmount = fees[i].figure.amount - feeTotal.amount;

                // Update the fee total amount
                feeTotal.amount = fees[i].figure.amount;

                // Transfer to beneficiary
                clientFund.transferToBeneficiary(
                    destination, beneficiary, deltaAmount, fees[i].figure.currency.ct, fees[i].figure.currency.id, ""
                );

                // Emit event
                emit StageFeesEvent(
                    wallet, deltaAmount, fees[i].figure.amount, fees[i].figure.currency.ct, fees[i].figure.currency.id
                );
            }
        }
    }
}