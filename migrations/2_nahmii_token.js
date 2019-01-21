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

        if (helpers.isTestNetwork(network))
            ownerAccount = accounts[0];

        let ctl = {
            deployer,
            deployFilters: helpers.getFiltersFromArgs(),
            addressStorage,
            ownerAccount
        };

        if (helpers.isTestNetwork(network)) {
            await execDeploy(ctl, 'SafeMath', '', SafeMath);

            await deployer.link(SafeMath, NahmiiToken);

            await execDeploy(ctl, 'NahmiiToken', '', NahmiiToken);

            const instance = await NahmiiToken.at(addressStorage.get('NahmiiToken'));
            await instance.mint(ownerAccount, 120e24);
            await instance.disableMinting();

            console.log(`Balance of token holder: ${(await instance.balanceOf(ownerAccount)).toString()}`);
            console.log(`Minting disabled:        ${await instance.mintingDisabled()}`);

        } else if (network.startsWith('ropsten'))
            addressStorage.set('NahmiiToken', '0x65905e653b750bcb8f903374bc93cbd8e2e71b71');

        else if (network.startsWith('mainnet'))
            addressStorage.set('NahmiiToken', '0xac4f2f204b38390b92d0540908447d5ed352799a');

        console.log(`Saving addresses in ${__filename}...`);
        await addressStorage.save();
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
