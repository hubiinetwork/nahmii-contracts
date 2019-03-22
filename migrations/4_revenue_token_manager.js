/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const NahmiiToken = artifacts.require('NahmiiToken');
const RevenueTokenManager = artifacts.require('RevenueTokenManager');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');

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
        let instance;

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
            let ctl = {
                deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage,
                deployerAccount
            };

            SafeMathUintLib.address = addressStorage.get('SafeMathUintLib');

            if (helpers.isTestNetwork(network) || network.startsWith('ropsten')) {
                await deployer.link(SafeMathUintLib, [
                    RevenueTokenManager
                ]);

                await execDeploy(ctl, 'RevenueTokenManager', 'RevenueTokenManager', RevenueTokenManager);

                if (!helpers.isTestNetwork(network)) {
                    const instance = await NahmiiToken.at(addressStorage.get('NahmiiToken'));
                    await instance.mint(addressStorage.get('RevenueTokenManager'), 120e24);

                    while (0 == (await instance.balanceOf(addressStorage.get('RevenueTokenManager'))).toNumber()) {
                        console.log(`Waiting 60s for token minting to be mined`);
                        await helpers.sleep(60000);
                    }

                    instance = await RevenueTokenManager.at(addressStorage.get('RevenueTokenManager'));
                    await instance.setToken(addressStorage.get('NahmiiToken'));
                    await instance.setBeneficiary(deployerAccount);

                    const releases = airdriipReleases();

                    const earliestReleaseTimes = [];
                    const amounts = [];
                    const blockNumbers = [];
                    releases.forEach((r) => {
                        earliestReleaseTimes.push(r.earliestReleaseTime);
                        amounts.push(r.amount);
                        if (r.blockNumber)
                            blockNumbers.push(r.blockNumber);
                    });

                    let result = await instance.defineReleases(
                        earliestReleaseTimes.slice(0, 60),
                        amounts.slice(0, 60),
                        blockNumbers.slice(0, 60),
                        {gas: 5e6}
                    );

                    console.log(`First batch of releases defined in TX ${result.tx}...`);

                    while (null == (await web3.eth.getTransactionReceipt(result.tx)).blockNumber) {
                        console.log(`Waiting 60s for first batch of releases to be mined...`);
                        await helpers.sleep(60000);
                    }

                    result = await instance.defineReleases(
                        earliestReleaseTimes.slice(60),
                        amounts.slice(60),
                        blockNumbers.slice(60),
                        {gas: 5e6}
                    );

                    console.log(`Second batch of releases defined in TX ${result.tx}...`);

                    while (null == (await web3.eth.getTransactionReceipt(result.tx)).blockNumber) {
                        console.log(`Waiting 60s for second batch of releases to be mined...`);
                        await helpers.sleep(60000);
                    }

                    for (let i = 0; i < 15; i++)
                        await instance.release(i);

                    if (!helpers.isTestNetwork(network))
                        await instance.setBeneficiary('0xe8575e787e28bcb0ee3046605f795bf883e82e84');

                    console.log(`Releases:`);
                    releases.forEach((r) => {
                        console.log(`  ${moment.unix(r.earliestReleaseTime)} - ${r.blockNumber ? r.blockNumber : ''}`);
                    });

                    const firstRelease = await instance.releases(0);
                    console.log(`First release of ${firstRelease[1].toString()} at ${new Date(1000 * firstRelease[0].toNumber())} with block number ${firstRelease[2].toNumber()}`);

                    const secondRelease = await instance.releases(1);
                    console.log(`Second release of ${secondRelease[1].toString()} at ${new Date(1000 * secondRelease[0].toNumber())} with block number ${secondRelease[2].toNumber()}`);

                    const lastRelease = await instance.releases(119);
                    console.log(`Last release of ${lastRelease[1].toString()} at ${new Date(1000 * lastRelease[0].toNumber())} with block number ${lastRelease[2].toNumber()}`);

                    console.log(`Total locked amount: ${(await instance.totalLockedAmount()).toNumber()}`);
                    console.log(`Releases count: ${(await instance.releasesCount()).toNumber()}`);
                    console.log(`Executed releases count: ${(await instance.executedReleasesCount()).toNumber()}`);
                }

            } else if (network.startsWith('mainnet')) {
                addressStorage.set('RevenueTokenManager', '0xe3f2158610b7145c04ae03a6356038ad2404a9a6');
            }

        } finally {
            if (!helpers.isTestNetwork(network))
                helpers.lockAddress(web3, deployerAccount);
        }

        console.log(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract, usesAccessManager) {
    let address = ctl.addressStorage.get(instanceName || contractName);

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        let instance;

        if (usesAccessManager) {
            let signerManager = ctl.addressStorage.get('SignerManager');

            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, signerManager, {from: ctl.deployerAccount});

        } else
            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, {from: ctl.deployerAccount});

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

function airdriipReleases() {
    let date = new moment('15 Jan 2019 00:00:00 UT');

    const releases = [];
    const blockNumbers = [
        4828869, 4834113, 4841090, 4847145, 4852161, 4857914,
        4864167, 4870652, 4876970, 4883180, 4889874, 4895788,
        4901555, 4907444, 4913921, 4923471
    ];
    for (let i = 0; i < 120; i++) {
        const release = {
            earliestReleaseTime: moment(date).subtract(1, 'hour').unix(),
            amount: 1e24
        };

        if (blockNumbers[i])
            release.blockNumber = blockNumbers[i];

        releases.push(release);

        date = moment(date).add(1, 'day');
    }
    return releases;
}
