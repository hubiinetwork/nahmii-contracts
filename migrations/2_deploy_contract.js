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
const DealSettlementChallenge = artifacts.require("./DealSettlementChallenge.sol");
const DealSettlementChallenger = artifacts.require("./DealSettlementChallenger.sol");
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
const FraudChallengeByDuplicateDealNonceOfTrades = artifacts.require("./FraudChallengeByDuplicateDealNonceOfTrades.sol");
const FraudChallengeByDuplicateDealNonceOfPayments = artifacts.require("./FraudChallengeByDuplicateDealNonceOfPayments.sol");
const FraudChallengeByDuplicateDealNonceOfTradeAndPayment = artifacts.require("./FraudChallengeByDuplicateDealNonceOfTradeAndPayment.sol");
const FraudChallenge = artifacts.require("./FraudChallenge.sol");
const ReserveFund = artifacts.require("./ReserveFund.sol");
const RevenueFund = artifacts.require("./RevenueFund.sol");
const SecurityBond = artifacts.require("./SecurityBond.sol");
const TokenHolderRevenueFund = artifacts.require("./TokenHolderRevenueFund.sol");

const fs = require('fs');
const path = require('path');

const helpers = require('./helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
	var ownerAccount;
	const addresses = {};

    if (helpers.isTestNetwork(network)) {
        ownerAccount = accounts[0];
    }
    else {
        ownerAccount = helpers.getOwnerAccountFromArgs();
        ownerAccountPassword = helpers.getPasswordFromArgs();
        helpers.unlockAddress(web3, ownerAccount, ownerAccountPassword, 1200); //20 minutes
    }

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
        ClientFund, CommunityVote, Configuration, Exchange, CancelOrdersChallenge, DealSettlementChallenge, DealSettlementChallenger,
        FraudChallenge, ReserveFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
    ]);

    deployer.link(SafeMathUintLib, [
        Exchange, CancelOrdersChallenge, FraudChallenge, RevenueFund, ReserveFund, TokenHolderRevenueFund
    ]);

    deployer.link(Types, [
        Exchange, CancelOrdersChallenge, DealSettlementChallenge, DealSettlementChallenger,
        FraudChallengeByOrder, FraudChallengeByTrade, FraudChallengeByPayment, FraudChallengeBySuccessiveTrades,
        FraudChallengeBySuccessivePayments, FraudChallengeByPaymentSucceedingTrade, FraudChallengeByTradeSucceedingPayment,
        FraudChallengeByTradeOrderResiduals, FraudChallengeByDoubleSpentOrders, FraudChallengeByDuplicateDealNonceOfTrades,
        FraudChallengeByDuplicateDealNonceOfPayments, FraudChallengeByDuplicateDealNonceOfTradeAndPayment, FraudChallenge
    ]);

    deployer.deploy(ClientFund, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.ClientFund = ClientFund.address;
    });

    deployer.deploy(CommunityVote, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.CommunityVote = CommunityVote.address;
    });

    deployer.deploy(Configuration, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.Configuration = Configuration.address;
    });

    deployer.deploy(Exchange, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.Exchange = Exchange.address;
    });

    deployer.deploy(CancelOrdersChallenge, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.CancelOrdersChallenge = CancelOrdersChallenge.address;
    });

    deployer.deploy(DealSettlementChallenge, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.DealSettlementChallenge = DealSettlementChallenge.address;

		return deployer.deploy(DealSettlementChallenger, ownerAccount, DealSettlementChallenge.address, {
			from : ownerAccount
		})
	}).then(() => {
		addresses.DealSettlementChallenger = DealSettlementChallenger.address;

		return DealSettlementChallenge.deployed();
	}).then((web3DealSettlementChallenge) => {

		return web3DealSettlementChallenge.changeDealSettlementChallenger(DealSettlementChallenger.address, {
			from : ownerAccount
		});
	});

    deployer.deploy(Hasher, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.Hasher = Hasher.address;
    });

    deployer.deploy(Validator, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.Validator = Validator.address;
    });

    deployer.deploy(FraudChallengeByOrder, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByOrder = FraudChallengeByOrder.address;
    });

    deployer.deploy(FraudChallengeByTrade, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByTrade = FraudChallengeByTrade.address;
    });

    deployer.deploy(FraudChallengeByPayment, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByPayment = FraudChallengeByPayment.address;
    });

    deployer.deploy(FraudChallengeBySuccessiveTrades, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeBySuccessiveTrades = FraudChallengeBySuccessiveTrades.address;
    });

    deployer.deploy(FraudChallengeBySuccessivePayments, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeBySuccessivePayments = FraudChallengeBySuccessivePayments.address;
    });

    deployer.deploy(FraudChallengeByPaymentSucceedingTrade, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByPaymentSucceedingTrade = FraudChallengeByPaymentSucceedingTrade.address;
    });

    deployer.deploy(FraudChallengeByTradeSucceedingPayment, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByTradeSucceedingPayment = FraudChallengeByTradeSucceedingPayment.address;
    });

    deployer.deploy(FraudChallengeByTradeOrderResiduals, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByTradeOrderResiduals = FraudChallengeByTradeOrderResiduals.address;
    });

    deployer.deploy(FraudChallengeByDoubleSpentOrders, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByDoubleSpentOrders = FraudChallengeByDoubleSpentOrders.address;
    });

    deployer.deploy(FraudChallengeByDuplicateDealNonceOfTrades, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByDuplicateDealNonceOfTrades = FraudChallengeByDuplicateDealNonceOfTrades.address;
    });

    deployer.deploy(FraudChallengeByDuplicateDealNonceOfPayments, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByDuplicateDealNonceOfPayments = FraudChallengeByDuplicateDealNonceOfPayments.address;
    });

    deployer.deploy(FraudChallengeByDuplicateDealNonceOfTradeAndPayment, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallengeByDuplicateDealNonceOfTradeAndPayment = FraudChallengeByDuplicateDealNonceOfTradeAndPayment.address;
    });

    deployer.deploy(FraudChallenge, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.FraudChallenge = FraudChallenge.address;
    });

    deployer.deploy(ReserveFund, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.ReserveFund1 = ReserveFund.address;
    });

    deployer.deploy(ReserveFund, ownerAccount, {
        from: ownerAccount,
        overwrite: true
    }).then(() => {
        addresses.ReserveFund2 = ReserveFund.address;
    });

    deployer.deploy(RevenueFund, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.RevenueFund1 = RevenueFund.address;
    });

    deployer.deploy(RevenueFund, ownerAccount, {
        from: ownerAccount,
        overwrite: true
    }).then(() => {
        addresses.RevenueFund2 = RevenueFund.address;
    });

    deployer.deploy(SecurityBond, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.SecurityBond = SecurityBond.address;
    });

    deployer.deploy(TokenHolderRevenueFund, ownerAccount, {
        from: ownerAccount
    }).then(() => {
        addresses.TokenHolderRevenueFund = TokenHolderRevenueFund.address;

		saveAddresses(deployer, addresses);
	});
};

function saveAddresses(deployer, addresses) {
    return new Promise((resolve, reject) => {
        var build_path = deployer.basePath + path.sep + '..' + path.sep + 'build';
        var address_filename = build_path + path.sep + 'addresses.json';

        //No need to handle the error. If the file doesn't exist then we'll start afresh with a new object.
        fs.readFile(address_filename, {encoding: 'utf8'}, function (err, json) {
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
