/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Wallet, Contract, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('import_driip_settlement_state');

const DriipSettlementState = artifacts.require('DriipSettlementState');

module.exports = async (callback) => {

    try {
        const web3DriipSettlementState = await DriipSettlementState.deployed();
        const ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, provider);

        // TODO Read deployer account from cmd line arguments
        const deployerAccount = Wallet.createRandom().address;

        if (!(await ethersDriipSettlementState.isRegisteredService(deployerAccount))) {
            await ethersDriipSettlementState.registerService(deployerAccount);
            await ethersDriipSettlementState.enableServiceAction(deployerAccount, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());
            await ethersDriipSettlementState.enableServiceAction(deployerAccount, await ethersDriipSettlementState.SET_TOTAL_FEE_ACTION());
        }

        const inDir = 'state/DriipSettlementState';

        // Settlements
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

        // Max nonces
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

        // Total fees
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

    } catch (e) {
        callback(e);
    }

    callback();
};
