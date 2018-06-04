/*!
 * Hubii - Omphalos
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

var SafeMathIntLib = artifacts.require('./SafeMathInt.sol');
var SafeMathUintLib = artifacts.require('./SafeMathUint.sol');
var ClientFund = artifacts.require("./ClientFund.sol");
var CommunityVote = artifacts.require("./CommunityVote.sol");
var Configuration = artifacts.require("./Configuration.sol");
var Exchange = artifacts.require("./Exchange.sol");
var ReserveFund = artifacts.require("./ReserveFund.sol");
var RevenueFund = artifacts.require("./RevenueFund.sol");
var SecurityBond = artifacts.require("./SecurityBond.sol");
var TokenHolderRevenueFund = artifacts.require("./TokenHolderRevenueFund.sol");

var fs = require('fs');
var path = require('path');

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
	var ownerAccount = accounts[0];
	var actions = [];
	var addresses = {};

	deployer.deploy(SafeMathIntLib).then(() => {
		addresses.SafeMathInt = SafeMathIntLib.address;
	});

	deployer.deploy(SafeMathUintLib).then(() => {
		addresses.SafeMathUint = SafeMathUintLib.address;
	});

	deployer.link(SafeMathUintLib, Exchange);
	deployer.link(SafeMathUintLib, RevenueFund);
	deployer.link(SafeMathUintLib, ReserveFund);
	deployer.link(SafeMathUintLib, TokenHolderRevenueFund);
	deployer.link(SafeMathIntLib, ClientFund);
	deployer.link(SafeMathIntLib, CommunityVote);
	deployer.link(SafeMathIntLib, Configuration);
	deployer.link(SafeMathIntLib, Exchange);
	deployer.link(SafeMathIntLib, ReserveFund);
	deployer.link(SafeMathIntLib, RevenueFund);
	deployer.link(SafeMathIntLib, SecurityBond);
	deployer.link(SafeMathIntLib, TokenHolderRevenueFund);
	
	deployer.deploy(ClientFund, ownerAccount).then(() => {
		addresses.ClientFund = ClientFund.address;
	});

	deployer.deploy(CommunityVote, ownerAccount).then(() => {
		addresses.CommunityVote = CommunityVote.address;
	});

	deployer.deploy(Configuration, ownerAccount).then(() => {
		addresses.Configuration = Configuration.address;
	});

	deployer.deploy(Exchange, ownerAccount).then(() => {
		addresses.Exchange = Exchange.address;
	});

	deployer.deploy(ReserveFund, ownerAccount).then(() => {
		addresses.ReserveFund1 = ReserveFund.address;
	});

	deployer.deploy(ReserveFund, ownerAccount, { overwrite: true }).then(() => {
		addresses.ReserveFund2 = ReserveFund.address;
	});

	deployer.deploy(RevenueFund, ownerAccount).then(() => {
		addresses.RevenueFund1 = RevenueFund.address;
	});

	deployer.deploy(RevenueFund, ownerAccount, { overwrite: true }).then(() => {
		addresses.RevenueFund2 = RevenueFund.address;
	});

	deployer.deploy(SecurityBond, ownerAccount).then(() => {
		addresses.SecurityBond = SecurityBond.address;
	});

	deployer.deploy(TokenHolderRevenueFund, ownerAccount).then(() => {
		addresses.TokenHolderRevenueFund = TokenHolderRevenueFund.address;

		saveAddresses(deployer, addresses);
	});
};

function saveAddresses(deployer, addresses)
{
	return new Promise((resolve, reject) => {
		var filename = deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json';

		//No need to handle the error. If the file doesn't exist then we'll start afresh with a new object.
		fs.readFile(filename, { encoding: 'utf8' }, function(err, json) {
			if (!err) {
				try {
					json = JSON.parse(json);
				} catch (err) {
					reject(err);
					return;
				}
			}
			if (typeof json !== 'object') {
				json = {};
			}
			if (typeof json.networks !== 'object') {
				json.networks = {};
			}

			json.networks[deployer.network_id] = addresses;
	
			//update timestamp
			json.updatedAt = new Date().toISOString();

			//convert to text
			json = JSON.stringify(json, null, 2);

			//write json file (by this time the build folder should exists)
			fs.writeFile(filename, json, 'utf8', function (err) {
				if (!err)
					resolve();
				else
					reject(err);
			});
		});
	});
}
