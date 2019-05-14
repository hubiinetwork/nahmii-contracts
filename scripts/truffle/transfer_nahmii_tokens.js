/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const NahmiiToken = artifacts.require('NahmiiToken');

const helpers = require('../common/helpers.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = async (callback) => {
    let deployerAccount;

    const testNetwork = false;
    deployerAccount = helpers.parseDeployerArg();

    if (!testNetwork)
        helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 14400);

    try {

        const instance = await NahmiiToken.at('0x65905e653b750bCB8f903374Bc93cbd8E2E71B71');
        await instance.addMinter('0x630FAEe42B6D418C909958C9590235F082c88136');
        await instance.transfer('0x630FAEe42B6D418C909958C9590235F082c88136', new web3.BigNumber('120e24'));

        console.log(`Balance of token holder: ${(await instance.balanceOf('0x630FAEe42B6D418C909958C9590235F082c88136')).toString()}`);
    }
    catch (err) {
        if (!testNetwork)
            helpers.lockAddress(web3, deployerAccount);
        callback();
        throw err;
    }

    if (!testNetwork)
        helpers.lockAddress(web3, deployerAccount);
};
