/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */


const RevenueTokenManager = artifacts.require('RevenueTokenManager');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');

const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

require('../scripts/common/promisify_web3.js')(web3);

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let ownerAccount;
        let instance;

        await addressStorage.load();

        // if (helpers.isResetArgPresent())
        //     addressStorage.clear();

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
                deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage,
                ownerAccount
            };

            SafeMathUintLib.address = addressStorage.get('SafeMathUintLib');

            if (helpers.isTestNetwork(network)) {
                await deployer.link(SafeMathUintLib, [
                    RevenueTokenManager
                ]);

                await execDeploy(ctl, 'RevenueTokenManager', 'RevenueTokenManager', RevenueTokenManager);

                instance = await RevenueTokenManager.at(addressStorage.get('RevenueTokenManager'));
                if (!network.startsWith('ropsten')) {
                    await instance.setToken(addressStorage.get('NahmiiToken'));
                    await instance.setBeneficiary('0xe8575e787e28bcb0ee3046605f795bf883e82e84');

                    // let earliestReleaseTimes = [];
                    // let amounts = [];
                    // let blockNumbers = [];
                    // helpers.airdriipReleases().forEach((d) => {
                    //    earliestReleaseTimes.push(d.earliestReleaseTime);
                    //    amounts.push(d.amount);
                    //    if (d.blockNumber)
                    //         blockNumbers.push(d.blockNumber);
                    // });
                    // console.log(earliestReleaseTimes);
                    // console.log(amounts);
                    // console.log(blockNumbers);
                    // await instance.defineReleases(earliestReleaseTimes, amounts, blockNumbers);
                }
            }

        } finally {
            if (!helpers.isTestNetwork(network)) {
                if (web3.eth.personal)
                    web3.eth.personal.lockAccount(ownerAccount);
                else
                    web3.personal.lockAccount(ownerAccount);
            }
        }

        console.log(`Saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract, usesAccessManager) {
    let address = ctl.addressStorage.get(instanceName || contractName);

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        let instance;

        if (usesAccessManager) {
            let signerManager = ctl.addressStorage.get('SignerManager');

            instance = await ctl.deployer.deploy(contract, ctl.ownerAccount, signerManager, {from: ctl.ownerAccount});

        } else
            instance = await ctl.deployer.deploy(contract, ctl.ownerAccount, {from: ctl.ownerAccount});

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
