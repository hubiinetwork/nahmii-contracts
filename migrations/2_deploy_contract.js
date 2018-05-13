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
var Fraud = artifacts.require("./Fraud.sol");
var ReserveFund = artifacts.require("./ReserveFund.sol");
var RevenueFund = artifacts.require("./RevenueFund.sol");
var SecurityBond = artifacts.require("./SecurityBond.sol");
var TokenHolderRevenueFund = artifacts.require("./TokenHolderRevenueFund.sol");

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
    var ownerAccount = accounts[0];

    deployer.deploy(SafeMathIntLib);
    deployer.link(SafeMathIntLib, ClientFund);
    deployer.link(SafeMathIntLib, CommunityVote);
    deployer.link(SafeMathIntLib, Configuration);
    deployer.link(SafeMathIntLib, Exchange);
    deployer.link(SafeMathIntLib, Fraud);
    deployer.link(SafeMathIntLib, ReserveFund);
    deployer.link(SafeMathIntLib, RevenueFund);
    deployer.link(SafeMathIntLib, SecurityBond);
    deployer.link(SafeMathIntLib, TokenHolderRevenueFund);
    deployer.deploy(SafeMathUintLib);
    deployer.link(SafeMathUintLib, Exchange);
    deployer.link(SafeMathUintLib, Fraud);
    deployer.link(SafeMathUintLib, RevenueFund);
    deployer.deploy(Types);
    deployer.link(Types, Exchange);
    deployer.link(Types, Fraud);
    deployer.deploy(ClientFund, ownerAccount);
    deployer.deploy(CommunityVote, ownerAccount);
    deployer.deploy(Configuration, ownerAccount);
    deployer.deploy(Exchange, ownerAccount);
    deployer.deploy(Fraud, ownerAccount);
    deployer.deploy(ReserveFund, ownerAccount);
    deployer.deploy(RevenueFund, ownerAccount);
    deployer.deploy(SecurityBond, ownerAccount);
    deployer.deploy(TokenHolderRevenueFund, ownerAccount);
};
