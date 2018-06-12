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

    deployer.deploy(Types).then(() => {
        addresses.Types = Types.address;
    });

    deployer.link(SafeMathIntLib, ClientFund);
	deployer.link(SafeMathIntLib, CommunityVote);
	deployer.link(SafeMathIntLib, Configuration);
	deployer.link(SafeMathIntLib, Exchange);
    deployer.link(SafeMathIntLib, CancelOrdersChallenge);
	deployer.link(SafeMathIntLib, DealSettlementChallenge);
	deployer.link(SafeMathIntLib, DealSettlementChallengePartialChallenge);
    deployer.link(SafeMathIntLib, FraudChallenge);
	deployer.link(SafeMathIntLib, ReserveFund);
	deployer.link(SafeMathIntLib, RevenueFund);
	deployer.link(SafeMathIntLib, SecurityBond);
	deployer.link(SafeMathIntLib, TokenHolderRevenueFund);

    deployer.link(SafeMathUintLib, Exchange);
    deployer.link(SafeMathUintLib, CancelOrdersChallenge);
    deployer.link(SafeMathUintLib, FraudChallenge);
    deployer.link(SafeMathUintLib, RevenueFund);
    deployer.link(SafeMathUintLib, ReserveFund);
    deployer.link(SafeMathUintLib, TokenHolderRevenueFund);

    deployer.link(Types, Exchange);
    deployer.link(Types, CancelOrdersChallenge);
	deployer.link(Types, DealSettlementChallenge);
	deployer.link(Types, DealSettlementChallengePartialChallenge);
    deployer.link(Types, FraudChallenge);

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

	deployer.deploy(CancelOrdersChallenge, ownerAccount).then(() => {
		addresses.CancelOrdersChallenge = CancelOrdersChallenge.address;
	});

	deployer.deploy(DealSettlementChallenge, ownerAccount).then(() => {
		addresses.DealSettlementChallenge = DealSettlementChallenge.address;

		deployer.deploy(DealSettlementChallengePartialChallenge, ownerAccount, DealSettlementChallenge.address).then(() => {
			addresses.DealSettlementChallengePartialChallenge = DealSettlementChallengePartialChallenge.address;
		});
	});

	deployer.deploy(Hasher, ownerAccount).then(() => {
		addresses.Hasher = Hasher.address;
	});

	deployer.deploy(Validator, ownerAccount).then(() => {
		addresses.Validator = Validator.address;
	});
/*
	deployer.deploy(FraudChallenge, ownerAccount).then(() => {
		addresses.FraudChallenge = FraudChallenge.address;
	});
*/
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
