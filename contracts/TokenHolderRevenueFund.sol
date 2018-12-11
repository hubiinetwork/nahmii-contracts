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

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    RevenueTokenManager public revenueTokenManager;

    BalanceLib.Balance  periodAccrual;
    InUseCurrencyLib.InUseCurrency periodInUseCurrency;

    BalanceLib.Balance  aggregateAccrual;
    InUseCurrencyLib.InUseCurrency aggregateInUseCurrency;

    mapping(address => mapping(address => mapping(uint256 => uint256[]))) public claimedAccrualBlockNumbersByWalletCurrency;

    mapping(address => mapping(uint256 => uint256[])) public accrualBlockNumbersByCurrency;
    mapping(address => mapping(uint256 => mapping(uint256 => int256))) aggregateAccrualAmountByCurrencyBlockNumber;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetRevenueTokenManagerEvent(RevenueTokenManager oldRevenueTokenManager,
        RevenueTokenManager newRevenueTokenManager);
    event ReceiveEvent(address from, int256 amount, address currencyCt,
        uint256 currencyId);
    event WithdrawEvent(address to, int256 amount, address currencyCt, uint256 currencyId);
    event CloseAccrualPeriodEvent(int256 periodAmount, int256 aggregateAmount, address currencyCt,
        uint256 currencyId);
    event ClaimAccrualEvent(address wallet, string balance, int256 amount, address currencyCt, uint256 currencyId,
        string standard);
    event ClaimAccrualByProxyEvent(address wallet, string balance, int256 amount, address currencyCt,
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

        // Emit event
        emit ReceiveEvent(wallet, amount, address(0), 0);
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

        // Emit event
        emit ReceiveEvent(wallet, amount, currencyCt, currencyId);
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

    /// @notice Claim accrual
    function claimAccrual(Beneficiary beneficiary, string balance, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claimAccrual(msg.sender, currencyCt, currencyId);

        // Transfer claimed amount to beneficiary
        _transferToBeneficiary(
            beneficiary, msg.sender, balance, claimedAmount, currencyCt, currencyId, standard
        );

        // Emit event
        emit ClaimAccrualEvent(msg.sender, balance, claimedAmount, currencyCt, currencyId, standard);
    }

    function claimAccrualByProxy(address wallet, string balance, address currencyCt,
        uint256 currencyId, string standard)
    public
    onlyEnabledServiceAction(CLAIM_ACCRUAL_BY_PROXY_ACTION)
    {
        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claimAccrual(wallet, currencyCt, currencyId);

        // Transfer claimed amount to beneficiary
        _transferToBeneficiary(
            Beneficiary(msg.sender), wallet, balance, claimedAmount, currencyCt, currencyId, standard
        );

        // Emit event
        emit ClaimAccrualByProxyEvent(wallet, balance, claimedAmount, currencyCt, currencyId, standard);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _claimAccrual(address wallet, address currencyCt, uint256 currencyId)
    private
    returns (int256)
    {
        // Require that at least one accrual period has terminated
        require(0 < accrualBlockNumbersByCurrency[currencyCt][currencyId].length);

        // Calculate lower block number as last accrual block number claimed for currency c by wallet OR 0
        uint256[] storage claimedAccrualBlockNumbers = claimedAccrualBlockNumbersByWalletCurrency[wallet][currencyCt][currencyId];
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

    function _transferToBeneficiary(Beneficiary beneficiary, address destWallet, string balance,
        int256 amount, address currencyCt, uint256 currencyId, string standard)
    private
    {
        // Transfer ETH to the beneficiary
        if (currencyCt == address(0) && currencyId == 0)
            beneficiary.receiveEthersTo.value(uint256(amount))(destWallet, balance);

        else {
            // Approve of beneficiary
            TransferController controller = transferController(currencyCt, standard);
            require(
                address(controller).delegatecall(
                    controller.getApproveSignature(), beneficiary, uint256(amount), currencyCt, currencyId
                )
            );

            // Transfer tokens to the beneficiary
            beneficiary.receiveTokensTo(destWallet, balance, amount, currencyCt, currencyId, standard);
        }
    }
}
