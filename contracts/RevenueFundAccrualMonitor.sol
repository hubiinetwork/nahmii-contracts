/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {BalanceAucCalculator} from "./BalanceAucCalculator.sol";
import {BalanceRecordable} from "./BalanceRecordable.sol";
import {ConstantsLib} from "./ConstantsLib.sol";
import {Ownable} from "./Ownable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {RevenueTokenManager} from "./RevenueTokenManager.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {TokenHolderRevenueFund} from "./TokenHolderRevenueFund.sol";

contract RevenueFundAccrualMonitor is Ownable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    RevenueFund public revenueFund;
    TokenHolderRevenueFund public tokenHolderRevenueFund;
    RevenueTokenManager public revenueTokenManager;
    BalanceAucCalculator public balanceBlocksCalculator;
    BalanceAucCalculator public releasedAmountBlocksCalculator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetRevenueFundEvent(RevenueFund revenueFund);
    event SetTokenHolderRevenueFundEvent(TokenHolderRevenueFund tokenHolderRvenueFund);
    event SetRevenueTokenManagerEvent(RevenueTokenManager revenueTokenManager);
    event SetBalanceBlocksCalculatorEvent(BalanceAucCalculator balanceAucCalculator);
    event SetReleasedAmountBlocksCalculatorEvent(BalanceAucCalculator balanceAucCalculator);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer) Ownable(deployer) public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the revenue fund contract
    /// @param _revenueFund The RevenueFund contract instance
    function setRevenueFund(RevenueFund _revenueFund)
    public
    onlyDeployer
    notNullAddress(address(_revenueFund))
    {
        // Set new revenue fund
        revenueFund = _revenueFund;

        // Emit event
        emit SetRevenueFundEvent(revenueFund);
    }

    /// @notice Set the token holder revenue fund contract
    /// @param _tokenHolderRevenueFund The TokenHolderRevenueFund contract instance
    function setTokenHolderRevenueFund(TokenHolderRevenueFund _tokenHolderRevenueFund)
    public
    onlyDeployer
    notNullAddress(address(_tokenHolderRevenueFund))
    {
        // Set new revenue fund
        tokenHolderRevenueFund = _tokenHolderRevenueFund;

        // Emit event
        emit SetTokenHolderRevenueFundEvent(tokenHolderRevenueFund);
    }

    /// @notice Set the revenue token manager contract
    /// @param _revenueTokenManager The RevenueTokenManager contract instance
    function setRevenueTokenManager(RevenueTokenManager _revenueTokenManager)
    public
    onlyDeployer
    notNullAddress(address(_revenueTokenManager))
    {
        // Set new revenue token manager
        revenueTokenManager = _revenueTokenManager;

        // Emit event
        emit SetRevenueTokenManagerEvent(revenueTokenManager);
    }

    /// @notice Set the balance AUC calculator for the calculation of revenue token balance blocks
    /// @param _balanceAucCalculator The balance AUC calculator
    function setBalanceBlocksCalculator(BalanceAucCalculator _balanceAucCalculator)
    public
    onlyDeployer
    notNullOrThisAddress(address(_balanceAucCalculator))
    {
        // Set the calculator
        balanceBlocksCalculator = _balanceAucCalculator;

        // Emit event
        emit SetBalanceBlocksCalculatorEvent(balanceBlocksCalculator);
    }

    /// @notice Set the balance AUC calculator for the calculation of released amount blocks
    /// @param _balanceAucCalculator The balance AUC calculator
    function setReleasedAmountBlocksCalculator(BalanceAucCalculator _balanceAucCalculator)
    public
    onlyDeployer
    notNullOrThisAddress(address(_balanceAucCalculator))
    {
        // Set the calculator
        releasedAmountBlocksCalculator = _balanceAucCalculator;

        // Emit event
        emit SetReleasedAmountBlocksCalculatorEvent(releasedAmountBlocksCalculator);
    }

    /// @notice Get the claimable amount for the given wallet-currency pair for the
    /// ongoing accrual
    /// @param wallet The address of the concerned wallet
    /// @param currencyCt The address of the concerned currency contract (address(0) == ETH)
    /// @param currencyId The ID of the concerned currency (0 for ETH and ERC20)
    /// @return The claimable amount
    function claimableAmount(address wallet, address currencyCt, uint256 currencyId)
    public
    view
    returns (int256)
    {
        // Get the claimable amount of the accrual, i.e. corresponding to the fraction that will be
        // transferred to TokenHolderRevenueFund when the accrual is closed
        int256 accrualClaimableAmount = _accrualClaimableAmount(currencyCt, currencyId);

        // Get the start block of the current accrual, i.e. 0 if first accrual or (end block + 1)
        // of the previous closed accrual
        uint256 currentAccrualStartBlock = _currentAccrualStartBlock(currencyCt, currencyId);

        // Get the wallet balance blocks in the ongoing accrual
        int256 balanceBlocks = _balanceBlocks(wallet, currentAccrualStartBlock, block.number);

        // Get the corrected released amount blocks in the ongoing accrual, i.e. the revenue token manager's
        // released amount blocks subtracted the balance blocks of non-claimers
        int256 amountBlocks = _correctedReleasedAmountBlocks(currentAccrualStartBlock, block.number);

        // Return the calculated claimable amount
        return accrualClaimableAmount
        .mul_nn(balanceBlocks)
        .div_nn(amountBlocks);
    }

    //
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------
    function _accrualClaimableAmount(address currencyCt, uint256 currencyId)
    private
    view
    returns (int256)
    {
        int256 periodAccrualBalance = revenueFund.periodAccrualBalance(currencyCt, currencyId);

        int256 beneficiaryFraction = revenueFund.beneficiaryFraction(tokenHolderRevenueFund);

        return periodAccrualBalance
        .mul_nn(beneficiaryFraction)
        .div_nn(ConstantsLib.PARTS_PER());
    }

    function _currentAccrualStartBlock(address currencyCt, uint256 currencyId)
    private
    view
    returns (uint256)
    {
        uint256 lastClosedAccrualIndex = tokenHolderRevenueFund.closedAccrualsCount(
            currencyCt, currencyId
        );
        if (0 == lastClosedAccrualIndex)
            return 0;
        else {
            (,uint256 endBlock,) = tokenHolderRevenueFund.closedAccrualsByCurrency(
                currencyCt, currencyId, lastClosedAccrualIndex.sub(1)
            );
            return endBlock.add(1);
        }
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
        // Obtain the released amount blocks from revenue token manager
        int256 amountBlocks = int256(releasedAmountBlocksCalculator.calculate(
                BalanceRecordable(address(revenueTokenManager)), address(0), startBlock, endBlock
            ));

        // Correct the amount blocks by subtracting the contributions from contracts that may not claim
        for (uint256 i = 0; i < tokenHolderRevenueFund.nonClaimersCount(); i = i.add(1))
            amountBlocks = amountBlocks.sub(_balanceBlocks(tokenHolderRevenueFund.nonClaimers(i), startBlock, endBlock));

        // Return corrected amount blocks
        return amountBlocks;
    }
}
