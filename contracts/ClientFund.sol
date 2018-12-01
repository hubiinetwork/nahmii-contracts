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
import {Configurable} from "./Configurable.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {Benefactor} from "./Benefactor.sol";
import {AuthorizableServable} from "./AuthorizableServable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {TransferController} from "./TransferController.sol";
//import {BalanceLib} from "./BalanceLib.sol";
//import {BalanceLogLib} from "./BalanceLogLib.sol";
//import {TxHistoryLib} from "./TxHistoryLib.sol";
//import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {BalanceTracker} from "./BalanceTracker.sol";
import {TransactionTracker} from "./TransactionTracker.sol";

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
*/
contract ClientFund is Ownable, Configurable, Beneficiary, Benefactor, AuthorizableServable, TransferControllerManageable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public DEPOSITED_BALANCE_TYPE = "deposited";
    string constant public SETTLED_BALANCE_TYPE = "settled";
    string constant public STAGED_BALANCE_TYPE = "staged";

    bytes32 constant public DEPOSITED_BALANCE_TYPE_HASH = keccak256(abi.encodePacked(DEPOSITED_BALANCE_TYPE));
    bytes32 constant public SETTLED_BALANCE_TYPE_HASH = keccak256(abi.encodePacked(SETTLED_BALANCE_TYPE));
    bytes32 constant public STAGED_BALANCE_TYPE_HASH = keccak256(abi.encodePacked(STAGED_BALANCE_TYPE));

    bytes32 constant public DEPOSIT_TRANSACTION_TYPE_HASH = keccak256(abi.encodePacked("deposit"));
    bytes32 constant public WITHDRAWAL_TRANSACTION_TYPE_HASH = keccak256(abi.encodePacked("withdrawal"));

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Wallet {
        address locker;
        uint256 unlockTime;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;

    address[] public lockedWallets;
    mapping(address => uint256) public lockedWalletIndexByWallet;

    address[] public seizedWallets;
    mapping(address => bool) public seizedByWallet;

    BalanceTracker public balanceTracker;
    TransactionTracker public transactionTracker;

    bytes32[] private _allBalanceTypeHashes;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetBalanceTrackerEvent(BalanceTracker balanceTracker);
    event SetTransactionTrackerEvent(TransactionTracker transactionTracker);
    event ReceiveEvent(address wallet, string balanceType, int256 amount, address currencyCt, uint256 currencyId,
        string standard);
    event WithdrawEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard);
    event StageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event UnstageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event UpdateSettledBalanceEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event StageToBeneficiaryEvent(address sourceWallet, address beneficiary, int256 amount, address currencyCt,
        uint256 currencyId, string standard);
    event TransferToBeneficiaryEvent(address beneficiary, int256 amount, address currencyCt, uint256 currencyId);
    event LockBalancesEvent(address lockedWallet, address lockerWallet);
    event UnlockBalancesEvent(address lockedWallet, address lockerWallet);
    event UnlockBalancesByProxyEvent(address lockedWallet, address lockerWallet);
    event SeizeBalancesEvent(address lockedWallet, address lockerWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) Beneficiary() Benefactor()
    public
    {
        serviceActivationTimeout = 1 weeks;

        _allBalanceTypeHashes = new bytes32[](3);
        _allBalanceTypeHashes[0] = DEPOSITED_BALANCE_TYPE_HASH;
        _allBalanceTypeHashes[1] = SETTLED_BALANCE_TYPE_HASH;
        _allBalanceTypeHashes[2] = STAGED_BALANCE_TYPE_HASH;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the balance tracker contract
    /// @dev This function can only successfully be called once
    /// @param _balanceTracker The (address of) BalanceTracker contract instance
    function setBalanceTracker(BalanceTracker _balanceTracker)
    public
    onlyDeployer
    {
        // Require that balance tracker has not been set previously
        require(address(0) == address(balanceTracker));

        // Set balance tracker
        balanceTracker = _balanceTracker;

        // Emit event
        emit SetBalanceTrackerEvent(_balanceTracker);
    }

    /// @notice Set the transaction tracker contract
    /// @dev This function can only successfully be called once
    /// @param _transactionTracker The (address of) TransactionTracker contract instance
    function setTransactionTracker(TransactionTracker _transactionTracker)
    public
    onlyDeployer
    {
        // Require that transaction tracker has not been set previously
        require(address(0) == address(transactionTracker));

        // Set transaction tracker
        transactionTracker = _transactionTracker;

        // Emit event
        emit SetTransactionTrackerEvent(_transactionTracker);
    }

    /// @notice Fallback function that deposits ethers to msg.sender's deposited balance
    function()
    public
    payable
    {
        receiveEthersTo(msg.sender, DEPOSITED_BALANCE_TYPE);
    }

    /// @notice Deposit ethers to the given wallet's deposited balance
    /// @param wallet The address of the concerned wallet
    /// @param balanceType The target balance ty
    function receiveEthersTo(address wallet, string balanceType)
    public
    payable
    {
        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Register reception
        _receiveTo(wallet, balanceType, amount, address(0), 0);

        // Emit event
        emit ReceiveEvent(wallet, balanceType, amount, address(0), 0, "");
    }

    /// @notice Receive token to msg.sender's given balance
    /// @dev The wallet must approve of this ClientFund's transfer prior to calling this function
    /// @param balanceType The target balance type
    /// @param amount The amount to deposit
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function receiveTokens(string balanceType, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        receiveTokensTo(msg.sender, balanceType, amount, currencyCt, currencyId, standard);
    }

    /// @notice Receive token to the given wallet's given balance
    /// @dev The wallet must approve of this ClientFund's transfer prior to calling this function
    /// @param wallet The address of the concerned wallet
    /// @param balanceType The target balance type
    /// @param amount The amount to deposit
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("ERC20", "ERC721")
    function receiveTokensTo(address wallet, string balanceType, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = transferController(currencyCt, standard);
        require(address(controller).delegatecall(
                controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId)
        );

        // Register reception
        _receiveTo(wallet, balanceType, amount, currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, balanceType, amount, currencyCt, currencyId, standard);
    }

    /// @notice Get metadata of the given wallet's deposit at the given index
    /// @param wallet The address of the concerned wallet
    /// @param index The index of wallet's deposit
    /// @return The deposit metadata
    function deposit(address wallet, uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return transactionTracker.getByIndex(wallet, DEPOSIT_TRANSACTION_TYPE_HASH, index);
    }

    /// @notice Get the count of the given wallet's deposits
    /// @param wallet The address of the concerned wallet
    /// @return The count of the concerned wallet's deposits
    function depositsCount(address wallet) public view returns (uint256) {
        return transactionTracker.count(wallet, DEPOSIT_TRANSACTION_TYPE_HASH);
    }

    /// @notice Get metadata of the given wallet's deposit in the given currency at the given index
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param index The index of wallet's deposit in the given currency
    /// @return The deposit metadata
    function depositOfCurrency(address wallet, address currencyCt, uint256 currencyId, uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return transactionTracker.getByCurrencyIndex(
            wallet, DEPOSIT_TRANSACTION_TYPE_HASH, currencyCt, currencyId, index
        );
    }

    /// @notice Get the count of the given wallet's deposits in the given currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The count of the concerned wallet's deposits in the given currency
    function depositsOfCurrencyCount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return transactionTracker.countByCurrency(
            wallet, DEPOSIT_TRANSACTION_TYPE_HASH, currencyCt, currencyId
        );
    }

    /// @notice Get deposited balance of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The deposited balance of the concerned wallet and currency
    function depositedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return balanceTracker.get(wallet, DEPOSITED_BALANCE_TYPE_HASH, currencyCt, currencyId);
    }

    /// @notice Get settled balance of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The settled balance of the concerned wallet and currency
    function settledBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return balanceTracker.get(wallet, SETTLED_BALANCE_TYPE_HASH, currencyCt, currencyId);
    }

    /// @notice Get staged balance of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The staged balance of the concerned wallet and currency
    function stagedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return balanceTracker.get(wallet, STAGED_BALANCE_TYPE_HASH, currencyCt, currencyId);
    }

    /// @notice Get active balance (sum of deposited and settled balances) of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The active balance of the concerned wallet and currency
    function activeBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        return balanceTracker.get(wallet, DEPOSITED_BALANCE_TYPE_HASH, currencyCt, currencyId).add(
            balanceTracker.get(wallet, SETTLED_BALANCE_TYPE_HASH, currencyCt, currencyId)
        );
    }

    /// @notice Get last active balance log entry of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The active balance log entry of the concerned wallet and currency
    function lastLoggedActiveBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        (int256 depositedAmount, uint256 depositedBlockNumber) =
        0 < balanceTracker.logSize(wallet, DEPOSITED_BALANCE_TYPE_HASH, currencyCt, currencyId) ?
        balanceTracker.lastLog(
            wallet, DEPOSITED_BALANCE_TYPE_HASH, currencyCt, currencyId
        ) :
        (0, 0);

        (int256 settledAmount, uint256 settledBlockNumber) =
        0 < balanceTracker.logSize(wallet, SETTLED_BALANCE_TYPE_HASH, currencyCt, currencyId) ?
        balanceTracker.lastLog(
            wallet, SETTLED_BALANCE_TYPE_HASH, currencyCt, currencyId
        ) :
        (0, 0);

        // Set amount as the sum of deposited and settled
        amount = depositedAmount.add(settledAmount);

        // Set block number as the latest of deposited and settled
        blockNumber = depositedBlockNumber > settledBlockNumber ? depositedBlockNumber : settledBlockNumber;
    }

    /// @notice Update the settled balance by the difference between provided off-chain balance amount
    /// and deposited on-chain balance, where deposited balance is resolved at the given block number
    /// @param wallet The address of the concerned wallet
    /// @param amount The off-chain balance amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param blockNumber The block number to which the settled balance is updated
    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId,
        uint256 blockNumber)
    public
    onlyAuthorizedService(wallet)
    notNullAddress(wallet)
    {
        require(amount.isPositiveInt256());

        (int256 depositedAmount,) = balanceTracker.logByBlockNumber(
            wallet, DEPOSITED_BALANCE_TYPE_HASH, currencyCt, currencyId, blockNumber
        );

        int256 settledBalanceAmount = amount.sub(depositedAmount);
        balanceTracker.set(wallet, SETTLED_BALANCE_TYPE_HASH, settledBalanceAmount, currencyCt, currencyId);

        // Emit event
        emit UpdateSettledBalanceEvent(wallet, amount, currencyCt, currencyId);
    }

    /// @notice Stage the amount for subsequent withdrawal
    /// @param wallet The address of the concerned wallet
    /// @param stageAmount The concerned amount to stage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stage(address wallet, int256 stageAmount, address currencyCt, uint256 currencyId)
    public
    onlyAuthorizedService(wallet)
    {
        require(stageAmount.isNonZeroPositiveInt256());

        // Subtract stage amount from settled, possibly also from deposited
        _stageSubtract(wallet, stageAmount, currencyCt, currencyId);

        // Add to staged
        balanceTracker.add(wallet, STAGED_BALANCE_TYPE_HASH, stageAmount, currencyCt, currencyId);

        // Emit event
        emit StageEvent(wallet, stageAmount, currencyCt, currencyId);
    }

    /// @notice Unstage a staged amount
    /// @param unstageAmount The concerned balance amount to unstage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function unstage(int256 unstageAmount, address currencyCt, uint256 currencyId)
    public
    {
        require(unstageAmount.isNonZeroPositiveInt256());

        // Clamp amount to unstage
        unstageAmount = unstageAmount.clampMax(
            balanceTracker.get(msg.sender, STAGED_BALANCE_TYPE_HASH, currencyCt, currencyId)
        );
        if (unstageAmount == 0)
            return;

        // Move from staged balance to deposited balance
        balanceTracker.transfer(msg.sender, STAGED_BALANCE_TYPE_HASH, DEPOSITED_BALANCE_TYPE_HASH, unstageAmount, currencyCt, currencyId);

        // Emit event
        emit UnstageEvent(msg.sender, unstageAmount, currencyCt, currencyId);
    }

    /// @notice Stage the amount from wallet to the given beneficiary and targeted to wallet
    /// @param wallet The address of the concerned wallet
    /// @param beneficiary The (address of) concerned beneficiary contract
    /// @param stageAmount The concerned amount to stage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function stageToBeneficiary(address wallet, Beneficiary beneficiary, int256 stageAmount,
        address currencyCt, uint256 currencyId, string standard)
    public
    onlyAuthorizedService(wallet)
    {
        // Subtract stage amount from settled, possibly also from deposited
        _stageSubtract(wallet, stageAmount, currencyCt, currencyId);

        // Transfer to beneficiary
        _transferToBeneficiary(wallet, beneficiary, stageAmount, currencyCt, currencyId, standard);

        // Emit event
        emit StageToBeneficiaryEvent(wallet, beneficiary, stageAmount, currencyCt, currencyId, standard);
    }

    /// @notice Transfer the given amount of currency to the given beneficiary without target wallet
    /// @param beneficiary The (address of) concerned beneficiary contract
    /// @param transferAmount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function transferToBeneficiary(Beneficiary beneficiary, int256 transferAmount,
        address currencyCt, uint256 currencyId, string standard)
    public
    notNullAddress(beneficiary)
    onlyActiveService
    {
        // Transfer to beneficiary
        _transferToBeneficiary(address(0), beneficiary, transferAmount, currencyCt, currencyId, standard);

        // Emit event
        emit TransferToBeneficiaryEvent(beneficiary, transferAmount, currencyCt, currencyId);
    }

    /// @notice Lock balances of the given locked wallet allowing them to be seized by
    /// the given locker wallet
    /// @param lockedWallet The address of concerned wallet whose balances will be locked
    /// @param lockerWallet The address of concerned wallet that locks
    function lockBalancesByProxy(address lockedWallet, address lockerWallet)
    public
    notNullAddress(lockerWallet)
    onlyAuthorizedService(lockedWallet)
    {
        // Require that the wallet to be locked is not locked by other wallet
        require(address(0) == walletMap[lockedWallet].locker || lockerWallet == walletMap[lockedWallet].locker);

        // Lock and set release time
        walletMap[lockedWallet].locker = lockerWallet;
        walletMap[lockedWallet].unlockTime = block.timestamp.add(configuration.walletLockTimeout());

        // Add to the store of locked wallets
        _addToLockedWallets(lockedWallet);

        // Emit event
        emit LockBalancesEvent(lockedWallet, lockerWallet);
    }

    /// @notice Unlock balances of msg.sender if release timeout has expired
    function unlockBalances()
    public
    {
        // Require that release timeout has expired
        require(
            address(0) != walletMap[msg.sender].locker &&
            block.timestamp >= walletMap[msg.sender].unlockTime
        );

        // Store locker
        address locker = walletMap[msg.sender].locker;

        // Unlock balances
        _unlockBalances(msg.sender);

        // Emit event
        emit UnlockBalancesEvent(msg.sender, locker);
    }

    /// @notice Unlock balances of the given wallet
    /// @param wallet The address of concerned wallet whose balances will be unlocked
    function unlockBalancesByProxy(address wallet)
    public
    onlyAuthorizedService(wallet)
    {
        // Store locker
        address locker = walletMap[msg.sender].locker;

        // Unlock balances
        _unlockBalances(wallet);

        // Emit event
        emit UnlockBalancesByProxyEvent(msg.sender, locker);
    }

    /// @notice Seize balances in the given currency of the given locked wallet, provided that the
    /// function is called by the wallet that locked and it is done before expiration of release timeout
    /// @param lockedWallet The address of concerned wallet whose balances are locked
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function seizeBalances(address lockedWallet, address currencyCt, uint256 currencyId)
    public
    {
        require(
            msg.sender == walletMap[lockedWallet].locker &&
            block.timestamp < walletMap[lockedWallet].unlockTime
        );

        // Get sum of balances for locked wallet
        int256 amount = _sumAllBalancesOfWalletAndCurrency(lockedWallet, currencyCt, currencyId);
        require(amount >= 0);

        // Zero locked wallet's balances
        _zeroAllBalancesOfWalletAndCurrency(lockedWallet, currencyCt, currencyId);

        // Add to staged balance of sender
        balanceTracker.add(msg.sender, STAGED_BALANCE_TYPE_HASH, amount, currencyCt, currencyId);

        // Add to the store of seized wallets
        _addToSeizedWallets(lockedWallet);

        // Emit event
        emit SeizeBalancesEvent(lockedWallet, msg.sender);
    }

    /// @notice Withdraw the given amount from staged balance
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        amount = amount.clampMax(balanceTracker.get(msg.sender, STAGED_BALANCE_TYPE_HASH, currencyCt, currencyId));
        if (amount <= 0)
            return;

        // Subtract to per-wallet staged balance
        balanceTracker.sub(msg.sender, STAGED_BALANCE_TYPE_HASH, amount, currencyCt, currencyId);

        // Log record of this transaction
        transactionTracker.add(msg.sender, WITHDRAWAL_TRANSACTION_TYPE_HASH, amount, currencyCt, currencyId);

        // Execute transfer
        if (currencyCt == address(0) && currencyId == 0)
            msg.sender.transfer(uint256(amount));

        else {
            TransferController controller = transferController(currencyCt, standard);
            require(address(controller).delegatecall(
                    controller.getDispatchSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId)
            );
        }

        // Emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId, standard);
    }

    /// @notice Get metadata of the given wallet's withdrawal at the given index
    /// @param wallet The address of the concerned wallet
    /// @param index The index of wallet's withdrawal
    /// @return The withdrawal metadata
    function withdrawal(address wallet, uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber, address currencyCt, uint256 currencyId)
    {
        return transactionTracker.getByIndex(wallet, WITHDRAWAL_TRANSACTION_TYPE_HASH, index);
    }

    /// @notice Get the count of the given wallet's withdrawals
    /// @param wallet The address of the concerned wallet
    /// @return The count of the concerned wallet's withdrawals
    function withdrawalsCount(address wallet)
    public
    view
    returns (uint256)
    {
        return transactionTracker.count(wallet, WITHDRAWAL_TRANSACTION_TYPE_HASH);
    }

    /// @notice Get metadata of the given wallet's withdrawal in the given currency at the given index
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param index The index of wallet's withdrawal in the given currency
    /// @return The withdrawal metadata
    function withdrawalOfCurrency(address wallet, address currencyCt, uint256 currencyId, uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return transactionTracker.getByCurrencyIndex(
            wallet, WITHDRAWAL_TRANSACTION_TYPE_HASH, currencyCt, currencyId, index
        );
    }

    /// @notice Get the count of the given wallet's withdrawals in the given currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The count of the concerned wallet's withdrawals in the given currency
    function withdrawalsOfCurrencyCount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return transactionTracker.countByCurrency(
            wallet, WITHDRAWAL_TRANSACTION_TYPE_HASH, currencyCt, currencyId
        );
    }

    /// @notice Get the locked status of given wallet
    /// @param wallet The address of the concerned wallet
    /// @return true if wallet is locked, false otherwise
    function isLockedWallet(address wallet) public view returns (bool) {
        return block.timestamp < walletMap[wallet].unlockTime;
    }

    /// @notice Get the number of wallets whose funds have been locked
    /// @return Number of wallets
    function lockedWalletsCount() public view returns (uint256) {
        return lockedWallets.length;
    }

    /// @notice Get the address of the wallet that locks the balances of the given wallet
    /// @param wallet The address of the concerned wallet
    /// @return The locking wallet's address
    function locker(address wallet) public view returns (address) {
        return walletMap[wallet].locker;
    }

    /// @notice Get the timestamp at which the wallet's locked balances will be released
    /// @param wallet The address of the concerned wallet
    /// @return The balances release timestamp
    function unlockTime(address wallet) public view returns (uint256) {
        return walletMap[wallet].unlockTime;
    }

    /// @notice Get the seized status of given wallet
    /// @param wallet The address of the concerned wallet
    /// @return true if wallet is seized, false otherwise
    function isSeizedWallet(address wallet) public view returns (bool) {
        return seizedByWallet[wallet];
    }

    /// @notice Get the number of wallets whose funds have been seized
    /// @return Number of wallets
    function seizedWalletsCount() public view returns (uint256) {
        return seizedWallets.length;
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _receiveTo(address wallet, string balanceType, int256 amount, address currencyCt,
        uint256 currencyId)
    private
    {
        bytes32 balanceHash = 0 < bytes(balanceType).length ? keccak256(abi.encodePacked(balanceType)) : DEPOSITED_BALANCE_TYPE_HASH;

        if (STAGED_BALANCE_TYPE_HASH == balanceHash)
            balanceTracker.add(wallet, STAGED_BALANCE_TYPE_HASH, amount, currencyCt, currencyId);

        else if (DEPOSITED_BALANCE_TYPE_HASH == balanceHash) {
            // Add to per-wallet deposited balance
            balanceTracker.add(wallet, DEPOSITED_BALANCE_TYPE_HASH, amount, currencyCt, currencyId);

            // Log record of this transaction
            transactionTracker.add(wallet, DEPOSIT_TRANSACTION_TYPE_HASH, amount, currencyCt, currencyId);

        }

        else
            revert();
    }

    function _stageSubtract(address wallet, int256 stageAmount, address currencyCt, uint256 currencyId)
    private
    {
        // Clamp amount to stage
        stageAmount = stageAmount.clampMax(activeBalance(wallet, currencyCt, currencyId));
        if (stageAmount <= 0)
            return;

        // Get settled balance amount
        int256 settledBalanceAmount = balanceTracker.get(wallet, SETTLED_BALANCE_TYPE_HASH, currencyCt, currencyId);

        // If settled is greater than or equal to amount then amount can be deducted from settled
        if (settledBalanceAmount >= stageAmount)
            balanceTracker.sub(wallet, SETTLED_BALANCE_TYPE_HASH, stageAmount, currencyCt, currencyId);

        // Else settled will be zeroed and (stage amount - settled) is deducted from deposited
        else {
            balanceTracker.add(wallet, DEPOSITED_BALANCE_TYPE_HASH, settledBalanceAmount.sub(stageAmount), currencyCt, currencyId);
            balanceTracker.set(wallet, SETTLED_BALANCE_TYPE_HASH, 0, currencyCt, currencyId);
        }
    }

    function _transferToBeneficiary(address destWallet, Beneficiary beneficiary,
        int256 transferAmount, address currencyCt, uint256 currencyId, string standard)
    private
    {
        require(transferAmount.isNonZeroPositiveInt256());
        require(isRegisteredBeneficiary(beneficiary));

        // Transfer funds to the beneficiary
        if (currencyCt == address(0) && currencyId == 0)
            beneficiary.receiveEthersTo.value(uint256(transferAmount))(destWallet, "");

        else {
            // Approve of beneficiary
            TransferController controller = transferController(currencyCt, standard);
            require(address(controller).delegatecall(
                    controller.getApproveSignature(), beneficiary, uint256(transferAmount), currencyCt, currencyId)
            );

            // Transfer funds to the beneficiary
            beneficiary.receiveTokensTo(destWallet, "", transferAmount, currencyCt, currencyId, standard);
        }
    }

    function _sumAllBalancesOfWalletAndCurrency(address wallet, address currencyCt, uint256 currencyId)
    private
    view
    returns (int256)
    {
        return balanceTracker.sum(wallet, _allBalanceTypeHashes, currencyCt, currencyId);
    }

    function _zeroAllBalancesOfWalletAndCurrency(address wallet, address currencyCt, uint256 currencyId)
    private
    {
        balanceTracker.reset(wallet, _allBalanceTypeHashes, currencyCt, currencyId);
    }

    function _unlockBalances(address wallet)
    private
    {
        // Unlock and release
        walletMap[wallet].locker = address(0);
        walletMap[wallet].unlockTime = 0;

        // Remove from the store of locked wallets
        _removeFromLockedWallets(wallet);
    }

    function _addToLockedWallets(address wallet)
    private
    {
        if (0 == lockedWalletIndexByWallet[wallet]) {
            lockedWallets.push(wallet);
            lockedWalletIndexByWallet[wallet] = lockedWallets.length;
        }
    }

    function _removeFromLockedWallets(address wallet)
    private
    {
        if (0 != lockedWalletIndexByWallet[wallet]) {
            if (lockedWalletIndexByWallet[wallet] < lockedWallets.length) {
                lockedWalletIndexByWallet[lockedWallets[lockedWallets.length - 1]] = lockedWalletIndexByWallet[wallet];
                lockedWallets[lockedWalletIndexByWallet[wallet]] = lockedWallets[lockedWallets.length - 1];
            }
            lockedWallets.length--;
            lockedWalletIndexByWallet[wallet] = 0;
        }
    }

    function _addToSeizedWallets(address wallet)
    private
    {
        if (!seizedByWallet[wallet]) {
            seizedByWallet[wallet] = true;
            seizedWallets.push(wallet);
        }
    }
}
