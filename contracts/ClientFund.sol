/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {Beneficiary} from "./Beneficiary.sol";
import {Benefactor} from "./Benefactor.sol";
import {AuthorizableServable} from "./AuthorizableServable.sol";
import {Ownable} from "./Ownable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {TransferController} from "./TransferController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
*/
contract ClientFund is Ownable, Beneficiary, Benefactor, AuthorizableServable, TransferControllerManageable {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;
    using SafeMathIntLib for int256;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Wallet {
        BalanceLib.Balance deposited;
        BalanceLib.Balance staged;
        BalanceLib.Balance settled;

        TxHistoryLib.TxHistory txHistory;

        InUseCurrencyLib.InUseCurrency inUseCurrencies;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    mapping(address => Wallet) private walletMap;

    mapping(address => uint256) private registeredServicesMap;
    mapping(address => mapping(address => bool)) private disabledServicesMap;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event DepositEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard);
    event WithdrawEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard);
    event StageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event UnstageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event UpdateSettledBalanceEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event StageToBeneficiaryEvent(address sourceWallet, address beneficiary, int256 amount, address currencyCt,
        uint256 currencyId);
    event StageToBeneficiaryUntargetedEvent(address sourceWallet, address beneficiary, int256 amount,
        address currencyCt, uint256 currencyId);
    event SeizeAllBalancesEvent(address sourceWallet, address targetWallet);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address owner) Ownable(owner) Beneficiary() Benefactor() public {
        serviceActivationTimeout = 1 weeks;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Fallback function that deposits ethers to msg.sender's deposited balance
    function() public payable {
        depositEthersTo(msg.sender);
    }

    /// @notice Deposit ethers to the given wallet's deposited balance
    /// @param wallet The address of the concerned wallet
    function depositEthersTo(address wallet) public payable {
        int256 amount = SafeMathIntLib.toNonZeroInt256(msg.value);

        // Add to per-wallet deposited balance
        walletMap[wallet].deposited.add(amount, address(0), 0);
        walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

        // Add currency to in-use list
        walletMap[wallet].inUseCurrencies.addItem(address(0), 0);

        // Emit event
        emit DepositEvent(wallet, amount, address(0), 0, "");
    }

    /// @notice Deposit token to msg.sender's deposited balance
    /// @dev The wallet must approve of this ClientFund's transfer prior to calling this function
    /// @param amount The amount to deposit
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function depositTokens(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        depositTokensTo(msg.sender, amount, currencyCt, currencyId, standard);
    }

    /// @notice Deposit token to the given wallet's deposited balance
    /// @dev The wallet must approve of this ClientFund's transfer prior to calling this function
    /// @param wallet The address of the concerned wallet
    /// @param amount The amount to deposit
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("ERC20", "ERC721")
    function depositTokensTo(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        require(address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId));

        // Add to per-wallet deposited balance
        walletMap[wallet].deposited.add(amount, currencyCt, currencyId);
        walletMap[wallet].txHistory.addDeposit(amount, currencyCt, currencyId);

        // Add currency to in-use list
        walletMap[wallet].inUseCurrencies.addItem(currencyCt, currencyId);

        // Emit event
        emit DepositEvent(wallet, amount, currencyCt, currencyId, standard);
    }

    /// @notice Get metadata of the given wallet's deposit at the given index
    /// @param wallet The address of the concerned wallet
    /// @param index The index of wallet's deposit
    /// @return The deposit metadata
    function deposit(address wallet, uint index)
    public
    view
    returns (int256 amount, uint256 timestamp, address currencyCt, uint256 currencyId)
    {
        return walletMap[wallet].txHistory.deposit(index);
    }

    /// @notice Get the count of the given wallet's deposits
    /// @param wallet The address of the concerned wallet
    /// @return The count of the concerned wallet's deposits
    function depositCount(address wallet) public view returns (uint256) {
        return walletMap[wallet].txHistory.depositCount();
    }

    /// @notice Get deposited balance of the given wallet and currency
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The deposited balance of the concerned wallet and currency
    function depositedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    notNullAddress(wallet)
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
    notNullAddress(wallet)
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
    notNullAddress(wallet)
    returns (int256)
    {
        return walletMap[wallet].staged.get(currencyCt, currencyId);
    }

    /// @notice Update the settled balance by the difference between provided amount and deposited on-chain balance
    /// @param wallet The address of the concerned wallet
    /// @param amount The off-chain balance amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyRegisteredActiveService
    notNullAddress(wallet)
    {
        require(isAuthorizedServiceForWallet(msg.sender, wallet));
        require(amount.isPositiveInt256());

        int256 settledBalanceAmount = amount.sub(walletMap[wallet].deposited.get(currencyCt, currencyId));
        walletMap[wallet].settled.set(settledBalanceAmount, currencyCt, currencyId);

        // Emit event
        emit UpdateSettledBalanceEvent(wallet, amount, currencyCt, currencyId);
    }

    /// @notice Stage the amount for subsequent withdrawal
    /// @param wallet The address of the concerned wallet
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyRegisteredActiveService
    {
        require(isAuthorizedServiceForWallet(msg.sender, wallet));
        require(amount.isNonZeroPositiveInt256());

        // Clamp amount to stage
        amount = amount.clampMax(walletMap[wallet].deposited.get(currencyCt, currencyId).add(walletMap[wallet].settled.get(currencyCt, currencyId)));
        if (amount <= 0)
            return;

        walletMap[wallet].deposited.sub(walletMap[wallet].settled.get(currencyCt, currencyId) > amount ? 0 : amount.sub(walletMap[wallet].settled.get(currencyCt, currencyId)), currencyCt, currencyId);
        walletMap[wallet].settled.sub_allow_neg(walletMap[wallet].settled.get(currencyCt, currencyId) > amount ? amount : walletMap[wallet].settled.get(currencyCt, currencyId), currencyCt, currencyId);
        walletMap[wallet].staged.add(amount, currencyCt, currencyId);

        // Emit event
        emit StageEvent(wallet, amount, currencyCt, currencyId);
    }

    /// @notice Unstage a staged amount
    /// @param amount The concerned balance amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function unstage(int256 amount, address currencyCt, uint256 currencyId) public notDeployer {
        require(amount.isNonZeroPositiveInt256());

        // Clamp amount to move
        amount = amount.clampMax(walletMap[msg.sender].staged.get(currencyCt, currencyId));
        if (amount == 0)
            return;

        // Move from staged balance to deposited
        walletMap[msg.sender].staged.transfer(walletMap[msg.sender].deposited, amount, currencyCt, currencyId);

        // Emit event
        emit UnstageEvent(msg.sender, amount, currencyCt, currencyId);
    }

    /// @notice Stage the amount from msg.sender to the given beneficiary and targeted to msg.sender 
    /// @param beneficiary The (address of) concerned beneficiary contract
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stageToBeneficiary(Beneficiary beneficiary, int256 amount, address currencyCt, uint256 currencyId) public notDeployer {
        stageToBeneficiaryPrivate(msg.sender, msg.sender, beneficiary, amount, currencyCt, currencyId);

        // Emit event
        emit StageToBeneficiaryEvent(msg.sender, beneficiary, amount, currencyCt, currencyId);
    }

    /// @notice Stage the amount from the given source wallet to the given beneficiary without target wallet
    /// @param sourceWallet The address of concerned source wallet
    /// @param beneficiary The (address of) concerned beneficiary contract
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function stageToBeneficiaryUntargeted(address sourceWallet, Beneficiary beneficiary, int256 amount, address currencyCt, uint256 currencyId) public
    onlyRegisteredActiveService
    notNullAddress(sourceWallet)
    notNullAddress(beneficiary)
    {
        require(isAuthorizedServiceForWallet(msg.sender, sourceWallet));

        stageToBeneficiaryPrivate(sourceWallet, address(0), beneficiary, amount, currencyCt, currencyId);

        // Emit event
        emit StageToBeneficiaryUntargetedEvent(sourceWallet, beneficiary, amount, currencyCt, currencyId);
    }

    /// @notice Transfer all balances of the given source wallet to the given target wallet
    /// @param sourceWallet The address of concerned source wallet
    /// @param targetWallet The address of concerned target wallet
    function seizeAllBalances(address sourceWallet, address targetWallet) public
    onlyRegisteredActiveService
    notNullAddress(sourceWallet)
    notNullAddress(targetWallet)
    {
        require(isAuthorizedServiceForWallet(msg.sender, sourceWallet));

        // Seize all balances
        uint256 len = walletMap[sourceWallet].inUseCurrencies.getLength();
        int256 amount;
        for (uint256 i = 0; i < len; i++) {
            MonetaryTypes.Currency memory currency = walletMap[sourceWallet].inUseCurrencies.getAt(i);

            amount = sumAllBalancesOfWalletAndCurrency(sourceWallet, currency.ct, currency.id);
            assert(amount >= 0);

            zeroAllBalancesOfWalletAndCurrency(sourceWallet, currency.ct, currency.id);

            // Add to staged balance
            walletMap[targetWallet].staged.add(amount, currency.ct, currency.id);

            // Add currencyCt to in-use list
            walletMap[targetWallet].inUseCurrencies.addItem(currency.ct, currency.id);
        }

        // Emit event
        emit SeizeAllBalancesEvent(sourceWallet, targetWallet);
    }

    /// @notice Withdraw the given amount from staged balance
    /// @param amount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of token ("ERC20", "ERC721")
    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard) public {
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
            TransferController controller = getTransferController(currencyCt, standard);
            require(address(controller).delegatecall(controller.getSendSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId), "uff");
        }

        // Emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId, standard);
    }

    /// @notice Get metadata of the given wallet's withdrawal at the given index
    /// @param wallet The address of the concerned wallet
    /// @param index The index of wallet's deposit
    /// @return The withdrawal metadata
    function withdrawal(address wallet, uint index) public view returns (int256 amount, uint256 timestamp, address token, uint256 id) {
        return walletMap[wallet].txHistory.withdrawal(index);
    }

    /// @notice Get the count of the given wallet's withdrawals
    /// @param wallet The address of the concerned wallet
    /// @return The count of the concerned wallet's withdrawals
    function withdrawalCount(address wallet) public view returns (uint256) {
        return walletMap[wallet].txHistory.withdrawalCount();
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function stageToBeneficiaryPrivate(address sourceWallet, address destWallet, Beneficiary beneficiary,
        int256 amount, address currencyCt, uint256 currencyId)
    private
    {
        require(amount.isNonZeroPositiveInt256());
        require(isRegisteredBeneficiary(beneficiary));

        //clamp amount to stage
        amount = amount.clampMax(walletMap[sourceWallet].deposited.get(currencyCt, currencyId)
            .add(walletMap[sourceWallet].settled.get(currencyCt, currencyId)));
        if (amount <= 0)
            return;

        walletMap[sourceWallet].deposited.sub(walletMap[sourceWallet].settled.get(currencyCt, currencyId) > amount ? 0 : amount.sub(walletMap[sourceWallet].settled.get(currencyCt, currencyId)), currencyCt, currencyId);
        walletMap[sourceWallet].settled.sub_allow_neg(walletMap[sourceWallet].settled.get(currencyCt, currencyId) > amount ? amount : walletMap[sourceWallet].settled.get(currencyCt, currencyId), currencyCt, currencyId);

        transferToBeneficiaryPrivate(destWallet, beneficiary, amount, currencyCt, currencyId);
    }

    // TODO Update this function with 'standard' parameter as in deposits and withdrawals
    function transferToBeneficiaryPrivate(address destWallet, Beneficiary beneficiary,
        int256 amount, address currencyCt, uint256 currencyId)
    private {
        // Transfer funds to the beneficiary
        if (currencyCt == address(0) && currencyId == 0)
            beneficiary.depositEthersTo.value(uint256(amount))(destWallet);

        else {
            //execute transfer
            TransferController controller = getTransferController(currencyCt, "");
            require(address(controller).delegatecall(controller.getApproveSignature(), beneficiary, uint256(amount), currencyCt, currencyId));

            //transfer funds to the beneficiary
            beneficiary.depositTokensTo(destWallet, amount, currencyCt, currencyId, "");
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

    function zeroAllBalancesOfWalletAndCurrency(address wallet, address currencyCt, uint256 currencyId) private {
        walletMap[wallet].deposited.set(0, currencyCt, currencyId);
        walletMap[wallet].settled.set(0, currencyCt, currencyId);
        walletMap[wallet].staged.set(0, currencyCt, currencyId);
    }
}
