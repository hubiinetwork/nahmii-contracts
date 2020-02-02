/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2019 Hubii AS
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
import {MonetaryTypesLib} from "./MonetaryTypesLib.sol";
import {CurrenciesLib} from "./CurrenciesLib.sol";
import {RevenueToken} from "./RevenueToken.sol";
import {RevenueTokenManager} from "./RevenueTokenManager.sol";
import {TransferController} from "./TransferController.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {BalanceAucCalculator} from "./BalanceAucCalculator.sol";
import {BalanceRecordable} from "./BalanceRecordable.sol";

/**
 * @title TokenHolderRevenueFund
 * @notice Fund that manages the revenue earned by revenue token holders.
 */
contract TokenHolderRevenueFund is Ownable, AccrualBeneficiary, Servable, TransferControllerManageable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;
    using FungibleBalanceLib for FungibleBalanceLib.Balance;
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

        mapping(address => ClaimRecord) claimRecordsByWallet;
    }

    struct ClaimRecord {
        bool completed;
        BlockSpan[] completedSpans;
    }

    struct BlockSpan {
        uint256 startBlock;
        uint256 endBlock;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    RevenueTokenManager public revenueTokenManager;
    BalanceAucCalculator public balanceBlocksCalculator;
    BalanceAucCalculator public releasedAmountBlocksCalculator;

    FungibleBalanceLib.Balance private periodAccrual;
    CurrenciesLib.Currencies private periodCurrencies;

    FungibleBalanceLib.Balance private aggregateAccrual;
    CurrenciesLib.Currencies private aggregateCurrencies;

    mapping(address => mapping(uint256 => Accrual[])) public closedAccrualsByCurrency;

    address[] public nonClaimers;
    mapping(address => uint256) public nonClaimerIndicesByWallet;

    mapping(address => mapping(address => mapping(uint256 => uint256[]))) public claimedAccrualIndicesByWalletCurrency;
    mapping(address => mapping(address => mapping(uint256 => mapping(uint256 => bool)))) public accrualClaimedByWalletCurrencyAccrual;

    mapping(address => mapping(address => mapping(uint256 => mapping(uint256 => uint256)))) public maxClaimedBlockNumberByWalletCurrencyAccrual;
    uint256 public claimBlockNumberBatchSize;

    mapping(address => mapping(uint256 => mapping(uint256 => int256))) public aggregateAccrualAmountByCurrencyBlockNumber;

    mapping(address => FungibleBalanceLib.Balance) private stagedByWallet;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetRevenueTokenManagerEvent(RevenueTokenManager manager);
    event SetBalanceBlocksCalculatorEvent(BalanceAucCalculator calculator);
    event SetReleasedAmountBlocksCalculatorEvent(BalanceAucCalculator calculator);
    event SetClaimBlockNumberBatchSizeEvent(uint256 batchSize);
    event RegisterNonClaimerEvent(address wallet);
    event DeregisterNonClaimerEvent(address wallet);
    event ReceiveEvent(address wallet, int256 amount, address currencyCt,
        uint256 currencyId);
    event WithdrawEvent(address to, int256 amount, address currencyCt, uint256 currencyId);
    event CloseAccrualPeriodEvent(int256 periodAmount, int256 aggregateAmount, address currencyCt,
        uint256 currencyId);
    event ClaimAndTransferToBeneficiaryByAccrualsEvent(address wallet, string balanceType, int256 amount,
        address currencyCt, uint256 currencyId, uint256 startAccrualIndex, uint256 endAccrualIndex,
        string standard);
    event ClaimAndTransferToBeneficiaryByBlockNumbersEvent(address wallet, string balanceType, int256 amount,
        address currencyCt, uint256 currencyId, uint256 startBlock, uint256 endBlock,
        string standard);
    event ClaimAndStageByAccrualsEvent(address from, int256 amount, address currencyCt,
        uint256 currencyId, uint256 startAccrualIndex, uint256 endAccrualIndex);
    event ClaimAndStageByBlockNumbersEvent(address from, int256 amount, address currencyCt,
        uint256 currencyId, uint256 startBlock, uint256 endBlock);
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
    /// @param manager The (address of) RevenueTokenManager contract instance
    function setRevenueTokenManager(RevenueTokenManager manager)
    public
    onlyDeployer
    notNullAddress(address(manager))
    {
        // Set new revenue token manager
        revenueTokenManager = manager;

        // Emit event
        emit SetRevenueTokenManagerEvent(manager);
    }

    /// @notice Set the balance AUC calculator for calculation of revenue token balance blocks
    /// @param calculator The balance AUC calculator
    function setBalanceBlocksCalculator(BalanceAucCalculator calculator)
    public
    onlyDeployer
    notNullOrThisAddress(address(calculator))
    {
        // Set the calculator
        balanceBlocksCalculator = calculator;

        // Emit event
        emit SetBalanceBlocksCalculatorEvent(balanceBlocksCalculator);
    }

    /// @notice Set the balance AUC calculator for calculation of revenue token balance blocks
    /// @param calculator The balance AUC calculator
    function setReleasedAmountBlocksCalculator(BalanceAucCalculator calculator)
    public
    onlyDeployer
    notNullOrThisAddress(address(calculator))
    {
        // Set the calculator
        releasedAmountBlocksCalculator = calculator;

        // Emit event
        emit SetReleasedAmountBlocksCalculatorEvent(releasedAmountBlocksCalculator);
    }

    /// @notice Set the block number batch size for claims with function
    /// claimAndTransferToBeneficiary(Beneficiary beneficiary, address destWallet, string memory balanceType,
    ///     address currencyCt, uint256 currencyId, string memory standard)
    /// @param batchSize The batch size
    function setClaimBlockNumberBatchSize(uint256 batchSize)
    public
    onlyDeployer
    {
        // Update claim by block number batch size
        claimBlockNumberBatchSize = batchSize;

        // Emit event
        emit SetClaimBlockNumberBatchSizeEvent(batchSize);
    }

    /// @notice Get the number of registered non-claimers
    /// @return The number of registered non-claimers
    function nonClaimersCount()
    public
    view
    returns (uint256)
    {
        return nonClaimers.length;
    }

    /// @notice Gauge whether the given wallet is a registered non-claimer, i.e. prevented from claiming
    /// @param wallet The address of the concerned wallet
    /// @return true if wallet is non-claimer
    function isNonClaimer(address wallet)
    public
    view
    returns (bool)
    {
        return 0 < nonClaimerIndicesByWallet[wallet];
    }

    /// @notice Register the given wallet as a non-claimer that is prevented from claiming
    /// @param wallet The address of the concerned wallet
    function registerNonClaimer(address wallet)
    public
    onlyDeployer
    notNullAddress(wallet)
    {
        // If non-claimer has not been added already...
        if (0 == nonClaimerIndicesByWallet[wallet]) {
            // Add non-claimer
            nonClaimers.push(wallet);
            nonClaimerIndicesByWallet[wallet] = nonClaimers.length;

            // Emit event
            emit RegisterNonClaimerEvent(wallet);
        }
    }

    /// @notice Deregister the given wallet as a non-claimer that is prevented from claiming
    /// @param wallet The address of the concerned wallet
    function deregisterNonClaimer(address wallet)
    public
    onlyDeployer
    notNullAddress(wallet)
    {
        // If non-claimer has been added previously...
        if (0 < nonClaimerIndicesByWallet[wallet]) {
            // Remove non-claimer
            if (nonClaimerIndicesByWallet[wallet] < nonClaimers.length) {
                nonClaimers[nonClaimerIndicesByWallet[wallet].sub(1)] = nonClaimers[nonClaimers.length.sub(1)];
                nonClaimerIndicesByWallet[nonClaimers[nonClaimers.length.sub(1)]] = nonClaimerIndicesByWallet[wallet];
            }
            nonClaimers.length--;
            nonClaimerIndicesByWallet[wallet] = 0;

            // Emit event
            emit DeregisterNonClaimerEvent(wallet);
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
        require(amount.isNonZeroPositiveInt256(), "Amount not strictly positive [TokenHolderRevenueFund.sol:293]");

        // Execute transfer
        TransferController controller = transferController(currencyCt, standard);
        (bool success,) = address(controller).delegatecall(
            abi.encodeWithSelector(
                controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId
            )
        );
        require(success, "Reception by controller failed [TokenHolderRevenueFund.sol:302]");

        // Add to balances
        periodAccrual.add(amount, currencyCt, currencyId);
        aggregateAccrual.add(amount, currencyCt, currencyId);

        // Add currency to in-use lists
        periodCurrencies.add(currencyCt, currencyId);
        aggregateCurrencies.add(currencyCt, currencyId);

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

    /// @notice Get the number of closed accruals for the given currency
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
        for (uint256 i = 0; i < currencies.length; i = i.add(1)) {
            MonetaryTypesLib.Currency memory currency = currencies[i];

            // Get the amount of the accrual period
            int256 periodAmount = periodAccrual.get(currency.ct, currency.id);

            // Define start block of the completed accrual, as (if existent) previous period end block + 1, else 0
            uint256 startBlock = (
            0 == closedAccrualsByCurrency[currency.ct][currency.id].length ?
            0 :
            closedAccrualsByCurrency[currency.ct][currency.id][closedAccrualsByCurrency[currency.ct][currency.id].length - 1].endBlock + 1
            );

            // Add new accrual to closed accruals
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

    /// @notice Get the index of closed accrual for the given currency and block number
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param blockNumber The concerned block number
    /// @return The accrual index
    function closedAccrualIndexByBlockNumber(address currencyCt, uint256 currencyId, uint256 blockNumber)
    public
    view
    returns (uint256)
    {
        for (uint256 i = closedAccrualsByCurrency[currencyCt][currencyId].length; i > 0;) {
            i = i.sub(1);
            if (closedAccrualsByCurrency[currencyCt][currencyId][i].startBlock <= blockNumber)
                return i;
        }
        return 0;
    }

    /// @notice Get the claimable amount for the given wallet-currency pair in the given
    /// range of accrual indices
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param startAccrualIndex The index of the first accrual in the range, clamped to the max accrual index
    /// @param endAccrualIndex The index of the last accrual in the range, clamped to the max accrual index
    /// @return The claimable amount
    function claimableAmountByAccruals(address wallet, address currencyCt, uint256 currencyId,
        uint256 startAccrualIndex, uint256 endAccrualIndex)
    public
    view
    returns (int256)
    {
        // Return 0 if wallet is non-claimer
        if (isNonClaimer(wallet))
            return 0;

        // Return 0 if no accrual has terminated
        if (0 == closedAccrualsByCurrency[currencyCt][currencyId].length)
            return 0;

        // Impose ordinality constraint
        require(startAccrualIndex <= endAccrualIndex, "Accrual index ordinality mismatch [TokenHolderRevenueFund.sol:496]");

        // Declare claimable amount
        int256 claimableAmount = 0;

        // For each accrual index in range...
        for (
            uint256 i = startAccrualIndex;
            i <= endAccrualIndex && i < closedAccrualsByCurrency[currencyCt][currencyId].length;
            i = i.add(1)
        ) {
            // Add to claimable amount
            claimableAmount = claimableAmount.add(
                _claimableAmount(wallet, closedAccrualsByCurrency[currencyCt][currencyId][i])
            );
        }

        // Return the claimable amount
        return claimableAmount;
    }

    /// @notice Get the claimable amount for the given wallet-currency pair in the given
    /// range of block numbers
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param startBlock The first block number in the range
    /// @param endBlock The last block number in the range
    /// @return The claimable amount
    function claimableAmountByBlockNumbers(address wallet, address currencyCt, uint256 currencyId,
        uint256 startBlock, uint256 endBlock)
    public
    view
    returns (int256)
    {
        // Return 0 if wallet is non-claimer
        if (isNonClaimer(wallet))
            return 0;

        // Return 0 if no accrual has terminated
        if (0 == closedAccrualsByCurrency[currencyCt][currencyId].length)
            return 0;

        // Impose ordinality constraint
        require(startBlock <= endBlock, "Block number ordinality mismatch [TokenHolderRevenueFund.sol:540]");

        // Obtain accrual indices corresponding to block number boundaries
        uint256 startAccrualIndex = closedAccrualIndexByBlockNumber(currencyCt, currencyId, startBlock);
        uint256 endAccrualIndex = closedAccrualIndexByBlockNumber(currencyCt, currencyId, endBlock);

        // Obtain accrual
        Accrual storage endAccrual = closedAccrualsByCurrency[currencyCt][currencyId][endAccrualIndex];

        // Return 0 if end block is before the end accrual's start block
        if (endBlock < endAccrual.startBlock)
            return 0;

        // Declare claimable amount
        int256 claimableAmount = 0;

        // If start accrual index is strictly smaller than end accrual index...
        if (startAccrualIndex < endAccrualIndex) {
            // Obtain accrual
            Accrual storage startAccrual = closedAccrualsByCurrency[currencyCt][currencyId][startAccrualIndex];

            // Add to claimable amount for first (potentially partial) accrual
            claimableAmount = _claimableAmount(
                wallet, startAccrual,
                startBlock.clampMin(startAccrual.startBlock),
                endBlock.clampMax(startAccrual.endBlock)
            );
        }

        // For each accrual between first and last accrual
        for (uint256 i = startAccrualIndex.add(1); i < endAccrualIndex; i = i.add(1)) {
            // Add to claimable amount
            claimableAmount = claimableAmount.add(
                _claimableAmount(wallet, closedAccrualsByCurrency[currencyCt][currencyId][i])
            );
        }

        // Add to claimable amount for last (potentially partial) accrual
        claimableAmount = claimableAmount.add(
            _claimableAmount(
                wallet, endAccrual,
                startBlock.clampMin(endAccrual.startBlock),
                endBlock.clampMax(endAccrual.endBlock)
            )
        );

        // Return the claimable amount
        return claimableAmount;
    }

    /// @notice Claim accrual amounts and transfer to beneficiary by accrual index bounds
    /// @param beneficiary The concerned beneficiary
    /// @param destWallet The concerned destination wallet of the transfer
    /// @param balanceType The target balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param startAccrualIndex The index of the first accrual in the range, clamped to the max accrual index
    /// @param endAccrualIndex The index of the last accrual in the range, clamped to the max accrual index
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function claimAndTransferToBeneficiaryByAccruals(Beneficiary beneficiary, address destWallet, string memory balanceType,
        address currencyCt, uint256 currencyId, uint256 startAccrualIndex, uint256 endAccrualIndex,
        string memory standard)
    public
    {
        // Require that message sender is non-claimer
        require(!isNonClaimer(msg.sender), "Message sender is non-claimer [TokenHolderRevenueFund.sol:605]");

        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claimByAccruals(msg.sender, currencyCt, currencyId, startAccrualIndex, endAccrualIndex);

        // Transfer to beneficiary
        _transferToBeneficiary(beneficiary, destWallet, balanceType, claimedAmount,
            currencyCt, currencyId, standard);

        // Emit event
        emit ClaimAndTransferToBeneficiaryByAccrualsEvent(msg.sender, balanceType, claimedAmount, currencyCt, currencyId,
            startAccrualIndex, endAccrualIndex, standard);
    }

    /// @notice Claim accrual amounts and transfer to beneficiary by block number bounds
    /// @param beneficiary The concerned beneficiary
    /// @param destWallet The concerned destination wallet of the transfer
    /// @param balanceType The target balance type
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param startBlock The first block number in the range
    /// @param endBlock The last block number in the range
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function claimAndTransferToBeneficiaryByBlockNumbers(Beneficiary beneficiary, address destWallet,
        string memory balanceType, address currencyCt, uint256 currencyId, uint256 startBlock,
        uint256 endBlock, string memory standard)
    public
    {
        // Require that message sender is non-claimer
        require(!isNonClaimer(msg.sender), "Message sender is non-claimer [TokenHolderRevenueFund.sol:634]");

        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claimByBlockNumbers(msg.sender, currencyCt, currencyId, startBlock, endBlock);

        // Transfer to beneficiary
        _transferToBeneficiary(beneficiary, destWallet, balanceType, claimedAmount,
            currencyCt, currencyId, standard);

        // Emit event
        emit ClaimAndTransferToBeneficiaryByBlockNumbersEvent(msg.sender, balanceType, claimedAmount, currencyCt,
            currencyId, startBlock, endBlock, standard);
    }

    /// @notice Claim last unclaimed accrual's amount and transfer to beneficiary
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
        // Determine the last accrual index that was fully claimed, or 0 if the message sender has not previously
        // claimed the currency
        uint256 accrualIndex = (
        0 == claimedAccrualIndicesByWalletCurrency[msg.sender][currencyCt][currencyId].length ?
        0 :
        claimedAccrualIndicesByWalletCurrency[msg.sender][currencyCt][currencyId][
        claimedAccrualIndicesByWalletCurrency[msg.sender][currencyCt][currencyId].length - 1
        ] + 1
        );

        // If no block number batch size has been set then claim and transfer by accrual index
        if (0 == claimBlockNumberBatchSize) {
            // Add accrual index to claimed indices
            _updateClaimedAccruals(msg.sender, currencyCt, currencyId, accrualIndex);

            // Claim and transfer
            claimAndTransferToBeneficiaryByAccruals(
                beneficiary, destWallet, balanceType, currencyCt, currencyId,
                accrualIndex, accrualIndex, standard
            );
        }

        // Else claim and transfer by block numbers
        else {
            // Obtain accrual
            Accrual storage accrual = closedAccrualsByCurrency[currencyCt][currencyId][accrualIndex];

            // Obtain the block number bounds
            uint256 startBlock = (
            0 == maxClaimedBlockNumberByWalletCurrencyAccrual[msg.sender][currencyCt][currencyId][accrualIndex] ?
            accrual.startBlock :
            maxClaimedBlockNumberByWalletCurrencyAccrual[msg.sender][currencyCt][currencyId][accrualIndex] + 1
            ).clampMax(accrual.endBlock);
            uint256 endBlock = (startBlock + claimBlockNumberBatchSize - 1).clampMax(accrual.endBlock);

            // Add accrual index to claimed indices if this is the last block number span
            if (endBlock == accrual.endBlock)
                _updateClaimedAccruals(msg.sender, currencyCt, currencyId, accrualIndex);

            // Update max claimed block number
            maxClaimedBlockNumberByWalletCurrencyAccrual[msg.sender][currencyCt][currencyId][accrualIndex] = endBlock;

            // Claim and transfer
            claimAndTransferToBeneficiaryByBlockNumbers(
                beneficiary, destWallet, balanceType, currencyCt, currencyId,
                startBlock, endBlock, standard
            );
        }
    }

    /// @notice Claim accrual amount and stage for later withdrawal by accrual index bounds
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param startAccrualIndex The index of the first accrual in the range, clamped to the max accrual index
    /// @param endAccrualIndex The index of the last accrual in the range, clamped to the max accrual index
    function claimAndStageByAccruals(address currencyCt, uint256 currencyId,
        uint256 startAccrualIndex, uint256 endAccrualIndex)
    public
    {
        // Require that message sender is non-claimer
        require(!isNonClaimer(msg.sender), "Message sender is non-claimer [TokenHolderRevenueFund.sol:719]");

        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claimByAccruals(msg.sender, currencyCt, currencyId, startAccrualIndex, endAccrualIndex);

        // If the claimed amount is strictly positive...
        if (0 < claimedAmount) {
            // Update staged balance
            stagedByWallet[msg.sender].add(claimedAmount, currencyCt, currencyId);

            // Emit event
            emit ClaimAndStageByAccrualsEvent(msg.sender, claimedAmount, currencyCt, currencyId, startAccrualIndex, endAccrualIndex);
        }
    }

    /// @notice Claim accrual amount and stage for later withdrawal by block number bounds
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param startBlock The first block number in the range
    /// @param endBlock The last block number in the range
    function claimAndStageByBlockNumbers(address currencyCt, uint256 currencyId,
        uint256 startBlock, uint256 endBlock)
    public
    {
        // Require that message sender is non-claimer
        require(!isNonClaimer(msg.sender), "Message sender is non-claimer [TokenHolderRevenueFund.sol:744]");

        // Claim accrual and obtain the claimed amount
        int256 claimedAmount = _claimByBlockNumbers(msg.sender, currencyCt, currencyId, startBlock, endBlock);

        // If the claimed amount is strictly positive...
        if (0 < claimedAmount) {
            // Update staged balance
            stagedByWallet[msg.sender].add(claimedAmount, currencyCt, currencyId);

            // Emit event
            emit ClaimAndStageByBlockNumbersEvent(msg.sender, claimedAmount, currencyCt, currencyId, startBlock, endBlock);
        }
    }

    /// @notice Gauge whether the accrual by the given accrual index has previously been fully
    /// claimed for the given wallet-currency pair
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param accrualIndex The index of the concerned accrual
    /// @return true if fully claimed
    function fullyClaimed(address wallet, address currencyCt, uint256 currencyId, uint256 accrualIndex)
    public
    view
    returns (bool)
    {
        // Return true if the given accrual has been closed and fully claimed by the wallet
        return (
        accrualIndex < closedAccrualsByCurrency[currencyCt][currencyId].length &&
        closedAccrualsByCurrency[currencyCt][currencyId][accrualIndex].claimRecordsByWallet[wallet].completed
        );
    }

    /// @notice Gauge whether the accrual by the given accrual index has previously been partially
    /// claimed for the given wallet-currency pair
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param accrualIndex The index of the concerned accrual
    /// @return true if partially claimed
    function partiallyClaimed(address wallet, address currencyCt, uint256 currencyId, uint256 accrualIndex)
    public
    view
    returns (bool)
    {
        // Return true if the given accrual has been closed and partially claimed by the wallet
        return (
        accrualIndex < closedAccrualsByCurrency[currencyCt][currencyId].length &&
        0 < closedAccrualsByCurrency[currencyCt][currencyId][accrualIndex].claimRecordsByWallet[wallet].completedSpans.length
        );
    }

    /// @notice Get the block spans of partial claims executed on the given accrual index and wallet-currency pair
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param accrualIndex The index of the concerned accrual
    /// @return The claimed block spans
    function claimedBlockSpans(address wallet, address currencyCt, uint256 currencyId, uint256 accrualIndex)
    public
    view
    returns (BlockSpan[] memory)
    {
        if (closedAccrualsByCurrency[currencyCt][currencyId].length <= accrualIndex)
            return new BlockSpan[](0);

        return closedAccrualsByCurrency[currencyCt][currencyId][accrualIndex].claimRecordsByWallet[wallet].completedSpans;
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
        require(amount.isNonZeroPositiveInt256(), "Amount not strictly positive [TokenHolderRevenueFund.sol:823]");

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
            require(success, "Dispatch by controller failed [TokenHolderRevenueFund.sol:842]");
        }

        // Emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId, standard);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _claimByAccruals(address wallet, address currencyCt, uint256 currencyId,
        uint256 startAccrualIndex, uint256 endAccrualIndex)
    private
    returns (int256)
    {
        // Require that at least one accrual has terminated
        require(0 < closedAccrualsByCurrency[currencyCt][currencyId].length, "No terminated accrual found [TokenHolderRevenueFund.sol:858]");

        // Impose ordinality constraint
        require(startAccrualIndex <= endAccrualIndex, "Accrual index mismatch [TokenHolderRevenueFund.sol:861]");

        // Declare claimed amount
        int256 claimedAmount = 0;

        // For each accrual index in range...
        for (
            uint256 i = startAccrualIndex;
            i <= endAccrualIndex && i < closedAccrualsByCurrency[currencyCt][currencyId].length;
            i = i.add(1)
        ) {
            // Obtain accrual
            Accrual storage accrual = closedAccrualsByCurrency[currencyCt][currencyId][i];

            // Add to claimable amount for accrual
            claimedAmount = claimedAmount.add(_claimableAmount(wallet, accrual));

            // Update claim record
            _updateClaimRecord(wallet, accrual);
        }

        // Return the claimed amount
        return claimedAmount;
    }

    function _claimByBlockNumbers(address wallet, address currencyCt, uint256 currencyId,
        uint256 startBlock, uint256 endBlock)
    private
    returns (int256)
    {
        // Require that at least one accrual has terminated
        require(0 < closedAccrualsByCurrency[currencyCt][currencyId].length, "No terminated accrual found [TokenHolderRevenueFund.sol:892]");

        // Impose ordinality constraint
        require(startBlock <= endBlock, "Block number mismatch [TokenHolderRevenueFund.sol:895]");

        // Obtain accrual indices corresponding to block number boundaries
        uint256 startAccrualIndex = closedAccrualIndexByBlockNumber(currencyCt, currencyId, startBlock);
        uint256 endAccrualIndex = closedAccrualIndexByBlockNumber(currencyCt, currencyId, endBlock);

        // Declare claimed amount and clamped blocks
        int256 claimedAmount = 0;
        uint256 clampedStartBlock = 0;
        uint256 clampedEndBlock = 0;

        // If start accrual index is strictly smaller than end accrual index...
        if (startAccrualIndex < endAccrualIndex) {
            // Obtain start accrual
            Accrual storage accrual = closedAccrualsByCurrency[currencyCt][currencyId][startAccrualIndex];

            // Clamp start and end blocks
            clampedStartBlock = startBlock.clampMin(accrual.startBlock);
            clampedEndBlock = endBlock.clampMax(accrual.endBlock);

            // Add to claimable amount for first (potentially partial) accrual
            claimedAmount = _claimableAmount(wallet, accrual, clampedStartBlock, clampedEndBlock);

            // Update claim record
            _updateClaimRecord(wallet, accrual, clampedStartBlock, clampedEndBlock);
        }

        // For each accrual index in range...
        for (uint256 i = startAccrualIndex.add(1); i < endAccrualIndex; i = i.add(1)) {
            // Obtain accrual
            Accrual storage accrual = closedAccrualsByCurrency[currencyCt][currencyId][i];

            // Add to claimable amount for accrual
            claimedAmount = claimedAmount.add(_claimableAmount(wallet, accrual));

            // Update claim record
            _updateClaimRecord(wallet, accrual);
        }

        // Obtain end accrual
        Accrual storage accrual = closedAccrualsByCurrency[currencyCt][currencyId][endAccrualIndex];

        // Clamp start and end blocks
        clampedStartBlock = startBlock.clampMin(accrual.startBlock);
        clampedEndBlock = endBlock.clampMax(accrual.endBlock);

        // Add to claimable amount for last (potentially partial) accrual
        claimedAmount = claimedAmount.add(
            _claimableAmount(wallet, accrual, clampedStartBlock, clampedEndBlock)
        );

        // Update claim record
        _updateClaimRecord(wallet, accrual, clampedStartBlock, clampedEndBlock);

        // Return the claimed amount
        return claimedAmount;
    }

    function _transferToBeneficiary(Beneficiary beneficiary, address destWallet, string memory balanceType,
        int256 amount, address currencyCt, uint256 currencyId, string memory standard)
    private
    {
        // Transfer ETH to the beneficiary
        if (address(0) == currencyCt && 0 == currencyId)
            beneficiary.receiveEthersTo.value(uint256(amount))(destWallet, balanceType);

        else {
            // Approve of beneficiary
            TransferController controller = transferController(currencyCt, standard);
            (bool success,) = address(controller).delegatecall(
                abi.encodeWithSelector(
                    controller.getApproveSignature(), address(beneficiary), uint256(amount), currencyCt, currencyId
                )
            );
            require(success, "Approval by controller failed [TokenHolderRevenueFund.sol:969]");

            // Transfer tokens to the beneficiary
            beneficiary.receiveTokensTo(destWallet, balanceType, amount, currencyCt, currencyId, standard);
        }
    }

    function _updateClaimRecord(address wallet, Accrual storage accrual)
    private
    {
        // Set the completed flag to true
        accrual.claimRecordsByWallet[wallet].completed = true;

        // Clear completed block number spans if existent
        if (0 < accrual.claimRecordsByWallet[wallet].completedSpans.length)
            accrual.claimRecordsByWallet[wallet].completedSpans.length = 0;
    }

    function _updateClaimRecord(address wallet, Accrual storage accrual,
        uint256 startBlock, uint256 endBlock)
    private
    {
        // Add completed block span
        accrual.claimRecordsByWallet[wallet].completedSpans.push(
            BlockSpan(startBlock, endBlock)
        );
    }

    function _updateClaimedAccruals(address wallet, address currencyCt, uint256 currencyId, uint256 accrualIndex)
    private
    {
        if (!accrualClaimedByWalletCurrencyAccrual[wallet][currencyCt][currencyId][accrualIndex]) {
            claimedAccrualIndicesByWalletCurrency[wallet][currencyCt][currencyId].push(accrualIndex);
            accrualClaimedByWalletCurrencyAccrual[wallet][currencyCt][currencyId][accrualIndex] = true;
        }
    }

    /// @dev Return false if the wallet's claim record is either completed or its number of completed block
    /// number spans is non-zero
    function _isClaimable(address wallet, Accrual storage accrual)
    private
    view
    returns (bool)
    {
        // Return false if accrual amount is non-zero and no claim of accrual has been executed
        return (
        0 < accrual.amount &&
        !accrual.claimRecordsByWallet[wallet].completed &&
        0 == accrual.claimRecordsByWallet[wallet].completedSpans.length
        );
    }

    function _isClaimable(address wallet, Accrual storage accrual,
        uint256 startBlock, uint256 endBlock)
    private
    view
    returns (bool)
    {
        // Return false if accrual amount is zero or the claim is fully completed
        if (
            0 == accrual.amount ||
        accrual.claimRecordsByWallet[wallet].completed
        )
            return false;

        // Return false if start or end block is within any of the completed block spans
        for (uint256 i = 0;
            i < accrual.claimRecordsByWallet[wallet].completedSpans.length;
            i = i.add(1)) {
            if (
                (
                accrual.claimRecordsByWallet[wallet].completedSpans[i].startBlock <= startBlock &&
                startBlock <= accrual.claimRecordsByWallet[wallet].completedSpans[i].endBlock
                ) ||
                (
                accrual.claimRecordsByWallet[wallet].completedSpans[i].startBlock <= endBlock &&
                endBlock <= accrual.claimRecordsByWallet[wallet].completedSpans[i].endBlock
                )
            )
                return false;
        }

        return true;
    }

    function _claimableAmount(address wallet, Accrual storage accrual)
    private
    view
    returns (int256)
    {
        // Return 0 if not claimable
        if (!_isClaimable(wallet, accrual))
            return 0;

        // Retrieve the released amount blocks
        int256 _releasedAmountBlocks = _correctedReleasedAmountBlocks(
            accrual.startBlock, accrual.endBlock
        );

        // Return 0 if no revenue tokens were released
        if (0 == _releasedAmountBlocks)
            return 0;

        // Retrieve the balance blocks of wallet
        int256 _walletBalanceBlocks = _balanceBlocks(
            wallet, accrual.startBlock, accrual.endBlock
        );

        // Calculate the claimed amount
        return accrual.amount
        .mul_nn(_walletBalanceBlocks)
        .div_nn(_releasedAmountBlocks);
    }

    function _claimableAmount(address wallet, Accrual storage accrual,
        uint256 startBlock, uint256 endBlock)
    private
    view
    returns (int256)
    {
        // Return 0 if not claimable
        if (!_isClaimable(wallet, accrual, startBlock, endBlock))
            return 0;

        // Retrieve the released amount blocks
        int256 _releasedAmountBlocks = _correctedReleasedAmountBlocks(
            startBlock, endBlock
        );

        // Return 0 if no revenue tokens were released
        if (0 == _releasedAmountBlocks)
            return 0;

        // Retrieve the balance blocks of wallet
        int256 _walletBalanceBlocks = _balanceBlocks(
            wallet, startBlock, endBlock
        );

        // Calculate scaling factor numerator and denominator to account for partial concerned span of accrual
        int256 _accrualNumerator = int256(endBlock.sub(startBlock).add(1));
        int256 _accrualDenominator = int256(accrual.endBlock.sub(accrual.startBlock).add(1));

        // Calculate the scaled claimable amount
        return accrual.amount
        .mul_nn(_walletBalanceBlocks)
        .mul_nn(_accrualNumerator)
        .div_nn(_releasedAmountBlocks.mul_nn(_accrualDenominator));
    }

    function _balanceBlocks(address wallet, uint256 startBlock, uint256 endBlock)
    private
    view
    returns (int256)
    {
        return int256(balanceBlocksCalculator.calculate(
                BalanceRecordable(address(revenueTokenManager.token())), wallet, startBlock, endBlock
            ));
    }

    function _correctedReleasedAmountBlocks(uint256 startBlock, uint256 endBlock)
    private
    view
    returns (int256)
    {
        // Obtain the released amount blocks
        int256 amountBlocks = int256(releasedAmountBlocksCalculator.calculate(
                BalanceRecordable(address(revenueTokenManager)), address(0), startBlock, endBlock
            ));

        // Correct the amount blocks by subtracting the contributions from contracts that may not claim
        for (uint256 i = 0; i < nonClaimers.length; i = i.add(1))
            amountBlocks = amountBlocks.sub(_balanceBlocks(nonClaimers[i], startBlock, endBlock));

        // Return corrected amount blocks
        return amountBlocks;
    }
}