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
import {BalanceLib} from "./BalanceLib.sol";
import {BalanceLogLib} from "./BalanceLogLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
*/
contract ClientFund is Ownable, Configurable, Beneficiary, Benefactor, AuthorizableServable, TransferControllerManageable {
    using BalanceLib for BalanceLib.Balance;
    using BalanceLogLib for BalanceLogLib.BalanceLog;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant public DEPOSITED_BALANCE_TYPE = "deposited";
    string constant public SETTLED_BALANCE_TYPE = "settled";
    string constant public STAGED_BALANCE_TYPE = "staged";

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Wallet {
        BalanceLib.Balance deposited;
        BalanceLib.Balance staged;
        BalanceLib.Balance settled;
        BalanceLogLib.BalanceLog active;

        TxHistoryLib.TxHistory txHistory;

        InUseCurrencyLib.InUseCurrency inUseCurrencies;

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

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
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
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
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

        if (0 == bytes(balanceType).length)
            balanceType = DEPOSITED_BALANCE_TYPE;

        bytes32 balanceHash = keccak256(abi.encodePacked(balanceType));

        if (keccak256(abi.encodePacked(STAGED_BALANCE_TYPE)) == balanceHash)
            walletMap[wallet].staged.add(amount, address(0), 0);

        else if (keccak256(abi.encodePacked(DEPOSITED_BALANCE_TYPE)) == balanceHash) {
            // Add to per-wallet deposited balance
            walletMap[wallet].deposited.add(amount, address(0), 0);
            walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

            // Add active balance log entry
            walletMap[wallet].active.add(activeBalance(wallet, address(0), 0), address(0), 0);

        } else
            revert();

        // Add currency to in-use list
        walletMap[wallet].inUseCurrencies.addItem(address(0), 0);

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
        require(address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId));

        if (0 == bytes(balanceType).length)
            balanceType = DEPOSITED_BALANCE_TYPE;

        bytes32 balanceHash = keccak256(abi.encodePacked(balanceType));

        if (keccak256(abi.encodePacked(STAGED_BALANCE_TYPE)) == balanceHash)
            walletMap[wallet].staged.add(amount, currencyCt, currencyId);

        else if (keccak256(abi.encodePacked(DEPOSITED_BALANCE_TYPE)) == balanceHash) {
            // Add to per-wallet deposited balance
            walletMap[wallet].deposited.add(amount, currencyCt, currencyId);
            walletMap[wallet].txHistory.addDeposit(amount, currencyCt, currencyId);

            // Add active balance log entry
            walletMap[wallet].active.add(activeBalance(wallet, currencyCt, currencyId), currencyCt, currencyId);

        } else
            revert();

        // Add currency to in-use list
        walletMap[wallet].inUseCurrencies.addItem(currencyCt, currencyId);

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
        return walletMap[wallet].txHistory.deposit(index);
    }

    /// @notice Get the count of the given wallet's deposits
    /// @param wallet The address of the concerned wallet
    /// @return The count of the concerned wallet's deposits
    function depositsCount(address wallet) public view returns (uint256) {
        return walletMap[wallet].txHistory.depositsCount();
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
        return walletMap[wallet].txHistory.currencyDeposit(currencyCt, currencyId, index);
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
        return walletMap[wallet].txHistory.currencyDepositsCount(currencyCt, currencyId);
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
        return walletMap[wallet].deposited.get(currencyCt, currencyId);
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
        return walletMap[wallet].settled.get(currencyCt, currencyId);
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
        return walletMap[wallet].staged.get(currencyCt, currencyId);
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
        return walletMap[wallet].deposited.get(currencyCt, currencyId)
        .add(walletMap[wallet].staged.get(currencyCt, currencyId));
    }

    /// @notice Get active balance log entry of the given wallet and currency at the given index
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param index The index of wallet's active balance log entry in the given currency
    /// @return The active balance log entry of the concerned wallet and currency
    function activeBalanceLogEntry(address wallet, address currencyCt, uint256 currencyId, uint256 index)
    public
    view
    returns (int256 amount, uint256 blockNumber)
    {
        return walletMap[wallet].active.get(currencyCt, currencyId, index);
    }

    /// @notice Get the count of entries of the given wallet's active balance log in the given currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The count of the concerned wallet's active balance log entries in the given currency
    function activeBalanceLogEntriesCount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (uint256)
    {
        return walletMap[wallet].active.count(currencyCt, currencyId);
    }

    /// @notice Update the settled balance by the difference between provided amount and deposited on-chain balance
    /// @param wallet The address of the concerned wallet
    /// @param amount The off-chain balance amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyAuthorizedService(wallet)
    notNullAddress(wallet)
    {
        require(amount.isPositiveInt256());

        int256 settledBalanceAmount = amount.sub(walletMap[wallet].deposited.get(currencyCt, currencyId));
        walletMap[wallet].settled.set(settledBalanceAmount, currencyCt, currencyId);

        // Emit event
        emit UpdateSettledBalanceEvent(wallet, amount, currencyCt, currencyId);
    }

    /// @notice Stage the amount for subsequent withdrawal
    /// @param wallet The address of the concerned wallet
    /// @param amount The concerned amount to be staged
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyAuthorizedService(wallet)
    {
        require(amount.isNonZeroPositiveInt256());

        // Subtract stage amount from settled, possibly also from deposited
        stageSubtract(wallet, amount, currencyCt, currencyId);

        // Add active balance log entry
        walletMap[wallet].active.add(activeBalance(wallet, currencyCt, currencyId), currencyCt, currencyId);

        // Add to staged
        walletMap[wallet].staged.add(amount, currencyCt, currencyId);

        // Emit event
        emit StageEvent(wallet, amount, currencyCt, currencyId);
    }

    /// @notice Unstage a staged amount
    /// @param amount The concerned balance amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function unstage(int256 amount, address currencyCt, uint256 currencyId)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        // Clamp amount to move
        amount = amount.clampMax(walletMap[msg.sender].staged.get(currencyCt, currencyId));
        if (amount == 0)
            return;

        // Move from staged balance to deposited
        walletMap[msg.sender].staged.transfer(walletMap[msg.sender].deposited, amount, currencyCt, currencyId);

        // Add active balance log entry
        walletMap[msg.sender].active.add(activeBalance(msg.sender, currencyCt, currencyId), currencyCt, currencyId);

        // Emit event
        emit UnstageEvent(msg.sender, amount, currencyCt, currencyId);
    }

    /// @notice Stage the amount from wallet to the given beneficiary and targeted to wallet
    /// @param wallet The address of the concerned wallet
    /// @param beneficiary The (address of) concerned beneficiary contract
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function stageToBeneficiary(address wallet, Beneficiary beneficiary, int256 amount,
        address currencyCt, uint256 currencyId, string standard)
    public
    onlyAuthorizedService(wallet)
    {
        // Subtract stage amount from settled, possibly also from deposited
        stageSubtract(wallet, amount, currencyCt, currencyId);

        // Add active balance log entry
        walletMap[wallet].active.add(activeBalance(wallet, currencyCt, currencyId), currencyCt, currencyId);

        // Transfer to beneficiary
        transferToBeneficiaryPrivate(wallet, beneficiary, amount, currencyCt, currencyId, standard);

        // Emit event
        emit StageToBeneficiaryEvent(wallet, beneficiary, amount, currencyCt, currencyId, standard);
    }

    /// @notice Transfer the given amount of currency to the given beneficiary without target wallet
    /// @param beneficiary The (address of) concerned beneficiary contract
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function transferToBeneficiary(Beneficiary beneficiary, int256 amount,
        address currencyCt, uint256 currencyId, string standard)
    public
    notNullAddress(beneficiary)
    onlyActiveService
    {
        // Transfer to beneficiary
        transferToBeneficiaryPrivate(address(0), beneficiary, amount, currencyCt, currencyId, standard);

        // Emit event
        emit TransferToBeneficiaryEvent(beneficiary, amount, currencyCt, currencyId);
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
        addToLockedWallets(lockedWallet);

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
        unlockBalancesPrivate(msg.sender);

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
        unlockBalancesPrivate(wallet);

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

        int256 amount = sumAllBalancesOfWalletAndCurrency(lockedWallet, currencyCt, currencyId);
        assert(amount >= 0);

        zeroAllBalancesOfWalletAndCurrency(lockedWallet, currencyCt, currencyId);

        // Add to staged balance
        walletMap[msg.sender].staged.add(amount, currencyCt, currencyId);

        // Add currencyCt to in-use list
        walletMap[msg.sender].inUseCurrencies.addItem(currencyCt, currencyId);

        // Add to the store of seized wallets
        addToSeizedWallets(lockedWallet);

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

        amount = amount.clampMax(walletMap[msg.sender].staged.get(currencyCt, currencyId));
        if (amount <= 0)
            return;

        // Subtract to per-wallet staged balance
        walletMap[msg.sender].staged.sub(amount, currencyCt, currencyId);
        walletMap[msg.sender].txHistory.addWithdrawal(amount, currencyCt, currencyId);

        // Execute transfer
        if (currencyCt == address(0) && currencyId == 0)
            msg.sender.transfer(uint256(amount));

        else {
            TransferController controller = transferController(currencyCt, standard);
            require(address(controller).delegatecall(controller.getDispatchSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId));
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
        return walletMap[wallet].txHistory.withdrawal(index);
    }

    /// @notice Get the count of the given wallet's withdrawals
    /// @param wallet The address of the concerned wallet
    /// @return The count of the concerned wallet's withdrawals
    function withdrawalsCount(address wallet)
    public
    view
    returns (uint256)
    {
        return walletMap[wallet].txHistory.withdrawalsCount();
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
        return walletMap[wallet].txHistory.currencyWithdrawal(currencyCt, currencyId, index);
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
        return walletMap[wallet].txHistory.currencyWithdrawalsCount(currencyCt, currencyId);
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
    function stageSubtract(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    private
    {
        // Clamp amount to stage
        amount = amount.clampMax(activeBalance(wallet, currencyCt, currencyId));
        if (amount <= 0)
            return;

        // If settled is greater than or equal to amount then amount can be deducted from settled
        if (walletMap[wallet].settled.get(currencyCt, currencyId) >= amount)
            walletMap[wallet].settled.sub_allow_neg(
                amount, currencyCt, currencyId
            );

        // Else settled will be zeroed and (amount - settled) is deducted from deposited
        else {
            walletMap[wallet].deposited.add_allow_neg(
                walletMap[wallet].settled.get(currencyCt, currencyId).sub(amount),
                currencyCt, currencyId
            );
            walletMap[wallet].settled.set(0, currencyCt, currencyId);
        }
    }

    function transferToBeneficiaryPrivate(address destWallet, Beneficiary beneficiary,
        int256 amount, address currencyCt, uint256 currencyId, string standard)
    private
    {
        require(amount.isNonZeroPositiveInt256());
        require(isRegisteredBeneficiary(beneficiary));

        // Transfer funds to the beneficiary
        if (currencyCt == address(0) && currencyId == 0)
            beneficiary.receiveEthersTo.value(uint256(amount))(destWallet, "");

        else {
            // Approve of beneficiary
            TransferController controller = transferController(currencyCt, standard);
            require(address(controller).delegatecall(controller.getApproveSignature(), beneficiary, uint256(amount), currencyCt, currencyId));

            // Transfer funds to the beneficiary
            beneficiary.receiveTokensTo(destWallet, "", amount, currencyCt, currencyId, standard);
        }
    }

    function sumAllBalancesOfWalletAndCurrency(address wallet, address currencyCt, uint256 currencyId)
    private
    view
    returns (int256)
    {
        return walletMap[wallet].deposited.get(currencyCt, currencyId)
        .add(walletMap[wallet].settled.get(currencyCt, currencyId))
        .add(walletMap[wallet].staged.get(currencyCt, currencyId));
    }

    function zeroAllBalancesOfWalletAndCurrency(address wallet, address currencyCt, uint256 currencyId)
    private
    {
        walletMap[wallet].deposited.set(0, currencyCt, currencyId);
        walletMap[wallet].settled.set(0, currencyCt, currencyId);
        walletMap[wallet].staged.set(0, currencyCt, currencyId);
    }

    function unlockBalancesPrivate(address wallet)
    private
    {
        // Unlock and release
        walletMap[wallet].locker = address(0);
        walletMap[wallet].unlockTime = 0;

        // Remove from the store of locked wallets
        removeFromLockedWallets(wallet);
    }

    function addToLockedWallets(address wallet)
    private
    {
        if (0 == lockedWalletIndexByWallet[wallet]) {
            lockedWallets.push(wallet);
            lockedWalletIndexByWallet[wallet] = lockedWallets.length;
        }
    }

    function removeFromLockedWallets(address wallet)
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

    function addToSeizedWallets(address wallet)
    private
    {
        if (!seizedByWallet[wallet]) {
            seizedByWallet[wallet] = true;
            seizedWallets.push(wallet);
        }
    }
}
