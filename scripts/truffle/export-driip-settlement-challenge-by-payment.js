/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_driip_settlement_challenge_by_payment');

const DriipSettlementChallengeByPayment = artifacts.require('DriipSettlementChallengeByPayment');

let web3DriipSettlementChallengeByPayment, ethersDriipSettlementChallengeByPayment;

const rootDir = 'state/export/DriipSettlementChallengeByPayment';
const fromBlock = 0;

const iface = new utils.Interface(DriipSettlementChallengeByPayment.abi);

async function parseLogs(eventName) {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementChallengeByPayment.interface.events[eventName].topic],
        fromBlock,
        address: ethersDriipSettlementChallengeByPayment.address
    });
    debug(`# ${eventName}: ${logs.length}`);
    return Promise.all(logs.map(async (log) => ({
            values: iface.parseLog(log).values,
            blockNumber: log.blockNumber,
            blockTimestamp: (await provider.getBlock(log.blockNumber)).timestamp
    })));
}

async function writeJSON(data, fileName, dir = rootDir) {
    if (!data || !data.length)
        return;

    await fs.mkdir(dir, {recursive: true});

    await fs.writeFile(
        `${dir}/${ethersDriipSettlementChallengeByPayment.address}-${fileName}.json`,
        JSON.stringify(data, null, 2)
    );
}

async function exportStartChallengePaymentQuery(dir) {
    const logs = await parseLogs('StartChallengeFromPaymentEvent');

    const query = [];

    logs.forEach(log => {
        query.push({
            'sender.wallet': log.values.wallet.toLowerCase(),
            'sender.nonce': log.values.nonce.toNumber()
        });
        query.push({
            'recipient.wallet': log.values.wallet.toLowerCase(),
            'recipient.nonce': log.values.nonce.toNumber()
        });
    });

    return writeJSON(query, 'start-challenge-payment-identifiers', dir);
}

async function exportStartChallengeFromPayment() {
    const logs = await parseLogs('StartChallengeFromPaymentEvent');

    return writeJSON(logs.map(log => ({
        wallet: log.values.wallet.toLowerCase(),
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        data: {
            nonce: log.values.nonce.toNumber(),
            cumulativeTransferAmount: log.values.cumulativeTransferAmount.toString(),
            stageAmount: log.values.stageAmount.toString(),
            targetBalanceAmount: log.values.targetBalanceAmount.toString(),
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber()
            }
        },
    })), 'start-challenge-from-payment');
}

async function exportStopChallenge() {
    const logs = await parseLogs('StopChallengeEvent');

    return writeJSON(logs.map(log => ({
        wallet: log.values.wallet.toLowerCase(),
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        data: {
            nonce: log.values.nonce.toNumber(),
            cumulativeTransferAmount: log.values.cumulativeTransferAmount.toString(),
            stageAmount: log.values.stageAmount.toString(),
            targetBalanceAmount: log.values.targetBalanceAmount.toString(),
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber()
            },
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
            cumulativeTransferAmount: log.values.cumulativeTransferAmount.toString(),
            stageAmount: log.values.stageAmount.toString(),
            targetBalanceAmount: log.values.targetBalanceAmount.toString(),
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber()
            },
            challengerWallet: log.values.challengerWallet.toLowerCase()
        }
    })), 'challenge-by-payment');
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        web3DriipSettlementChallengeByPayment = await DriipSettlementChallengeByPayment.deployed();
        ethersDriipSettlementChallengeByPayment = new Contract(web3DriipSettlementChallengeByPayment.address, DriipSettlementChallengeByPayment.abi, provider);

        // Start challenge payment query
        await exportStartChallengePaymentQuery('state/query');

        // Start challenge from payment
        await exportStartChallengeFromPayment();

        // Stop challenge
        await exportStopChallenge();

        // Challenge by payment
        await exportChallengeByPayment();

    } catch (e) {
        callback(e);
    }

    callback();
};
