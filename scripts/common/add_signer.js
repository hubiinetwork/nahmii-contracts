/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const SignerManager = artifacts.require('SignerManager');

const helpers = require('./helpers.js');
const AddressStorage = require('./address_storage');

// -----------------------------------------------------------------------------------------------------------------

module.exports = async (callback) => {

    const network = helpers.parseNetworkArg();

    const addressStorage = new AddressStorage(`${__dirname}/../../build/addresses.json`, network);
    await addressStorage.load();

    const testNetwork = false;
    const deployerAccount = helpers.parseDeployerArg();
    const signerAccount = helpers.parseAddressArg('signer');

    if (!helpers.isTestNetwork(network))
        helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 7200);

    try {
        const instance = await SignerManager.at(addressStorage.get('SignerManager'));

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
        if (!testNetwork)
            helpers.lockAddress(web3, deployerAccount);
    }
};
