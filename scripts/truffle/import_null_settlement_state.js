/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('import_driip_settlement_state');
const helpers = require('../common/helpers.js');

const NullSettlementState = artifacts.require('NullSettlementState');

module.exports = async (callback) => {

    let unlockable;

    try {
        const web3NullSettlementState = await NullSettlementState.deployed();
        const ethersNullSettlementState = new Contract(web3NullSettlementState.address, NullSettlementState.abi, provider);

        const network = helpers.parseNetworkArg();
        const deployerAccount = helpers.parseDeployerArg();

        unlockable = !helpers.isTestNetwork(network) && helpers.hasArg('password');

        if (unlockable)
            helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 14400);

        if (!(await ethersNullSettlementState.isRegisteredService(deployerAccount))) {
            await ethersNullSettlementState.registerService(deployerAccount);
            await ethersNullSettlementState.enableServiceAction(deployerAccount, await ethersNullSettlementState.SET_MAX_NONCE_ACTION());
        }

        const inDir = 'state/NullSettlementState';

        // Max nonce by wallet and currency
        const maxNonceByWalletCurrency = JSON.parse(await fs.readFile(`${inDir}/max-nonces.json`));
        debug(`Max nonce by wallet and currency data: ${JSON.stringify(maxNonceByWalletCurrency, null, 2)}`);

        console.log('Set max nonce by wallet and currency:');
        for (let i = 0; i < maxNonceByWalletCurrency.length; i++) {

            const {wallet, currency, maxNonce} = maxNonceByWalletCurrency[i];

            await ethersNullSettlementState.setMaxNonceByWalletAndCurrency(
                wallet, currency, maxNonce
            );

            console.log(`  ${wallet}, (${currency.ct}, ${currency.id.toString()}): ${(await ethersNullSettlementState.maxNonceByWalletAndCurrency(wallet, currency)).toString()}`);
        }

    } catch (e) {
        callback(e);
    } finally {
        if (unlockable)
            helpers.lockAddress(web3, deployerAccount);
    }

    callback();
};
