/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Copyright (C) 2017-2018 Hubii
 */
var DexAssetsManager = artifacts.require("./DexAssetsManager.sol");

module.exports = function (deployer, network, accounts) {
	deployer.deploy(DexAssetsManager, accounts[0]);
};
