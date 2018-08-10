/*
 * Hubii Striim
 *
 * Compliant with the Hubii Striim specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;

import {Ownable} from "./Ownable.sol";
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";
import {Servable} from "./Servable.sol";
import {SelfDestructible} from "./SelfDestructible.sol";
import {SafeMathInt} from "./SafeMathInt.sol";
import {SafeMathUint} from "./SafeMathUint.sol";
import {RevenueToken} from "./RevenueToken.sol";
import {CurrencyManager} from "./CurrencyManager.sol";
import {CurrencyController} from "./CurrencyController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";

/**
@title TokenHolderRevenueFund
@notice Fund that manages the revenue earned by revenue token holders.
*/
contract TokenHolderRevenueFund is Ownable, AccrualBeneficiary, Servable, SelfDestructible {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using SafeMathInt for int256;
    using SafeMathUint for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CLOSE_ACCRUAL_PERIOD_ACTION = "close_accrual_period";

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct AccrualItem {
        address currency;
        uint256 currencyId;
    }

    struct Wallet {
        BalanceLib.Balance staged;

        TxHistoryLib.TxHistory txHistory;

        // Claim accrual tracking
        mapping(address => mapping(uint256 => uint256[])) claimAccrualBlockNumbers;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    CurrencyManager private currencyManager;
    RevenueToken private revenueToken;

    BalanceLib.Balance periodAccrual;
    AccrualItem[] periodAccrualList;
    mapping(address => mapping(uint256 => bool)) periodAccrualMap;

    BalanceLib.Balance aggregateAccrual;
    AccrualItem[] aggregateAccrualList;
    mapping(address => mapping(uint256 => bool)) aggregateAccrualMap;

    mapping(address => Wallet) private walletMap;

    uint256[] accrualBlockNumbers;

   //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event ChangeRevenueTokenEvent(address oldAddress, address newAddress);
    event ChangeCurrencyManagerEvent(address oldAddress, address newAddress);
    event DepositEvent(address from, int256 amount, address currency, uint256 currencyId); //currency==0 for ethers
    event WithdrawEvent(address to, int256 amount, address currency, uint256 currencyId);  //currency==0 for ethers
    event CloseAccrualPeriodEvent();
    event ClaimAccrualEvent(address from, address currency, uint256 currencyId);  //currency==0 for ethers

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) Servable() public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Change the revenue token contract
    /// @param newAddress The (address of) RevenueToken contract instance
    function changeRevenueToken(address newAddress) public onlyOwner notNullAddress(newAddress) {
        if (newAddress != address(revenueToken)) {
            //set new revenue token
            address oldAddress = address(revenueToken);
            revenueToken = RevenueToken(newAddress);

            //emit event
            emit ChangeRevenueTokenEvent(oldAddress, newAddress);
        }
    }

    /// @notice Change the currency manager contract
    /// @param newAddress The (address of) CurrencyManager contract instance
    function changeCurrencyManager(address newAddress) public onlyOwner notNullAddress(newAddress) {
        if (newAddress != address(currencyManager)) {
            //set new currency manager
            address oldAddress = address(currencyManager);
            currencyManager = CurrencyManager(newAddress);

            //emit event
            emit ChangeCurrencyManagerEvent(oldAddress, newAddress);
        }
    }

    //
    // Deposit functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        depositEthersTo(msg.sender);
    }

    function depositEthersTo(address wallet) public payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to balances
        periodAccrual.add(amount, address(0), 0);
        aggregateAccrual.add(amount, address(0), 0);

        //add deposit info
        walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

        //emit event
        emit DepositEvent(wallet, amount, address(0), 0);
    }

    function depositTokens(int256 amount, address currency, uint256 currencyId, string standard) public {
        depositTokensTo(msg.sender, amount, currency, currencyId, standard);
    }

    function depositTokensTo(address wallet, int256 amount, address currency, uint256 currencyId, string standard) public {
        require(amount.isNonZeroPositiveInt256());

        //execute transfer
        CurrencyController controller = currencyManager.getCurrencyController(currency, standard);
        controller.receive(msg.sender, this, uint256(amount), currency, currencyId);

        //add to balances
        periodAccrual.add(amount, currency, currencyId);
        aggregateAccrual.add(amount, currency, currencyId);

        //add currency to in-use list
        if (!periodAccrualMap[currency][currencyId]) {
            periodAccrualMap[currency][currencyId] = true;
            periodAccrualList.push(AccrualItem(currency, currencyId));
        }

        if (!aggregateAccrualMap[currency][currencyId]) {
            aggregateAccrualMap[currency][currencyId] = true;
            aggregateAccrualList.push(AccrualItem(currency, currencyId));
        }

        //add deposit info
        walletMap[wallet].txHistory.addDeposit(amount, currency, currencyId);

        //emit event
        emit DepositEvent(wallet, amount, currency, currencyId);
    }

    function deposit(address wallet, uint index) public view returns (int256 amount, uint256 timestamp, address token, uint256 id) {
        return walletMap[wallet].txHistory.deposit(index);
    }

    function depositCount(address wallet) public view returns (uint256) {
        return walletMap[wallet].txHistory.depositCount();
    }

    //
    // Balance retrieval functions
    // -----------------------------------------------------------------------------------------------------------------
    function periodAccrualBalance(address currency, uint256 currencyId) public view returns (int256) {
        return periodAccrual.get(currency, currencyId);
    }

    function aggregateAccrualBalance(address currency, uint256 currencyId) public view returns (int256) {
        return aggregateAccrual.get(currency, currencyId);
    }

    function stagedBalance(address wallet, address currency, uint256 currencyId) public view returns (int256) {
        //require(wallet != address(0));
        return walletMap[wallet].staged.get(currency, currencyId);
    }

    //
    // Accrual functions
    // -----------------------------------------------------------------------------------------------------------------
    function closeAccrualPeriod() public onlyOwnerOrEnabledServiceAction(CLOSE_ACCRUAL_PERIOD_ACTION) {
        uint256 i;
        uint256 len;

        //register this block
        accrualBlockNumbers.push(block.number);

        //clear accruals
        len = periodAccrualList.length;
        for (i = 0; i < len; i++) {
            AccrualItem storage item = periodAccrualList[i];
            periodAccrual.set(0, item.currency, item.currencyId);
        }

        //raise event
        emit CloseAccrualPeriodEvent();
    }

    function claimAccrual(address currency, uint256 currencyId) public {
        int256 balance;
        int256 amount;
        int256 fraction;
        int256 bb;
        uint256 bn_low;
        uint256 bn_up;

        require(address(revenueToken) != address(0));

        balance = aggregateAccrual.get(currency, currencyId);
        require(balance.isNonZeroPositiveInt256());

        // lower bound = last accrual block number claimed for currency c by msg.sender OR 0
        // upper bound = last accrual block number

        require(accrualBlockNumbers.length > 0);
        bn_up = accrualBlockNumbers[accrualBlockNumbers.length - 1];

        uint256[] storage claimAccrualBlockNumbers = walletMap[msg.sender].claimAccrualBlockNumbers[currency][currencyId];
        if (claimAccrualBlockNumbers.length == 0) {
            bn_low = 0; //no block numbers for claimed accruals yet
        }
        else {
            bn_low = claimAccrualBlockNumbers[claimAccrualBlockNumbers.length - 1];
        }

        require(bn_low != bn_up);
        // avoid division by 0

        bb = int256(revenueToken.balanceBlocksIn(msg.sender, bn_low, bn_up));

        fraction = bb.mul_nn(1e18).mul_nn(balance).div_nn(balance.mul_nn(int256(bn_up.sub(bn_low))).mul_nn(1e18));
        amount = fraction.mul_nn(balance).div_nn(1e18);
        if (amount <= 0)
            return;

        // Move calculated amount a of currency c from aggregate active balance of currency c to msg.sender’s staged balance of currency c
        aggregateAccrual.sub(amount, currency, currencyId);
        walletMap[msg.sender].staged.add(amount, currency, currencyId);

        // Store upper bound as the last claimed accrual block number for currency
        claimAccrualBlockNumbers.push(bn_up);

        //raise event
        emit ClaimAccrualEvent(msg.sender, currency, currencyId);
    }

    //
    // Withdrawal functions
    // -----------------------------------------------------------------------------------------------------------------
    function withdraw(int256 amount, address currency, uint256 currencyId) public notOwner {
        require(amount.isNonZeroPositiveInt256());

        amount = amount.clampMax(walletMap[msg.sender].staged.get(currency, currencyId));
        if (amount <= 0)
            return;

        //subtract to per-wallet staged balance
        walletMap[msg.sender].staged.sub(amount, currency, currencyId);
        walletMap[msg.sender].txHistory.addWithdrawal(amount, currency, currencyId);

        //execute transfer
        if (currency == address(0)) {
            msg.sender.transfer(uint256(amount));
        }
        else {
            CurrencyController controller = currencyManager.getCurrencyController(currency, "");
            if (!address(controller).delegatecall(controller.send_signature, msg.sender, uint256(amount), currency, currencyId)) {
                revert();
            }
        }

        //emit event
        emit WithdrawEvent(msg.sender, amount, currency, currencyId);
    }

    function withdrawal(address wallet, uint index) public view onlyOwner returns (int256 amount, uint256 timestamp, address token, uint256 id) {
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

    modifier notMySelfAddress(address _address) {
        require(_address != address(this));
        _;
    }
}
