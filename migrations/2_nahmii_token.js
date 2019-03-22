/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const SafeMath = artifacts.require('SafeMath');
const NahmiiToken = artifacts.require('NahmiiToken');

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

            helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 7200);
        }

        try {
            if (helpers.isTestNetwork(network) || network.startsWith('ropsten')) {
                let ctl = {
                    deployer,
                    deployFilters: helpers.getFiltersFromArgs(),
                    addressStorage,
                    deployerAccount
                };

                await execDeploy(ctl, 'SafeMath', '', SafeMath);

                await deployer.link(SafeMath, NahmiiToken);

                await execDeploy(ctl, 'NahmiiToken', '', NahmiiToken);

                if (!helpers.isTestNetwork(network)) {
                    console.log(`Balance of token holder: ${(await instance.balanceOf(deployerAccount)).toString()}`);
                    // await instance.disableMinting();
                    console.log(`Minting disabled:        ${await instance.mintingDisabled()}`);
                }

            } else if (network.startsWith('mainnet'))
                addressStorage.set('NahmiiToken', '0xac4f2f204b38390b92d0540908447d5ed352799a');

        } finally {
            if (!helpers.isTestNetwork(network))
                helpers.lockAddress(web3, deployerAccount);
        }

        console.log(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract) {
    let address = ctl.addressStorage.get(instanceName || contractName);

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        let instance = await ctl.deployer.deploy(contract, {from: ctl.deployerAccount});

        ctl.addressStorage.set(instanceName || contractName, instance.address);
    }
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
