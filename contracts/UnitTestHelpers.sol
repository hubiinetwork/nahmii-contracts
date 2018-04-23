/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.21;

import "./SafeMath.sol";
import "./ERC20.sol";
import "./ClientFund.sol";

/**
@title UnitTestHelpers
@notice A dummy SC where several functions are added to assist in unit testing.
*/
contract UnitTestHelpers {
    using SafeMath for uint256; 

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    function UnitTestHelpers() public {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function invalidCallToTransferFromActiveToStagedBalance(address clientFunds, address sourceWallet, address destWallet, uint256 amount, address token)public  {
        require(clientFunds != address(0));
        ClientFund sc = ClientFund(clientFunds);
        sc.transferFromActiveToStagedBalance(sourceWallet, destWallet, amount, token);
    }
}
