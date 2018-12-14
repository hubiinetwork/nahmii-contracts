/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity ^0.4.25;

import {Ownable} from "./Ownable.sol";
import {IERC20} from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

/**
 * @title Balance tracker
 * @notice An ownable that allows a beneficiary to extract tokens in
 *   a number of batches each a given release time
 */
contract TokenMultiTimelock is Ownable {
    using SafeERC20 for IERC20;

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Release {
        uint256 releaseTime;
        uint256 amount;
        bool done;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    IERC20 public token;
    address public beneficiary;

    Release[] public releases;
    uint256 public totalLockedAmount;
    uint256 public executedReleasesCount;

    event SetTokenEvent(IERC20 token);
    event SetBeneficiaryEvent(address beneficiary);
    event AddReleaseEvent(uint256 releaseTime, uint256 amount);
    event ReleaseEvent(uint256 index, uint256 nominalReleaseTime,
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
    notNullOrThisAddress(_token)
    {
        // Require that the token has not previously been set
        require(address(token) == address(0));

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

    /// @notice Define a new release
    /// @param releaseTime The timestamp after which the amount may be released
    /// @param amount The amount to be released
    function defineRelease(uint256 releaseTime, uint256 amount)
    onlyOperator
    public
    {
        // Require that token address has been set
        require(address(token) != address(0));

        // Update the total amount locked by this contract
        totalLockedAmount += amount;

        // Require that total amount locked is smaller than or equal to the token balance of
        // this contract
        require(token.balanceOf(address(this)) >= totalLockedAmount);

        // Add release
        releases.push(Release(releaseTime, amount, false));

        // Emit event
        emit AddReleaseEvent(releaseTime, amount);
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

    /// @notice Transfers tokens held in the indicated release to beneficiary.
    /// @param index The index of the release
    function release(uint256 index)
    public
    onlyOperator
    {
        // Get the release object
        Release storage _release = releases[index];

        // Require that this release has not already been executed
        require(!_release.done);

        // Require that the current timestamp is beyond the nominal release time
        require(block.timestamp >= _release.releaseTime);

        // Set release done
        _release.done = true;

        // Bump number of executed releases
        executedReleasesCount++;

        // Decrement the total locked amount
        totalLockedAmount -= _release.amount;

        // Execute transfer
        token.safeTransfer(beneficiary, _release.amount);

        // Emit event
        emit ReleaseEvent(index, _release.releaseTime, block.timestamp, _release.amount);
    }
}
