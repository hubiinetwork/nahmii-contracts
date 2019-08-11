/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const TestERC20 = artifacts.require('TestERC20');
const helpers = require('../common/helpers.js');
const debug = require('debug')('deploy_testerc20');

// A script for the deployment of the TestERC20 contract.
//
// This script may be run as follows:
//
//    DEBUG=deploy_testerc20 npm run exec:deploy_testerc20 -- --network ganache --deployer 0xc31Eb6E317054A79bb5E442D686CB9b225670c1D

module.exports = async (callback) => {

    const network = helpers.parseNetworkArg();
    const deployerAccount = helpers.parseDeployerArg();

    if (!helpers.isTestNetwork(network))
        helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 14400);

    try {
        const instance = await TestERC20.new({from: deployerAccount});

        debug(`Deployed TestERC20 at ${await instance.address}`);

        callback();
    } catch (err) {
        callback(err);
    } finally {
        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, deployerAccount);
    }
};
