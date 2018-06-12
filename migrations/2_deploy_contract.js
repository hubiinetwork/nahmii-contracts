/*!
 * Hubii - Omphalos
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
const Hasher = artifacts.require('./Hasher.sol');
const Validator = artifacts.require('./Validator.sol');
const FraudChallengeByOrder = artifacts.require("./FraudChallengeByOrder.sol");
const FraudChallengeByTrade = artifacts.require("./FraudChallengeByTrade.sol");
const FraudChallengeByPayment = artifacts.require("./FraudChallengeByPayment.sol");
const FraudChallengeBySuccessiveTrades = artifacts.require("./FraudChallengeBySuccessiveTrades.sol");
const FraudChallengeBySuccessivePayments = artifacts.require("./FraudChallengeBySuccessivePayments.sol");
const FraudChallengeByPaymentSucceedingTrade = artifacts.require("./FraudChallengeByPaymentSucceedingTrade.sol");
const FraudChallengeByTradeSucceedingPayment = artifacts.require("./FraudChallengeByTradeSucceedingPayment.sol");
const FraudChallengeByTradeOrderResidual = artifacts.require("./FraudChallengeByTradeOrderResidual.sol");
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

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
    const ownerAccount = accounts[0];
    const actions = [];
    const addresses = {};

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
    deployer.link(SafeMathIntLib, ReserveFund);
    deployer.link(SafeMathIntLib, RevenueFund);
    deployer.link(SafeMathIntLib, SecurityBond);
    deployer.link(SafeMathIntLib, TokenHolderRevenueFund);

    deployer.link(SafeMathUintLib, Exchange);
    deployer.link(SafeMathUintLib, CancelOrdersChallenge);
    deployer.link(SafeMathUintLib, RevenueFund);
    deployer.link(SafeMathUintLib, ReserveFund);
    deployer.link(SafeMathUintLib, TokenHolderRevenueFund);

    deployer.link(Types, Exchange);
    deployer.link(Types, CancelOrdersChallenge);
    deployer.link(Types, DealSettlementChallenge);
    deployer.link(Types, FraudChallengeByOrder);
    deployer.link(Types, FraudChallengeByTrade);
    deployer.link(Types, FraudChallengeByPayment);
    deployer.link(Types, FraudChallengeBySuccessiveTrades);
    deployer.link(Types, FraudChallengeBySuccessivePayments);
    deployer.link(Types, FraudChallengeByPaymentSucceedingTrade);
    deployer.link(Types, FraudChallengeByTradeSucceedingPayment);
    deployer.link(Types, FraudChallengeByTradeOrderResidual);
    deployer.link(Types, FraudChallengeByDoubleSpentOrders);
    deployer.link(Types, FraudChallengeByDuplicateDealNonceOfTrades);
    deployer.link(Types, FraudChallengeByDuplicateDealNonceOfPayments);
    deployer.link(Types, FraudChallengeByDuplicateDealNonceOfTradeAndPayment);
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
        addresses.DealSettlementChallenge = Exchange.DealSettlementChallenge;
    });

    deployer.deploy(Hasher, ownerAccount).then(() => {
        addresses.Hasher = Hasher.address;
    });

    deployer.deploy(Validator, ownerAccount).then(() => {
        addresses.Validator = Validator.address;
    });

    deployer.deploy(FraudChallengeByOrder, ownerAccount).then(() => {
        addresses.FraudChallengeByOrder = FraudChallengeByOrder.address;
    });

    deployer.deploy(FraudChallengeByTrade, ownerAccount).then(() => {
        addresses.FraudChallengeByTrade = FraudChallengeByTrade.address;
    });

    deployer.deploy(FraudChallengeByPayment, ownerAccount).then(() => {
        addresses.FraudChallengeByPayment = FraudChallengeByPayment.address;
    });

    deployer.deploy(FraudChallengeBySuccessiveTrades, ownerAccount).then(() => {
        addresses.FraudChallengeBySuccessiveTrades = FraudChallengeBySuccessiveTrades.address;
    });

    deployer.deploy(FraudChallengeBySuccessivePayments, ownerAccount).then(() => {
        addresses.FraudChallengeBySuccessivePayments = FraudChallengeBySuccessivePayments.address;
    });

    deployer.deploy(FraudChallengeByPaymentSucceedingTrade, ownerAccount).then(() => {
        addresses.FraudChallengeByPaymentSucceedingTrade = FraudChallengeByPaymentSucceedingTrade.address;
    });

    deployer.deploy(FraudChallengeByTradeSucceedingPayment, ownerAccount).then(() => {
        addresses.FraudChallengeByTradeSucceedingPayment = FraudChallengeByTradeSucceedingPayment.address;
    });

    deployer.deploy(FraudChallengeByTradeOrderResidual, ownerAccount).then(() => {
        addresses.FraudChallengeByTradeOrderResidual = FraudChallengeByTradeOrderResidual.address;
    });

    deployer.deploy(FraudChallengeByDoubleSpentOrders, ownerAccount).then(() => {
        addresses.FraudChallengeByDoubleSpentOrders = FraudChallengeByDoubleSpentOrders.address;
    });

    deployer.deploy(FraudChallengeByDuplicateDealNonceOfTrades, ownerAccount).then(() => {
        addresses.FraudChallengeByDuplicateDealNonceOfTrades = FraudChallengeByDuplicateDealNonceOfTrades.address;
    });

    deployer.deploy(FraudChallengeByDuplicateDealNonceOfPayments, ownerAccount).then(() => {
        addresses.FraudChallengeByDuplicateDealNonceOfPayments = FraudChallengeByDuplicateDealNonceOfPayments.address;
    });

    deployer.deploy(FraudChallengeByDuplicateDealNonceOfTradeAndPayment, ownerAccount).then(() => {
        addresses.FraudChallengeByDuplicateDealNonceOfTradeAndPayment = FraudChallengeByDuplicateDealNonceOfTradeAndPayment.address;
    });

    deployer.deploy(FraudChallenge, ownerAccount).then(() => {
        addresses.FraudChallenge = FraudChallenge.address;
    });

    deployer.deploy(ReserveFund, ownerAccount).then(() => {
        addresses.ReserveFund1 = ReserveFund.address;
    });

    deployer.deploy(ReserveFund, ownerAccount, {overwrite: true}).then(() => {
        addresses.ReserveFund2 = ReserveFund.address;
    });

    deployer.deploy(RevenueFund, ownerAccount).then(() => {
        addresses.RevenueFund1 = RevenueFund.address;
    });

    deployer.deploy(RevenueFund, ownerAccount, {overwrite: true}).then(() => {
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

function saveAddresses(deployer, addresses) {
    return new Promise((resolve, reject) => {
        const filename = deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json';

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
