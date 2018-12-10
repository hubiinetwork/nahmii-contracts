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
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {RevenueToken} from "./RevenueToken.sol";
import {RevenueTokenManager} from "./RevenueTokenManager.sol";
import {TransferController} from "./TransferController.sol";
import {Beneficiary} from "./Beneficiary.sol";

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
    string constant public CLAIM_ACCRUAL_BY_PROXY_ACTION = "claim_accrual_by_proxy";

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

        mapping(address => mapping(uint256 => uint256[])) claimedAccrualBlockNumbers;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    RevenueTokenManager public revenueTokenManager;

    BalanceLib.Balance  periodAccrual;
    InUseCurrencyLib.InUseCurrency periodInUseCurrency;

    BalanceLib.Balance  aggregateAccrual;
    InUseCurrencyLib.InUseCurrency aggregateInUseCurrency;

    mapping(address => Wallet) private walletMap;

    mapping(address => mapping(uint256 => uint256[])) public accrualBlockNumbersByCurrency;
    mapping(address => mapping(uint256 => mapping(uint256 => int256))) aggregateAccrualAmountByCurrencyBlockNumber;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetRevenueTokenManagerEvent(RevenueTokenManager oldRevenueTokenManager,
        RevenueTokenManager newRevenueTokenManager);
    event ReceiveEvent(address from, string balanceType, int256 amount, address currencyCt,
        uint256 currencyId);
    event WithdrawEvent(address to, int256 amount, address currencyCt, uint256 currencyId);
    event CloseAccrualPeriodEvent(int256 periodAmount, int256 aggregateAmount, address currencyCt,
        uint256 currencyId);
    event ClaimAccrualEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event ClaimAccrualByProxyEvent(address wallet, int256 amount, address currencyCt,
        uint256 currencyId, string standard);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the revenue token manager contract
    /// @param newRevenueTokenManager The (address of) RevenueTokenManager contract instance
    function setRevenueTokenManager(RevenueTokenManager newRevenueTokenManager)
    public
    onlyDeployer
    notNullAddress(newRevenueTokenManager)
    {
        if (newRevenueTokenManager != revenueTokenManager) {
            // Set new revenue token
            RevenueTokenManager oldRevenueTokenManager = revenueTokenManager;
            revenueTokenManager = newRevenueTokenManager;

            // Emit event
            emit SetRevenueTokenManagerEvent(oldRevenueTokenManager, newRevenueTokenManager);
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

            // Store the aggregate accrual balance of currency at this block number
            aggregateAccrualAmountByCurrencyBlockNumber[currency.ct][currency.id][block.number] = aggregateAccrual.get(currency.ct, currency.id);

            // Get the amount of the accrual period
            int256 periodAmount = periodAccrual.get(currency.ct, currency.id);

            // Reset period accrual of currency
            periodAccrual.set(0, currency.ct, currency.id);

            // Remove currency from period in-use list
            periodInUseCurrency.removeItem(currency.ct, currency.id);

            // Emit event
            emit CloseAccrualPeriodEvent(
                periodAmount,
                aggregateAccrualAmountByCurrencyBlockNumber[currency.ct][currency.id][block.number],
                currency.ct, currency.id
            );
        }
    }

    /// @notice Claim accrual and stage
    function claimAccrual(address currencyCt, uint256 currencyId)
    public
    {
        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claimAccrual(msg.sender, currencyCt, currencyId);

        // Stage the claimed amount
        walletMap[msg.sender].staged.add(claimedAmount, currencyCt, currencyId);

        // Emit event
        emit ClaimAccrualEvent(msg.sender, claimedAmount, currencyCt, currencyId);
    }

    function claimAccrualByProxy(address wallet, address currencyCt, uint256 currencyId, string standard)
    public
    onlyEnabledServiceAction(CLAIM_ACCRUAL_BY_PROXY_ACTION)
    {
        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claimAccrual(wallet, currencyCt, currencyId);

        // Define msg.sender as beneficiary
        Beneficiary beneficiary = Beneficiary(msg.sender);

        // Transfer ETH to the beneficiary
        if (currencyCt == address(0) && currencyId == 0)
            beneficiary.receiveEthersTo.value(uint256(claimedAmount))(wallet, "");

        else {
            // Approve of beneficiary
            TransferController controller = transferController(currencyCt, standard);
            require(
                address(controller).delegatecall(
                    controller.getApproveSignature(), beneficiary, uint256(claimedAmount), currencyCt, currencyId
                )
            );

            // Transfer tokens to the beneficiary
            beneficiary.receiveTokensTo(wallet, "", claimedAmount, currencyCt, currencyId, standard);
        }

        // Emit event
        emit ClaimAccrualByProxyEvent(wallet, claimedAmount, currencyCt, currencyId, standard);
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
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function _claimAccrual(address wallet, address currencyCt, uint256 currencyId)
    private
    returns (int256)
    {
        // Require that at least one accrual period has terminated
        require(0 < accrualBlockNumbersByCurrency[currencyCt][currencyId].length);

        // Calculate lower block number as last accrual block number claimed for currency c by wallet OR 0
        uint256[] storage claimedAccrualBlockNumbers = walletMap[wallet].claimedAccrualBlockNumbers[currencyCt][currencyId];
        uint256 bnLow = (0 == claimedAccrualBlockNumbers.length ? 0 : claimedAccrualBlockNumbers[claimedAccrualBlockNumbers.length - 1]);

        // Set upper block number as last accrual block number
        uint256 bnUp = accrualBlockNumbersByCurrency[currencyCt][currencyId][accrualBlockNumbersByCurrency[currencyCt][currencyId].length - 1];

        // Require that lower block number is below upper block number
        require(bnLow < bnUp);

        // Calculate the amount that is claimable in the span between lower and upper block numbers
        int256 claimableAmount = aggregateAccrualAmountByCurrencyBlockNumber[currencyCt][currencyId][bnUp]
        - aggregateAccrualAmountByCurrencyBlockNumber[currencyCt][currencyId][bnLow];

        // Retrieve the balance blocks of wallet
        int256 walletBalanceBlocks = int256(
            RevenueToken(revenueTokenManager.token()).balanceBlocksIn(wallet, bnLow, bnUp)
        );

        // Retrieve the released amount blocks
        int256 releasedAmountBlocks = int256(
            revenueTokenManager.releasedAmountBlocksIn(bnLow, bnUp)
        );

        // Calculate the claimed amount
        int256 claimedAmount = walletBalanceBlocks.mul_nn(claimableAmount).mul_nn(1e18).div_nn(releasedAmountBlocks.mul_nn(1e18));

        // Store upper bound as the last claimed accrual block number for currency
        claimedAccrualBlockNumbers.push(bnUp);

        // Return the claimed amount
        return claimedAmount;
    }
}
