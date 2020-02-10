/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;
pragma experimental ABIEncoderV2;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/math/Math.sol';
import {BalanceRecordable} from "./BalanceRecordable.sol";
import {TokenUpgradeAgent} from "./TokenUpgradeAgent.sol";

/**
 * @title RevenueToken
 * @dev Implementation of the EIP20 standard token (also known as ERC20 token) with added
 * storage of balance records (block number/balance pairs) and upgrade support.
 */
contract RevenueToken is ERC20Mintable, BalanceRecordable {
    using SafeMath for uint256;
    using Math for uint256;

    struct BalanceRecord {
        uint256 blockNumber;
        uint256 balance;
    }

    mapping(address => BalanceRecord[]) public balanceRecords;

    bool public mintingDisabled;

    event DisableMinting();
    event Upgrade(TokenUpgradeAgent tokenUpgradeAgent, address from, uint256 value);
    event UpgradeFrom(TokenUpgradeAgent tokenUpgradeAgent, address upgrader, address from, uint256 value);
    event UpgradeBalanceRecords(address account, uint256 startIndex, uint256 endIndex);

    /**
     * @notice Disable further minting
     * @dev This operation can not be undone
     */
    function disableMinting()
    public
    onlyMinter
    {
        // Disable minting
        mintingDisabled = true;

        // Emit event
        emit DisableMinting();
    }

    /**
     * @notice Mint tokens
     * @param to The address that will receive the minted tokens
     * @param value The amount of tokens to mint
     * @return A boolean that indicates if the operation was successful
     */
    function mint(address to, uint256 value)
    public
    onlyMinter
    returns (bool)
    {
        // Require that minting has not been disabled
        require(!mintingDisabled, "Minting disabled [RevenueToken.sol:68]");

        // Call super's mint, including event emission
        bool minted = super.mint(to, value);

        // Add balance record if minted
        if (minted)
            _addBalanceRecord(to);

        // Return the minted flag
        return minted;
    }

    /**
     * @notice Transfer token for a specified address
     * @param to The address to transfer to
     * @param value The amount to be transferred
     * @return A boolean that indicates if the operation was successful
     */
    function transfer(address to, uint256 value)
    public
    returns (bool)
    {
        // Call super's transfer, including event emission
        bool transferred = super.transfer(to, value);

        // Add balance records if funds were transferred
        if (transferred) {
            _addBalanceRecord(msg.sender);
            _addBalanceRecord(to);
        }

        // Return the transferred flag
        return transferred;
    }

    /**
     * @notice Approve the passed address to spend the specified amount of tokens on behalf of msg.sender
     * @dev Beware that to change the approve amount you first have to reduce the addresses'
     * allowance to zero by calling `approve(spender, 0)` if it is not already 0 to mitigate the race
     * condition described in https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds
     * @param value The amount of tokens to be spent
     */
    function approve(address spender, uint256 value)
    public
    returns (bool)
    {
        // Prevent the update of non-zero allowance
        require(
            0 == value || 0 == allowance(msg.sender, spender),
            "Value or allowance non-zero [RevenueToken.sol:117]"
        );

        // Call super's approve, including event emission
        return super.approve(spender, value);
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param from address The address to send tokens from
     * @param to address The address to send tokens to
     * @param value uint256 the amount of tokens to be transferred
     * @return A boolean that indicates if the operation was successful
     */
    function transferFrom(address from, address to, uint256 value)
    public
    returns (bool)
    {
        // Call super's transferFrom, including event emission
        bool transferred = super.transferFrom(from, to, value);

        // Add balance records if funds were transferred
        if (transferred) {
            _addBalanceRecord(from);
            _addBalanceRecord(to);
        }

        // Return the transferred flag
        return transferred;
    }

    /**
     * @notice Upgrade the given value of this token to a new token contract
     * using the given upgrade agent
     * @param tokenUpgradeAgent The upgrade agent doing the increment of the new token
     * @param value The value to decrement this token
     * @return A boolean that indicates if the operation was successful
     */
    function upgrade(TokenUpgradeAgent tokenUpgradeAgent, uint256 value)
    public
    returns (bool)
    {
        // Destroy old tokens of message sender
        _burn(msg.sender, value);

        // Upgrade from message sender
        bool upgraded = tokenUpgradeAgent.upgradeFrom(msg.sender, value);

        // Require successful upgrade
        require(upgraded, "Upgrade failed [RevenueToken.sol:168]");

        // Emit event
        emit Upgrade(tokenUpgradeAgent, msg.sender, value);

        // Return true
        return upgraded;
    }

    /**
    * @notice Upgrade the given wallet's value of this token to a new token contract using the given upgrade agent
    * @param tokenUpgradeAgent The upgrade agent doing the increment of the new token
    * @param from The wallet whose token balance will be upgraded
    * @param value The value to decrement this token
    * @return A boolean that indicates if the operation was successful
    */
    function upgradeFrom(TokenUpgradeAgent tokenUpgradeAgent, address from, uint256 value)
    public
    returns (bool)
    {
        // Destroy old tokens of wallet
        _burnFrom(from, value);

        // Upgrade from wallet
        bool upgraded = tokenUpgradeAgent.upgradeFrom(from, value);

        // Require successful upgrade
        require(upgraded, "Upgrade failed [RevenueToken.sol:195]");

        // Emit event
        emit UpgradeFrom(tokenUpgradeAgent, msg.sender, from, value);

        // Return true
        return upgraded;
    }

    /**
     * @notice Get the count of balance records for the given account
     * @param account The concerned account
     * @return The count of balance updates
     */
    function balanceRecordsCount(address account)
    public
    view
    returns (uint256)
    {
        return balanceRecords[account].length;
    }

    /**
     * @notice Get the balance record balance for the given account and balance record index
     * @param account The concerned account
     * @param index The concerned index
     * @return The balance record balance
     */
    function recordBalance(address account, uint256 index)
    public
    view
    returns (uint256)
    {
        return balanceRecords[account][index].balance;
    }

    /**
     * @notice Get the balance record block number for the given account and balance record index
     * @param account The concerned account
     * @param index The concerned index
     * @return The balance record block number
     */
    function recordBlockNumber(address account, uint256 index)
    public
    view
    returns (uint256)
    {
        return balanceRecords[account][index].blockNumber;
    }

    /**
     * @notice Get the index of the balance record containing the given block number,
     * or -1 if the given block number is below the smallest balance record block number
     * @param account The concerned account
     * @param blockNumber The concerned block number
     * @return The count of balance updates
     */
    function recordIndexByBlockNumber(address account, uint256 blockNumber)
    public
    view
    returns (int256)
    {
        for (uint256 i = balanceRecords[account].length; i > 0;) {
            i = i.sub(1);
            if (balanceRecords[account][i].blockNumber <= blockNumber)
                return int256(i);
        }
        return - 1;
    }

    /**
     * @notice Add the account's given set of balance records to the stored set of records
     * @dev The balance records have to be ordered by increasing block number for the account.
     * Also the smallest balance record block number passed in this function has to be greater
     * than or equal to the ones of balance records previously stored for the account
     * @param account The concerned account
     * @param _balanceRecords The set of balance records to be added
     */
    function upgradeBalanceRecords(address account, BalanceRecord[] memory _balanceRecords)
    public
    onlyMinter
    {
        // If there are input balance records
        if (0 < _balanceRecords.length) {
            // Require that minting has not been disabled
            require(!mintingDisabled, "Minting disabled [RevenueToken.sol:280]");

            // Calculate index range to be upgraded
            uint256 startIndex = balanceRecords[account].length;
            uint256 endIndex = startIndex.add(_balanceRecords.length).sub(1);

            // Save block number from previous balance record
            uint256 previousBlockNumber = startIndex > 0 ? balanceRecords[account][startIndex - 1].blockNumber : 0;

            // Add balance records
            for (uint256 i = 0; i < _balanceRecords.length; i++) {
                // Check block number is valid
                require(previousBlockNumber <= _balanceRecords[i].blockNumber, "Invalid balance record block number [RevenueToken.sol:292]");

                // Add incoming balance record
                balanceRecords[account].push(_balanceRecords[i]);

                // Update previous block number
                previousBlockNumber = _balanceRecords[i].blockNumber;
            }

            // Emit event
            emit UpgradeBalanceRecords(account, startIndex, endIndex);
        }
    }

    /**
     * @dev Add balance record for the given account
     */
    function _addBalanceRecord(address account)
    private
    {
        balanceRecords[account].push(BalanceRecord(block.number, balanceOf(account)));
    }
}