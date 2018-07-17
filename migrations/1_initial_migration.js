/*!
 * Hubii Striim
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const Migrations = artifacts.require("Migrations");

const helpers = require('./helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = function (deployer, network, accounts) {
    let ownerAccount;

    if (helpers.isTestNetwork(network))
        ownerAccount = accounts[0];
    else {
        ownerAccount = helpers.getOwnerAccountFromArgs();
        const ownerAccountPassword = helpers.getPasswordFromArgs();
        helpers.unlockAddress(web3, ownerAccount, ownerAccountPassword, 7200); //120 minutes
    }

    deployer.deploy(Migrations, {
        from: ownerAccount
    }).then(() => {
        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, ownerAccount);
    }).catch((err) => {
        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, ownerAccount);
        throw err;
    })
};
