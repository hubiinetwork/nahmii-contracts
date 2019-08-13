/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const SafeMath = artifacts.require('SafeMath');
const NahmiiToken = artifacts.require('NahmiiToken');

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

        // if (helpers.isResetArgPresent())
        //     addressStorage.clear();

        if (helpers.isTestNetwork(network))
            deployerAccount = accounts[0];

        else {
            deployerAccount = helpers.parseDeployerArg();

            if (web3.eth.personal)
                await web3.eth.personal.unlockAccount(deployerAccount, helpers.parsePasswordArg(), 14400); // 4h
            else
                await web3.personal.unlockAccount(deployerAccount, helpers.parsePasswordArg(), 14400); // 4h
        }

        debug(`deployerAccount: ${deployerAccount}`);

        try {
            if (helpers.isTestNetwork(network)) {
                let ctl = {
                    deployer,
                    deployFilters: helpers.getFiltersFromArgs(),
                    addressStorage,
                    deployerAccount
                };

                await execDeploy(ctl, 'SafeMath', '', SafeMath);

                await deployer.link(SafeMath, NahmiiToken);

                const instance = await execDeploy(ctl, 'NahmiiToken', '', NahmiiToken);

                if (!helpers.isTestNetwork(network)) {
                    debug(`Balance of token holder: ${(await instance.balanceOf(deployerAccount)).toString()}`);
                    // await instance.disableMinting();
                    debug(`Minting disabled:        ${await instance.mintingDisabled()}`);
                }
            }

            else if (network.startsWith('ropsten'))
                addressStorage.set('NahmiiToken', '0x229d723cd3f661e4103703da82a5a13c107ba586');

            else if (network.startsWith('mainnet'))
                addressStorage.set('NahmiiToken', '0xac4f2f204b38390b92d0540908447d5ed352799a');

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
