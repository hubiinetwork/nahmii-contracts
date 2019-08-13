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
import {Servable} from "./Servable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
import {Upgradable} from "./Upgradable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {PartnerFund} from "./PartnerFund.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {NahmiiTypesLib} from "./NahmiiTypesLib.sol";
import {DriipSettlementTypesLib} from "./DriipSettlementTypesLib.sol";

/**
 * @title DriipSettlementState
 * @notice Where driip settlement state is managed
 */
contract DriipSettlementState is Ownable, Servable, CommunityVotable, Upgradable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public INIT_SETTLEMENT_ACTION = "init_settlement";
    string constant public COMPLETE_SETTLEMENT_ACTION = "complete_settlement";
    string constant public SET_MAX_NONCE_ACTION = "set_max_nonce";
    string constant public ADD_SETTLED_AMOUNT_ACTION = "add_settled_amount";
    string constant public SET_TOTAL_FEE_ACTION = "set_total_fee";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public maxDriipNonce;

    DriipSettlementTypesLib.Settlement[] public settlements;
    mapping(address => uint256[]) public walletSettlementIndices;
    mapping(address => mapping(uint256 => uint256)) public walletNonceSettlementIndex;

    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxNonce;

    mapping(address => mapping(address => mapping(uint256 => mapping(uint256 => int256)))) public walletCurrencyBlockNumberSettledAmount;
    mapping(address => mapping(address => mapping(uint256 => uint256[]))) public walletCurrencySettledBlockNumbers;

    mapping(address => mapping(address => mapping(address => mapping(address => mapping(uint256 => MonetaryTypesLib.NoncedAmount))))) public totalFeesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event InitSettlementEvent(DriipSettlementTypesLib.Settlement settlement);
    event CompleteSettlementPartyEvent(address wallet, uint256 nonce, DriipSettlementTypesLib.SettlementRole settlementRole,
        uint256 doneBlockNumber);
    event SetMaxDriipNonceEvent(uint256 maxDriipNonce);
    event UpdateMaxDriipNonceFromCommunityVoteEvent(uint256 maxDriipNonce);
    event SetMaxNonceByWalletAndCurrencyEvent(address wallet, MonetaryTypesLib.Currency currency,
        uint256 maxNonce);
    event AddSettledAmountEvent(address wallet, int256 amount, MonetaryTypesLib.Currency currency,
        uint256 blockNumber);
    event SetTotalFeeEvent(address wallet, Beneficiary beneficiary, address destination,
        MonetaryTypesLib.Currency currency, MonetaryTypesLib.NoncedAmount totalFee);
    event UpgradeSettlementEvent(DriipSettlementTypesLib.Settlement settlement);
    event UpgradeSettledAmountEvent(address wallet, int256 amount, MonetaryTypesLib.Currency currency,
        uint256 blockNumber);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Get the count of settlements
    function settlementsCount()
    public
    view
    returns (uint256)
    {
        return settlements.length;
    }

    /// @notice Get the count of settlements for given wallet
    /// @param wallet The address for which to return settlement count
    /// @return count of settlements for the provided wallet
    function settlementsCountByWallet(address wallet)
    public
    view
    returns (uint256)
    {
        return walletSettlementIndices[wallet].length;
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
        require(walletSettlementIndices[wallet].length > index, "Index out of bounds [DriipSettlementState.sol:114]");
        return settlements[walletSettlementIndices[wallet][index] - 1];
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
        require(0 != walletNonceSettlementIndex[wallet][nonce], "No settlement found for wallet and nonce [DriipSettlementState.sol:127]");
        return settlements[walletNonceSettlementIndex[wallet][nonce] - 1];
    }

    /// @notice Initialize settlement, i.e. create one if no such settlement exists
    /// for the double pair of wallets and nonces
    /// @param settledKind The kind of driip of the settlement
    /// @param settledHash The hash of driip of the settlement
    /// @param originWallet The address of the origin wallet
    /// @param originNonce The wallet nonce of the origin wallet
    /// @param targetWallet The address of the target wallet
    /// @param targetNonce The wallet nonce of the target wallet
    function initSettlement(string memory settledKind, bytes32 settledHash, address originWallet,
        uint256 originNonce, address targetWallet, uint256 targetNonce)
    public
    onlyEnabledServiceAction(INIT_SETTLEMENT_ACTION)
    {
        if (
            0 == walletNonceSettlementIndex[originWallet][originNonce] &&
            0 == walletNonceSettlementIndex[targetWallet][targetNonce]
        ) {
            // Create new settlement
            settlements.length++;

            // Get the 0-based index
            uint256 index = settlements.length - 1;

            // Update settlement
            settlements[index].settledKind = settledKind;
            settlements[index].settledHash = settledHash;
            settlements[index].origin.nonce = originNonce;
            settlements[index].origin.wallet = originWallet;
            settlements[index].target.nonce = targetNonce;
            settlements[index].target.wallet = targetWallet;

            // Emit event
            emit InitSettlementEvent(settlements[index]);

            // Store 1-based index value
            index++;
            walletSettlementIndices[originWallet].push(index);
            walletSettlementIndices[targetWallet].push(index);
            walletNonceSettlementIndex[originWallet][originNonce] = index;
            walletNonceSettlementIndex[targetWallet][targetNonce] = index;
        }
    }

    /// @notice Set the done of the given settlement role in the given settlement
    /// @param wallet The address of the concerned wallet
    /// @param nonce The nonce of the concerned wallet
    /// @param settlementRole The settlement role
    /// @param done The done flag
    function completeSettlement(address wallet, uint256 nonce,
        DriipSettlementTypesLib.SettlementRole settlementRole, bool done)
    public
    onlyEnabledServiceAction(COMPLETE_SETTLEMENT_ACTION)
    {
        // Get the 1-based index of the settlement
        uint256 index = walletNonceSettlementIndex[wallet][nonce];

        // Require the existence of settlement
        require(0 != index, "No settlement found for wallet and nonce [DriipSettlementState.sol:188]");

        // Get the settlement party
        DriipSettlementTypesLib.SettlementParty storage party =
        DriipSettlementTypesLib.SettlementRole.Origin == settlementRole ?
        settlements[index - 1].origin :
        settlements[index - 1].target;

        // Update party done block number
        party.doneBlockNumber = done ? block.number : 0;

        // Emit event
        emit CompleteSettlementPartyEvent(wallet, nonce, settlementRole, party.doneBlockNumber);
    }

    /// @notice Gauge whether the settlement is done wrt the given wallet and nonce
    /// @param wallet The address of the concerned wallet
    /// @param nonce The nonce of the concerned wallet
    /// @return True if settlement is done for role, else false
    function isSettlementPartyDone(address wallet, uint256 nonce)
    public
    view
    returns (bool)
    {
        // Get the 1-based index of the settlement
        uint256 index = walletNonceSettlementIndex[wallet][nonce];

        // Return false if settlement does not exist
        if (0 == index)
            return false;

        // Return done status
        return (
        wallet == settlements[index - 1].origin.wallet ?
        0 != settlements[index - 1].origin.doneBlockNumber :
        0 != settlements[index - 1].target.doneBlockNumber
        );
    }

    /// @notice Gauge whether the settlement is done wrt the given wallet, nonce
    /// and settlement role
    /// @param wallet The address of the concerned wallet
    /// @param nonce The nonce of the concerned wallet
    /// @param settlementRole The settlement role
    /// @return True if settlement is done for role, else false
    function isSettlementPartyDone(address wallet, uint256 nonce,
        DriipSettlementTypesLib.SettlementRole settlementRole)
    public
    view
    returns (bool)
    {
        // Get the 1-based index of the settlement
        uint256 index = walletNonceSettlementIndex[wallet][nonce];

        // Return false if settlement does not exist
        if (0 == index)
            return false;

        // Get the settlement party
        DriipSettlementTypesLib.SettlementParty storage settlementParty =
        DriipSettlementTypesLib.SettlementRole.Origin == settlementRole ?
        settlements[index - 1].origin : settlements[index - 1].target;

        // Require that wallet is party of the right role
        require(wallet == settlementParty.wallet, "Wallet has wrong settlement role [DriipSettlementState.sol:252]");

        // Return done status
        return 0 != settlementParty.doneBlockNumber;
    }

    /// @notice Get the done block number of the settlement party with the given wallet and nonce
    /// @param wallet The address of the concerned wallet
    /// @param nonce The nonce of the concerned wallet
    /// @return The done block number of the settlement wrt the given settlement role
    function settlementPartyDoneBlockNumber(address wallet, uint256 nonce)
    public
    view
    returns (uint256)
    {
        // Get the 1-based index of the settlement
        uint256 index = walletNonceSettlementIndex[wallet][nonce];

        // Require the existence of settlement
        require(0 != index, "No settlement found for wallet and nonce [DriipSettlementState.sol:271]");

        // Return done block number
        return (
        wallet == settlements[index - 1].origin.wallet ?
        settlements[index - 1].origin.doneBlockNumber :
        settlements[index - 1].target.doneBlockNumber
        );
    }

    /// @notice Get the done block number of the settlement party with the given wallet, nonce and settlement role
    /// @param wallet The address of the concerned wallet
    /// @param nonce The nonce of the concerned wallet
    /// @param settlementRole The settlement role
    /// @return The done block number of the settlement wrt the given settlement role
    function settlementPartyDoneBlockNumber(address wallet, uint256 nonce,
        DriipSettlementTypesLib.SettlementRole settlementRole)
    public
    view
    returns (uint256)
    {
        // Get the 1-based index of the settlement
        uint256 index = walletNonceSettlementIndex[wallet][nonce];

        // Require the existence of settlement
        require(0 != index, "No settlement found for wallet and nonce [DriipSettlementState.sol:296]");

        // Get the settlement party
        DriipSettlementTypesLib.SettlementParty storage settlementParty =
        DriipSettlementTypesLib.SettlementRole.Origin == settlementRole ?
        settlements[index - 1].origin : settlements[index - 1].target;

        // Require that wallet is party of the right role
        require(wallet == settlementParty.wallet, "Wallet has wrong settlement role [DriipSettlementState.sol:304]");

        // Return done block number
        return settlementParty.doneBlockNumber;
    }

    /// @notice Set the max (driip) nonce
    /// @param _maxDriipNonce The max nonce
    function setMaxDriipNonce(uint256 _maxDriipNonce)
    public
    onlyEnabledServiceAction(SET_MAX_NONCE_ACTION)
    {
        maxDriipNonce = _maxDriipNonce;

        // Emit event
        emit SetMaxDriipNonceEvent(maxDriipNonce);
    }

    /// @notice Update the max driip nonce property from CommunityVote contract
    function updateMaxDriipNonceFromCommunityVote()
    public
    {
        uint256 _maxDriipNonce = communityVote.getMaxDriipNonce();
        if (0 == _maxDriipNonce)
            return;

        maxDriipNonce = _maxDriipNonce;

        // Emit event
        emit UpdateMaxDriipNonceFromCommunityVoteEvent(maxDriipNonce);
    }

    /// @notice Get the max nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The max nonce
    function maxNonceByWalletAndCurrency(address wallet, MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (uint256)
    {
        return walletCurrencyMaxNonce[wallet][currency.ct][currency.id];
    }

    /// @notice Set the max nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @param maxNonce The max nonce
    function setMaxNonceByWalletAndCurrency(address wallet, MonetaryTypesLib.Currency memory currency,
        uint256 maxNonce)
    public
    onlyEnabledServiceAction(SET_MAX_NONCE_ACTION)
    {
        // Update max nonce value
        walletCurrencyMaxNonce[wallet][currency.ct][currency.id] = maxNonce;

        // Emit event
        emit SetMaxNonceByWalletAndCurrencyEvent(wallet, currency, maxNonce);
    }

    /// @notice Get the value of settled amount at the given block number
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @param blockNumber The concerned block number
    function settledAmountByBlockNumber(address wallet, MonetaryTypesLib.Currency memory currency,
        uint256 blockNumber)
    public
    view
    returns (int256)
    {
        uint256 settledBlockNumber = _walletSettledBlockNumber(wallet, currency, blockNumber);
        return walletCurrencyBlockNumberSettledAmount[wallet][currency.ct][currency.id][settledBlockNumber];
    }

    /// @notice Add to the settled amount at the given block number
    /// @param wallet The address of the concerned wallet
    /// @param amount The new settled amount
    /// @param currency The concerned currency
    /// @param blockNumber The concerned block number
    function addSettledAmountByBlockNumber(address wallet, int256 amount, MonetaryTypesLib.Currency memory currency,
        uint256 blockNumber)
    public
    onlyEnabledServiceAction(ADD_SETTLED_AMOUNT_ACTION)
    {
        // Get the current settled block number
        uint256 settledBlockNumber = _walletSettledBlockNumber(wallet, currency, blockNumber);

        // Add to the settled amount for the found settled block number
        walletCurrencyBlockNumberSettledAmount[wallet][currency.ct][currency.id][settledBlockNumber] =
        walletCurrencyBlockNumberSettledAmount[wallet][currency.ct][currency.id][settledBlockNumber].add(amount);

        // Add the current block number to the set of settled block numbers
        walletCurrencySettledBlockNumbers[wallet][currency.ct][currency.id].push(block.number);

        // Emit event
        emit AddSettledAmountEvent(wallet, amount, currency, blockNumber);
    }

    /// @notice Get the total fee payed by the given wallet to the given beneficiary and destination
    /// in the given currency
    /// @param wallet The address of the concerned wallet
    /// @param beneficiary The concerned beneficiary
    /// @param destination The concerned destination
    /// @param currency The concerned currency
    /// @return The total fee
    function totalFee(address wallet, Beneficiary beneficiary, address destination,
        MonetaryTypesLib.Currency memory currency)
    public
    view
    returns (MonetaryTypesLib.NoncedAmount memory)
    {
        return totalFeesMap[wallet][address(beneficiary)][destination][currency.ct][currency.id];
    }

    /// @notice Set the total fee payed by the given wallet to the given beneficiary and destination
    /// in the given currency
    /// @param wallet The address of the concerned wallet
    /// @param beneficiary The concerned beneficiary
    /// @param destination The concerned destination
    /// @param _totalFee The total fee
    function setTotalFee(address wallet, Beneficiary beneficiary, address destination,
        MonetaryTypesLib.Currency memory currency, MonetaryTypesLib.NoncedAmount memory _totalFee)
    public
    onlyEnabledServiceAction(SET_TOTAL_FEE_ACTION)
    {
        // Update total fees value
        totalFeesMap[wallet][address(beneficiary)][destination][currency.ct][currency.id] = _totalFee;

        // Emit event
        emit SetTotalFeeEvent(wallet, beneficiary, destination, currency, _totalFee);
    }

    /// @notice Upgrade settlement
    /// @param settlement The concerned settlement
    function upgradeSettlement(DriipSettlementTypesLib.Settlement memory settlement)
    public
    onlyWhenUpgrading
    {
        // Require that settlement has not been initialized/upgraded already
        require(
            0 == walletNonceSettlementIndex[settlement.origin.wallet][settlement.origin.nonce],
            "Settlement exists for origin wallet and nonce [DriipSettlementState.sol:443]"
        );
        require(
            0 == walletNonceSettlementIndex[settlement.target.wallet][settlement.target.nonce],
            "Settlement exists for target wallet and nonce [DriipSettlementState.sol:447]"
        );

        // Push the settlement
        settlements.push(settlement);

        // Get the 1-based index
        uint256 index = settlements.length;

        // Update indices
        walletSettlementIndices[settlement.origin.wallet].push(index);
        walletSettlementIndices[settlement.target.wallet].push(index);
        walletNonceSettlementIndex[settlement.origin.wallet][settlement.origin.nonce] = index;
        walletNonceSettlementIndex[settlement.target.wallet][settlement.target.nonce] = index;

        // Emit event
        emit UpgradeSettlementEvent(settlement);
    }

    /// @notice Upgrade settled amount
    /// @param wallet The address of the concerned wallet
    /// @param amount The new settled amount
    /// @param currency The concerned currency
    /// @param blockNumber The concerned block number
    function upgradeSettledAmount(address wallet, int256 amount, MonetaryTypesLib.Currency memory currency,
        uint256 blockNumber)
    public
    onlyWhenUpgrading
    {
        // Require that settlement amount has not been initialized/upgraded already
        require(0 == walletCurrencyBlockNumberSettledAmount[wallet][currency.ct][currency.id][blockNumber], "[DriipSettlementState.sol:479]");

        // Upgrade the settled amount
        walletCurrencyBlockNumberSettledAmount[wallet][currency.ct][currency.id][blockNumber] = amount;

        // Add the block number to the set of settled block numbers
        walletCurrencySettledBlockNumbers[wallet][currency.ct][currency.id].push(blockNumber);

        // Emit event
        emit UpgradeSettledAmountEvent(wallet, amount, currency, blockNumber);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _walletSettledBlockNumber(address wallet, MonetaryTypesLib.Currency memory currency,
        uint256 blockNumber)
    private
    view
    returns (uint256)
    {
        for (uint256 i = walletCurrencySettledBlockNumbers[wallet][currency.ct][currency.id].length; i > 0; i--)
            if (walletCurrencySettledBlockNumbers[wallet][currency.ct][currency.id][i - 1] <= blockNumber)
                return walletCurrencySettledBlockNumbers[wallet][currency.ct][currency.id][i - 1];
        return 0;
    }
}