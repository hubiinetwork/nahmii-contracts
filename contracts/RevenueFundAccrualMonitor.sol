/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2020 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import {BalanceAucCalculator} from "./BalanceAucCalculator.sol";
import {BalanceRecordable} from "./BalanceRecordable.sol";
import {ConstantsLib} from "./ConstantsLib.sol";
import {Ownable} from "./Ownable.sol";
import {RevenueFund} from "./RevenueFund.sol";
import {TokenHolderRevenueFund} from "./TokenHolderRevenueFund.sol";
import {ClaimableAmountCalculator} from "./ClaimableAmountCalculator.sol";
import {SafeMathIntLib} from "./SafeMathIntLib.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";

contract RevenueFundAccrualMonitor is Ownable {
    using SafeMathIntLib for int256;
    using SafeMathUintLib for uint256;

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    RevenueFund public revenueFund;
    TokenHolderRevenueFund public tokenHolderRevenueFund;
    ClaimableAmountCalculator public claimableAmountCalculator;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetRevenueFundEvent(RevenueFund revenueFund);
    event SetTokenHolderRevenueFundEvent(TokenHolderRevenueFund tokenHolderRvenueFund);
    event SetClaimableAmountCalculatorEvent(ClaimableAmountCalculator calculator);

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

    /// @notice Set the claimable amount calculator contract
    /// @param _claimableAmountCalculator The ClaimableAmountCalculator contract instance
    function setClaimableAmountCalculator(ClaimableAmountCalculator _claimableAmountCalculator)
    public
    onlyDeployer
    notNullAddress(address(_claimableAmountCalculator))
    {
        // Set new claimable amount calculator
        claimableAmountCalculator = _claimableAmountCalculator;

        // Emit event
        emit SetClaimableAmountCalculatorEvent(claimableAmountCalculator);
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

        // Return the claimable amount
        return claimableAmountCalculator.calculate(
            wallet, accrualClaimableAmount,
            currentAccrualStartBlock, block.number,
            currentAccrualStartBlock, block.number
        );
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
}
