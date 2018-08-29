/*!
 * Hubii Striim
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const BalanceLib = artifacts.require('BalanceLib');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const Challenge = artifacts.require('Challenge');
const ClientFund = artifacts.require('ClientFund');
const CommunityVote = artifacts.require('CommunityVote');
const Configuration = artifacts.require('Configuration');
const Exchange = artifacts.require('Exchange');
const DriipSettlementChallenge = artifacts.require('DriipSettlementChallenge');
const DriipSettlementChallenger = artifacts.require('DriipSettlementChallenger');
const Hasher = artifacts.require('Hasher');
const FraudChallengeByDoubleSpentOrders = artifacts.require('FraudChallengeByDoubleSpentOrders');
const FraudChallengeByDuplicateDriipNonceOfPayments = artifacts.require('FraudChallengeByDuplicateDriipNonceOfPayments');
const FraudChallengeByDuplicateDriipNonceOfTradeAndPayment = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment');
const FraudChallengeByDuplicateDriipNonceOfTrades = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTrades');
const FraudChallengeByOrder = artifacts.require('FraudChallengeByOrder');
const FraudChallengeByPayment = artifacts.require('FraudChallengeByPayment');
const FraudChallengeByPaymentSucceedingTrade = artifacts.require('FraudChallengeByPaymentSucceedingTrade');
const FraudChallengeBySuccessiveTrades = artifacts.require('FraudChallengeBySuccessiveTrades');
const FraudChallengeBySuccessivePayments = artifacts.require('FraudChallengeBySuccessivePayments');
const FraudChallengeByTrade = artifacts.require('FraudChallengeByTrade');
const FraudChallengeByTradeOrderResiduals = artifacts.require('FraudChallengeByTradeOrderResiduals');
const FraudChallengeByTradeSucceedingPayment = artifacts.require('FraudChallengeByTradeSucceedingPayment');
const FraudChallenge = artifacts.require('FraudChallenge');
const InUseCurrencyLib = artifacts.require('InUseCurrencyLib');
const MonetaryTypes = artifacts.require('MonetaryTypes');
const Ownable = artifacts.require('Ownable');
const PartnerFund = artifacts.require('PartnerFund');
const RevenueFund = artifacts.require('RevenueFund');
const SafeMathInt = artifacts.require('SafeMathInt');
const SafeMathUint = artifacts.require('SafeMathUint');
const SecurityBond = artifacts.require('SecurityBond');
const StriimChallenge = artifacts.require('StriimChallenge');
const StriimTypes = artifacts.require('StriimTypes');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const TxHistoryLib = artifacts.require('TxHistoryLib');
const Validator = artifacts.require('Validator');

const fs = require('fs');
const path = require('path');

const helpers = require('./helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    let ownerAccount;

    deployer.then(async () => {
        if (helpers.isTestNetwork(network)) {
            ownerAccount = accounts[0];
        }
        else {
            ownerAccount = helpers.getOwnerAccountFromArgs();
            const ownerAccountPassword = helpers.getPasswordFromArgs();
            helpers.unlockAddress(web3, ownerAccount, ownerAccountPassword, 7200); //120 minutes
        }

        try {
            const deployFilters = helpers.getFiltersFromArgs();

            const addresses = {};

            await execDeploy(deployer, 'MonetaryTypes', MonetaryTypes, deployFilters, addresses, ownerAccount);

            await deployer.link(MonetaryTypes, [
                ClientFund, Configuration, DriipSettlementChallenger, Exchange, StriimTypes, StriimChallenge, TokenHolderRevenueFund, Validator
            ]);

            await execDeploy(deployer, 'SafeMathInt', SafeMathInt, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'SafeMathUint', SafeMathUint, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'StriimTypes', StriimTypes, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'BalanceLib', BalanceLib, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'TxHistoryLib', TxHistoryLib, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'InUseCurrencyLib', InUseCurrencyLib, deployFilters, addresses, ownerAccount);

            await deployer.link(SafeMathInt, [
                ClientFund, CommunityVote, Configuration, Exchange, CancelOrdersChallenge, DriipSettlementChallenge, DriipSettlementChallenger,
                FraudChallenge, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
            ]);
            await deployer.link(SafeMathUint, [
                Exchange, CancelOrdersChallenge, FraudChallenge, RevenueFund, TokenHolderRevenueFund
            ]);
            await deployer.link(StriimTypes, [
                Exchange, CancelOrdersChallenge, DriipSettlementChallenge, DriipSettlementChallenger,
                FraudChallengeByOrder, FraudChallengeByTrade, FraudChallengeByPayment, FraudChallengeBySuccessiveTrades,
                FraudChallengeBySuccessivePayments, FraudChallengeByPaymentSucceedingTrade, FraudChallengeByTradeSucceedingPayment,
                FraudChallengeByTradeOrderResiduals, FraudChallengeByDoubleSpentOrders, FraudChallengeByDuplicateDriipNonceOfTrades,
                FraudChallengeByDuplicateDriipNonceOfPayments, FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, FraudChallenge,
                Hasher, StriimChallenge, Validator
            ]);
            await deployer.link(BalanceLib, [
                ClientFund, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
            ]);
            await deployer.link(TxHistoryLib, [
                ClientFund, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
            ]);
            await deployer.link(InUseCurrencyLib, [
                ClientFund, RevenueFund, SecurityBond
            ]);

            await execDeploy(deployer, 'ClientFund', ClientFund, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'CommunityVote', CommunityVote, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'Configuration', Configuration, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'Exchange', Exchange, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'CancelOrdersChallenge', CancelOrdersChallenge, deployFilters, addresses, ownerAccount);
            if (shouldDeploy('DriipSettlementChallenge', deployFilters)) {
                let instance = await deployer.deploy(DriipSettlementChallenge, ownerAccount, {from: ownerAccount});
                addresses.DriipSettlementChallenge = instance.address;

                instance = await deployer.deploy(DriipSettlementChallenger, ownerAccount, {
                    from: ownerAccount,
                    overwrite: true
                });
                addresses.DriipSettlementChallenger = instance.address;
            }
            await execDeploy(deployer, 'Hasher', Hasher, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'Validator', Validator, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByOrder', FraudChallengeByOrder, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByTrade', FraudChallengeByTrade, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByPayment', FraudChallengeByPayment, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeBySuccessiveTrades', FraudChallengeBySuccessiveTrades, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeBySuccessivePayments', FraudChallengeBySuccessivePayments, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByPaymentSucceedingTrade', FraudChallengeByPaymentSucceedingTrade, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByTradeSucceedingPayment', FraudChallengeByTradeSucceedingPayment, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByTradeOrderResiduals', FraudChallengeByTradeOrderResiduals, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByDoubleSpentOrders', FraudChallengeByDoubleSpentOrders, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfTrades', FraudChallengeByDuplicateDriipNonceOfTrades, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfPayments', FraudChallengeByDuplicateDriipNonceOfPayments, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfTradeAndPayment', FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'FraudChallenge', FraudChallenge, deployFilters, addresses, ownerAccount);
            // TODO Comment back in RevenueFund and SecurityBond once they have been updated to support two-component currency descriptors
            // if (shouldDeploy('RevenueFund', deployFilters)) {
            // 	let instance = await deployer.deploy(RevenueFund, ownerAccount, { from: ownerAccount });
            // 	addresses.RevenueFund1 = instance.address;
            //
            // 	instance = await deployer.deploy(RevenueFund, ownerAccount, { from: ownerAccount, overwrite: true });
            // 	addresses.RevenueFund2 = instance.address;
            // }
            // await execDeploy(deployer, 'SecurityBond', SecurityBond, deployFilters, addresses, ownerAccount);
            await execDeploy(deployer, 'TokenHolderRevenueFund', TokenHolderRevenueFund, deployFilters, addresses, ownerAccount);
            // TODO Comment back in RevenueFund and SecurityBond once they have been updated to support two-component currency descriptors
            // await execDeploy(deployer, 'PartnerFund', PartnerFund, deployFilters, addresses, ownerAccount);

            console.log("Saving addresses...");
            await updateAddresses(deployer, addresses, helpers.isResetArgPresent());
        }
        catch (err) {
            if (!helpers.isTestNetwork(network))
                helpers.lockAddress(web3, ownerAccount);

            throw err;
        }

        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, ownerAccount);
    });
};

async function loadAddressesFromFile(filename) {
    var json;

    try {
        //No need to handle the error. If the file doesn't exist then we'll start afresh with a new object.
        json = fs.readFileSync(filename, {encoding: 'utf8'});

        json = JSON.parse(json);
    }
    catch (err) {
        if (err.code !== 'ENOENT')
            throw err;

        json = {};
    }
    if (typeof json.networks !== 'object') {
        json.networks = {};
    }
    return json;
}

async function saveAddressesToFile(filename, json) {
    var folder = filename.substr(0, filename.lastIndexOf(path.sep));

    //write json file (by this time the build folder should exists)
    try {
        fs.mkdirSync(folder);
    }
    catch (err) {
        if (err.code !== 'EEXIST')
            throw err;
    }

    fs.writeFileSync(filename, json, 'utf8');
}

async function updateAddresses(deployer, addresses, doReset) {
    var filename = deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json';

    var json = await loadAddressesFromFile(filename);

    if (doReset || typeof json.networks[deployer.network_id] !== 'object') {
        json.networks[deployer.network_id] = {};
    }

    //update addresses
    Object.keys(addresses).forEach(function (key) {
        json.networks[deployer.network_id][key] = addresses[key];
    });

    //update timestamp
    json.updatedAt = new Date().toISOString();

    await saveAddressesToFile(filename, JSON.stringify(json, null, 2));
}

async function execDeploy(deployer, contractName, contract, deployFilters, addresses, ownerAccount) {
    if (shouldDeploy(contractName, deployFilters)) {
        await deployer.deploy(contract, ownerAccount, {from: ownerAccount});
        let instance = await contract.deployed();
        addresses[contractName] = instance.address;
    }
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
