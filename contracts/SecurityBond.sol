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
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";
import {Servable} from "./Servable.sol";
import {Ownable} from "./Ownable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {TransferController} from "./TransferController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";

/**
@title SecurityBond
@notice Fund that contains crypto incentive for challenging operator fraud.
*/
// TODO Update to two-component currency descriptor
contract SecurityBond is Ownable, AccrualBeneficiary, Servable, TransferControllerManageable {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;
    using SafeMathInt for int256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public STAGE_ACTION = "stage";

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct SubStageItem {
        int256 available_amount;
        uint256 start_timestamp;
    }

    struct SubStageInfo {
        uint256 current_index;
        SubStageItem[] list;
    }

    struct Wallet {
        BalanceLib.Balance staged;
        mapping(address => mapping(uint256 => SubStageInfo)) subStaged;

        TxHistoryLib.TxHistory txHistory;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;

    //Active balance of ethers and tokens shared among all wallets
    BalanceLib.Balance active;

    uint256 private withdrawalTimeout;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event StageEvent(address from, int256 amount, address currencyCt, uint256 currencyId);
    event WithdrawEvent(address to, int256 amount, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address _owner) Ownable(_owner) Servable() public {
        withdrawalTimeout = 30 minutes;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function setWithdrawalTimeout(uint256 timeoutInSeconds) public onlyOwner {
        withdrawalTimeout = timeoutInSeconds;
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        depositEthersTo(msg.sender);
    }

    function depositEthersTo(address wallet) public payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to active balance
        active.add(amount, address(0), 0);
        walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

        //emit event
        emit DepositEvent(wallet, amount, address(0), 0);
    }

    function depositTokens(int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        depositTokensTo(msg.sender, amount, currencyCt, currencyId, standard);
    }

    function depositTokensTo(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        require(amount.isNonZeroPositiveInt256());

        //execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        controller.receive(msg.sender, this, uint256(amount), currencyCt, currencyId);

        //add to per-wallet deposited balance
        active.add(amount, currencyCt, currencyId);
        walletMap[wallet].txHistory.addDeposit(amount, currencyCt, currencyId);

        //emit event
        emit DepositEvent(wallet, amount, currencyCt, currencyId);
    }

    function deposit(address wallet, uint index) public view
        returns (int256 amount, uint256 timestamp, address token, uint256 id)
    {
        return walletMap[wallet].txHistory.deposit(index);
    }

    function depositCount(address wallet) public view returns (uint256) {
        return walletMap[wallet].txHistory.depositCount();
    }

    //
    // Balance retrieval functions
    // -----------------------------------------------------------------------------------------------------------------
    function activeBalance(address currencyCt, uint256 currencyId) public view returns (int256) {
        return active.get(currencyCt, currencyId);
    }

    function stagedBalance(address wallet, address currencyCt, uint256 currencyId) public view returns (int256) {
        require(wallet != address(0));

        return walletMap[wallet].staged.get(currencyCt, currencyId);
    }

    //
    // Staging functions
    // -----------------------------------------------------------------------------------------------------------------
    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId) public notNullAddress(wallet) onlyOwnerOrEnabledServiceAction(STAGE_ACTION) {
        uint256 start_time;

        require(amount.isPositiveInt256());

        //clamp amount to move
        amount = amount.clampMax(active.get(currencyCt, currencyId));
        if (amount <= 0)
            return;

        //move from active balance to staged
        active.sub(amount, currencyCt, currencyId);
        walletMap[wallet].staged.add(amount, currencyCt, currencyId);

        //add substage info
        start_time = block.timestamp + ((wallet == owner) ? withdrawalTimeout : 0);
        walletMap[wallet].subStaged[currencyCt][currencyId].list.push(SubStageItem(amount, start_time));

        //emit event
        emit StageEvent(msg.sender, amount, currencyCt, currencyId);
    }

    //
    // Withdrawal functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        uint256 current_index;
        int256 to_send_amount;
        int256 this_round_amount;

        require(amount.isNonZeroPositiveInt256());

        //start withdrawal from current substage
        SubStageInfo storage ssi = walletMap[msg.sender].subStaged[currencyCt][currencyId];
        to_send_amount = 0;
        while (to_send_amount < amount) {
            current_index = ssi.current_index;

            if (current_index >= ssi.list.length) {
                break;
            }
            if (block.timestamp < ssi.list[current_index].start_timestamp) {
                break;
            }

            this_round_amount = (amount - to_send_amount).clampMax(ssi.list[current_index].available_amount);

            ssi.list[current_index].available_amount = ssi.list[current_index].available_amount.sub_nn(this_round_amount);
            if (ssi.list[current_index].available_amount == 0) {
                ssi.current_index++;
            }

            to_send_amount = to_send_amount + this_round_amount;
        }
        if (to_send_amount == 0)
            return;

        //subtract to per-wallet staged balance (will check for sufficient funds)
        walletMap[msg.sender].staged.sub(to_send_amount, currencyCt, currencyId);

        walletMap[msg.sender].txHistory.addWithdrawal(to_send_amount, currencyCt, currencyId);

        //execute transfer
        msg.sender.transfer(uint256(to_send_amount));

        //emit event
        emit WithdrawEvent(msg.sender, to_send_amount, currencyCt, currencyId);
    }

    function withdrawal(address wallet, uint index) public view onlyOwner
        returns (int256 amount, uint256 timestamp, address token, uint256 id)
    {
        return walletMap[wallet].txHistory.withdrawal(index);
    }

    function withdrawalCount(address wallet) public view onlyOwner returns (uint256) {
        return walletMap[wallet].txHistory.withdrawalCount();
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier notNullAddress(address _address) {
        require(_address != address(0));
        _;
    }
}