/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_null_settlement_challenge_by_payment');

const NullSettlementChallengeByPayment = artifacts.require('NullSettlementChallengeByPayment');

let web3NullSettlementChallengeByPayment, ethersNullSettlementChallengeByPayment;

const rootDir = 'state/export/NullSettlementChallengeByPayment';
const fromBlock = 0;

const iface = new utils.Interface(NullSettlementChallengeByPayment.abi);


async function parseLogs(eventName) {
    const logs = await provider.getLogs({
        topics: [ethersNullSettlementChallengeByPayment.interface.events[eventName].topic],
        fromBlock,
        address: ethersNullSettlementChallengeByPayment.address
    });
    debug(`# ${eventName}: ${logs.length}`);
    return Promise.all(logs.map(async (log) => ({
        values: iface.parseLog(log).values,
        blockNumber: log.blockNumber,
        blockTimestamp: (await provider.getBlock(log.blockNumber)).timestamp
    })));
}

async function writeJSON(data, fileName) {
    if (!data || !data.length)
        return;

    await fs.mkdir(rootDir, {recursive: true});

    await fs.writeFile(
        `${rootDir}/${ethersNullSettlementChallengeByPayment.address}-${fileName}.json`,
        JSON.stringify(
            data,
            null, 2
        )
    );
}

async function exportStartChallenge() {
    const logs = await parseLogs('StartChallengeEvent');

    return writeJSON(logs.map(log => ({
        wallet: log.values.wallet.toLowerCase(),
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        data: {
            nonce: log.values.nonce.toNumber(),
            stageAmount: log.values.stageAmount.toString(),
            targetBalanceAmount: log.values.targetBalanceAmount.toString(),
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber()
            }
        }
    })), 'start-challenge');
}

async function exportStopChallenge() {
    const logs = await parseLogs('StopChallengeEvent');

    return writeJSON(logs.map(log => ({
        wallet: log.values.wallet.toLowerCase(),
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        data: {
            nonce: log.values.nonce.toNumber(),
            stageAmount: log.values.stageAmount.toString(),
            targetBalanceAmount: log.values.targetBalanceAmount.toString(),
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber()
            }
        }
    })), 'stop-challenge');
}

async function exportChallengeByPayment() {
    const logs = await parseLogs('ChallengeByPaymentEvent');

    return writeJSON(logs.map(log => ({
        wallet: log.values.challengedWallet.toLowerCase(),
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        data: {
            nonce: log.values.nonce.toNumber(),
            stageAmount: log.values.stageAmount.toString(),
            targetBalanceAmount: log.values.targetBalanceAmount.toString(),
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber()
            },
            challengerWallet: log.values.challengerWallet
        }
    })), 'challenge-by-payment');
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        web3NullSettlementChallengeByPayment = await NullSettlementChallengeByPayment.deployed();
        ethersNullSettlementChallengeByPayment = new Contract(web3NullSettlementChallengeByPayment.address, NullSettlementChallengeByPayment.abi, provider);

        // Start challenge
        await exportStartChallenge();

        // Stop challenge
        await exportStopChallenge();

        // Challenge by payment
        await exportChallengeByPayment();

    } catch (e) {
        callback(e);
    }

    callback();
};
