/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('write_null_settlement_state');

const NullSettlementState = artifacts.require('NullSettlementState');

const iface = new utils.Interface(NullSettlementState.abi);

const outDir = 'state/export/NullSettlementState';
const fromBlock = 0;

async function exportMaxNullNonces(ethersNullSettlementState) {
    const maxNullLogs = await provider.getLogs({
        topics: [ethersNullSettlementState.interface.events.SetMaxNullNonceEvent.topic],
        fromBlock,
        address: ethersNullSettlementState.address
    });
    debug(`# SetMaxNullNonceEvent: ${maxNullLogs.length}`);

    // TODO export of max null nonces to JSON file
}

async function exportMaxNonces(ethersNullSettlementState) {
    const maxNonceByWalletCurrencyLogs = await provider.getLogs({
        topics: [ethersNullSettlementState.interface.events.SetMaxNonceByWalletAndCurrencyEvent.topic],
        fromBlock,
        address: ethersNullSettlementState.address
    });
    debug(`# SetMaxNonceByWalletAndCurrencyEvent: ${maxNonceByWalletCurrencyLogs.length}`);

    let maxNonceByWalletCurrency = maxNonceByWalletCurrencyLogs.map(
        log => {
            const {wallet, currency, maxNonce} = iface.parseLog(log).values;
            const e = {
                wallet,
                currency: {ct: currency[0], id: currency[1].toNumber()},
                maxNonce: maxNonce.toNumber(),
                blockNumber: log.blockNumber
            };
            return e;
        }
    );

    await fs.writeFile(
        `${outDir}/max-nonces.json`,
        JSON.stringify(
            maxNonceByWalletCurrency,
            null, 2
        )
    );
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        const web3NullSettlementState = await NullSettlementState.deployed();
        const ethersNullSettlementState = new Contract(web3NullSettlementState.address, NullSettlementState.abi, provider);

        await fs.mkdir(outDir, {recursive: true});

        // Max null nonces
        await exportMaxNullNonces(ethersNullSettlementState);

        // Max nonces
        await exportMaxNonces(ethersNullSettlementState);

    } catch (e) {
        callback(e);
    }

    callback();
};
