/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {Ownable} from "./Ownable.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {TransferController} from "./TransferController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {StringsLib} from "./StringsLib.sol";

/**
@title PartnerFund
@notice XXXX
*/
contract PartnerFund is Ownable, Beneficiary, TransferControllerManageable {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using SafeMathIntLib for int256;
    using StringsLib for string;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Partner {
        bytes32 nameHash;

        uint256 fee;
        address wallet;
        uint256 index;

        bool operatorCanUpdate;
        bool partnerCanUpdate;

        BalanceLib.Balance active;
        BalanceLib.Balance staged;

        TxHistoryLib.TxHistory txHistory;
        FullBalanceHistory[] fullBalanceHistory;
    }

    struct FullBalanceHistory {
        uint256 listIndex;
        int256 balance;
        uint256 blockNumber;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Partner[] private partners;

    mapping(bytes32 => uint256) private _indexByNameHash;
    mapping(address => uint256) private _indexByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ReceiveEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event RegisterPartnerByNameEvent(string name, uint256 fee, address wallet);
    event RegisterPartnerByNameHashEvent(bytes32 nameHash, uint256 fee, address wallet);
    event SetFeeByIndexEvent(uint256 index, uint256 fee);
    event SetFeeByNameEvent(string name, uint256 fee);
    event SetFeeByNameHashEvent(bytes32 nameHash, uint256 fee);
    event SetFeeByWalletEvent(address wallet, uint256 fee);
    event SetPartnerWalletByIndexEvent(uint256 index, address oldWallet, address newWallet);
    event SetPartnerWalletByNameEvent(string name, address oldWallet, address newWallet);
    event SetPartnerWalletByNameHashEvent(bytes32 nameHash, address oldWallet, address newWallet);
    event SetPartnerWalletByWalletEvent(address oldWallet, address newWallet);
    event StageEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event WithdrawEvent(address to, int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    function() public payable {
        _receiveEthersTo(
            indexByWallet(msg.sender) - 1, SafeMathIntLib.toNonZeroInt256(msg.value)
        );
    }

    function receiveEthersTo(address tag, string)
    public
    payable
    {
        _receiveEthersTo(
            uint256(tag) - 1, SafeMathIntLib.toNonZeroInt256(msg.value)
        );
    }

    function receiveTokens(string, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        _receiveTokensTo(
            indexByWallet(msg.sender) - 1, amount, currencyCt, currencyId, standard
        );
    }

    function receiveTokensTo(address tag, string, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        _receiveTokensTo(
            uint256(tag) - 1, amount, currencyCt, currencyId, standard
        );
    }

    function hashName(string name)
    public
    pure
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(name.upper()));
    }

    function depositByIndices(uint256 partnerIndex, uint256 depositIndex)
    public
    view
    returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        // Require partner index is one of registered partner
        require(0 < partnerIndex && partnerIndex <= partners.length);

        return _depositByIndices(partnerIndex - 1, depositIndex);
    }

    function depositByName(string name, uint depositIndex)
    public
    view
    returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        // Implicitly require that partner name is registered
        return _depositByIndices(indexByName(name) - 1, depositIndex);
    }

    function depositByNameHash(bytes32 nameHash, uint depositIndex)
    public
    view
    returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        // Implicitly require that partner name hash is registered
        return _depositByIndices(indexByNameHash(nameHash) - 1, depositIndex);
    }

    function depositByWallet(address wallet, uint depositIndex)
    public
    view
    returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        // Implicitly require that partner wallet is registered
        return _depositByIndices(indexByWallet(wallet) - 1, depositIndex);
    }

    function depositsCountByIndex(uint256 index)
    public
    view
    returns (uint256)
    {
        // Require partner index is one of registered partner
        require(0 < index && index <= partners.length);

        return _depositsCountByIndex(index - 1);
    }

    function depositsCountByName(string name)
    public
    view
    returns (uint256)
    {
        // Implicitly require that partner name is registered
        return _depositsCountByIndex(indexByName(name) - 1);
    }

    function depositsCountByNameHash(bytes32 nameHash)
    public
    view
    returns (uint256)
    {
        // Implicitly require that partner name hash is registered
        return _depositsCountByIndex(indexByNameHash(nameHash) - 1);
    }

    function depositsCountByWallet(address wallet)
    public
    view
    returns (uint256)
    {
        // Implicitly require that partner wallet is registered
        return _depositsCountByIndex(indexByWallet(wallet) - 1);
    }

    function activeBalanceByIndex(uint256 index, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Require partner index is one of registered partner
        require(0 < index && index <= partners.length);

        return _activeBalanceByIndex(index - 1, currencyCt, currencyId);
    }

    function activeBalanceByName(string name, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Implicitly require that partner name is registered
        return _activeBalanceByIndex(indexByName(name) - 1, currencyCt, currencyId);
    }

    function activeBalanceByNameHash(bytes32 nameHash, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Implicitly require that partner name hash is registered
        return _activeBalanceByIndex(indexByNameHash(nameHash) - 1, currencyCt, currencyId);
    }

    function activeBalanceByWallet(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Implicitly require that partner wallet is registered
        return _activeBalanceByIndex(indexByWallet(wallet) - 1, currencyCt, currencyId);
    }

    function stagedBalanceByIndex(uint256 index, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Require partner index is one of registered partner
        require(0 < index && index <= partners.length);

        return _stagedBalanceByIndex(index - 1, currencyCt, currencyId);
    }

    function stagedBalanceByName(string name, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Implicitly require that partner name is registered
        return _stagedBalanceByIndex(indexByName(name) - 1, currencyCt, currencyId);
    }

    function stagedBalanceByNameHash(bytes32 nameHash, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Implicitly require that partner name is registered
        return _stagedBalanceByIndex(indexByNameHash(nameHash) - 1, currencyCt, currencyId);
    }

    function stagedBalanceByWallet(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Implicitly require that partner wallet is registered
        return _stagedBalanceByIndex(indexByWallet(wallet) - 1, currencyCt, currencyId);
    }

    function partnersCount()
    public
    view
    returns (uint256)
    {
        return partners.length;
    }

    function registerByName(string name, uint256 fee, address wallet,
        bool partnerCanUpdate, bool operatorCanUpdate)
    public
    onlyOperator
    {
        // Require not empty name string
        require(bytes(name).length > 0);

        // Hash name
        bytes32 nameHash = hashName(name);

        // Register partner
        _registerPartnerByNameHash(nameHash, fee, wallet, partnerCanUpdate, operatorCanUpdate);

        // Emit event
        emit RegisterPartnerByNameEvent(name, fee, wallet);
    }

    function registerByNameHash(bytes32 nameHash, uint256 fee, address wallet,
        bool partnerCanUpdate, bool operatorCanUpdate)
    public
    onlyOperator
    {
        // Register partner
        _registerPartnerByNameHash(nameHash, fee, wallet, partnerCanUpdate, operatorCanUpdate);

        // Emit event
        emit RegisterPartnerByNameHashEvent(nameHash, fee, wallet);
    }

    /// @notice Gets the 1-based index of partner by its name
    /// @dev Reverts if name does not correspond to registered partner
    /// @return Index of partner by given name
    function indexByNameHash(bytes32 nameHash)
    public
    view
    returns (uint256)
    {
        uint256 index = _indexByNameHash[nameHash];
        require(0 < index);
        return index;
    }

    /// @notice Gets the 1-based index of partner by its name
    /// @dev Reverts if name does not correspond to registered partner
    /// @return Index of partner by given name
    function indexByName(string name)
    public
    view
    returns (uint256)
    {
        return indexByNameHash(hashName(name));
    }

    /// @notice Gets the 1-based index of partner by its wallet
    /// @dev Reverts if wallet does not correspond to registered partner
    /// @return Index of partner by given wallet
    function indexByWallet(address wallet)
    public
    view
    returns (uint256)
    {
        uint256 index = _indexByWallet[wallet];
        require(0 < index);
        return index;
    }

    function isRegisteredByName(string name)
    public
    view
    returns (bool)
    {
        return (0 < _indexByNameHash[hashName(name)]);
    }

    function isRegisteredByNameHash(bytes32 nameHash)
    public
    view
    returns (bool)
    {
        return (0 < _indexByNameHash[nameHash]);
    }

    function isRegisteredByWallet(address wallet)
    public
    view
    returns (bool)
    {
        return (0 < _indexByWallet[wallet]);
    }

    /// @dev Reverts if name does not correspond to registered partner
    function feeByIndex(uint256 index)
    public
    view
    returns (uint256)
    {
        // Require partner index is one of registered partner
        require(0 < index && index <= partners.length);

        return _partnerFeeByIndex(index - 1);
    }

    /// @dev Reverts if name does not correspond to registered partner
    function feeByName(string name)
    public
    view
    returns (uint256)
    {
        // Get fee, implicitly requiring that partner name is registered
        return _partnerFeeByIndex(indexByName(name) - 1);
    }

    /// @dev Reverts if name hash does not correspond to registered partner
    function feeByNameHash(bytes32 nameHash)
    public
    view
    returns (uint256)
    {
        // Get fee, implicitly requiring that partner name hash is registered
        return _partnerFeeByIndex(indexByNameHash(nameHash) - 1);
    }

    /// @dev Reverts if name does not correspond to registered partner
    function feeByWallet(address wallet)
    public
    view
    returns (uint256)
    {
        // Get fee, implicitly requiring that partner wallet is registered
        return _partnerFeeByIndex(indexByWallet(wallet) - 1);
    }

    /// @dev index is 1-based
    function setFeeByIndex(uint256 index, uint256 fee)
    public
    {
        // Require partner index is one of registered partner
        require(0 < index && index <= partners.length);

        // Update fee
        _setPartnerFeeByIndex(index - 1, fee);

        // Emit event
        emit SetFeeByIndexEvent(index, fee);
    }

    function setFeeByName(string name, uint256 fee)
    public
    {
        // Update fee, implicitly requiring that partner name is registered
        _setPartnerFeeByIndex(indexByName(name) - 1, fee);

        // Emit event
        emit SetFeeByNameEvent(name, fee);
    }

    function setFeeByNameHash(bytes32 nameHash, uint256 fee)
    public
    {
        // Update fee, implicitly requiring that partner name hash is registered
        _setPartnerFeeByIndex(indexByNameHash(nameHash) - 1, fee);

        // Emit event
        emit SetFeeByNameHashEvent(nameHash, fee);
    }

    function setFeeByWallet(address wallet, uint256 fee)
    public
    {
        // Update fee, implicitly requiring that partner wallet is registered
        _setPartnerFeeByIndex(indexByWallet(wallet) - 1, fee);

        // Emit event
        emit SetFeeByWalletEvent(wallet, fee);
    }

    /// @dev Reverts if index does not correspond to registered partner
    function walletByIndex(uint256 index)
    public
    view
    returns (address)
    {
        // Require partner index is one of registered partner
        require(0 < index && index <= partners.length);

        return partners[index - 1].wallet;
    }

    /// @dev Reverts if name does not correspond to registered partner
    function walletByName(string name)
    public
    view
    returns (address)
    {
        // Get wallet, implicitly requiring that partner name is registered
        return partners[indexByName(name) - 1].wallet;
    }

    /// @dev Reverts if name hash does not correspond to registered partner
    function walletByNameHash(bytes32 nameHash)
    public
    view
    returns (address)
    {
        // Get wallet, implicitly requiring that partner name hash is registered
        return partners[indexByNameHash(nameHash) - 1].wallet;
    }

    function setWalletByIndex(uint256 index, address newWallet)
    public
    {
        // Require partner index is one of registered partner
        require(0 < index && index <= partners.length);

        // Update wallet
        address oldWallet = _setPartnerWalletByIndex(index - 1, newWallet);

        // Emit event
        emit SetPartnerWalletByIndexEvent(index, oldWallet, newWallet);
    }

    /// @dev Reverts if name does not correspond to registered partner
    function setWalletByName(string name, address newWallet)
    public
    {
        // Update wallet
        address oldWallet = _setPartnerWalletByIndex(indexByName(name) - 1, newWallet);

        // Emit event
        emit SetPartnerWalletByNameEvent(name, oldWallet, newWallet);
    }

    /// @dev Reverts if name hash does not correspond to registered partner
    function setWalletByNameHash(bytes32 nameHash, address newWallet)
    public
    {
        // Update wallet
        address oldWallet = _setPartnerWalletByIndex(indexByNameHash(nameHash) - 1, newWallet);

        // Emit event
        emit SetPartnerWalletByNameHashEvent(nameHash, oldWallet, newWallet);
    }

    /// @dev Reverts if old wallet hash does not correspond to registered partner
    function setWalletByWallet(address oldWallet, address newWallet)
    public
    {
        // Update wallet
        _setPartnerWalletByIndex(indexByWallet(oldWallet) - 1, newWallet);

        // Emit event
        emit SetPartnerWalletByWalletEvent(oldWallet, newWallet);
    }

    function stage(int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        // Get index, implicitly requiring that msg.sender is wallet of registered partner
        uint256 index = indexByWallet(msg.sender);

        // Require positive amount
        require(amount.isPositiveInt256());

        // Clamp amount to move
        amount = amount.clampMax(partners[index - 1].active.get(currencyCt, currencyId));

        partners[index - 1].active.sub(amount, currencyCt, currencyId);
        partners[index - 1].staged.add(amount, currencyCt, currencyId);

        partners[index - 1].txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add to full deposit history
        partners[index - 1].fullBalanceHistory.push(
            FullBalanceHistory(
                partners[index - 1].txHistory.depositsCount() - 1,
                partners[index - 1].active.get(currencyCt, currencyId),
                block.number
            )
        );

        // Emit event
        emit StageEvent(msg.sender, amount, currencyCt, currencyId);
    }

    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        // Get index, implicitly requiring that msg.sender is wallet of registered partner
        uint256 index = indexByWallet(msg.sender);

        // Require positive amount
        require(amount.isPositiveInt256());

        // Clamp amount to move
        amount = amount.clampMax(partners[index - 1].staged.get(currencyCt, currencyId));

        partners[index - 1].staged.sub(amount, currencyCt, currencyId);

        // Execute transfer
        if (currencyCt == address(0))
            msg.sender.transfer(uint256(amount));

        else {
            TransferController controller = transferController(currencyCt, standard);
            require(address(controller).delegatecall(
                    controller.getDispatchSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId)
            );
        }

        // Emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @dev index is 0-based
    function _receiveEthersTo(uint256 index, int256 amount)
    private
    {
        // Require that index is within bounds
        require(index < partners.length);

        // Add to active
        partners[index].active.add(amount, address(0), 0);
        partners[index].txHistory.addDeposit(amount, address(0), 0);

        // Add to full deposit history
        partners[index].fullBalanceHistory.push(
            FullBalanceHistory(
                partners[index].txHistory.depositsCount() - 1,
                partners[index].active.get(address(0), 0),
                block.number
            )
        );

        // Emit event
        emit ReceiveEvent(msg.sender, amount, address(0), 0);
    }

    /// @dev index is 0-based
    function _receiveTokensTo(uint256 index, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    private
    {
        // Require that index is within bounds
        require(index < partners.length);

        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = transferController(currencyCt, standard);
        require(address(controller).delegatecall(
                controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId)
        );

        // Add to active
        partners[index].active.add(amount, currencyCt, currencyId);
        partners[index].txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add to full deposit history
        partners[index].fullBalanceHistory.push(
            FullBalanceHistory(
                partners[index].txHistory.depositsCount() - 1,
                partners[index].active.get(currencyCt, currencyId),
                block.number
            )
        );

        // Emit event
        emit ReceiveEvent(msg.sender, amount, currencyCt, currencyId);
    }

    /// @dev partnerIndex is 0-based
    function _depositByIndices(uint256 partnerIndex, uint256 depositIndex)
    private
    view
    returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        require(depositIndex < partners[partnerIndex].fullBalanceHistory.length);

        FullBalanceHistory storage entry = partners[partnerIndex].fullBalanceHistory[depositIndex];
        (,, currencyCt, currencyId) = partners[partnerIndex].txHistory.deposit(entry.listIndex);

        balance = entry.balance;
        blockNumber = entry.blockNumber;
    }

    /// @dev index is 0-based
    function _depositsCountByIndex(uint256 index)
    private
    view
    returns (uint256)
    {
        return partners[index].fullBalanceHistory.length;
    }

    /// @dev index is 0-based
    function _activeBalanceByIndex(uint256 index, address currencyCt, uint256 currencyId)
    private
    view
    returns (int256)
    {
        return partners[index].active.get(currencyCt, currencyId);
    }

    /// @dev index is 0-based
    function _stagedBalanceByIndex(uint256 index, address currencyCt, uint256 currencyId)
    private
    view
    returns (int256)
    {
        return partners[index].staged.get(currencyCt, currencyId);
    }

    function _registerPartnerByNameHash(bytes32 nameHash, uint256 fee, address wallet,
        bool partnerCanUpdate, bool operatorCanUpdate)
    private
    {
        // Require that the name is not previously registered
        require(0 == _indexByNameHash[nameHash]);

        // Require possibility to update
        require(partnerCanUpdate || operatorCanUpdate);

        // Add new partner
        partners.length++;

        // Reference by 1-based index
        uint256 index = partners.length;

        // Update partner map
        partners[index - 1].nameHash = nameHash;
        partners[index - 1].fee = fee;
        partners[index - 1].wallet = wallet;
        partners[index - 1].partnerCanUpdate = partnerCanUpdate;
        partners[index - 1].operatorCanUpdate = operatorCanUpdate;
        partners[index - 1].index = index;

        // Update name hash to index map
        _indexByNameHash[nameHash] = index;

        // Update wallet to index map
        _indexByWallet[wallet] = index;
    }

    /// @dev index is 0-based
    function _setPartnerFeeByIndex(uint256 index, uint256 fee)
    private
    {
        // If operator tries to change verify that operator has access
        if (isOperator())
            require(partners[index].operatorCanUpdate);

        else {
            // Require that msg.sender is partner
            require(msg.sender == partners[index].wallet);

            // If partner tries to change verify that partner has access
            require(partners[index].partnerCanUpdate);
        }

        // Update stored fee
        partners[index].fee = fee;
    }

    // @dev index is 0-based
    function _setPartnerWalletByIndex(uint256 index, address newWallet)
    private
    returns (address)
    {
        address oldWallet = partners[index].wallet;

        // If address has not been set operator is the only allowed to change it
        if (oldWallet == address(0))
            require(isOperator());

        // Else if operator tries to change verify that operator has access
        else if (isOperator())
            require(partners[index].operatorCanUpdate);

        else {
            // Require that msg.sender is partner
            require(msg.sender == oldWallet);

            // If partner tries to change verify that partner has access
            require(partners[index].partnerCanUpdate);

            // Require that new wallet is not zero-address if it can not be changed by operator
            require(partners[index].operatorCanUpdate || newWallet != address(0));
        }

        // Update stored wallet
        partners[index].wallet = newWallet;

        // Update address to tag map
        if (oldWallet != address(0))
            _indexByWallet[oldWallet] = 0;
        if (newWallet != address(0))
            _indexByWallet[newWallet] = index;

        return oldWallet;
    }

    // @dev index is 0-based
    function _partnerFeeByIndex(uint256 index)
    private
    view
    returns (uint256)
    {
        return partners[index].fee;
    }
}
