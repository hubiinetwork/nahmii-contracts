/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const Migrations = artifacts.require('Migrations');

const debug = require('debug')('1_initial_migrations');
const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let deployerAccount;
        let instance;

        await addressStorage.load();

        if (helpers.isTestNetwork(network))
            deployerAccount = accounts[0];
        else {
            deployerAccount = helpers.parseDeployerArg();

            if (web3.eth.personal)
                await web3.eth.personal.unlockAccount(deployerAccount, helpers.parsePasswordArg(), 7200); //120 minutes
            else
                await web3.personal.unlockAccount(deployerAccount, helpers.parsePasswordArg(), 7200); //120 minutes
        }

        debug(`deployerAccount: ${deployerAccount}`);

        try {
            if (helpers.isTestNetwork(network) || network.startsWith('ropsten')) {
                instance = await deployer.deploy(Migrations, {from: deployerAccount});
                addressStorage.set('Migrations', instance.address);

            } else {
                Migrations.address = '0x355c39f9f709dee1ddfa8e236edcbb29e35287ba';
                addressStorage.set('Migrations', '0x355c39f9f709dee1ddfa8e236edcbb29e35287ba');
            }

        } finally {
            if (!helpers.isTestNetwork(network))
                if (web3.eth.personal)
                    await web3.eth.personal.lockAccount(deployerAccount);
                else
                    await web3.personal.lockAccount(deployerAccount);
        }

        debug(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};
