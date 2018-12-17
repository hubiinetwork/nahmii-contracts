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
import {Beneficiary} from "./Beneficiary.sol";
import {Benefactor} from "./Benefactor.sol";
import {AuthorizableServable} from "./AuthorizableServable.sol";
import {TransferControllerManageable} from "./TransferControllerManageable.sol";
import {BalanceTrackable} from "./BalanceTrackable.sol";
import {TransactionTrackable} from "./TransactionTrackable.sol";
import {WalletLockable} from "./WalletLockable.sol";
import {TransferController} from "./TransferController.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {TokenHolderRevenueFund} from "./TokenHolderRevenueFund.sol";

/**
 * @title Client fund
 * @notice Where clients’ crypto is deposited into, staged and withdrawn from.
 */
contract ClientFund is Ownable, Beneficiary, Benefactor, AuthorizableServable, TransferControllerManageable,
BalanceTrackable, TransactionTrackable, WalletLockable {
    using SafeMathIntLib for int256;

    address[] public seizedWallets;
    mapping(address => bool) public seizedByWallet;

    TokenHolderRevenueFund public tokenHolderRevenueFund;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetTokenHolderRevenueFundEvent(TokenHolderRevenueFund oldTokenHolderRevenueFund,
        TokenHolderRevenueFund newTokenHolderRevenueFund);
    event ReceiveEvent(address wallet, string balanceType, int256 amount, address currencyCt,
        uint256 currencyId, string standard);
    event WithdrawEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId,
        string standard);
    event StageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event UnstageEvent(address wallet, int256 amount, address currencyCt, uint256 currencyId);
    event UpdateSettledBalanceEvent(address wallet, int256 amount, address currencyCt,
        uint256 currencyId);
    event StageToBeneficiaryEvent(address sourceWallet, address beneficiary, int256 amount,
        address currencyCt, uint256 currencyId, string standard);
    event TransferToBeneficiaryEvent(address wallet, address beneficiary, int256 amount,
        address currencyCt, uint256 currencyId);
    event SeizeBalancesEvent(address seizedWallet, address seizerWallet);
    event ClaimRevenueEvent(address claimer, string balanceType, address currencyCt,
        uint256 currencyId, string standard);

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
    /// @notice Set the token holder revenue fund contract
    /// @param newTokenHolderRevenueFund The (address of) TokenHolderRevenueFund contract instance
    function setTokenHolderRevenueFund(TokenHolderRevenueFund newTokenHolderRevenueFund)
    public
    onlyDeployer
    notNullAddress(newTokenHolderRevenueFund)
    notSameAddresses(newTokenHolderRevenueFund, tokenHolderRevenueFund)
    {
        // Set new token holder revenue fund
        TokenHolderRevenueFund oldTokenHolderRevenueFund = tokenHolderRevenueFund;
        tokenHolderRevenueFund = newTokenHolderRevenueFund;

        // Emit event
        emit SetTokenHolderRevenueFundEvent(oldTokenHolderRevenueFund, newTokenHolderRevenueFund);
    }

    /// @notice Fallback function that deposits ethers to msg.sender's deposited balance
    function()
    public
    payable
    {
        receiveEthersTo(msg.sender, balanceTracker.DEPOSITED_BALANCE_TYPE());
    }

    /// @notice Receive ethers to the given wallet's balance of the given type
    /// @param wallet The address of the concerned wallet
    /// @param balanceType The target balance type
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

    /// @notice Receive token to msg.sender's balance of the given type
    /// @dev The wallet must approve of this ClientFund's transfer prior to calling this function
    /// @param balanceType The target balance type
    /// @param amount The amount to deposit
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function receiveTokens(string balanceType, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        receiveTokensTo(msg.sender, balanceType, amount, currencyCt, currencyId, standard);
    }

    /// @notice Receive token to the given wallet's balance of the given type
    /// @dev The wallet must approve of this ClientFund's transfer prior to calling this function
    /// @param wallet The address of the concerned wallet
    /// @param balanceType The target balance type
    /// @param amount The amount to deposit
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function receiveTokensTo(address wallet, string balanceType, int256 amount, address currencyCt,
        uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        // Execute transfer
        TransferController controller = transferController(currencyCt, standard);
        require(
            address(controller).delegatecall(
                controller.getReceiveSignature(), msg.sender, this, uint256(amount), currencyCt, currencyId
            )
        );

        // Register reception
        _receiveTo(wallet, balanceType, amount, currencyCt, currencyId);

        // Emit event
        emit ReceiveEvent(wallet, balanceType, amount, currencyCt, currencyId, standard);
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
            wallet, balanceTracker.depositedBalanceType(), currencyCt, currencyId, blockNumber
        );

        int256 settledBalanceAmount = amount.sub(depositedAmount);
        balanceTracker.set(
            wallet, balanceTracker.settledBalanceType(), settledBalanceAmount, currencyCt, currencyId
        );

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
        balanceTracker.add(
            wallet, balanceTracker.stagedBalanceType(), stageAmount, currencyCt, currencyId
        );

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
            balanceTracker.get(
                msg.sender, balanceTracker.stagedBalanceType(), currencyCt, currencyId
            )
        );
        if (unstageAmount == 0)
            return;

        // Move from staged balance to deposited balance
        balanceTracker.transfer(
            msg.sender, balanceTracker.stagedBalanceType(), balanceTracker.depositedBalanceType(),
            unstageAmount, currencyCt, currencyId
        );

        // Emit event
        emit UnstageEvent(msg.sender, unstageAmount, currencyCt, currencyId);
    }

    /// @notice Stage the amount from wallet to the given beneficiary and targeted to wallet
    /// @param wallet The address of the concerned wallet
    /// @param beneficiary The (address of) concerned beneficiary contract
    /// @param stageAmount The concerned amount to stage
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
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
    /// @param wallet The address of the concerned wallet
    /// @param beneficiary The (address of) concerned beneficiary contract
    /// @param transferAmount The concerned amount
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function transferToBeneficiary(address wallet, Beneficiary beneficiary, int256 transferAmount,
        address currencyCt, uint256 currencyId, string standard)
    public
    onlyAuthorizedService(wallet)
    {
        // Transfer to beneficiary
        _transferToBeneficiary(wallet, beneficiary, transferAmount, currencyCt, currencyId, standard);

        // Emit event
        emit TransferToBeneficiaryEvent(wallet, beneficiary, transferAmount, currencyCt, currencyId);
    }

    /// @notice Seize balances in the given currency of the given wallet, provided that the wallet
    /// is locked by the caller
    /// @param wallet The address of the concerned wallet whose balances are seized
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    function seizeBalances(address wallet, address currencyCt, uint256 currencyId)
    public
    {
        require(walletLocker.isLockedBy(wallet, msg.sender));

        // Get sum of balances for locked wallet
        int256 amount = balanceTracker.sum(wallet, currencyCt, currencyId);

        // Zero locked wallet's balances
        balanceTracker.reset(wallet, currencyCt, currencyId);

        // Add to staged balance of sender
        balanceTracker.add(
            msg.sender, balanceTracker.stagedBalanceType(), amount, currencyCt, currencyId
        );

        // Add to the store of seized wallets
        if (!seizedByWallet[wallet]) {
            seizedByWallet[wallet] = true;
            seizedWallets.push(wallet);
        }

        // Emit event
        emit SeizeBalancesEvent(wallet, msg.sender);
    }

    /// @notice Withdraw the given amount from staged balance
    /// @param amount The concerned amount to withdraw
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function withdraw(int256 amount, address currencyCt, uint256 currencyId, string standard)
    public
    {
        require(amount.isNonZeroPositiveInt256());

        // Require that msg.sender is not locked
        require(!walletLocker.isLocked(msg.sender));

        amount = amount.clampMax(
            balanceTracker.get(
                msg.sender, balanceTracker.stagedBalanceType(), currencyCt, currencyId
            )
        );
        if (amount <= 0)
            return;

        // Subtract to per-wallet staged balance
        balanceTracker.sub(
            msg.sender, balanceTracker.stagedBalanceType(), amount, currencyCt, currencyId
        );

        // Log record of this transaction
        transactionTracker.add(
            msg.sender, transactionTracker.withdrawalTransactionType(), amount, currencyCt, currencyId
        );

        // Execute transfer
        if (address(0) == currencyCt && 0 == currencyId)
            msg.sender.transfer(uint256(amount));

        else {
            TransferController controller = transferController(currencyCt, standard);
            require(
                address(controller).delegatecall(
                    controller.getDispatchSignature(), this, msg.sender, uint256(amount), currencyCt, currencyId
                )
            );
        }

        // Emit event
        emit WithdrawEvent(msg.sender, amount, currencyCt, currencyId, standard);
    }

    /// @notice Get the seized status of given wallet
    /// @param wallet The address of the concerned wallet
    /// @return true if wallet is seized, false otherwise
    function isSeizedWallet(address wallet)
    public
    view
    returns (bool)
    {
        return seizedByWallet[wallet];
    }

    /// @notice Get the number of wallets whose funds have been seized
    /// @return Number of wallets
    function seizedWalletsCount()
    public
    view
    returns (uint256)
    {
        return seizedWallets.length;
    }

    /// @notice Claim revenue from token holder revenue fund based this contract's holdings of the
    /// revenue token, this so that revenue may be shared amongst revenue token holders in nahmii
    /// @param claimer The concerned address of claimer that will subsequently distribute revenue in nahmii
    /// @param balanceType The target balance type for the reception in this contract
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @param standard The standard of the token ("" for default registered, "ERC20", "ERC721")
    function claimRevenue(address claimer, string balanceType, address currencyCt,
        uint256 currencyId, string standard)
    public
    onlyOperator
    {
        tokenHolderRevenueFund.claimAndTransferToBeneficiary(
            this, claimer, balanceType,
            currencyCt, currencyId, standard
        );

        emit ClaimRevenueEvent(claimer, balanceType, currencyCt, currencyId, standard);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _receiveTo(address wallet, string balanceType, int256 amount, address currencyCt,
        uint256 currencyId)
    private
    {
        bytes32 balanceHash = 0 < bytes(balanceType).length ?
        keccak256(abi.encodePacked(balanceType)) :
        balanceTracker.depositedBalanceType();

        if (balanceTracker.stagedBalanceType() == balanceHash)
            balanceTracker.add(
                wallet, balanceTracker.stagedBalanceType(), amount, currencyCt, currencyId
            );

        else if (balanceTracker.depositedBalanceType() == balanceHash) {
            // Add to per-wallet deposited balance
            balanceTracker.add(
                wallet, balanceTracker.depositedBalanceType(), amount, currencyCt, currencyId
            );

            // Log record of this transaction
            transactionTracker.add(
                wallet, transactionTracker.depositTransactionType(), amount, currencyCt, currencyId
            );
        }

        else
            revert();
    }

    function _stageSubtract(address wallet, int256 stageAmount, address currencyCt, uint256 currencyId)
    private
    {
        // Clamp amount to stage
        stageAmount = stageAmount.clampMax(
            balanceTracker.get(
                wallet, balanceTracker.depositedBalanceType(), currencyCt, currencyId
            ).add(
                balanceTracker.get(wallet, balanceTracker.settledBalanceType(), currencyCt, currencyId)
            )
        );
        if (stageAmount <= 0)
            return;

        // Get settled balance amount
        int256 settledBalanceAmount = balanceTracker.get(
            wallet, balanceTracker.settledBalanceType(), currencyCt, currencyId
        );

        // If settled is greater than or equal to amount then amount can be deducted from settled
        if (settledBalanceAmount >= stageAmount)
            balanceTracker.sub(
                wallet, balanceTracker.settledBalanceType(), stageAmount, currencyCt, currencyId
            );

        // Else settled will be zeroed and (stage amount - settled) is deducted from deposited
        else {
            balanceTracker.add(
                wallet, balanceTracker.depositedBalanceType(), settledBalanceAmount.sub(stageAmount),
                currencyCt, currencyId
            );
            balanceTracker.set(
                wallet, balanceTracker.settledBalanceType(), 0, currencyCt, currencyId
            );
        }
    }

    function _transferToBeneficiary(address destWallet, Beneficiary beneficiary,
        int256 transferAmount, address currencyCt, uint256 currencyId, string standard)
    private
    {
        require(transferAmount.isNonZeroPositiveInt256());
        require(isRegisteredBeneficiary(beneficiary));

        // Transfer funds to the beneficiary
        if (address(0) == currencyCt && 0 == currencyId)
            beneficiary.receiveEthersTo.value(uint256(transferAmount))(destWallet, "");

        else {
            // Approve of beneficiary
            TransferController controller = transferController(currencyCt, standard);
            require(
                address(controller).delegatecall(
                    controller.getApproveSignature(), beneficiary, uint256(transferAmount), currencyCt, currencyId
                )
            );

            // Transfer funds to the beneficiary
            beneficiary.receiveTokensTo(destWallet, "", transferAmount, currencyCt, currencyId, standard);
        }
    }
}
