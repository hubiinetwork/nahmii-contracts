/*!
 * Hubii Striim
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const SafeMathInt = artifacts.require('SafeMathInt');
const SafeMathUint = artifacts.require('SafeMathUint');
const Types = artifacts.require('Types');
const ClientFund = artifacts.require('ClientFund');
const CommunityVote = artifacts.require('CommunityVote');
const Configuration = artifacts.require('Configuration');
const Exchange = artifacts.require('Exchange');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const DriipSettlementChallenge = artifacts.require('DriipSettlementChallenge');
const DriipSettlementChallenger = artifacts.require('DriipSettlementChallenger');
const Hasher = artifacts.require('Hasher');
const Validator = artifacts.require('Validator');
const FraudChallengeByOrder = artifacts.require('FraudChallengeByOrder');
const FraudChallengeByTrade = artifacts.require('FraudChallengeByTrade');
const FraudChallengeByPayment = artifacts.require('FraudChallengeByPayment');
const FraudChallengeBySuccessiveTrades = artifacts.require('FraudChallengeBySuccessiveTrades');
const FraudChallengeBySuccessivePayments = artifacts.require('FraudChallengeBySuccessivePayments');
const FraudChallengeByPaymentSucceedingTrade = artifacts.require('FraudChallengeByPaymentSucceedingTrade');
const FraudChallengeByTradeSucceedingPayment = artifacts.require('FraudChallengeByTradeSucceedingPayment');
const FraudChallengeByTradeOrderResiduals = artifacts.require('FraudChallengeByTradeOrderResiduals');
const FraudChallengeByDoubleSpentOrders = artifacts.require('FraudChallengeByDoubleSpentOrders');
const FraudChallengeByDuplicateDriipNonceOfTrades = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTrades');
const FraudChallengeByDuplicateDriipNonceOfPayments = artifacts.require('FraudChallengeByDuplicateDriipNonceOfPayments');
const FraudChallengeByDuplicateDriipNonceOfTradeAndPayment = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment');
const FraudChallenge = artifacts.require('FraudChallenge');
const ReserveFund = artifacts.require('ReserveFund');
const RevenueFund = artifacts.require('RevenueFund');
const SecurityBond = artifacts.require('SecurityBond');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const PartnerFund = artifacts.require('PartnerFund');

const fs = require('fs');
const path = require('path');

const helpers = require('./helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
    let ownerAccount;
    if (helpers.isTestNetwork(network)) {
        ownerAccount = accounts[0];
    }
    else {
        ownerAccount = helpers.getOwnerAccountFromArgs();
        const ownerAccountPassword = helpers.getPasswordFromArgs();
        helpers.unlockAddress(web3, ownerAccount, ownerAccountPassword, 7200); //120 minutes
    }

    const deployFilters = helpers.getFiltersFromArgs();

    const addresses = {};

    deployer
        .then(() => {
            return shouldDeploy('SafeMathInt', deployFilters) ?
                deployer.deploy(SafeMathInt, {
                    from: ownerAccount
                }) :
                null;
        }).then((instance) => {
        addresses.SafeMathInt = instance.address;
    }).then(() => {
        return shouldDeploy('SafeMathUint', deployFilters) ?
            deployer.deploy(SafeMathUint, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        addresses.SafeMathUint = instance.address;
    }).then(() => {
        return shouldDeploy('Types', deployFilters) ?
            deployer.deploy(Types, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        addresses.Types = instance.address;
    }).then(() => {
        return deployer.link(SafeMathInt, [
            ClientFund, CommunityVote, Configuration, Exchange, CancelOrdersChallenge, DriipSettlementChallenge, DriipSettlementChallenger,
            FraudChallenge, ReserveFund, RevenueFund, SecurityBond, TokenHolderRevenueFund, PartnerFund
        ]);
    }).then(() => {
        return deployer.link(SafeMathUint, [
            Exchange, CancelOrdersChallenge, FraudChallenge, RevenueFund, ReserveFund, TokenHolderRevenueFund
        ]);
    }).then(() => {
        return deployer.link(Types, [
            Exchange, CancelOrdersChallenge, DriipSettlementChallenge, DriipSettlementChallenger,
            FraudChallengeByOrder, FraudChallengeByTrade, FraudChallengeByPayment, FraudChallengeBySuccessiveTrades,
            FraudChallengeBySuccessivePayments, FraudChallengeByPaymentSucceedingTrade, FraudChallengeByTradeSucceedingPayment,
            FraudChallengeByTradeOrderResiduals, FraudChallengeByDoubleSpentOrders, FraudChallengeByDuplicateDriipNonceOfTrades,
            FraudChallengeByDuplicateDriipNonceOfPayments, FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, FraudChallenge
        ]);
    }).then(() => {
        return shouldDeploy('ClientFund', deployFilters) ?
            deployer.deploy(ClientFund, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.ClientFund = instance.address;
    }).then(() => {
        return shouldDeploy('CommunityVote', deployFilters) ?
            deployer.deploy(CommunityVote, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.CommunityVote = instance.address;
    }).then(() => {
        return shouldDeploy('Configuration', deployFilters) ?
            deployer.deploy(Configuration, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.Configuration = instance.address;
    }).then(() => {
        return shouldDeploy('Exchange', deployFilters) ?
            deployer.deploy(Exchange, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.Exchange = instance.address;
    }).then(() => {
        return shouldDeploy('CancelOrdersChallenge', deployFilters) ?
            deployer.deploy(CancelOrdersChallenge, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.CancelOrdersChallenge = instance.address;
    }).then(() => {
        return shouldDeploy('DriipSettlementChallenge', deployFilters) ?
            deployer.deploy(DriipSettlementChallenge, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.DriipSettlementChallenge = instance.address;
    }).then(() => {
        return shouldDeploy('DriipSettlementChallenge', deployFilters) ?
            deployer.deploy(DriipSettlementChallenger, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.DriipSettlementChallenger = instance.address;
    }).then(() => {
        return shouldDeploy('Hasher', deployFilters) ?
            deployer.deploy(Hasher, ownerAccount, {
                from: ownerAccount
            }) : null;
    }).then((instance) => {
        if (instance)
            addresses.Hasher = instance.address;
    }).then(() => {
        return shouldDeploy('Validator', deployFilters) ?
            deployer.deploy(Validator, ownerAccount, {
                from: ownerAccount
            }) : null;
    }).then((instance) => {
        if (instance)
            addresses.Validator = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByOrder', deployFilters) ?
            deployer.deploy(FraudChallengeByOrder, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByOrder = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByTrade', deployFilters) ?
            deployer.deploy(FraudChallengeByTrade, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByTrade = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByPayment', deployFilters) ?
            deployer.deploy(FraudChallengeByPayment, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByPayment = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeBySuccessiveTrades', deployFilters) ?
            deployer.deploy(FraudChallengeBySuccessiveTrades, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeBySuccessiveTrades = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeBySuccessivePayments', deployFilters) ?
            deployer.deploy(FraudChallengeBySuccessivePayments, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeBySuccessivePayments = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByPaymentSucceedingTrade', deployFilters) ?
            deployer.deploy(FraudChallengeByPaymentSucceedingTrade, ownerAccount, {
                from: ownerAccount
            }) : null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByPaymentSucceedingTrade = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByTradeSucceedingPayment', deployFilters) ?
            deployer.deploy(FraudChallengeByTradeSucceedingPayment, ownerAccount, {
                from: ownerAccount
            }) : null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByTradeSucceedingPayment = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByTradeOrderResiduals', deployFilters) ?
            deployer.deploy(FraudChallengeByTradeOrderResiduals, ownerAccount, {
                from: ownerAccount
            }) : null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByTradeOrderResiduals = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByDoubleSpentOrders', deployFilters) ?
            deployer.deploy(FraudChallengeByDoubleSpentOrders, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByDoubleSpentOrders = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByDuplicateDriipNonceOfTrades', deployFilters) ?
            deployer.deploy(FraudChallengeByDuplicateDriipNonceOfTrades, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByDuplicateDriipNonceOfTrades = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByDuplicateDriipNonceOfPayments', deployFilters) ?
            deployer.deploy(FraudChallengeByDuplicateDriipNonceOfPayments, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByDuplicateDriipNonceOfPayments = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment', deployFilters) ?
            deployer.deploy(FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallengeByDuplicateDriipNonceOfTradeAndPayment = instance.address;
    }).then(() => {
        return shouldDeploy('FraudChallenge', deployFilters) ?
            deployer.deploy(FraudChallenge, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.FraudChallenge = instance.address;
    }).then(() => {
        return shouldDeploy('ReserveFund1', deployFilters) ?
            deployer.deploy(ReserveFund, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.ReserveFund1 = instance.address;
    }).then(() => {
        return shouldDeploy('ReserveFund2', deployFilters) ?
            deployer.deploy(ReserveFund, ownerAccount, {
                from: ownerAccount,
                overwrite: true
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.ReserveFund2 = instance.address;
    }).then(() => {
        return shouldDeploy('RevenueFund1', deployFilters) ?
            deployer.deploy(RevenueFund, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.RevenueFund1 = instance.address;
    }).then(() => {
        return shouldDeploy('RevenueFund2', deployFilters) ?
            deployer.deploy(RevenueFund, ownerAccount, {
                from: ownerAccount,
                overwrite: true
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.RevenueFund2 = instance.address;
    }).then(() => {
        return shouldDeploy('SecurityBond', deployFilters) ?
            deployer.deploy(SecurityBond, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.SecurityBond = instance.address;
    }).then(() => {
        return shouldDeploy('TokenHolderRevenueFund', deployFilters) ?
            deployer.deploy(TokenHolderRevenueFund, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.TokenHolderRevenueFund = instance.address;
    }).then(() => {
        return shouldDeploy('PartnerFund', deployFilters) ?
            deployer.deploy(PartnerFund, ownerAccount, {
                from: ownerAccount
            }) :
            null;
    }).then((instance) => {
        if (instance)
            addresses.PartnerFund = instance.address;
    }).then(() => {
        return updateAddresses(deployer, addresses, helpers.isResetArgPresent());
    }).then(() => {
        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, ownerAccount);
    }).catch((err) => {
        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, ownerAccount);
        throw err;
    });
};

function loadAddressesFromFile(filename) {
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

function saveAddressesToFile(filename, json) {
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

function updateAddresses(deployer, addresses, doReset) {
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

function shouldDeploy(contractName, deployFilters) {
    if (!deployFilters) {
        return true;
    }
    for (var i = 0; i < deployFilters.length; i++) {
        if (deployFilters[i].test(contractName))
            return true;
    }
    return false;
}

function next() {
    return new Promise((resolve, reject) => {
        resolve(null);
    });
}
