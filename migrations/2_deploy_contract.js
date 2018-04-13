/*!
 * Hubii Network - DEX Smart Contract for assets settlement.
 *
 * Copyright (C) 2017-2018 Hubii
 */

var ClientFund = artifacts.require("./ClientFund.sol");
var CommunityVote = artifacts.require("./CommunityVote.sol");
var Configuration = artifacts.require("./Configuration.sol");
var Exchange = artifacts.require("./Exchange.sol");
var ReserveFund = artifacts.require("./ReserveFund.sol");
var RevenueFund = artifacts.require("./RevenueFund.sol");
var SecurityBond = artifacts.require("./SecurityBond.sol");
var TokenHolderRevenueFund = artifacts.require("./TokenHolderRevenueFund.sol");

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
	var ownerAccount = accounts[0];

	deployer.deploy(ClientFund, ownerAccount);
	deployer.deploy(CommunityVote, ownerAccount);
	deployer.deploy(Configuration, ownerAccount);
	deployer.deploy(Exchange, ownerAccount);
	deployer.deploy(ReserveFund, ownerAccount);
	deployer.deploy(RevenueFund, ownerAccount);
	deployer.deploy(SecurityBond, ownerAccount);
	deployer.deploy(TokenHolderRevenueFund, ownerAccount);
};
