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
import {Servable} from "./Servable.sol";
import {CommunityVotable} from "./CommunityVotable.sol";
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
contract DriipSettlementState is Ownable, Servable, CommunityVotable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public INIT_SETTLEMENT_ACTION = "init_settlement";
    string constant public SET_SETTLEMENT_ROLE_DONE_ACTION = "set_settlement_role_done";
    string constant public SET_MAX_NONCE_ACTION = "set_max_nonce";
    string constant public SET_MAX_DRIIP_NONCE_ACTION = "set_max_driip_nonce";
    string constant public SET_FEE_TOTAL_ACTION = "set_fee_total";

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    uint256 public maxDriipNonce;

    DriipSettlementTypesLib.Settlement[] public settlements;
    mapping(address => uint256[]) public walletSettlementIndices;
    mapping(address => mapping(uint256 => uint256)) public walletNonceSettlementIndex;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public walletCurrencyMaxNonce;

    mapping(address => mapping(address => mapping(address => mapping(address => mapping(uint256 => MonetaryTypesLib.NoncedAmount))))) public totalFeesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event InitSettlementEvent(DriipSettlementTypesLib.Settlement settlement);
    event SetSettlementRoleDoneEvent(address wallet, uint256 nonce,
        DriipSettlementTypesLib.SettlementRole settlementRole, bool done);
    event SetMaxNonceByWalletAndCurrencyEvent(address wallet, MonetaryTypesLib.Currency currency,
        uint256 maxNonce);
    event SetTotalFeeEvent(address wallet, Beneficiary beneficiary, address destination,
        MonetaryTypesLib.Currency currency, MonetaryTypesLib.NoncedAmount totalFee);

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
    returns (DriipSettlementTypesLib.Settlement)
    {
        require(walletSettlementIndices[wallet].length > index);
        return settlements[walletSettlementIndices[wallet][index] - 1];
    }

    /// @notice Get settlement of given wallet and wallet nonce
    /// @param wallet The address for which to return settlement
    /// @param nonce The wallet's nonce
    /// @return settlement for the provided wallet and index
    function settlementByWalletAndNonce(address wallet, uint256 nonce)
    public
    view
    returns (DriipSettlementTypesLib.Settlement)
    {
        require(0 < walletNonceSettlementIndex[wallet][nonce]);
        return settlements[walletNonceSettlementIndex[wallet][nonce] - 1];
    }

    /// @notice Initialize settlement, i.e. create one if no such settlement exists
    /// for the double pair of wallets and nonces
    /// @param settledType The type of driip of the settlement
    /// @param settledHash The hash of driip of the settlement
    /// @param originWallet The address of the origin wallet
    /// @param originNonce The wallet nonce of the origin wallet
    /// @param targetWallet The address of the target wallet
    /// @param targetNonce The wallet nonce of the target wallet
    function initSettlement(string settledType, bytes32 settledHash, address originWallet,
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
            settlements[index].settledType = settledType;
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

    /// @notice Gauge whether the settlement is done wrt the given settlement role
    /// @param wallet The address of the concerned wallet
    /// @param nonce The nonce of the concerned wallet
    /// @param settlementRole The settlement role
    /// @return True if settlement is done for role, else false
    function isSettlementRoleDone(address wallet, uint256 nonce,
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

        // Return done of settlement role
        if (DriipSettlementTypesLib.SettlementRole.Origin == settlementRole)
            return settlements[index - 1].origin.done;
        else // DriipSettlementTypesLib.SettlementRole.Target == settlementRole
            return settlements[index - 1].target.done;
    }

    /// @notice Set the done of the given settlement role in the given settlement
    /// @param wallet The address of the concerned wallet
    /// @param nonce The nonce of the concerned wallet
    /// @param settlementRole The settlement role
    /// @param done The done flag
    function setSettlementRoleDone(address wallet, uint256 nonce,
        DriipSettlementTypesLib.SettlementRole settlementRole, bool done)
    public
    onlyEnabledServiceAction(SET_SETTLEMENT_ROLE_DONE_ACTION)
    {
        // Get the 1-based index of the settlement
        uint256 index = walletNonceSettlementIndex[wallet][nonce];

        // Require the existence of settlement
        require(0 != index);

        // Update the settlement role done value
        if (DriipSettlementTypesLib.SettlementRole.Origin == settlementRole)
            settlements[index - 1].origin.done = done;
        else // DriipSettlementTypesLib.SettlementRole.Target == settlementRole
            settlements[index - 1].target.done = done;

        // Emit event
        emit SetSettlementRoleDoneEvent(wallet, nonce, settlementRole, done);
    }

    /// @notice Get the max nonce of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currency The concerned currency
    /// @return The max nonce
    function maxNonceByWalletAndCurrency(address wallet, MonetaryTypesLib.Currency currency)
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
    function setMaxNonceByWalletAndCurrency(address wallet, MonetaryTypesLib.Currency currency,
        uint256 maxNonce)
    public
    onlyEnabledServiceAction(SET_MAX_NONCE_ACTION)
    {
        // Update max nonce value
        walletCurrencyMaxNonce[wallet][currency.ct][currency.id] = maxNonce;

        // Emit event
        emit SetMaxNonceByWalletAndCurrencyEvent(wallet, currency, maxNonce);
    }

    /// @notice Set the max (driip) nonce
    /// @param _maxDriipNonce The max nonce
    function setMaxDriipNonce(uint256 _maxDriipNonce)
    public
    onlyEnabledServiceAction(SET_MAX_DRIIP_NONCE_ACTION)
    {
        maxDriipNonce = _maxDriipNonce;
    }

    /// @notice Update the max driip nonce property from CommunityVote contract
    function updateMaxDriipNonce()
    public
    {
        uint256 _maxDriipNonce = communityVote.getMaxDriipNonce();
        if (_maxDriipNonce > 0) {
            maxDriipNonce = _maxDriipNonce;
        }
    }

    /// @notice Get the total fee payed by the given wallet to the given beneficiary and destination
    /// in the given currency
    /// @param wallet The address of the concerned wallet
    /// @param beneficiary The concerned beneficiary
    /// @param destination The concerned destination
    /// @param currency The concerned currency
    /// @return The total fee
    function totalFee(address wallet, Beneficiary beneficiary, address destination,
        MonetaryTypesLib.Currency currency)
    public
    view
    returns (MonetaryTypesLib.NoncedAmount)
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
        MonetaryTypesLib.Currency currency, MonetaryTypesLib.NoncedAmount _totalFee)
    public
    onlyEnabledServiceAction(SET_FEE_TOTAL_ACTION)
    {
        // Update total fees value
        totalFeesMap[wallet][address(beneficiary)][destination][currency.ct][currency.id] = _totalFee;

        // Emit event
        emit SetTotalFeeEvent(wallet, beneficiary, destination, currency, _totalFee);
    }
}