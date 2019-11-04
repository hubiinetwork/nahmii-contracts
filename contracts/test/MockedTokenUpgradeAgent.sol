/*
 * Hubii Nahmii
 *
 * Compliant with the Hubii Nahmii specification v0.12.
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

pragma solidity >=0.4.25 <0.6.0;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol';
import {TokenUpgradeAgent} from "../TokenUpgradeAgent.sol";

/**
 * @title MockedTokenUpgradeAgent
 * @notice Mocked implementation of a token upgrade agent
 */
contract MockedTokenUpgradeAgent is TokenUpgradeAgent {

    bool public _upgradeFrom;

    constructor(address _oldToken)
    public
    TokenUpgradeAgent(_oldToken)
    {
    }

    function upgradeFrom(address, uint256)
    public
    onlyOrigin
    returns (bool)
    {
        return _upgradeFrom;
    }

    function _setUpgradeFrom(bool _from)
    public
    {
        _upgradeFrom = _from;
    }
}