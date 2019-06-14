/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {TransferController} from "./TransferController.sol";
import {IERC20} from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
 * @title ERC20TransferController
 * @notice Handles transfers of ERC20 tokens
 */
contract ERC20TransferController is TransferController {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant _standard = "ERC20";

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function isFungible()
    public
    view
    returns (bool)
    {
        return true;
    }

    function standard()
    public
    view
    returns (string memory)
    {
        return _standard;
    }

    /// @notice MUST be called with DELEGATECALL
    function receive(address from, address to, uint256 amount, address currencyCt, uint256 currencyId)
    public
    {
        require(msg.sender != address(0), "Message sender is null address [ERC20TransferController.sol:47]");
        require(amount > 0, "Amount is strictly positive [ERC20TransferController.sol:48]");
        require(currencyId == 0, "Currency ID is not 0 [ERC20TransferController.sol:49]");

        require(IERC20(currencyCt).transferFrom(from, to, amount), "Transfer not successful [ERC20TransferController.sol:51]");

        // Emit event
        emit CurrencyTransferred(from, to, amount, currencyCt, currencyId);
    }

    /// @notice MUST be called with DELEGATECALL
    function approve(address to, uint256 amount, address currencyCt, uint256 currencyId)
    public
    {
        require(amount > 0, "Amount is strictly positive [ERC20TransferController.sol:61]");
        require(currencyId == 0, "Currency ID is not 0 [ERC20TransferController.sol:62]");

        require(IERC20(currencyCt).approve(to, amount), "Approval not successful [ERC20TransferController.sol:64]");
    }

    /// @notice MUST be called with DELEGATECALL
    function dispatch(address from, address to, uint256 amount, address currencyCt, uint256 currencyId)
    public
    {
        require(amount > 0, "Amount is strictly positive [ERC20TransferController.sol:71]");
        require(currencyId == 0, "Currency ID is not 0 [ERC20TransferController.sol:72]");

        require(IERC20(currencyCt).approve(from, amount), "Approval not successful [ERC20TransferController.sol:74]");
        require(IERC20(currencyCt).transferFrom(from, to, amount), "Transfer not successful [ERC20TransferController.sol:75]");

        // Emit event
        emit CurrencyTransferred(from, to, amount, currencyCt, currencyId);
    }
}