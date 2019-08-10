/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_null_settlement');

const NullSettlement = artifacts.require('NullSettlement');

let web3NullSettlement, ethersNullSettlement;

const rootDir = 'state/export/NullSettlement';
const fromBlock = 0;

const iface = new utils.Interface(NullSettlement.abi);

async function parseLogs(eventName) {
    const logs = await provider.getLogs({
        topics: [ethersNullSettlement.interface.events[eventName].topic],
        fromBlock,
        address: ethersNullSettlement.address
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
        `${rootDir}/${ethersNullSettlement.address}-${fileName}.json`,
        JSON.stringify(
            data,
            null, 2
        )
    );
}

async function exportSettleNull() {
    const logs = await parseLogs('SettleNullEvent');

    return writeJSON(logs.map(log => ({
        wallet: log.values.wallet.toLowerCase(),
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        data: {
            currency: {
                ct: log.values.currencyCt.toLowerCase(),
                id: log.values.currencyId.toNumber()
            }
        },
    })), 'settle-null');
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        web3NullSettlement = await NullSettlement.deployed();
        ethersNullSettlement = new Contract(web3NullSettlement.address, NullSettlement.abi, provider);

        // Settle payment
        await exportSettleNull();

    } catch (e) {
        callback(e);
    }

    callback();
};
