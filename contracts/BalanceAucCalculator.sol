pragma solidity >=0.4.25 <0.6.0;

import {BalanceRecordable} from "./BalanceRecordable.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";

/**
 * @title BalanceAucCalculator
 * @notice Calculator of area under curve of balance graph as function of block number
 */
contract BalanceAucCalculator {
    using SafeMathUintLib for uint256;

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Calculate the area under curve for the given wallet's balance in the given range of block numbers
    /// @param balanceRecordable The address of the concerned balance recordable instance
    /// (e.g. RevenueToken or RevenueTokenManager)
    /// @param wallet The concerned wallet
    /// @param startBlock The lower block number boundary
    /// @param endBlock The upper block number boundary
    /// @return The calculated value of area under curve
    function calculate(BalanceRecordable balanceRecordable, address wallet, uint256 startBlock, uint256 endBlock)
    public
    view
    returns (uint256)
    {
        // Return 0 if end boundary is not strictly greater than start boundary
        if (endBlock < startBlock)
            return 0;

        // Get the count of balance records
        uint256 recordsCount = balanceRecordable.balanceRecordsCount(wallet);

        // Return 0 if the balance recordable has no records
        if (0 == recordsCount)
            return 0;

        // Obtain the record index of the end block number boundary
        int256 _endIndex = balanceRecordable.recordIndexByBlockNumber(wallet, endBlock);

        // If the record index is negative the upper boundary is below the first record's block number, hence return 0
        if (0 > _endIndex)
            return 0;

        // Cast end record index to unsigned
        uint256 endIndex = uint256(_endIndex);

        // Clamp the start block number boundary to the first record block number as any contribution
        // to the calculation below this limit is 0
        startBlock = startBlock.clampMin(balanceRecordable.recordBlockNumber(wallet, 0));

        // Obtain the record index of the start block number boundary
        uint256 startIndex = uint256(balanceRecordable.recordIndexByBlockNumber(wallet, startBlock));

        // Initialize the result
        uint256 result = 0;

        // Add contribution for the record where the lower block number boundary resides
        if (startIndex < endIndex)
            result = result.add(
                balanceRecordable.recordBalance(wallet, startIndex).mul(
                    balanceRecordable.recordBlockNumber(wallet, startIndex.add(1)).sub(startBlock)
                )
            );

        // Add contribution from records at intermediate indices
        for (uint256 i = startIndex.add(1); i < endIndex; i = i.add(1))
            result = result.add(
                balanceRecordable.recordBalance(wallet, i).mul(
                    balanceRecordable.recordBlockNumber(wallet, i.add(1)).sub(
                        balanceRecordable.recordBlockNumber(wallet, i)
                    )
                )
            );

        // Add contribution from the record where the upper block number boundary resides
        result = result.add(
            balanceRecordable.recordBalance(wallet, endIndex).mul(
                endBlock.sub(
                    balanceRecordable.recordBlockNumber(wallet, endIndex).clampMin(startBlock)
                ).add(1)
            )
        );

        // Return result
        return result;
    }
}
