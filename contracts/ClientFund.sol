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
import {Beneficiary} from "./Beneficiary.sol";
import {Benefactor} from "./Benefactor.sol";
import {AuthorizableServable} from "./AuthorizableServable.sol";
import {Ownable} from "./Ownable.sol";
import {AccessorManageable} from "./AccessorManageable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {TransferController} from "./TransferController.sol";
import {BalanceLib} from "./BalanceLib.sol";
import {TxHistoryLib} from "./TxHistoryLib.sol";
import {InUseCurrencyLib} from "./InUseCurrencyLib.sol";
import {MonetaryTypes} from "./MonetaryTypes.sol";

/**
@title Client fund
@notice Where clients’ crypto is deposited into, staged and withdrawn from.
@dev Asset descriptor combo (currencyCt == 0x0, currencyId == 0) corresponds to ethers
*/
contract ClientFund is Ownable, AccessorManageable, Beneficiary, Benefactor, AuthorizableServable, TransferControllerManageable {
    using BalanceLib for BalanceLib.Balance;
    using TxHistoryLib for TxHistoryLib.TxHistory;
    using InUseCurrencyLib for InUseCurrencyLib.InUseCurrency;
    using SafeMathInt for int256;

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
    constructor(address owner, address accessorManager) Ownable(owner) AccessorManageable(accessorManager) Beneficiary() Benefactor() public {
        serviceActivationTimeout = 1 weeks;
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function() public payable {
        depositEthersTo(msg.sender);
    }

    function depositEthersTo(address wallet) public payable {
        int256 amount = SafeMathInt.toNonZeroInt256(msg.value);

        //add to per-wallet deposited balance
        walletMap[wallet].deposited.add(amount, address(0), 0);
        walletMap[wallet].txHistory.addDeposit(amount, address(0), 0);

        //add currency to in-use list
        walletMap[wallet].inUseCurrencies.addItem(address(0), 0);

        //emit event
        emit DepositEvent(wallet, amount, address(0), 0, "");
    }

    function depositTokens(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        depositTokensTo(msg.sender, amount, currencyCt, currencyId, standard);
    }

    function depositTokensTo(address wallet, int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        //execute transfer
        TransferController controller = getTransferController(currencyCt, standard);
        require(address(controller).delegatecall(controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId));

        //add to per-wallet deposited balance
        walletMap[wallet].deposited.add(amount, currencyCt, currencyId);
        walletMap[wallet].txHistory.addDeposit(amount, currencyCt, currencyId);

        //add currency to in-use list
        walletMap[wallet].inUseCurrencies.addItem(currencyCt, currencyId);

        //emit event
        emit DepositEvent(wallet, amount, currencyCt, currencyId, standard);
    }

    function deposit(address wallet, uint index)
    public
    view
    returns (int256 amount, uint256 timestamp, address currencyCt, uint256 currencyId)
    {
        return walletMap[wallet].txHistory.deposit(index);
    }

    function depositCount(address wallet) public view returns (uint256) {
        return walletMap[wallet].txHistory.depositCount();
    }

    function depositedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    notNullAddress(wallet)
    returns (int256)
    {
        return walletMap[wallet].deposited.get(currencyCt, currencyId);
    }

    function settledBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    notNullAddress(wallet)
    returns (int256)
    {
        return walletMap[wallet].settled.get(currencyCt, currencyId);
    }

    function stagedBalance(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    notNullAddress(wallet)
    returns (int256)
    {
        return walletMap[wallet].staged.get(currencyCt, currencyId);
    }

    /// @notice Update the settled balance by the difference between provided amount and deposited on-chain balance
    /// @param wallet Concerned wallet
    /// @param amount The off-chain balance amount
    /// @param currencyCt Concerned currency contract address (address(0) == ETH)
    /// @param currencyId Concerned currency ID (0 for ETH and ERC20)
    function updateSettledBalance(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyRegisteredActiveService
    notNullAddress(wallet)
    {
        //        require(isAuthorizedServiceForWallet(msg.sender, wallet));
        require(amount.isPositiveInt256());

        int256 settledBalanceAmount = amount.sub(walletMap[wallet].deposited.get(currencyCt, currencyId));
        walletMap[wallet].settled.set(settledBalanceAmount, currencyCt, currencyId);

        emit UpdateSettledBalanceEvent(wallet, amount, currencyCt, currencyId);
    }

    function stage(address wallet, int256 amount, address currencyCt, uint256 currencyId)
    public
    onlyRegisteredActiveService
    {
        //        require(isAuthorizedServiceForWallet(msg.sender, wallet));
        require(amount.isNonZeroPositiveInt256());

        //clamp amount to stage
        amount = amount.clampMax(walletMap[wallet].deposited.get(currencyCt, currencyId).add(walletMap[wallet].settled.get(currencyCt, currencyId)));
        if (amount <= 0)
            return;

        walletMap[wallet].deposited.sub(walletMap[wallet].settled.get(currencyCt, currencyId) > amount ? 0 : amount.sub(walletMap[wallet].settled.get(currencyCt, currencyId)), currencyCt, currencyId);
        walletMap[wallet].settled.sub_allow_neg(walletMap[wallet].settled.get(currencyCt, currencyId) > amount ? amount : walletMap[wallet].settled.get(currencyCt, currencyId), currencyCt, currencyId);
        walletMap[wallet].staged.add(amount, currencyCt, currencyId);

        //emit event
        emit StageEvent(wallet, amount, currencyCt, currencyId);
    }

    function unstage(int256 amount, address currencyCt, uint256 currencyId) public notDeployer {
        require(amount.isNonZeroPositiveInt256());

        //clamp amount to move
        amount = amount.clampMax(walletMap[msg.sender].staged.get(currencyCt, currencyId));
        if (amount == 0)
            return;

        //move from staged balance to deposited
        walletMap[msg.sender].staged.transfer(walletMap[msg.sender].deposited, amount, currencyCt, currencyId);

        //emit event
        emit UnstageEvent(msg.sender, amount, currencyCt, currencyId);
    }

    function stageToBeneficiary(Beneficiary beneficiary, int256 amount, address currencyCt, uint256 currencyId) public notDeployer {
        stageToBeneficiaryPrivate(msg.sender, msg.sender, beneficiary, amount, currencyCt, currencyId);

        //emit event
        emit StageToBeneficiaryEvent(msg.sender, beneficiary, amount, currencyCt, currencyId);
    }

    function stageToBeneficiaryUntargeted(address sourceWallet, Beneficiary beneficiary, int256 amount, address currencyCt, uint256 currencyId) public
        onlyRegisteredActiveService
        notNullAddress(sourceWallet)
        notNullAddress(beneficiary)
    {
        //        require(isAuthorizedServiceForWallet(msg.sender, sourceWallet));

        stageToBeneficiaryPrivate(sourceWallet, address(0), beneficiary, amount, currencyCt, currencyId);

        //emit event
        emit StageToBeneficiaryUntargetedEvent(sourceWallet, beneficiary, amount, currencyCt, currencyId);
    }

    function seizeAllBalances(address sourceWallet, address targetWallet) public
        onlyRegisteredActiveService
        notNullAddress(sourceWallet)
        notNullAddress(targetWallet)
    {
        int256 amount;
        uint256 i;
        uint256 len;

        //        require(isAuthorizedServiceForWallet(msg.sender, sourceWallet));

        //seize all currencies
        len = walletMap[sourceWallet].inUseCurrencies.getLength();
        for (i = 0; i < len; i++) {
            MonetaryTypes.Currency memory currency = walletMap[sourceWallet].inUseCurrencies.getAt(i);

            amount = sumAllBalancesOfWalletAndCurrency(sourceWallet, currency.ct, currency.id);
            assert(amount >= 0);

            zeroAllBalancesOfWalletAndCurrency(sourceWallet, currency.ct, currency.id);

            //add to staged balance
            walletMap[targetWallet].staged.add(amount, currency.ct, currency.id);

            //add currencyCt to in-use list
            walletMap[targetWallet].inUseCurrencies.addItem(currency.ct, currency.id);
        }

        //emit event
        emit SeizeAllBalancesEvent(sourceWallet, targetWallet);
    }

    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard) public {
        require(amount.isNonZeroPositiveInt256());

        amount = amount.clampMax(walletMap[msg.sender].staged.get(currencyCt, currencyId));
        if (amount <= 0)
            return;

        //subtract to per-wallet staged balance
        walletMap[msg.sender].staged.sub(amount, currencyCt, currencyId);
        walletMap[msg.sender].txHistory.addWithdrawal(amount, currencyCt, currencyId);

        //execute transfer
        if (currencyCt == address(0) && currencyId == 0)
            msg.sender.transfer(uint256(amount));

        else {
            TransferController controller = getTransferController(currencyCt, standard);
            require(address(controller).delegatecall(controller.getSendSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId), "uff");
        }

        //emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId, standard);
    }

    function withdrawal(address wallet, uint index) public view returns (int256 amount, uint256 timestamp, address token, uint256 id) {
        return walletMap[wallet].txHistory.withdrawal(index);
    }

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
        //transfer funds to the beneficiary
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
