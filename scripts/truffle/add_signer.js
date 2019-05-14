/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const SignerManager = artifacts.require('SignerManager');
const helpers = require('../common/helpers.js');

module.exports = async (callback) => {

    const network = helpers.parseNetworkArg();
    const deployerAccount = helpers.parseDeployerArg();
    const signerAccount = helpers.parseAddressArg('signer');

    if (!helpers.isTestNetwork(network))
        helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 14400);

    try {
        const instance = await SignerManager.deployed();

        if (await instance.isSigner(signerAccount))
            console.log(`Signer ${signerAccount} is already registered with SignerManager at ${SignerManager.address}`);

        else {
            await instance.registerSigner(signerAccount);

            if (await instance.isSigner(signerAccount))
                console.log(`Signer ${signerAccount} registered with SignerManager at ${SignerManager.address}`);
        }

        callback();
    } catch (err) {
        callback(err);
    } finally {
        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, deployerAccount);
    }
};
