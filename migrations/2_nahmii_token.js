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

        // if (helpers.isResetArgPresent())
        //     addressStorage.clear();

        if (helpers.isTestNetwork(network)) {
            ownerAccount = accounts[0];

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

        else if (network.startsWith('ropsten')) {
            addressStorage.set('NahmiiToken', '0x65905e653b750bCB8f903374Bc93cbd8E2E71B71');

            console.log(`Referenced NahmiiToken:  0x65905e653b750bCB8f903374Bc93cbd8E2E71B71`);
        }

        else if (network.startsWith('mainnet')) {
            addressStorage.set('NahmiiToken', '0xAc4f2f204b38390b92D0540908447d5ed352799a');

            console.log(`Referenced NahmiiToken:  0xAc4f2f204b38390b92D0540908447d5ed352799a`);
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
