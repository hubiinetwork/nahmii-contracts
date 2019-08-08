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

async function parseLogs(eventName) {
    const logs = await provider.getLogs({
        topics: [ethersClientFund.interface.events[eventName].topic],
        fromBlock,
        address: ethersClientFund.address
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

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        web3ClientFund = await ClientFund.deployed();
        ethersClientFund = new Contract(web3ClientFund.address, ClientFund.abi, provider);

        // Receive
        await exportReceive();

    } catch (e) {
        callback(e);
    }

    callback();
};
