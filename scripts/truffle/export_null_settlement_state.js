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

const coder = new utils.AbiCoder();
const iface = new utils.Interface(NullSettlementState.abi);

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        const web3NullSettlementState = await NullSettlementState.deployed();
        const ethersNullSettlementState = new Contract(web3NullSettlementState.address, NullSettlementState.abi, provider);

        const outDir = 'state/NullSettlementState';
        await fs.mkdir(outDir, {recursive: true});

        const fromBlock = 7588183;

        // Max nonce
        const maxNullLogs = await provider.getLogs({
            topics: [ethersNullSettlementState.interface.events.SetMaxNullNonceEvent.topic],
            fromBlock,
            address: ethersNullSettlementState.address
        });
        debug(`# SetMaxNullNonceEvent: ${maxNullLogs.length}`);

        // Max nonce by wallet and currency
        const maxNullByWalletCurrencyLogs = await provider.getLogs({
            topics: [ethersNullSettlementState.interface.events.SetMaxNonceByWalletAndCurrencyEvent.topic],
            fromBlock,
            address: ethersNullSettlementState.address
        });
        debug(`# SetMaxNonceByWalletAndCurrencyEvent: ${maxNullByWalletCurrencyLogs.length}`);

        let maxNullNonceByWalletCurrency = maxNullByWalletCurrencyLogs.map(
            log => {
                const {wallet, currency, maxNullNonce} = iface.parseLog(log).values;
                const e = {
                    wallet,
                    currency: {ct: currency[0], id: currency[1].toNumber()},
                    maxNonce: maxNullNonce.toNumber(),
                    blockNumber: log.blockNumber
                };
                return e;
            }
        );

        await fs.writeFile(
            `${outDir}/max-nonces.json`,
            JSON.stringify(
                maxNullNonceByWalletCurrency,
                null, 2
            )
        );

    } catch (e) {
        callback(e);
    }

    callback();
};