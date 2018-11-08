/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const Migrations = artifacts.require('Migrations');
const helpers = require('../scripts/common/helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    let ownerAccount;

    if (helpers.isTestNetwork(network))
        ownerAccount = accounts[0];
    else {
        ownerAccount = helpers.getOwnerAccountFromArgs();

        if (web3.eth.personal)
            web3.eth.personal.unlockAccount(ownerAccount, helpers.getPasswordFromArgs(), 7200); //120 minutes
        else
            web3.personal.unlockAccount(ownerAccount, helpers.getPasswordFromArgs(), 7200); //120 minutes
    }

    deployer.deploy(Migrations, {
        from: ownerAccount
    }).then(() => {
        if (!helpers.isTestNetwork(network)) {
            if (web3.eth.personal)
                web3.eth.personal.lockAccount(ownerAccount);
            else
                web3.personal.lockAccount(ownerAccount);
        }
    }).catch((err) => {
        if (!helpers.isTestNetwork(network)) {
            if (web3.eth.personal)
                web3.eth.personal.lockAccount(ownerAccount);
            else
                web3.personal.lockAccount(ownerAccount);
        }
        throw err;
    })
};
