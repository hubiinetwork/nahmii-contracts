/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const RevenueToken = artifacts.require('RevenueToken');

const path = require('path');
const helpers = require('./helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let ownerAccount;
        let instance, tx;

        await addressStorage.load();

        if (helpers.isResetArgPresent())
            addressStorage.clear();

        if (helpers.isTestNetwork(network))
            ownerAccount = accounts[0];
        else {
            ownerAccount = helpers.getOwnerAccountFromArgs();

            if (web3.eth.personal)
                web3.eth.personal.unlockAccount(ownerAccount, helpers.getPasswordFromArgs(), 7200); //120 minutes
            else
                web3.personal.unlockAccount(ownerAccount, helpers.getPasswordFromArgs(), 7200); //120 minutes
        }

        try {
            let ctl = {
                deployer: deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage: addressStorage,
                ownerAccount: ownerAccount
            };

            await execDeploy(ctl, 'RevenueToken', '', RevenueToken);

            console.log('Saving addresses...');
            await addressStorage.save();
        }
        catch (err) {
            if (!helpers.isTestNetwork(network)) {
                if (web3.eth.personal)
                    web3.eth.personal.lockAccount(ownerAccount);
                else
                    web3.personal.lockAccount(ownerAccount);
            }
            throw err;
        }

        if (!helpers.isTestNetwork(network)) {
            if (web3.eth.personal)
                web3.eth.personal.lockAccount(ownerAccount);
            else
                web3.personal.lockAccount(ownerAccount);
        }
    });
};

async function execDeploy(ctl, contractName, instanceName, contract) {
    let address = ctl.addressStorage.get(instanceName || contractName);

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        let instance = await ctl.deployer.deploy(contract, {from: ctl.ownerAccount});

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
