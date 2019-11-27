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
        else
            deployerAccount = helpers.parseDeployerArg();

        debug(`deployerAccount: ${deployerAccount}`);

        if (helpers.isTestNetwork(network)) {
            instance = await deployer.deploy(Migrations, {from: deployerAccount});
            addressStorage.set('Migrations', instance.address);

        } else if (network.startsWith('ropsten')) {
            addressStorage.set('Migrations', '0x5868e542da7392de80c7ac0e7724a1e892f13611');
            Migrations.address = addressStorage.get('Migrations');

        } else if (network.startsWith('mainnet')) {
            addressStorage.set('Migrations', '0x14b641a8263c7a2ec41f117a3c82e2a61567a799');
            Migrations.address = addressStorage.get('Migrations');
        }

        debug(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};
