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
import {AccrualBeneficiary} from "./AccrualBeneficiary.sol";
import {Servable} from "./Servable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {FungibleBalanceLib} from "./FungibleBalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {CurrenciesLib} from "./CurrenciesLib.sol";
import {RevenueToken} from "./RevenueToken.sol";
import {RevenueTokenManager} from "./RevenueTokenManager.sol";
import {TransferController} from "./TransferController.sol";
import {Beneficiary} from "./Beneficiary.sol";

/**
 * @title TokenHolderRevenueFund
 * @notice Fund that manages the revenue earned by revenue token holders.
 */
contract TokenHolderRevenueFund is Ownable, AccrualBeneficiary, Servable, TransferControllerManageable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using FungibleBalanceLib for FungibleBalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using CurrenciesLib for CurrenciesLib.Currencies;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public CLOSE_ACCRUAL_PERIOD_ACTION = "close_accrual_period";

    //
    // Types
    // -----------------------------------------------------------------------------------------------------------------
    struct Accrual {
        uint256 startBlock;
        uint256 endBlock;
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    RevenueTokenManager public revenueTokenManager;

    FungibleBalanceLib.Balance private periodAccrual;
    CurrenciesLib.Currencies private periodCurrencies;

    FungibleBalanceLib.Balance private aggregateAccrual;
    CurrenciesLib.Currencies private aggregateCurrencies;

    TxHistoryLib.TxHistory private txHistory;

    mapping(address => mapping(uint256 => Accrual[])) public closedAccrualsByCurrency;

    mapping(address => mapping(address => mapping(uint256 => uint256[]))) public claimedAccrualIndicesByWalletCurrency;
    mapping(address => mapping(address => mapping(uint256 => mapping(uint256 => bool)))) public accrualClaimedByWalletCurrencyIndex;

    mapping(address => mapping(uint256 => mapping(uint256 => int256))) public aggregateAccrualAmountByCurrencyBlockNumber;

    mapping(address => FungibleBalanceLib.Balance) private stagedByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetRevenueTokenManagerEvent(RevenueTokenManager oldRevenueTokenManager,
        RevenueTokenManager newRevenueTokenManager);
    event ReceiveEvent(address wallet, int256 amount, address currencyCt,
        uint256 currencyId);
    event WithdrawEvent(address to, int256 amount, address currencyCt, uint256 currencyId);
    event CloseAccrualPeriodEvent(int256 periodAmount, int256 aggregateAmount, address currencyCt,
        uint256 currencyId);
    event ClaimAndTransferToBeneficiaryEvent(address wallet, string balanceType, int256 amount,
        address currencyCt, uint256 currencyId, uint256 firstPeriodIndex, uint256 lastPeriodIndex,
        string standard);
    event ClaimAndStageEvent(address from, int256 amount, address currencyCt, uint256 currencyId,
        uint256 firstPeriodIndex, uint256 lastPeriodIndex);
    event WithdrawEvent(address from, int256 amount, address currencyCt, uint256 currencyId,
        string standard);

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
    notNullAddress(address(newRevenueTokenManager))
    {
        if (newRevenueTokenManager != revenueTokenManager) {
            // Set new revenue token
            RevenueTokenManager oldRevenueTokenManager = revenueTokenManager;
            revenueTokenManager = newRevenueTokenManager;

            // Emit event
            emit SetRevenueTokenManagerEvent(oldRevenueTokenManager, newRevenueTokenManager);
        }
    }

    /// @notice Fallback function that deposits ethers
    function() external payable {
        receiveEthersTo(msg.sender, "");
    }

    /// @notice Receive ethers to
    /// @param wallet The concerned wallet address
    function receiveEthersTo(address wallet, string memory)
    public
    payable
    {
        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to balances
        periodAccrual.add(amount, address(0), 0);
        aggregateAccrual.add(amount, address(0), 0);

        // Add currency to in-use lists
        periodCurrencies.add(address(0), 0);
        aggregateCurrencies.add(address(0), 0);

        // Add to transaction history
        txHistory.addDeposit(amount, address(0), 0);

        // Emit event
        emit ReceiveEvent(wallet, amount, address(0), 0);
    }

    /// @notice Receive tokens
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function receiveTokens(string memory, int256 amount, address currencyCt, uint256 currencyId,
        string memory standard)
    public
    {
        receiveTokensTo(msg.sender, "", amount, currencyCt, currencyId, standard);
    }

    /// @notice Receive tokens to
    /// @param wallet The address of the concerned wallet
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function receiveTokensTo(address wallet, string memory, int256 amount, address currencyCt,
        uint256 currencyId, string memory standard)
    public
    {
        require(amount.isNonZeroPositiveInt256(), "Amount not strictly positive [TokenHolderRevenueFund.sol:168]");

        // Execute transfer
        TransferController controller = transferController(currencyCt, standard);
        (bool success,) = address(controller).delegatecall(
            abi.encodeWithSelector(
                controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId
            )
        );
        require(success, "Reception by controller failed [TokenHolderRevenueFund.sol:177]");

        // Add to balances
        periodAccrual.add(amount, currencyCt, currencyId);
        aggregateAccrual.add(amount, currencyCt, currencyId);

        // Add currency to in-use lists
        periodCurrencies.add(currencyCt, currencyId);
        aggregateCurrencies.add(currencyCt, currencyId);

        // Add to transaction history
        txHistory.addDeposit(amount, currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, amount, currencyCt, currencyId);
    }

    /// @notice Get the period accrual balance of the given currency
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The current period's accrual balance
    function periodAccrualBalance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return periodAccrual.get(currencyCt, currencyId);
    }

    /// @notice Get the aggregate accrual balance of the given currency, including contribution from the
    /// current accrual period
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The aggregate accrual balance
    function aggregateAccrualBalance(address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return aggregateAccrual.get(currencyCt, currencyId);
    }

    /// @notice Get the count of currencies recorded in the accrual period
    /// @return The number of currencies in the current accrual period
    function periodCurrenciesCount()
    public
    view
    returns (uint256)
    {
        return periodCurrencies.count();
    }

    /// @notice Get the currencies with indices in the given range that have been recorded in the current accrual period
    /// @param low The lower currency index
    /// @param up The upper currency index
    /// @return The currencies of the given index range in the current accrual period
    function periodCurrenciesByIndices(uint256 low, uint256 up)
    public
    view
    returns (MonetaryTypesLib.Currency[] memory)
    {
        return periodCurrencies.getByIndices(low, up);
    }

    /// @notice Get the count of currencies ever recorded
    /// @return The number of currencies ever recorded
    function aggregateCurrenciesCount()
    public
    view
    returns (uint256)
    {
        return aggregateCurrencies.count();
    }

    /// @notice Get the currencies with indices in the given range that have ever been recorded
    /// @param low The lower currency index
    /// @param up The upper currency index
    /// @return The currencies of the given index range ever recorded
    function aggregateCurrenciesByIndices(uint256 low, uint256 up)
    public
    view
    returns (MonetaryTypesLib.Currency[] memory)
    {
        return aggregateCurrencies.getByIndices(low, up);
    }

    /// @notice Get the count of deposits
    /// @return The count of deposits
    function depositsCount()
    public
    view
    returns (uint256)
    {
        return txHistory.depositsCount();
    }

    /// @notice Get the deposit at the given index
    /// @return The deposit at the given index
    function deposit(uint index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return txHistory.deposit(index);
    }

    /// @notice Get the staged balance of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The staged balance
    function stagedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return stagedByWallet[wallet].get(currencyCt, currencyId);
    }

    /// @notice Get the number of closed accruals for the given wallet and currency
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The number of closed accruals
    function closedAccrualsCount(address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return closedAccrualsByCurrency[currencyCt][currencyId].length;
    }

    /// @notice Close the current accrual period of the given currencies
    /// @param currencies The concerned currencies
    function closeAccrualPeriod(MonetaryTypesLib.Currency[] memory currencies)
    public
    onlyEnabledServiceAction(CLOSE_ACCRUAL_PERIOD_ACTION)
    {
        // Clear period accrual stats
        for (uint256 i = 0; i < currencies.length; i++) {
            MonetaryTypesLib.Currency memory currency = currencies[i];

            // Get the amount of the accrual period
            int256 periodAmount = periodAccrual.get(currency.ct, currency.id);

            // Define start block of the completed accrual period, as (if existent) previous period end block + 1, else 0
            uint256 startBlock = (
            0 == closedAccrualsByCurrency[currency.ct][currency.id].length ?
            0 :
            closedAccrualsByCurrency[currency.ct][currency.id][closedAccrualsByCurrency[currency.ct][currency.id].length - 1].endBlock + 1
            );

            // Add new accrual period
            closedAccrualsByCurrency[currency.ct][currency.id].push(Accrual(startBlock, block.number, periodAmount));

            // Store the aggregate accrual balance of currency at this block number
            aggregateAccrualAmountByCurrencyBlockNumber[currency.ct][currency.id][block.number] = aggregateAccrualBalance(
                currency.ct, currency.id
            );

            if (periodAmount > 0) {
                // Reset period accrual of currency
                periodAccrual.set(0, currency.ct, currency.id);

                // Remove currency from period in-use list
                periodCurrencies.removeByCurrency(currency.ct, currency.id);
            }

            // Emit event
            emit CloseAccrualPeriodEvent(
                periodAmount,
                aggregateAccrualAmountByCurrencyBlockNumber[currency.ct][currency.id][block.number],
                currency.ct, currency.id
            );
        }
    }

    /// @notice Get the claimable amount for the given wallet-currency pair in the given
    /// range of accrual period indices
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param firstPeriodIndex The index of the first accrual period in the range, clamped to the max period index
    /// @param lastPeriodIndex The index of the last accrual period in the range, clamped to the max period index
    /// @return The claimable amount
    function claimableAmount(address wallet, address currencyCt, uint256 currencyId,
        uint256 firstPeriodIndex, uint256 lastPeriodIndex)
    public
    view
    returns (int256)
    {
        // Return 0 if no accrual period has terminated
        if (0 == closedAccrualsByCurrency[currencyCt][currencyId].length)
            return 0;

        // Clamp period indices to the index of the last accrual period
        firstPeriodIndex = firstPeriodIndex.clampMax(closedAccrualsByCurrency[currencyCt][currencyId].length - 1);
        lastPeriodIndex = lastPeriodIndex.clampMax(closedAccrualsByCurrency[currencyCt][currencyId].length - 1);

        // Impose ordinality constraint
        require(firstPeriodIndex <= lastPeriodIndex, "Index parameters mismatch [TokenHolderRevenueFund.sol:376]");

        // For each period index in range...
        int256 _claimableAmount = 0;
        for (uint256 i = firstPeriodIndex; i <= lastPeriodIndex; i++)
        // Increment the claimed amount
            _claimableAmount = _claimableAmount.add(_claimableAmountOfPeriod(wallet, currencyCt, currencyId, i));

        // Return the claimable amount
        return _claimableAmount;
    }

    /// @notice Claim accrual and transfer to beneficiary
    /// @param beneficiary The concerned beneficiary
    /// @param destWallet The concerned destination wallet of the transfer
    /// @param balanceType The target balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function claimAndTransferToBeneficiary(Beneficiary beneficiary, address destWallet, string memory balanceType,
        address currencyCt, uint256 currencyId, string memory standard)
    public
    {
        // Determine the period index to be claimed, being the one after the last period index already claimed
        uint256 periodIndex = (
        0 == claimedAccrualIndicesByWalletCurrency[msg.sender][currencyCt][currencyId].length ?
        0 :
        claimedAccrualIndicesByWalletCurrency[msg.sender][currencyCt][currencyId][
        claimedAccrualIndicesByWalletCurrency[msg.sender][currencyCt][currencyId].length - 1
        ] + 1
        );

        // Claim accrual and obtain the claimed amount
        claimAndTransferToBeneficiary(
            beneficiary, destWallet, balanceType, currencyCt, currencyId,
            periodIndex, periodIndex, standard
        );
    }

    /// @notice Claim accrual and transfer to beneficiary
    /// @param beneficiary The concerned beneficiary
    /// @param destWallet The concerned destination wallet of the transfer
    /// @param balanceType The target balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param firstPeriodIndex The index of the first accrual period in the range, clamped to the max period index
    /// @param lastPeriodIndex The index of the last accrual period in the range, clamped to the max period index
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function claimAndTransferToBeneficiary(Beneficiary beneficiary, address destWallet, string memory balanceType,
        address currencyCt, uint256 currencyId, uint256 firstPeriodIndex, uint256 lastPeriodIndex,
        string memory standard)
    public
    {
        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claim(msg.sender, currencyCt, currencyId, firstPeriodIndex, lastPeriodIndex);

        // Transfer ETH to the beneficiary
        if (address(0) == currencyCt && 0 == currencyId)
            beneficiary.receiveEthersTo.value(uint256(claimedAmount))(destWallet, balanceType);

        else {
            // Approve of beneficiary
            TransferController controller = transferController(currencyCt, standard);
            (bool success,) = address(controller).delegatecall(
                abi.encodeWithSelector(
                    controller.getApproveSignature(), address(beneficiary), uint256(claimedAmount), currencyCt, currencyId
                )
            );
            require(success, "Approval by controller failed [TokenHolderRevenueFund.sol:444]");

            // Transfer tokens to the beneficiary
            beneficiary.receiveTokensTo(destWallet, balanceType, claimedAmount, currencyCt, currencyId, standard);
        }

        // Emit event
        emit ClaimAndTransferToBeneficiaryEvent(msg.sender, balanceType, claimedAmount, currencyCt, currencyId,
            firstPeriodIndex, lastPeriodIndex, standard);
    }

    /// @notice Claim accrual and stage for later withdrawal
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param firstPeriodIndex The index of the first accrual period in the range, clamped to the max period index
    /// @param lastPeriodIndex The index of the last accrual period in the range, clamped to the max period index
    function claimAndStage(address currencyCt, uint256 currencyId,
        uint256 firstPeriodIndex, uint256 lastPeriodIndex)
    public
    {
        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claim(msg.sender, currencyCt, currencyId, firstPeriodIndex, lastPeriodIndex);

        // Update staged balance
        stagedByWallet[msg.sender].add(claimedAmount, currencyCt, currencyId);

        // Emit event
        emit ClaimAndStageEvent(msg.sender, claimedAmount, currencyCt, currencyId, firstPeriodIndex, lastPeriodIndex);
    }

    /// @notice Withdraw from staged balance of msg.sender
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string memory standard)
    public
    {
        // Require that amount is strictly positive
        require(amount.isNonZeroPositiveInt256(), "Amount not strictly positive [TokenHolderRevenueFund.sol:483]");

        // Clamp amount to the max given by staged balance
        amount = amount.clampMax(stagedByWallet[msg.sender].get(currencyCt, currencyId));

        // Subtract to per-wallet staged balance
        stagedByWallet[msg.sender].sub(amount, currencyCt, currencyId);

        // Execute transfer
        if (address(0) == currencyCt && 0 == currencyId)
            msg.sender.transfer(uint256(amount));

        else {
            TransferController controller = transferController(currencyCt, standard);
            (bool success,) = address(controller).delegatecall(
                abi.encodeWithSelector(
                    controller.getDispatchSignature(), address(this), msg.sender, uint256(amount), currencyCt, currencyId
                )
            );
            require(success, "Dispatch by controller failed [TokenHolderRevenueFund.sol:502]");
        }

        // Emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId, standard);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _claim(address wallet, address currencyCt, uint256 currencyId,
        uint256 firstPeriodIndex, uint256 lastPeriodIndex)
    private
    returns (int256)
    {
        // Require that at least one accrual period has terminated
        require(0 < closedAccrualsByCurrency[currencyCt][currencyId].length, "No terminated accrual period found [TokenHolderRevenueFund.sol:518]");

        // Clamp period indices to the index of the last accrual period
        firstPeriodIndex = firstPeriodIndex.clampMax(closedAccrualsByCurrency[currencyCt][currencyId].length - 1);
        lastPeriodIndex = lastPeriodIndex.clampMax(closedAccrualsByCurrency[currencyCt][currencyId].length - 1);

        // Impose ordinality constraint
        require(firstPeriodIndex <= lastPeriodIndex, "Index parameters mismatch [TokenHolderRevenueFund.sol:525]");

        // For each period index in range...
        int256 _claimedAmount = 0;
        for (uint256 i = firstPeriodIndex; i <= lastPeriodIndex; i++) {
            // Increment the claimed amount
            _claimedAmount = _claimedAmount.add(_claimableAmountOfPeriod(wallet, currencyCt, currencyId, i));

            // Set the claimed flag on the period
            accrualClaimedByWalletCurrencyIndex[wallet][currencyCt][currencyId][i] = true;

            // Store the index of the claimed accrual period
            claimedAccrualIndicesByWalletCurrency[wallet][currencyCt][currencyId].push(i);
        }

        // Return the claimed amount
        return _claimedAmount;
    }

    function _claimableAmountOfPeriod(address wallet, address currencyCt, uint256 currencyId, uint256 periodIndex)
    private
    view
    returns (int256)
    {
        // Return 0 if the period amount is 0 or period has previously been claimed for wallet-currency pair
        if (
            0 == closedAccrualsByCurrency[currencyCt][currencyId][periodIndex].amount ||
        accrualClaimedByWalletCurrencyIndex[wallet][currencyCt][currencyId][periodIndex]
        )
            return 0;

        // Retrieve the balance blocks of wallet
        int256 _walletBalanceBlocks = int256(
            revenueTokenManager.balanceBlocksIn(
                wallet,
                closedAccrualsByCurrency[currencyCt][currencyId][periodIndex].startBlock,
                closedAccrualsByCurrency[currencyCt][currencyId][periodIndex].endBlock
            )
        );

        // Retrieve the released amount blocks
        int256 _releasedAmountBlocks = int256(
            revenueTokenManager.releasedAmountBlocksIn(
                closedAccrualsByCurrency[currencyCt][currencyId][periodIndex].startBlock,
                closedAccrualsByCurrency[currencyCt][currencyId][periodIndex].endBlock
            )
        );

        // Calculate the claimed amount
        return closedAccrualsByCurrency[currencyCt][currencyId][periodIndex].amount
        .mul_nn(_walletBalanceBlocks).div_nn(_releasedAmountBlocks);
    }
}