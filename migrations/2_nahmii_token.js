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
        let ownerAccount;

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

            await execDeploy(ctl, 'SafeMath', '', SafeMath);

            await deployer.link(SafeMath, NahmiiToken);

            await execDeploy(ctl, 'NahmiiToken', '', NahmiiToken);

            const instance = await NahmiiToken.at(addressStorage.get('NahmiiToken'));
            await instance.mint(ownerAccount, new web3.BigNumber('120e24'));
            await instance.disableMinting();

            console.log(`Balance of token holder: ${(await instance.balanceOf(ownerAccount)).toString()}`);
            console.log(`Minting disabled:        ${await instance.mintingDisabled()}`);

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
