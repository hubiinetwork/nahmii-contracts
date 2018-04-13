/*!
 * Hubii - Smart Contract migrations.
 *
 * Copyright (C) 2017-2018 Hubii
 */
const ClientFund = artifacts.require("./ClientFund.sol");
const CommunityVote = artifacts.require("./CommunityVote.sol");
const Configuration = artifacts.require("./Configuration.sol");
const TradesReserveFund = artifacts.require("./TradesReserveFund.sol");
const PaymentsReserveFund = artifacts.require("./PaymentsReserveFund.sol");
const TokenHolderRevenueFund = artifacts.require("./TokenHolderRevenueFund.sol");
const TradesRevenueFund = artifacts.require("./TradesRevenueFund.sol");
const PaymentsRevenueFund = artifacts.require("./PaymentsRevenueFund.sol");
const SecurityBond = artifacts.require("./SecurityBond.sol");
const Exchange = artifacts.require("./Exchange.sol");

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
    const ownerAccount = accounts[0];

    deployer.deploy(ClientFund, ownerAccount);
    deployer.deploy(CommunityVote, ownerAccount);
    deployer.deploy(Configuration, ownerAccount);
    deployer.deploy(TradesReserveFund, ownerAccount);
    deployer.deploy(PaymentsReserveFund, ownerAccount);
    deployer.deploy(TokenHolderRevenueFund, ownerAccount);
    deployer.deploy(TradesRevenueFund, ownerAccount);
    deployer.deploy(PaymentsRevenueFund, ownerAccount);
    deployer.deploy(SecurityBond, ownerAccount);
    deployer.deploy(Exchange, ownerAccount);
};
