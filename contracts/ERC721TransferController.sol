/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import {TransferController} from "./TransferController.sol";
import {IERC721} from "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";

/**
 * @title ERC721TransferController
 * @notice Handles transfers of ERC721 tokens
 */
contract ERC721TransferController is TransferController {
    //
    // Constants
    // -----------------------------------------------------------------------------------------------------------------
    string constant _standard = "ERC721";

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function isFungible()
    public
    view
    returns (bool)
    {
        return false;
    }

    function standard()
    public
    view
    returns (string memory)
    {
        return _standard;
    }

    function receive(address from, address to, uint256 id, address currencyCt, uint256 currencyId)
    public
    {
        require(currencyId == 0, "Currency ID is not 0 [ERC721TransferController.sol:46]");

        //        IERC721(currencyCt).transferFrom(from, to, id);

        // Emit event
        emit CurrencyTransferred(from, to, id, currencyCt, currencyId);
    }

    /// @notice MUST be called with DELEGATECALL
    function approve(address /*to*/, uint256 /*id*/, address /*currencyCt*/, uint256 currencyId)
    public
    {
        require(currencyId == 0, "Currency ID is not 0 [ERC721TransferController.sol:58]");

        //        IERC721(currencyCt).approve(to, id);
    }

    /// @notice MUST be called with DELEGATECALL
    function dispatch(address from, address to, uint256 id, address currencyCt, uint256 currencyId)
    public
    {
        require(currencyId == 0, "Currency ID is not 0 [ERC721TransferController.sol:67]");

        //        IERC721(currencyCt).approve(from, id);
        //        IERC721(currencyCt).transferFrom(from, to, id);

        // Emit eventid
        emit CurrencyTransferred(from, to, id, currencyCt, currencyId);
    }
}