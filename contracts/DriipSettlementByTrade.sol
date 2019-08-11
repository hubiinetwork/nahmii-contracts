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
import {ClientFundable} from "./ClientFundable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {FraudChallengable} from "./FraudChallengable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {PartnerFund} from "./PartnerFund.sol";
import {DriipSettlementChallengeState} from "./DriipSettlementChallengeState.sol";
import {DriipSettlementState} from "./DriipSettlementState.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {TradeTypesLib} from "./TradeTypesLib.sol";
import {DriipSettlementTypesLib} from "./DriipSettlementTypesLib.sol";
import {SettlementChallengeTypesLib} from "./SettlementChallengeTypesLib.sol";

/**
 * @title DriipSettlementByTrade
 * @notice Where driip settlements pertaining to trade are finalized
 */
contract DriipSettlementByTrade is Ownable, Configurable, ValidatableV2, ClientFundable, CommunityVotable,
FraudChallengable, WalletLockable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    DriipSettlementChallengeState public driipSettlementChallengeState;
    DriipSettlementState public driipSettlementState;
    RevenueFund public revenueFund;
    PartnerFund public partnerFund;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SettleTradeEvent(address wallet, TradeTypesLib.Trade trade, string standard);
    event SettleTradeByProxyEvent(address proxy, address wallet, TradeTypesLib.Trade trade, string standard);
    event SetDriipSettlementChallengeStateEvent(DriipSettlementChallengeState oldDriipSettlementChallengeState,
        DriipSettlementChallengeState newDriipSettlementChallengeState);
    event SetDriipSettlementStateEvent(DriipSettlementState oldDriipSettlementState,
        DriipSettlementState newDriipSettlementState);
    event SetRevenueFundEvent(RevenueFund oldRevenueFund, RevenueFund newRevenueFund);
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
    /// @notice Set the driip settlement challenge state contract
    /// @param newDriipSettlementChallengeState The (address of) DriipSettlementChallengeState contract instance
    function setDriipSettlementChallengeState(DriipSettlementChallengeState newDriipSettlementChallengeState)
    public
    onlyDeployer
    notNullAddress(address(newDriipSettlementChallengeState))
    {
        DriipSettlementChallengeState oldDriipSettlementChallengeState = driipSettlementChallengeState;
        driipSettlementChallengeState = newDriipSettlementChallengeState;
        emit SetDriipSettlementChallengeStateEvent(oldDriipSettlementChallengeState, driipSettlementChallengeState);
    }

    /// @notice Set the driip settlement state contract
    /// @param newDriipSettlementState The (address of) DriipSettlementState contract instance
    function setDriipSettlementState(DriipSettlementState newDriipSettlementState)
    public
    onlyDeployer
    notNullAddress(address(newDriipSettlementState))
    {
        DriipSettlementState oldDriipSettlementState = driipSettlementState;
        driipSettlementState = newDriipSettlementState;
        emit SetDriipSettlementStateEvent(oldDriipSettlementState, driipSettlementState);
    }

    /// @notice Set the revenue fund contract
    /// @param newRevenueFund The (address of) RevenueFund contract instance
    function setRevenueFund(RevenueFund newRevenueFund)
    public
    onlyDeployer
    notNullAddress(address(newRevenueFund))
    {
        RevenueFund oldRevenueFund = revenueFund;
        revenueFund = newRevenueFund;
        emit SetRevenueFundEvent(oldRevenueFund, revenueFund);
    }

    /// @notice Set the partner fund contract
    /// @param newPartnerFund The (address of) partner contract instance
    function setPartnerFund(PartnerFund newPartnerFund)
    public
    onlyDeployer
    notNullAddress(address(newPartnerFund))
    {
        PartnerFund oldPartnerFund = partnerFund;
        partnerFund = newPartnerFund;
        emit SetPartnerFundEvent(oldPartnerFund, partnerFund);
    }

    /// @notice Get the count of settlements
    function settlementsCount()
    public
    view
    returns (uint256)
    {
        return driipSettlementState.settlementsCount();
    }

    /// @notice Get the count of settlements for given wallet
    /// @param wallet The address for which to return settlement count
    /// @return count of settlements for the provided wallet
    function settlementsCountByWallet(address wallet)
    public
    view
    returns (uint256)
    {
        return driipSettlementState.settlementsCountByWallet(wallet);
    }

    /// @notice Get settlement of given wallet and index
    /// @param wallet The address for which to return settlement
    /// @param index The wallet's settlement index
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndIndex(address wallet, uint256 index)
    public
    view
    returns (DriipSettlementTypesLib.Settlement memory)
    {
        return driipSettlementState.settlementByWalletAndIndex(wallet, index);
    }

    /// @notice Get settlement of given wallet and wallet nonce
    /// @param wallet The address for which to return settlement
    /// @param nonce The wallet's nonce
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndNonce(address wallet, uint256 nonce)
    public
    view
    returns (DriipSettlementTypesLib.Settlement memory)
    {
        return driipSettlementState.settlementByWalletAndNonce(wallet, nonce);
    }

    /// @notice Settle driip that is a trade
    /// @param trade The trade to be settled
    /// @param standard The standard of the token to be settled (discarded if settling ETH)
    function settleTrade(TradeTypesLib.Trade memory trade, string memory standard)
    public
    {
        // Settle trade
        _settleTrade(msg.sender, trade, standard);

        // Emit event
        emit SettleTradeEvent(msg.sender, trade, standard);
    }

    /// @notice Settle driip that is a trade
    /// @param wallet The wallet whose side of the trade is to be settled
    /// @param trade The trade to be settled
    /// @param standard The standard of the token to be settled (discarded if settling ETH)
    function settleTradeByProxy(address wallet, TradeTypesLib.Trade memory trade, string memory standard)
    public
    onlyOperator
    {
        // Settle trade for wallet
        _settleTrade(wallet, trade, standard);

        // Emit event
        emit SettleTradeByProxyEvent(msg.sender, wallet, trade, standard);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _settleTrade(address wallet, TradeTypesLib.Trade memory trade, string memory standard)
    private
    onlySealedTrade(trade)
    onlyTradeParty(trade, wallet)
    {
        require(
            !fraudChallenge.isFraudulentTradeHash(trade.seal.hash),
            "Trade deemed fraudulent [DriipSettlementByTrade.sol:200]"
        );
        require(
            !communityVote.isDoubleSpenderWallet(wallet),
            "Wallet deemed double spender [DriipSettlementByTrade.sol:204]"
        );

        // Require that wallet is not locked
        require(!walletLocker.isLocked(wallet), "Wallet found locked [DriipSettlementByTrade.sol:210]");

        // Require that the wallet's current driip settlement challenge proposals are defined wrt this trade
        require(
            trade.seal.hash == driipSettlementChallengeState.proposalChallengedHash(wallet, trade.currencies.intended),
            "Trade not challenged in intended currency [DriipSettlementByTrade.sol:213]"
        );
        require(
            trade.seal.hash == driipSettlementChallengeState.proposalChallengedHash(wallet, trade.currencies.conjugate),
            "Trade not challenged in conjugate currency [DriipSettlementByTrade.sol:217]"
        );

        // Extract properties depending on settlement role
        (
        DriipSettlementTypesLib.SettlementRole settlementRole,
        TradeTypesLib.TradeParty memory party
        ) = _getRoleProperties(trade, wallet);

        // Require that driip settlement challenge proposals have been initiated
        require(
            driipSettlementChallengeState.hasProposal(wallet, party.nonce, trade.currencies.intended),
            "No intended proposal found [DriipSettlementByTrade.sol:229]"
        );
        require(
            driipSettlementChallengeState.hasProposal(wallet, party.nonce, trade.currencies.conjugate),
            "No conjugate proposal found [DriipSettlementByTrade.sol:233]"
        );

        // Require that driip settlement challenge proposal have not been terminated already
        require(
            !driipSettlementChallengeState.hasProposalTerminated(wallet, trade.currencies.intended),
            "Intended proposal found terminated [DriipSettlementByTrade.sol:239]"
        );
        require(
            !driipSettlementChallengeState.hasProposalTerminated(wallet, trade.currencies.conjugate),
            "Conjugate proposal found terminated [DriipSettlementByTrade.sol:243]"
        );

        // Require that driip settlement challenge proposals have expired
        require(
            driipSettlementChallengeState.hasProposalExpired(wallet, trade.currencies.intended),
            "Intended proposal found not expired [DriipSettlementByTrade.sol:249]"
        );
        require(
            driipSettlementChallengeState.hasProposalExpired(wallet, trade.currencies.conjugate),
            "Conjugate proposal found not expired [DriipSettlementByTrade.sol:253]"
        );

        // Require that driip settlement challenge proposals qualified
        require(
            SettlementChallengeTypesLib.Status.Qualified == driipSettlementChallengeState.proposalStatus(wallet, trade.currencies.intended),
            "Intended proposal found not qualified [DriipSettlementByTrade.sol:259]"
        );
        require(
            SettlementChallengeTypesLib.Status.Qualified == driipSettlementChallengeState.proposalStatus(wallet, trade.currencies.conjugate),
            "Conjugate proposal found not qualified [DriipSettlementByTrade.sol:263]"
        );

        // Require that operational mode is normal and data is available
        require(configuration.isOperationalModeNormal(), "Not normal operational mode [DriipSettlementByTrade.sol:269]");
        require(communityVote.isDataAvailable(), "Data not available [DriipSettlementByTrade.sol:270]");

        // Init settlement, i.e. create one if no such settlement exists for the double pair of wallets and nonces
        driipSettlementState.initSettlement(
            TradeTypesLib.TRADE_KIND(), trade.seal.hash,
            trade.seller.wallet, trade.seller.nonce,
            trade.buyer.wallet, trade.buyer.nonce
        );

        // If exists settlement of nonce then require that wallet has not already settled
        require(
            !driipSettlementState.isSettlementPartyDone(wallet, party.nonce, settlementRole),
            "Settlement party already done [DriipSettlementByTrade.sol:280]"
        );

        // Set wallet's completion of this trade to prevent the same settlement from being resettled by this wallet
        driipSettlementState.completeSettlement(
            wallet, party.nonce, settlementRole, true
        );

        // If wallet has previously settled balance of the intended currency with higher driip nonce, then don't
        // settle its balance again
        if (driipSettlementState.maxNonceByWalletAndCurrency(wallet, trade.currencies.intended) < party.nonce) {
            // Update settled nonce of wallet and currency
            driipSettlementState.setMaxNonceByWalletAndCurrency(wallet, trade.currencies.intended, party.nonce);

            // Update settled balance
            clientFund.updateSettledBalance(
                wallet, party.balances.intended.current, trade.currencies.intended.ct,
                trade.currencies.intended.id, standard, block.number
            );

            // Stage (stage function assures positive amount only)
            clientFund.stage(
                wallet,
                driipSettlementChallengeState.proposalStageAmount(wallet, trade.currencies.intended),
                trade.currencies.intended.ct, trade.currencies.intended.id, standard
            );
        }

        // If wallet has previously settled balance of the conjugate currency with higher driip nonce, then don't
        // settle its balance again
        if (driipSettlementState.maxNonceByWalletAndCurrency(wallet, trade.currencies.conjugate) < party.nonce) {
            // Update settled nonce of wallet and currency
            driipSettlementState.setMaxNonceByWalletAndCurrency(wallet, trade.currencies.conjugate, party.nonce);

            // Update settled balance
            clientFund.updateSettledBalance(
                wallet, party.balances.conjugate.current, trade.currencies.conjugate.ct,
                trade.currencies.conjugate.id, standard, block.number
            );

            // Stage (stage function assures positive amount only)
            clientFund.stage(
                wallet,
                driipSettlementChallengeState.proposalStageAmount(wallet, trade.currencies.conjugate),
                trade.currencies.conjugate.ct, trade.currencies.conjugate.id, standard
            );
        }

        // Stage fees to revenue fund
        if (address(0) != address(revenueFund))
            _stageFees(wallet, party.fees.total, revenueFund, party.nonce, standard);

        // Remove driip settlement challenge proposals
        driipSettlementChallengeState.terminateProposal(wallet, trade.currencies.intended, false);
        driipSettlementChallengeState.terminateProposal(wallet, trade.currencies.conjugate, false);
    }

    function _getRoleProperties(TradeTypesLib.Trade memory trade, address wallet)
    private
    view
    returns (
        DriipSettlementTypesLib.SettlementRole settlementRole,
        TradeTypesLib.TradeParty memory party
    )
    {
        if (validator.isTradeSeller(trade, wallet)) {
            settlementRole = DriipSettlementTypesLib.SettlementRole.Origin;
            party = trade.seller;

        } else {
            settlementRole = DriipSettlementTypesLib.SettlementRole.Target;
            party = trade.buyer;
        }
    }

    function _stageFees(address wallet, NahmiiTypesLib.OriginFigure[] memory fees,
        Beneficiary protocolBeneficiary, uint256 nonce, string memory standard)
    private
    {
        // For each origin figure...
        for (uint256 i = 0; i < fees.length; i++) {
            // Based on originId determine if this is protocol or partner fee, and if the latter define originId as destination in beneficiary
            (Beneficiary beneficiary, address destination) =
            (0 == fees[i].originId) ? (protocolBeneficiary, address(0)) : (partnerFund, address(fees[i].originId));

            if (driipSettlementState.totalFee(wallet, beneficiary, destination, fees[i].figure.currency).nonce < nonce) {
                // Get the amount previously staged
                int256 deltaAmount = fees[i].figure.amount.sub(driipSettlementState.totalFee(wallet, beneficiary, destination, fees[i].figure.currency).amount);

                // Update fee total
                driipSettlementState.setTotalFee(wallet, beneficiary, destination, fees[i].figure.currency, MonetaryTypesLib.NoncedAmount(nonce, fees[i].figure.amount));

                // Transfer to beneficiary
                clientFund.transferToBeneficiary(
                    destination, beneficiary, deltaAmount, fees[i].figure.currency.ct, fees[i].figure.currency.id, standard
                );

                // Emit event
                emit StageFeesEvent(
                    wallet, deltaAmount, fees[i].figure.amount, fees[i].figure.currency.ct, fees[i].figure.currency.id
                );
            }
        }
    }
}