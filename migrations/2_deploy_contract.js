/*!
 * Hubii Striim
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const SafeMathIntLib = artifacts.require('./SafeMathInt.sol');
const SafeMathUintLib = artifacts.require('./SafeMathUint.sol');
const Types = artifacts.require('./Types.sol');
const ClientFund = artifacts.require("./ClientFund.sol");
const CommunityVote = artifacts.require("./CommunityVote.sol");
const Configuration = artifacts.require("./Configuration.sol");
const Exchange = artifacts.require("./Exchange.sol");
const CancelOrdersChallenge = artifacts.require("./CancelOrdersChallenge.sol");
const DriipSettlementChallenge = artifacts.require("./DriipSettlementChallenge.sol");
const DriipSettlementChallenger = artifacts.require("./DriipSettlementChallenger.sol");
const Hasher = artifacts.require('./Hasher.sol');
const Validator = artifacts.require('./Validator.sol');
const FraudChallengeByOrder = artifacts.require("./FraudChallengeByOrder.sol");
const FraudChallengeByTrade = artifacts.require("./FraudChallengeByTrade.sol");
const FraudChallengeByPayment = artifacts.require("./FraudChallengeByPayment.sol");
const FraudChallengeBySuccessiveTrades = artifacts.require("./FraudChallengeBySuccessiveTrades.sol");
const FraudChallengeBySuccessivePayments = artifacts.require("./FraudChallengeBySuccessivePayments.sol");
const FraudChallengeByPaymentSucceedingTrade = artifacts.require("./FraudChallengeByPaymentSucceedingTrade.sol");
const FraudChallengeByTradeSucceedingPayment = artifacts.require("./FraudChallengeByTradeSucceedingPayment.sol");
const FraudChallengeByTradeOrderResiduals = artifacts.require("./FraudChallengeByTradeOrderResiduals.sol");
const FraudChallengeByDoubleSpentOrders = artifacts.require("./FraudChallengeByDoubleSpentOrders.sol");
const FraudChallengeByDuplicateDriipNonceOfTrades = artifacts.require("./FraudChallengeByDuplicateDriipNonceOfTrades.sol");
const FraudChallengeByDuplicateDriipNonceOfPayments = artifacts.require("./FraudChallengeByDuplicateDriipNonceOfPayments.sol");
const FraudChallengeByDuplicateDriipNonceOfTradeAndPayment = artifacts.require("./FraudChallengeByDuplicateDriipNonceOfTradeAndPayment.sol");
const FraudChallenge = artifacts.require("./FraudChallenge.sol");
const ReserveFund = artifacts.require("./ReserveFund.sol");
const RevenueFund = artifacts.require("./RevenueFund.sol");
const SecurityBond = artifacts.require("./SecurityBond.sol");
const TokenHolderRevenueFund = artifacts.require("./TokenHolderRevenueFund.sol");
const PartnerFund = artifacts.require("./PartnerFund.sol");
const RevenueToken = artifacts.require("./RevenueToken.sol");
const fs = require('fs');
const path = require('path');

const helpers = require('./helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
	var ownerAccount;
	var deployFilters;
	const addresses = {};

	if (helpers.isTestNetwork(network)) {
		ownerAccount = accounts[0];
	}
	else {
		ownerAccount = helpers.getOwnerAccountFromArgs();
		const ownerAccountPassword = helpers.getPasswordFromArgs();
		helpers.unlockAddress(web3, ownerAccount, ownerAccountPassword, 3600); //60 minutes
	}

	deployFilters = helpers.getFiltersFromArgs();

	deployer.deploy(SafeMathIntLib, {
		from: ownerAccount
	}).then(() => {
		addresses.SafeMathInt = SafeMathIntLib.address;
	});

	deployer.deploy(SafeMathUintLib, {
		from: ownerAccount
	}).then(() => {
		addresses.SafeMathUint = SafeMathUintLib.address;
	});

	deployer.deploy(Types, {
		from: ownerAccount
	}).then(() => {
		addresses.Types = Types.address;
	});

	deployer.link(SafeMathIntLib, [
		ClientFund, CommunityVote, Configuration, Exchange, CancelOrdersChallenge, DriipSettlementChallenge, DriipSettlementChallenger,
		FraudChallenge, ReserveFund, RevenueFund, SecurityBond, TokenHolderRevenueFund, PartnerFund
	]);

	deployer.link(SafeMathUintLib, [
		Exchange, CancelOrdersChallenge, FraudChallenge, RevenueFund, ReserveFund, TokenHolderRevenueFund, RevenueToken
	]);

	deployer.link(Types, [
		Exchange, CancelOrdersChallenge, DriipSettlementChallenge, DriipSettlementChallenger,
		FraudChallengeByOrder, FraudChallengeByTrade, FraudChallengeByPayment, FraudChallengeBySuccessiveTrades,
		FraudChallengeBySuccessivePayments, FraudChallengeByPaymentSucceedingTrade, FraudChallengeByTradeSucceedingPayment,
		FraudChallengeByTradeOrderResiduals, FraudChallengeByDoubleSpentOrders, FraudChallengeByDuplicateDriipNonceOfTrades,
		FraudChallengeByDuplicateDriipNonceOfPayments, FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, FraudChallenge
	]);

	deployer.then(() => {
		if (!shouldDeploy("ClientFund", deployFilters))
			return next();

		return deployer.deploy(ClientFund, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.ClientFund = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("CommunityVote", deployFilters))
			return next();

		return deployer.deploy(CommunityVote, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.CommunityVote = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("Configuration", deployFilters))
			return next();

		return deployer.deploy(Configuration, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.Configuration = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("Exchange", deployFilters))
			return next();

		return deployer.deploy(Exchange, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.Exchange = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("CancelOrdersChallenge", deployFilters))
			return next();

		return deployer.deploy(CancelOrdersChallenge, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.CancelOrdersChallenge = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("DriipSettlementChallenge", deployFilters))
			return next();

		return deployer.deploy(DriipSettlementChallenge, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance) {
			addresses.DriipSettlementChallenge = instance.address;

			return deployer.deploy(DriipSettlementChallenger, ownerAccount, instance.address, {
				from : ownerAccount
			});
		}
		else {
			return next();
		}
	}).then((instance) => {
		if (instance) {
			addresses.DriipSettlementChallenger = instance.address;

			return DriipSettlementChallenge.deployed();
		}
		else {
			return next();
		}
	}).then((web3DriipSettlementChallenge) => {
		if (web3DriipSettlementChallenge) {
			return web3DriipSettlementChallenge.changeDriipSettlementChallenger(addresses.DriipSettlementChallenger, {
				from : ownerAccount
			});
		}
		else {
			return next();
		}
	}).then(() => {
		if (!shouldDeploy("Hasher", deployFilters))
			return next();

		return deployer.deploy(Hasher, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.Hasher = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("Validator", deployFilters))
			return next();

		return deployer.deploy(Validator, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.Validator = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByOrder", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeByOrder, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByOrder = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByTrade", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeByTrade, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByTrade = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByPayment", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeByPayment, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByPayment = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeBySuccessiveTrades", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeBySuccessiveTrades, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeBySuccessiveTrades = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeBySuccessivePayments", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeBySuccessivePayments, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeBySuccessivePayments = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByPaymentSucceedingTrade", deployFilters))
			return next();

			return deployer.deploy(FraudChallengeByPaymentSucceedingTrade, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByPaymentSucceedingTrade = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByTradeSucceedingPayment", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeByTradeSucceedingPayment, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByTradeSucceedingPayment = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByDoubleSpentOrders", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeByDoubleSpentOrders, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByDoubleSpentOrders = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByDuplicateDriipNonceOfTrades", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeByDuplicateDriipNonceOfTrades, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByDuplicateDriipNonceOfTrades = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByDuplicateDriipNonceOfPayments", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeByDuplicateDriipNonceOfPayments, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByDuplicateDriipNonceOfPayments = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallengeByDuplicateDriipNonceOfTradeAndPayment", deployFilters))
			return next();

		return deployer.deploy(FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallengeByDuplicateDriipNonceOfTradeAndPayment = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("FraudChallenge", deployFilters))
			return next();

		return deployer.deploy(FraudChallenge, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.FraudChallenge = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("ReserveFund", deployFilters))
			return next();

		return deployer.deploy(ReserveFund, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance) {
			addresses.ReserveFund1 = instance.address;

			return deployer.deploy(ReserveFund, ownerAccount, {
				from: ownerAccount,
				overwrite: true
			});
		}
		else {
			return next();
		}
	}).then((instance) => {
		if (instance)
			addresses.ReserveFund2 = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("RevenueFund", deployFilters))
			return next();

		return deployer.deploy(RevenueFund, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance) {
			addresses.RevenueFund1 = instance.address;

			return deployer.deploy(RevenueFund, ownerAccount, {
				from: ownerAccount,
				overwrite: true
			});
		}
		else {
			return next();
		}
	}).then((instance) => {
		if (instance)
			addresses.RevenueFund2 = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("SecurityBond", deployFilters))
			return next();

		return deployer.deploy(SecurityBond, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.SecurityBond = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("TokenHolderRevenueFund", deployFilters))
			return next();

		return deployer.deploy(TokenHolderRevenueFund, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.TokenHolderRevenueFund = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("PartnerFund", deployFilters))
			return next();

		return deployer.deploy(PartnerFund, ownerAccount, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.PartnerFund = instance.address;

		return next();
	}).then(() => {
		if (!shouldDeploy("RevenueToken", deployFilters))
			return next();

		return deployer.deploy(RevenueToken, {
			from: ownerAccount
		});
	}).then((instance) => {
		if (instance)
			addresses.RevenueToken = instance.address;

		return next();
	}).then(() => {
		return updateAddresses(deployer, addresses, helpers.isResetArgPresent());
	}).then(() => {
		//done
	}).catch((err) => {
		throw err;
	});
};

function loadAddressesFromFile(filename)
{
	return new Promise((resolve, reject) => {
		//No need to handle the error. If the file doesn't exist then we'll start afresh with a new object.
		fs.readFile(filename, {encoding: 'utf8'}, function (err, json) {
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
			resolve(json);
		});
	});
}

function saveAddressesToFile(filename, json)
{
	return new Promise((resolve, reject) => {
		var folder = filename.substr(0, filename.lastIndexOf(path.sep));

		//write json file (by this time the build folder should exists)
		fs.mkdir(folder, function (err) {
			if ((!err) || (err && err.code == 'EEXIST')) {
				fs.writeFile(filename, json, 'utf8', function (err) {
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
}

function updateAddresses(deployer, addresses, doReset)
{
	return new Promise((resolve, reject) => {
		var filename = deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json';

		loadAddressesFromFile(filename).then(function (json) {
			if (doReset || typeof json.networks[deployer.network_id] !== 'object') {
				json.networks[deployer.network_id] = {};
			}

			//update addresses
			Object.keys(addresses).forEach(function (key) {
				json.networks[deployer.network_id][key] = addresses[key];
			});

			//update timestamp
			json.updatedAt = new Date().toISOString();

			return saveAddressesToFile(filename, JSON.stringify(json, null, 2));
		}).then(function () {
			resolve();
		}).catch(function (err) {
			reject(err);
		});
	});
}

function shouldDeploy(contractName, deployFilters)
{
	if (!deployFilters) {
		return true;
	}
	for (var i = 0; i < deployFilters.length; i++) {
		if (deployFilters[i].test(contractName))
			return true;
	}
	return false;
}

function next()
{
	return new Promise((resolve, reject) => {
		resolve(null);
	});
}
