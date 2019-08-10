/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_client_fund');

const ClientFund = artifacts.require('ClientFund');

let web3ClientFund, ethersClientFund;

const rootDir = 'state/export/ClientFund';
const fromBlock = 0;

const iface = new utils.Interface(ClientFund.abi);

// async function parseLogs(eventName) {
//     const logs = await provider.getLogs({
//         topics: [ethersClientFund.interface.events[eventName].topic],
//         fromBlock,
//         address: ethersClientFund.address
//     });
//     debug(`# ${eventName}: ${logs.length}`);
//     return Promise.all(logs.map(async (log) => ({
//         values: iface.parseLog(log).values,
//         blockNumber: log.blockNumber,
//         blockTimestamp: (await provider.getBlock(log.blockNumber)).timestamp
//     })));
// }

// async function parseLogs(...eventNames) {
//     const logs = (await Promise.all(eventNames.map(n => {
//         return provider.getLogs({
//             topics: [ethersClientFund.interface.events[n].topic],
//             fromBlock,
//             address: ethersClientFund.address
//         })
//     }))).reduce((a, e) => {
//         a = a.concat(e);
//         return a;
//     }, []);
//
//     debug(`# ${eventNames}: ${logs.length}`);
//     return Promise.all(logs.map(async (log) => ({
//         values: iface.parseLog(log).values,
//         blockNumber: log.blockNumber,
//         blockTimestamp: (await provider.getBlock(log.blockNumber)).timestamp
//     })));
// }

async function parseLogs(...eventNames) {
    let logs = [];
    for (let eventName of eventNames) {
        let eventLogs = await provider.getLogs({
            topics: [ethersClientFund.interface.events[eventName].topic],
            fromBlock,
            address: ethersClientFund.address
        });
        debug(`# ${eventName}: ${eventLogs.length}`);
        eventLogs = await Promise.all(eventLogs.map(async (log) => ({
            values: iface.parseLog(log).values,
            blockNumber: log.blockNumber,
            blockTimestamp: (await provider.getBlock(log.blockNumber)).timestamp,
            action: 'ReceiveEvent' == eventName ? 'receive' : 'withdraw'
        })));
        logs = logs.concat(eventLogs);
    }
    return logs;
}

async function writeJSON(data, fileName) {
    if (!data || !data.length)
        return;

    await fs.mkdir(rootDir, {recursive: true});

    await fs.writeFile(
        `${rootDir}/${ethersClientFund.address}-${fileName}.json`,
        JSON.stringify(
            data,
            null, 2
        )
    );
}

async function exportReceive() {
    const logs = await parseLogs('ReceiveEvent');

    return writeJSON(logs.map(log => ({
        wallet: log.values.wallet.toLowerCase(),
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        data: {
            balanceType: log.values.balanceType,
            value: log.values.value.toString(),
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber(),
            },
            standard: log.values.standard
        }
    })), 'receive');
}

async function exportWithdraw() {
    const logs = await parseLogs('WithdrawEvent');

    return writeJSON(logs.map(log => ({
        wallet: log.values.wallet.toLowerCase(),
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        data: {
            value: log.values.value.toString(),
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber(),
            },
            standard: log.values.standard
        }
    })), 'withdraw');
}

async function exportReceiveAndWithdraw() {
    const logs = await parseLogs('ReceiveEvent', 'WithdrawEvent');

    return writeJSON(logs.map(log => {
            const o = {
                wallet: log.values.wallet.toLowerCase(),
                blockNumber: log.blockNumber,
                blockTimestamp: log.blockTimestamp,
                data: {
                    value: log.values.value.toString(),
                    currency: {
                        ct: log.values.currencyCt.toLowerCase(),
                        id: log.values.currencyId.toNumber(),
                    },
                    standard: log.values.standard
                },
                action: log.action
            };

            if (log.values.balanceType)
                o.data.balanceType = log.values.balanceType;

            return o;
        }
    ), 'receive-withdraw');
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        web3ClientFund = await ClientFund.deployed();
        ethersClientFund = new Contract(web3ClientFund.address, ClientFund.abi, provider);

        // // Receive
        // await exportReceive();

        // // Withdraw
        // await exportWithdraw();

        // Receive and withdraw
        await exportReceiveAndWithdraw();

    } catch (e) {
        callback(e);
    }

    callback();
};
