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
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";
import {Servable} from "./Servable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {RevenueToken} from "./RevenueToken.sol";
import {TransferController} from "./TransferController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";

/**
@title TokenHolderRevenueFund
@notice Fund that manages the revenue earned by revenue token holders.
@dev Asset descriptor combo (currencyCt == 0x0, currencyId == 0) corresponds to ethers
*/
contract TokenHolderRevenueFund is Ownable, AccrualBeneficiary, Servable, TransferControllerManageable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CLOSE_ACCRUAL_PERIOD_ACTION = "close_accrual_period";

    string constant public DEPOSIT_BALANCE_TYPE = "deposit";

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct AccrualItem {
        address currencyCt;
        uint256 currencyId;
    }

    struct Wallet {
        BalanceLib.Balance staged;

        TxHistoryLib.TxHistory txHistory;

        // Claim accrual tracking
        mapping(address => mapping(uint256 => uint256[])) claimedAccrualBlockNumbers;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    RevenueToken private revenueToken;

    BalanceLib.Balance  periodAccrual;
    InUseCurrencyLib.InUseCurrency periodInUseCurrency;

    BalanceLib.Balance  aggregateAccrual;
    InUseCurrencyLib.InUseCurrency aggregateInUseCurrency;

    mapping(address => Wallet) private walletMap;

    mapping(address => mapping(uint256 => uint256[])) public accrualBlockNumbersByCurrency;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetRevenueTokenEvent(RevenueToken oldRevenueToken, RevenueToken newRevenueToken);
    event ReceiveEvent(address from, string balanceType, int256 amount, address currencyCt,
        uint256 currencyId);
    event WithdrawEvent(address to, int256 amount, address currencyCt, uint256 currencyId);
    event CloseAccrualPeriodEvent();
    event ClaimAccrualEvent(address from, address currencyCt, uint256 currencyId);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the revenue token contract
    /// @param newRevenueToken The (address of) RevenueToken contract instance
    function setRevenueToken(RevenueToken newRevenueToken)
    public
    onlyDeployer
    notNullAddress(newRevenueToken)
    {
        if (newRevenueToken != revenueToken) {
            // Set new revenue token
            RevenueToken oldRevenueToken = revenueToken;
            revenueToken = newRevenueToken;

            // Emit event
            emit SetRevenueTokenEvent(oldRevenueToken, newRevenueToken);
        }
    }

    function() public payable {
        receiveEthersTo(msg.sender, "");
    }

    function receiveEthersTo(address wallet, string)
    public
    payable
    {
        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to balances
        periodAccrual.add(amount, address(0), 0);
        aggregateAccrual.add(amount, address(0), 0);

        // Add currency to in-use lists
        periodInUseCurrency.addItem(address(0), 0);
        aggregateInUseCurrency.addItem(address(0), 0);

        // Add deposit info
        walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

        // Emit event
        emit ReceiveEvent(wallet, DEPOSIT_BALANCE_TYPE, amount, address(0), 0);
    }

    function receiveTokens(string, int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        receiveTokensTo(msg.sender, "", amount, currencyCt, currencyId, standard);
    }

    function receiveTokensTo(address wallet, string, int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = transferController(currencyCt, standard);
        if (!address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId))
            revert();

        // Add to balances
        periodAccrual.add(amount, currencyCt, currencyId);
        aggregateAccrual.add(amount, currencyCt, currencyId);

        // Add currency to in-use lists
        periodInUseCurrency.addItem(currencyCt, currencyId);
        aggregateInUseCurrency.addItem(currencyCt, currencyId);

        // Add deposit info
        walletMap[wallet].txHistory.addDeposit(amount, currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, DEPOSIT_BALANCE_TYPE, amount, currencyCt, currencyId);
    }

    function deposit(address wallet, uint index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return walletMap[wallet].txHistory.deposit(index);
    }

    function depositsCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletMap[wallet].txHistory.depositsCount();
    }

    function periodAccrualBalance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return periodAccrual.get(currencyCt, currencyId);
    }

    function aggregateAccrualBalance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return aggregateAccrual.get(currencyCt, currencyId);
    }

    function stagedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return walletMap[wallet].staged.get(currencyCt, currencyId);
    }

    function closeAccrualPeriod(MonetaryTypesLib.Currency[] currencies)
    public
    onlyEnabledServiceAction(CLOSE_ACCRUAL_PERIOD_ACTION)
    {
        // Clear period accrual stats
        for (uint256 i = 0; i < currencies.length; i++) {
            MonetaryTypesLib.Currency memory currency = currencies[i];

            // Register this block number as accrual block number of currency
            accrualBlockNumbersByCurrency[currency.ct][currency.id].push(block.number);

            // Reset period accrual of currency
            periodAccrual.set(0, currency.ct, currency.id);

            // Remove currency from period in-use list
            periodInUseCurrency.removeItem(currency.ct, currency.id);
        }

        // Emit event
        emit CloseAccrualPeriodEvent();
    }

    function claimAccrual(address currencyCt, uint256 currencyId)
    public
    {
        require(address(revenueToken) != address(0));

        int256 balance = aggregateAccrual.get(currencyCt, currencyId);
        require(balance.isNonZeroPositiveInt256());

        // lower bound = last accrual block number claimed for currency c by msg.sender OR 0
        // upper bound = last accrual block number

        require(accrualBlockNumbersByCurrency[currencyCt][currencyId].length > 0);
        uint256 bnUp = accrualBlockNumbersByCurrency[currencyCt][currencyId][accrualBlockNumbersByCurrency[currencyCt][currencyId].length - 1];

        uint256[] storage claimedAccrualBlockNumbers = walletMap[msg.sender].claimedAccrualBlockNumbers[currencyCt][currencyId];
        uint256 bnLow = (0 == claimedAccrualBlockNumbers.length ? 0 : claimedAccrualBlockNumbers[claimedAccrualBlockNumbers.length - 1]);

        require(bnLow < bnUp);

        int256 bb = int256(revenueToken.balanceBlocksIn(msg.sender, bnLow, bnUp));

        // TODO Calculate this one
        int256 bbTotalCirculating = 0;

        // Calculate claim amount
        int256 amount = bb.mul_nn(balance).mul_nn(1e18).div_nn(bbTotalCirculating.mul_nn(1e18));
        if (amount <= 0)
            return;

        // Stage the calculated amount
        walletMap[msg.sender].staged.add(amount, currencyCt, currencyId);

        // Store upper bound as the last claimed accrual block number for currency
        claimedAccrualBlockNumbers.push(bnUp);

        // Emit event
        emit ClaimAccrualEvent(msg.sender, currencyCt, currencyId);
    }

    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        amount = amount.clampMax(walletMap[msg.sender].staged.get(currencyCt, currencyId));
        if (amount <= 0)
            return;

        // Subtract to per-wallet staged balance
        walletMap[msg.sender].staged.sub(amount, currencyCt, currencyId);
        walletMap[msg.sender].txHistory.addWithdrawal(amount, currencyCt, currencyId);

        // Execute transfer
        if (currencyCt == address(0))
            msg.sender.transfer(uint256(amount));

        else {
            TransferController controller = transferController(currencyCt, standard);
            if (!address(controller).delegatecall(controller.getDispatchSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId)) {
                revert();
            }
        }

        // Emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId);
    }

    function withdrawal(address wallet, uint index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return walletMap[wallet].txHistory.withdrawal(index);
    }

    function withdrawalsCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletMap[wallet].txHistory.withdrawalsCount();
    }

    //
    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier revenueTokenInitialized() {
        require(revenueToken != address(0));
        _;
    }
}
