/*!
 * Hubii Striim
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const Migrations = artifacts.require("./Migrations.sol");

const helpers = require('./helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
    var ownerAccount;

    if (helpers.isTestNetwork(network)) {
        ownerAccount = accounts[0];
    } else {
        ownerAccount = helpers.getOwnerAccountFromArgs();
        const ownerAccountPassword = helpers.getPasswordFromArgs();
        helpers.unlockAddress(web3, ownerAccount, ownerAccountPassword, 3600); //60 minutes
    }

    deployer.deploy(Migrations, {
        from: ownerAccount
    });
};
