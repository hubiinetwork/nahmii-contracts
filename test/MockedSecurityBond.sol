/*!
 * Hubii - Omphalos
 *
 * Compliant with the Omphalos specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */
pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

//import "../contracts/SecurityBond.sol";

/**
@title Security bond
@notice Fund that contains crypto incentive for function UnchallengeDealSettlementOrderByTrade().s
*/
contract MockedSecurityBond /*is SecurityBond*/ {

    //
    // Structures
    // -----------------------------------------------------------------------------------------------------------------
    struct Stage {
        address wallet;
        address currency;
        int256 amount;
    }

    //
    // Variables
    // -----------------------------------------------------------------------------------------------------------------
    Stage[] public stages;

    //
    // Events
    // -----------------------------------------------------------------------------------------------------------------
    event StageEvent(address from, int256 amount, address token); //token==0 for ethers

    //
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------
    constructor(/*address owner*/) public /*SecurityBond(owner)*/ {
    }

    //
    // Functions
    // -----------------------------------------------------------------------------------------------------------------
    function reset() public {
        stages.length = 0;
    }

    function stagesCount() public view returns (uint256) {
        return stages.length;
    }

    function stage(int256 amount, address token, address wallet) public {
        stages.push(Stage(wallet, token, amount));
        emit StageEvent(msg.sender, amount, token);
    }
}