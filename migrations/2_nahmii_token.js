/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

const Math = artifacts.require('Math');
const NahmiiToken = artifacts.require('NahmiiToken');
const SafeMath = artifacts.require('SafeMath');

const debug = require('debug')('2_nahmii_token');
const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let deployerAccount;

        await addressStorage.load();

        if (helpers.isTestNetwork(network))
            deployerAccount = accounts[0];
        else
            deployerAccount = helpers.parseDeployerArg();

        debug(`deployerAccount: ${deployerAccount}`);

        let ctl = {
            deployer,
            deployFilters: helpers.getFiltersFromArgs(),
            addressStorage,
            deployerAccount
        };

        if (helpers.isTestNetwork(network)) {
            await execDeploy(ctl, 'SafeMath', '', SafeMath);
            await execDeploy(ctl, 'Math', '', Math);

        } else if (network.startsWith('ropsten')) {
            addressStorage.set('SafeMath', '0xfda9a5f546bd24b2aead0ca6a51d08cc475e26e8');
            addressStorage.set('Math', '0x7286202281f28d09fd2b9dc60c8673db6bb375c0');

            SafeMath.address = addressStorage.get('SafeMath');
            Math.address = addressStorage.get('Math');

        } else if (network.startsWith('mainnet')) {
            throw new Error('SafeMath and Math at mainnet not configured');

            await execDeploy(ctl, 'SafeMath', '', SafeMath);
            await execDeploy(ctl, 'Math', '', Math);

            SafeMath.address = addressStorage.get('SafeMath');
            Math.address = addressStorage.get('Math');
        }

        await deployer.link(SafeMath, NahmiiToken);
        await deployer.link(Math, NahmiiToken);

        if (helpers.isTestNetwork(network)) {
            const instance = await execDeploy(ctl, 'NahmiiToken', '', NahmiiToken);

            debug(`Balance of token holder: ${(await instance.balanceOf(deployerAccount)).toString()}`);
            debug(`Minting disabled:        ${await instance.mintingDisabled()}`);

        } else if (network.startsWith('ropsten')) {
            addressStorage.set('NahmiiToken', '0x99844E09d3447a28C4B2d9856F055910a40eB2Dc');

            const instance = await NahmiiToken.at(addressStorage.get('NahmiiToken'));

            debug(`Balance of token holder: ${(await instance.balanceOf(deployerAccount)).toString()}`);
            debug(`Minting disabled:        ${await instance.mintingDisabled()}`);

        } else if (network.startsWith('mainnet')) {
            throw new Error('NahmiiToken at mainnet not configured');

            await execDeploy(ctl, 'NahmiiToken', '', NahmiiToken);
        }

        debug(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract) {
    let address = ctl.addressStorage.get(instanceName || contractName);
    let instance;

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        instance = await ctl.deployer.deploy(contract, {from: ctl.deployerAccount});

        ctl.addressStorage.set(instanceName || contractName, instance.address);
    }

    return instance;
}

function shouldDeploy(contractName, deployFilters) {
    if (!deployFilters) {
        return true;
    }
    for (let i = 0; i < deployFilters.length; i++) {
        if (deployFilters[i].test(contractName))
            return true;
    }
    return false;
}
