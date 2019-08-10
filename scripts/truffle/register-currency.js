/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const TransferControllerManager = artifacts.require('TransferControllerManager');
const helpers = require('../common/helpers.js');

module.exports = async (callback) => {

    const network = helpers.parseNetworkArg();
    const deployerAccount = helpers.parseDeployerArg();
    const contractAddress = helpers.parseAddressArg('contract');
    const standard = helpers.parseStringArg('standard');

    if (!helpers.isTestNetwork(network))
        helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 14400);

    try {
        const instance = await TransferControllerManager.deployed();

        if ('0x' != await instance.transferController(contractAddress, ''))
            console.log(`Contract ${contractAddress} is already registered`);

        else {
            await instance.registerCurrency(contractAddress, standard);

            if ('0x' != await instance.transferController(contractAddress, ''))
                console.log(`Contract ${contractAddress} successfully registered as standard ${standard}`);
            else
                console.log(`Unable to register ${contractAddress} as standard ${standard}`);
        }

        callback();
    } catch (err) {
        callback(err);
    } finally {
        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, deployerAccount);
    }
};
