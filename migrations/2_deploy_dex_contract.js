/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Copyright (C) 2017-2018 Hubii
 */
var DexTrade = artifacts.require("./DexTrade.sol");
var DexReserveFunds = artifacts.require("./DexReserveFunds.sol");

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
	var ownerAccount = accounts[0];

	deployer.deploy(DexTrade, ownerAccount);
	deployer.deploy(DexReserveFunds, ownerAccount);
};
