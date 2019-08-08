/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_driip_settlement_state');

const DriipSettlementState = artifacts.require('DriipSettlementState');

let web3DriipSettlementState, ethersDriipSettlementState;
(async function () {
    web3DriipSettlementState = await DriipSettlementState.deployed();
    ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, provider);
})();

const outDir = 'state/export/DriipSettlementState';
const fromBlock = 0;

const iface = new utils.Interface(DriipSettlementState.abi);

async function exportSettlements() {
    const settlementsCount = (await ethersDriipSettlementState.settlementsCount()).toNumber();
    debug(`# settlements: ${settlementsCount}`);

    let settlements = [];
    for (let i = 0; i < settlementsCount; i++)
        settlements.push(await ethersDriipSettlementState.settlements(i));

    settlements = settlements.map(
        d => ({
            settledKind: d.settledKind,
            settledHash: d.settledHash,
            origin: {
                nonce: d.origin.nonce.toNumber(),
                wallet: d.origin.wallet,
                doneBlockNumber: d.origin.doneBlockNumber.toNumber()
            },
            target: {
                nonce: d.target.nonce.toNumber(),
                wallet: d.target.wallet,
                doneBlockNumber: d.target.doneBlockNumber.toNumber()
            }
        })
    );

    await fs.writeFile(
        `${outDir}/settlements.json`,
        JSON.stringify(
            settlements,
            null, 2
        )
    );
}

async function exportMaxNonces() {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementState.interface.events.SetMaxNonceByWalletAndCurrencyEvent.topic],
        fromBlock,
        address: ethersDriipSettlementState.address
    });
    debug(`# SetMaxNonceByWalletAndCurrencyEvent: ${logs.length}`);

    await fs.writeFile(
        `${outDir}/max-nonces.json`,
        JSON.stringify(
            logs.map(log => {
                    const d = iface.parseLog(log).values;
                    return {
                        wallet: d.wallet,
                        currency: {ct: d.currency[0], id: d.currency[1].toNumber()},
                        maxNonce: d.maxNonce.toNumber()
                    };
                }
            ),
            null, 2)
    );
}

async function exportTotalFees() {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementState.interface.events.SetTotalFeeEvent.topic],
        fromBlock,
        address: ethersDriipSettlementState.address
    });
    debug(`# SetTotalFeeEvent: ${logs.length}`);

    await fs.writeFile(
        `${outDir}/total-fees.json`,
        JSON.stringify(
            logs.map(log => {
                    const d = iface.parseLog(log).values;
                    return {
                        wallet: d.wallet,
                        beneficiary: d.beneficiary,
                        destination: d.destination,
                        currency: {ct: d.currency[0], id: d.currency[1].toNumber()},
                        totalFee: {nonce: d.totalFee[0].toNumber(), amount: d.totalFee[1].toString()}
                    };
                }
            ),
            null, 2
        )
    );
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        await fs.mkdir(outDir, {recursive: true});

        // Settlements
        await exportSettlements();

        // Max nonces
        await exportMaxNonces();

        // Total fee
        await exportTotalFees();

    } catch (e) {
        callback(e);
    }

    callback();
};
