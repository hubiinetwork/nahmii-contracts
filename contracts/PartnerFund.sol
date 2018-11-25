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

/**
@title PartnerFund
@notice XXXX
*/
contract PartnerFund is Ownable, Beneficiary, TransferControllerManageable {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using SafeMathIntLib for int256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Partner {
        bool isRegistered;
        bool operatorCanUpdate;
        bool partnerCanUpdate;

        uint256 fee;
        address wallet;
        uint256 index;

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
    address[] public tags;

    mapping(address => Partner) private partnerMap;
    mapping(address => address) private addressTagMap;
    mapping(uint256 => address) private indexTagMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event RegisterPartnerEvent(address tag, uint256 fee);
    event SetFeeEvent(address tag, uint256 fee);
    event SetWalletEvent(address tag, address oldWallet, address newWallet);
    event ReceiveEvent(address tag, address from, int256 amount, address currencyCt, uint256 currencyId);
    event StageEvent(address tag, address from, int256 amount, address currencyCt, uint256 currencyId);
    event WithdrawEvent(address tag, address to, int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    function() public payable {
        receiveEthersTo(partnerTagByWallet(msg.sender), "");
    }

    function receiveEthersTo(address tag, string)
    public
    payable
    isRegisteredTag(tag)
    {
        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to active
        partnerMap[tag].active.add(amount, address(0), 0);
        partnerMap[tag].txHistory.addDeposit(amount, address(0), 0);

        // Add to full deposit history
        partnerMap[tag].fullBalanceHistory.push(
            FullBalanceHistory(
                partnerMap[tag].txHistory.depositsCount() - 1,
                partnerMap[tag].active.get(address(0), 0),
                block.number
            )
        );

        // Emit event
        emit ReceiveEvent(tag, msg.sender, amount, address(0), 0);
    }

    function receiveTokens(string, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        receiveTokensTo(partnerTagByWallet(msg.sender), "", amount, currencyCt, currencyId, standard);
    }

    function receiveTokensTo(address tag, string, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    isRegisteredTag(tag)
    {
        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = transferController(currencyCt, standard);
        require(address(controller).delegatecall(
                controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId)
        );

        // Add to active
        partnerMap[tag].active.add(amount, currencyCt, currencyId);
        partnerMap[tag].txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add to full deposit history
        partnerMap[tag].fullBalanceHistory.push(
            FullBalanceHistory(
                partnerMap[tag].txHistory.depositsCount() - 1,
                partnerMap[tag].active.get(currencyCt, currencyId),
                block.number
            )
        );

        // Emit event
        emit ReceiveEvent(tag, msg.sender, amount, currencyCt, currencyId);
    }

    function depositByTag(address tag, uint index)
    public
    view
    isRegisteredTag(tag)
    returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        require(index < partnerMap[tag].fullBalanceHistory.length);

        FullBalanceHistory storage entry = partnerMap[tag].fullBalanceHistory[index];
        (,, currencyCt, currencyId) = partnerMap[tag].txHistory.deposit(entry.listIndex);

        balance = entry.balance;
        blockNumber = entry.blockNumber;
    }

    function depositByWallet(address wallet, uint index)
    public
    view
    returns (int256 balance, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return depositByTag(partnerTagByWallet(wallet), index);
    }

    function depositsCountByTag(address tag)
    public
    view
    isRegisteredTag(tag)
    returns (uint256)
    {
        return partnerMap[tag].fullBalanceHistory.length;
    }

    function depositsCountByWallet(address wallet)
    public
    view
    returns (uint256)
    {
        return depositsCountByTag(partnerTagByWallet(wallet));
    }

    function activeBalanceByTag(address tag, address currencyCt, uint256 currencyId)
    public
    view
    isRegisteredTag(tag)
    returns (int256)
    {
        return partnerMap[tag].active.get(currencyCt, currencyId);
    }

    function activeBalanceByWallet(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return activeBalanceByTag(partnerTagByWallet(wallet), currencyCt, currencyId);
    }

    function stagedBalanceByTag(address tag, address currencyCt, uint256 currencyId)
    public
    view
    isRegisteredTag(tag)
    returns (int256)
    {
        return partnerMap[tag].staged.get(currencyCt, currencyId);
    }

    function stagedBalanceByWallet(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return stagedBalanceByTag(partnerTagByWallet(wallet), currencyCt, currencyId);
    }

    function tagsCount()
    public
    view
    returns (uint256)
    {
        return tags.length;
    }

    function registerPartner(address tag, address wallet, uint256 fee, bool partnerCanUpdate, bool operatorCanUpdate)
    public
    onlyOperator
    notNullTag(tag)
    {
        // Require that the tag is not previously registered
        require(!partnerMap[tag].isRegistered);

        // Require possibility to update
        require(partnerCanUpdate || operatorCanUpdate);

        // Store tag
        tags.push(tag);

        // Update partner map
        partnerMap[tag].isRegistered = true;
        partnerMap[tag].operatorCanUpdate = operatorCanUpdate;
        partnerMap[tag].partnerCanUpdate = partnerCanUpdate;
        partnerMap[tag].fee = fee;
        partnerMap[tag].wallet = wallet;
        partnerMap[tag].index = tags.length;

        // Update address to tag map
        addressTagMap[wallet] = tag;

        // Update index to tag map
        indexTagMap[tags.length] = tag;

        // Emit event
        emit RegisterPartnerEvent(tag, fee);
    }

    function setPartnerFee(address tag, uint256 fee)
    public
    isRegisteredTag(tag)
    {
        // If operator tries to change verify that operator has access
        if (isOperator())
            require(partnerMap[tag].operatorCanUpdate);

        else {
            // Require that msg.sender is partner
            require(msg.sender == partnerMap[tag].wallet);

            // If partner tries to change verify that partner has access
            require(partnerMap[tag].partnerCanUpdate);
        }

        // Update stored fee
        partnerMap[tag].fee = fee;

        // Emit event
        emit SetFeeEvent(tag, fee);
    }

    function partnerFeeByTag(address tag)
    public
    view
    isRegisteredTag(tag)
    returns (uint256)
    {
        return partnerMap[tag].fee;
    }

    function setPartnerWallet(address tag, address newWallet)
    public
    isRegisteredTag(tag)
    {
        address oldWallet = partnerMap[tag].wallet;

        // If address has not been set operator is the only allowed to change it
        if (oldWallet == address(0))
            require(isOperator());

        // Else if operator tries to change verify that operator has access
        else if (isOperator())
            require(partnerMap[tag].operatorCanUpdate);

        else {
            // Require that msg.sender is partner
            require(msg.sender == oldWallet);

            // If partner tries to change verify that partner has access
            require(partnerMap[tag].partnerCanUpdate);

            // Require that new wallet is not zero-address if it can not be changed by operator
            require(partnerMap[tag].operatorCanUpdate || newWallet != address(0));
        }

        // Update stored wallet
        partnerMap[tag].wallet = newWallet;

        // Update address to tag map
        if (oldWallet != address(0))
            addressTagMap[oldWallet] = 0x0;
        if (newWallet != address(0))
            addressTagMap[newWallet] = tag;

        // Emit event
        emit SetWalletEvent(tag, oldWallet, newWallet);
    }

    function partnerWalletByTag(address tag)
    public
    view
    returns (address)
    {
        return partnerMap[tag].wallet;
    }

    function partnerTagByWallet(address wallet)
    internal
    view
    returns (address)
    {
        address tag = addressTagMap[wallet];
        require(tag != 0);
        require(partnerMap[tag].isRegistered);
        return tag;
    }

    function partnerTagByIndex(uint256 index)
    public
    view
    returns (address)
    {
        address tag = indexTagMap[index];
        require(tag != 0);
        require(partnerMap[tag].isRegistered);
        return tag;
    }

    function partnerIndexByTag(address tag)
    public
    view
    returns (uint256)
    {
        return partnerMap[tag].index;
    }

    function stage(int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        require(amount.isPositiveInt256());

        address tag = partnerTagByWallet(msg.sender);

        // Clamp amount to move
        amount = amount.clampMax(partnerMap[tag].active.get(currencyCt, currencyId));
        if (amount <= 0)
            return;

        partnerMap[tag].active.sub(amount, currencyCt, currencyId);
        partnerMap[tag].staged.add(amount, currencyCt, currencyId);

        partnerMap[tag].txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add to full deposit history
        partnerMap[tag].fullBalanceHistory.push(
            FullBalanceHistory(
                partnerMap[tag].txHistory.depositsCount() - 1,
                partnerMap[tag].active.get(currencyCt, currencyId),
                block.number
            )
        );

        // Emit event
        emit StageEvent(tag, msg.sender, amount, currencyCt, currencyId);
    }

    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        address tag = partnerTagByWallet(msg.sender);

        // Clamp amount to move
        amount = amount.clampMax(partnerMap[tag].staged.get(currencyCt, currencyId));
        if (amount <= 0)
            return;

        partnerMap[tag].staged.sub(amount, currencyCt, currencyId);

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
        emit WithdrawEvent(tag, msg.sender, amount, currencyCt, currencyId);
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullTag(address tag) {
        require(tag != 0);
        _;
    }

    modifier isRegisteredTag(address tag) {
        require(tag != 0);
        require(partnerMap[tag].isRegistered);
        _;
    }
}
