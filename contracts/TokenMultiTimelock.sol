/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {Ownable} from "./Ownable.sol";
import {SafeMathUintLib} from "./SafeMathUintLib.sol";
import {IERC20} from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

/**
 * @title TokenMultiTimelock
 * @notice An ownable that allows a beneficiary to extract tokens in
 *   a number of batches each a given release time
 */
contract TokenMultiTimelock is Ownable {
    using SafeMathUintLib for uint256;
    using SafeERC20 for IERC20;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Release {
        uint256 earliestReleaseTime;
        uint256 amount;
        uint256 totalAmount;
        uint256 blockNumber;
        bool done;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    IERC20 public token;
    address public beneficiary;

    Release[] public releases;
    uint256 public totalReleasedAmount;
    uint256 public totalLockedAmount;
    uint256 public executedReleasesCount;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event SetTokenEvent(IERC20 token);
    event SetBeneficiaryEvent(address beneficiary);
    event DefineReleaseEvent(uint256 earliestReleaseTime, uint256 amount, uint256 blockNumber);
    event SetReleaseBlockNumberEvent(uint256 index, uint256 blockNumber);
    event ReleaseEvent(uint256 index, uint256 blockNumber, uint256 earliestReleaseTime,
        uint256 actualReleaseTime, uint256 amount);

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(address deployer)
    Ownable(deployer)
    public
    {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    /// @notice Set the address of token
    /// @param _token The address of token
    function setToken(IERC20 _token)
    public
    onlyOperator
    notNullOrThisAddress(address(_token))
    {
        // Require that the token has not previously been set
        require(address(token) == address(0), "Token previously set [TokenMultiTimelock.sol:77]");

        // Update beneficiary
        token = _token;

        // Emit event
        emit SetTokenEvent(token);
    }

    /// @notice Set the address of beneficiary
    /// @param _beneficiary The new address of beneficiary
    function setBeneficiary(address _beneficiary)
    public
    onlyOperator
    notNullAddress(_beneficiary)
    {
        // Update beneficiary
        beneficiary = _beneficiary;

        // Emit event
        emit SetBeneficiaryEvent(beneficiary);
    }

    /// @notice Define a set of new releases
    /// @param earliestReleaseTimes The timestamp after which the corresponding amount may be released
    /// @param amounts The amounts to be released
    /// @param releaseBlockNumbers The set release block numbers for releases whose earliest release time
    /// is in the past
    function defineReleases(uint256[] memory earliestReleaseTimes, uint256[] memory amounts, uint256[] memory releaseBlockNumbers)
    onlyOperator
    public
    {
        require(
            earliestReleaseTimes.length == amounts.length,
            "Earliest release times and amounts lengths mismatch [TokenMultiTimelock.sol:109]"
        );
        require(
            earliestReleaseTimes.length >= releaseBlockNumbers.length,
            "Earliest release times and release block numbers lengths mismatch [TokenMultiTimelock.sol:113]"
        );

        // Require that token address has been set
        require(address(token) != address(0), "Token not initialized [TokenMultiTimelock.sol:119]");

        for (uint256 i = 0; i < earliestReleaseTimes.length; i++) {
            // Increment the total amount locked by this contract
            totalLockedAmount = totalLockedAmount.add(amounts[i]);

            // Require that total amount locked is less than or equal to the token balance of
            // this contract
            require(token.balanceOf(address(this)) >= totalLockedAmount, "Total locked amount overrun [TokenMultiTimelock.sol:127]");

            // Retrieve early block number where available
            uint256 blockNumber = i < releaseBlockNumbers.length ? releaseBlockNumbers[i] : 0;

            // Add release
            releases.push(Release(earliestReleaseTimes[i], amounts[i], 0, blockNumber, false));

            // Emit event
            emit DefineReleaseEvent(earliestReleaseTimes[i], amounts[i], blockNumber);
        }
    }

    /// @notice Get the count of releases
    /// @return The number of defined releases
    function releasesCount()
    public
    view
    returns (uint256)
    {
        return releases.length;
    }

    /// @notice Set the block number of a release that is not done
    /// @param index The index of the release
    /// @param blockNumber The updated block number
    function setReleaseBlockNumber(uint256 index, uint256 blockNumber)
    public
    onlyBeneficiary
    {
        // Require that the release is not done
        require(!releases[index].done, "Release previously done [TokenMultiTimelock.sol:158]");

        // Update the release block number
        releases[index].blockNumber = blockNumber;

        // Emit event
        emit SetReleaseBlockNumberEvent(index, blockNumber);
    }

    /// @notice Get the index of the release covering the given block number,
    /// or -1 if the given block number is below the smallest release block number
    /// @param blockNumber The concerned block number
    /// @return The release index
    function releaseIndexByBlockNumber(uint256 blockNumber)
    public
    view
    returns (int256)
    {
        for (uint256 i = releases.length; i > 0;) {
            i = i.sub(1);
            if (0 < releases[i].blockNumber && releases[i].blockNumber <= blockNumber)
                return int256(i);
        }
        return -1;
    }

    /// @notice Transfers tokens held in the indicated release to beneficiary.
    /// @param index The index of the release
    function release(uint256 index)
    public
    onlyBeneficiary
    {
        // Get the release object
        Release storage _release = releases[index];

        // Require that this release has been properly defined by having non-zero amount
        require(0 < _release.amount, "Release amount not strictly positive [TokenMultiTimelock.sol:194]");

        // Require that this release has not already been executed
        require(!_release.done, "Release previously done [TokenMultiTimelock.sol:197]");

        // Require that the current timestamp is beyond the nominal release time
        require(block.timestamp >= _release.earliestReleaseTime, "Block time stamp less than earliest release time [TokenMultiTimelock.sol:200]");

        // Increment total released amount
        totalReleasedAmount = totalReleasedAmount.add(_release.amount);

        // Set release' total (released) amount
        _release.totalAmount = totalReleasedAmount;

        // Set release done
        _release.done = true;

        // Set release block number if not previously set
        if (0 == _release.blockNumber)
            _release.blockNumber = block.number;

        // Bump number of executed releases
        executedReleasesCount = executedReleasesCount.add(1);

        // Decrement the total locked amount
        totalLockedAmount = totalLockedAmount.sub(_release.amount);

        // Execute transfer
        token.safeTransfer(beneficiary, _release.amount);

        // Emit event
        emit ReleaseEvent(index, _release.blockNumber, _release.earliestReleaseTime, block.timestamp, _release.amount);
    }

    // Modifiers
    // -----------------------------------------------------------------------------------------------------------------
    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, "Message sender not beneficiary [TokenMultiTimelock.sol:231]");
        _;
    }
}