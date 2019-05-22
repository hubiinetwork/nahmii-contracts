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

const DriipSettlementState = artifacts.require('DriipSettlementState');

const inDir = 'state/DriipSettlementState';

async function promoteToService(ethersDriipSettlementState, deployerAccount) {
    if (!(await ethersDriipSettlementState.isRegisteredService(deployerAccount))) {
        await ethersDriipSettlementState.registerService(deployerAccount);
        await ethersDriipSettlementState.enableServiceAction(deployerAccount, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());
        await ethersDriipSettlementState.enableServiceAction(deployerAccount, await ethersDriipSettlementState.SET_TOTAL_FEE_ACTION());
    }
}

async function demoteFromService(ethersDriipSettlementState, deployerAccount) {
    if (await ethersDriipSettlementState.isRegisteredService(deployerAccount)) {
        await ethersDriipSettlementState.disableServiceAction(deployerAccount, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION())
        await ethersDriipSettlementState.disableServiceAction(deployerAccount, await ethersDriipSettlementState.SET_TOTAL_FEE_ACTION())
        await ethersDriipSettlementState.deregisterService(deployerAccount);
    }
}

async function importSettlements(ethersDriipSettlementState) {
    const settlementEntries = JSON.parse(await fs.readFile(`${inDir}/settlements.json`));
    debug(`Read settlement entries: ${JSON.stringify(settlementEntries, null, 2)}`);

    console.log('Upgraded settlement by index:');
    for (let i = 0; i < settlementEntries.length; i++) {

        const settlement = settlementEntries[i];

        await ethersDriipSettlementState.upgradeSettlement(
            settlement.settledKind, settlement.settledHash,
            settlement.origin.wallet, settlement.origin.nonce, settlement.origin.done, settlement.origin.doneBlockNumber,
            settlement.target.wallet, settlement.target.nonce, settlement.target.done, settlement.target.doneBlockNumber
        );

        console.log(`  ${i}: ${await ethersDriipSettlementState.settlements(i)}`);
    }
}

async function importMaxNonces(ethersDriipSettlementState) {
    const maxNonceEntries = JSON.parse(await fs.readFile(`${inDir}/max-nonces.json`));
    debug(`Read max nonce entries: ${JSON.stringify(maxNonceEntries, null, 2)}`);

    console.log('Set max nonce by wallet and currency:');
    for (let i = 0; i < maxNonceEntries.length; i++) {

        const {wallet, currency, maxNonce} = maxNonceEntries[i];

        await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(wallet, currency, maxNonce);

        console.log(`  ${wallet}, (${currency.ct}, ${currency.id.toString()}): ${
            (await ethersDriipSettlementState.maxNonceByWalletAndCurrency(wallet, currency))
            }`);
    }
}

async function importTotalFees(ethersDriipSettlementState) {
    const totalFeeEntries = JSON.parse(await fs.readFile(`${inDir}/total-fees.json`));
    debug(`Read total fee entries: ${JSON.stringify(totalFeeEntries, null, 2)}`);

    console.log('Set total fee by wallet, beneficiary, destination and currency:');
    for (let i = 0; i < totalFeeEntries.length; i++) {

        const {wallet, beneficiary, destination, currency, totalFee} = totalFeeEntries[i];

        await ethersDriipSettlementState.setTotalFee(wallet, beneficiary, destination, currency, totalFee);

        console.log(`  ${wallet}, ${beneficiary}, ${destination}, (${currency.ct}, ${currency.id.toString()}): (${
            await ethersDriipSettlementState.totalFee(wallet, beneficiary, destination, currency)
            })`);
    }
}

module.exports = async (callback) => {

    let unlockable;

    try {
        const web3DriipSettlementState = await DriipSettlementState.deployed();
        const ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, provider);

        const network = helpers.parseNetworkArg();
        const deployerAccount = helpers.parseDeployerArg();

        unlockable = !helpers.isTestNetwork(network) && helpers.hasArg('password');

        if (unlockable)
            helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 14400);

        // Promote deployer to service
        await promoteToService(ethersDriipSettlementState, deployerAccount);

        // Settlements
        await importSettlements(ethersDriipSettlementState);

        // Max nonces
        await importMaxNonces(ethersDriipSettlementState);

        // Total fees
        await importTotalFees(ethersDriipSettlementState);

        // Demote deployer from service
        await demoteFromService(ethersDriipSettlementState, deployerAccount);

    } catch (e) {
        callback(e);
    } finally {
        if (unlockable)
            helpers.lockAddress(web3, deployerAccount);
    }

    callback();
};
