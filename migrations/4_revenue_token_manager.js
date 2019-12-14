/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

const NahmiiToken = artifacts.require('NahmiiToken');
const RevenueTokenManager = artifacts.require('RevenueTokenManager');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');

const debug = require('debug')('4_revenue_token_manager');
const moment = require('moment');
const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

require('../scripts/common/promisify_web3.js')(web3);

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

        SafeMathUintLib.address = addressStorage.get('SafeMathUintLib');

        if (network.startsWith('ropsten') || helpers.isTestNetwork(network)) {
            await deployer.link(SafeMathUintLib, RevenueTokenManager);

            const revenueTokenManager = await execDeploy(ctl, 'RevenueTokenManager', '', RevenueTokenManager, true);

            const nahmiiToken = await NahmiiToken.at(addressStorage.get('NahmiiToken'));
            await nahmiiToken.mint(addressStorage.get('RevenueTokenManager'), 120e24);

            await revenueTokenManager.setToken(addressStorage.get('NahmiiToken'));
            await revenueTokenManager.setBeneficiary(deployerAccount);

        } else if (network.startsWith('mainnet'))
            addressStorage.set('RevenueTokenManager', '0xe3f2158610b7145c04ae03a6356038ad2404a9a6');

        debug(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract, ownable) {
    let address = ctl.addressStorage.get(instanceName || contractName);
    let instance;

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        if (ownable)
            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, {from: ctl.deployerAccount});
        else
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

function airdriipReleases() {
    let date = moment().startOf('day');

    const earliestReleaseTimes = [];
    const amounts = [];
    for (let i = 0; i < 120; i++) {
        earliestReleaseTimes.push(moment(date).subtract(1, 'hour').unix());
        amounts.push(1e24);

        date.add(1, 'day');
    }
    return {earliestReleaseTimes, amounts};
}
