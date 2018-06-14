/*!
 * Hubii - Omphalos
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

var SafeMathIntLib = artifacts.require('./SafeMathInt.sol');
var SafeMathUintLib = artifacts.require('./SafeMathUint.sol');
var Types = artifacts.require('./Types.sol');
var ClientFund = artifacts.require("./ClientFund.sol");
var CommunityVote = artifacts.require("./CommunityVote.sol");
var Configuration = artifacts.require("./Configuration.sol");
var Exchange = artifacts.require("./Exchange.sol");
var CancelOrdersChallenge = artifacts.require("./CancelOrdersChallenge.sol");
var DealSettlementChallenge = artifacts.require("./DealSettlementChallenge.sol");
var DealSettlementChallengePartialChallenge = artifacts.require("./DealSettlementChallengePartialChallenge.sol");
var Hasher = artifacts.require('./Hasher.sol');
var Validator = artifacts.require('./Validator.sol');
var FraudChallenge = artifacts.require("./FraudChallenge.sol");
var ReserveFund = artifacts.require("./ReserveFund.sol");
var RevenueFund = artifacts.require("./RevenueFund.sol");
var SecurityBond = artifacts.require("./SecurityBond.sol");
var TokenHolderRevenueFund = artifacts.require("./TokenHolderRevenueFund.sol");

var fs = require('fs');
var path = require('path');

var helpers = require('./helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
	var ownerAccount;
	var addresses = {};

	if (helpers.isTestNetwork(network)) {
		ownerAccount = accounts[0];
	}
	else {
		ownerAccount = helpers.getOwnerAccountFromArgs();
		ownerAccountPassword = helpers.getPasswordFromArgs();
		helpers.unlockAddress(web3, ownerAccount, ownerAccountPassword, 600); //10 minutes
	}

	deployer.deploy(SafeMathIntLib, {
		from : ownerAccount
	}).then(() => {
		addresses.SafeMathInt = SafeMathIntLib.address;
	});

	deployer.deploy(SafeMathUintLib, {
		from : ownerAccount
	}).then(() => {
		addresses.SafeMathUint = SafeMathUintLib.address;
	});

	deployer.deploy(Types, {
		from : ownerAccount
	}).then(() => {
		addresses.Types = Types.address;
	});

	deployer.link(SafeMathIntLib, [
		ClientFund, CommunityVote, Configuration, Exchange, CancelOrdersChallenge, DealSettlementChallenge, DealSettlementChallengePartialChallenge,
		FraudChallenge, ReserveFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
	]);

	deployer.link(SafeMathUintLib, [
		Exchange, CancelOrdersChallenge, FraudChallenge, RevenueFund, ReserveFund, TokenHolderRevenueFund
	]);

	deployer.link(Types, [
		Exchange, CancelOrdersChallenge, DealSettlementChallenge, DealSettlementChallengePartialChallenge, FraudChallenge
	]);

	deployer.deploy(ClientFund, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.ClientFund = ClientFund.address;
	});

	deployer.deploy(CommunityVote, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.CommunityVote = CommunityVote.address;
	});

	deployer.deploy(Configuration, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.Configuration = Configuration.address;
	});

	deployer.deploy(Exchange, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.Exchange = Exchange.address;
	});

	deployer.deploy(CancelOrdersChallenge, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.CancelOrdersChallenge = CancelOrdersChallenge.address;
	});

	deployer.deploy(DealSettlementChallenge, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.DealSettlementChallenge = DealSettlementChallenge.address;

		deployer.deploy(DealSettlementChallengePartialChallenge, ownerAccount, DealSettlementChallenge.address, {
			from : ownerAccount
		}).then(() => {
			addresses.DealSettlementChallengePartialChallenge = DealSettlementChallengePartialChallenge.address;
		});
	});

	deployer.deploy(Hasher, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.Hasher = Hasher.address;
	});

	deployer.deploy(Validator, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.Validator = Validator.address;
	});
/*
	deployer.deploy(FraudChallenge, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.FraudChallenge = FraudChallenge.address;
	});
*/
	deployer.deploy(ReserveFund, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.ReserveFund1 = ReserveFund.address;
	});

	deployer.deploy(ReserveFund, ownerAccount, {
		from : ownerAccount,
		overwrite : true
	}).then(() => {
		addresses.ReserveFund2 = ReserveFund.address;
	});

	deployer.deploy(RevenueFund, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.RevenueFund1 = RevenueFund.address;
	});

	deployer.deploy(RevenueFund, ownerAccount, {
		from : ownerAccount,
		overwrite : true
	}).then(() => {
		addresses.RevenueFund2 = RevenueFund.address;
	});

	deployer.deploy(SecurityBond, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.SecurityBond = SecurityBond.address;
	});

	deployer.deploy(TokenHolderRevenueFund, ownerAccount, {
		from : ownerAccount
	}).then(() => {
		addresses.TokenHolderRevenueFund = TokenHolderRevenueFund.address;

		saveAddresses(deployer, addresses);
	});
};

function saveAddresses(deployer, addresses)
{
	return new Promise((resolve, reject) => {
		var build_path = deployer.basePath + path.sep + '..' + path.sep + 'build';
		var address_filename = build_path + path.sep + 'addresses.json';

		//No need to handle the error. If the file doesn't exist then we'll start afresh with a new object.
		fs.readFile(address_filename, { encoding: 'utf8' }, function(err, json) {
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
			fs.mkdir(build_path, function (err) {
				if ((!err) || (err && err.code == 'EEXIST')) {
					fs.writeFile(address_filename, json, 'utf8', function (err) {
						if (!err)
							resolve();
						else
							reject(err);
					});
				}
				else {
					reject(err);
				}
			});
		});
	});
}
