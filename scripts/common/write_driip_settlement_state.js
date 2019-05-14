/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('write_driip_settlement_state');

const DriipSettlementState = artifacts.require('DriipSettlementState');

const coder = new utils.AbiCoder();

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    const web3DriipSettlementState = await DriipSettlementState.deployed();
    const ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, provider);

    const outDir = 'state/DriipSettlementState';
    await fs.mkdir(outDir, {recursive: true});

    const fromBlock = 7588183;

    console.log(utils.Interface);
    const iface = new utils.Interface(DriipSettlementState.abi);

    // Settlements
    let logs = await provider.getLogs({
        topics: [ethersDriipSettlementState.interface.events.InitSettlementEvent.topic],
        // topics: ethersDriipSettlementState.interface.events.InitSettlementEvent.topics,
        fromBlock,
        address: ethersDriipSettlementState.address
    });
    debug(`# InitSettlementEvent: ${logs.length}`);

    let logSettlements = logs.map(
        log => {
            const d = iface.parseLog(log).values.settlement;
            const s = {
                settledKind: d[0],
                settledHash: d[1],
                origin: {nonce: d[2][0].toNumber(), wallet: d[2][1], done: d[2][2]},
                target: {nonce: d[3][0].toNumber(), wallet: d[3][1], done: d[3][2]}
            };
            s.blockNumber = log.blockNumber;
            return s;
        }
    );

    const settlementsCount = (await ethersDriipSettlementState.settlementsCount()).toNumber();
    debug(`# settlements: ${settlementsCount}`);

    let settlements = [];
    for (let i = 0; i < settlementsCount; i++)
        settlements.push(await ethersDriipSettlementState.settlements(i));

    settlements = settlements.map(
        d => {
            const h = d[1];
            const l = logSettlements.filter(l => l.settledHash == h)[0];
            const s = {
                settledKind: d[0],
                settledHash: h,
                origin: {nonce: d[2][0].toNumber(), wallet: d[2][1], done: d[2][2]},
                target: {nonce: d[3][0].toNumber(), wallet: d[3][1], done: d[3][2]}
            };
            s.origin.doneBlockNumber = s.origin.done ? l.blockNumber : 0;
            s.target.doneBlockNumber = s.target.done ? l.blockNumber : 0;
            return s;
        }
    );

    await fs.writeFile(
        `${outDir}/settlements.json`,
        JSON.stringify(
            settlements,
            null, 2
        )
    );

    // Max nonce by wallet and currency
    logs = await provider.getLogs({
        topics: [ethersDriipSettlementState.interface.events.SetMaxNonceByWalletAndCurrencyEvent.topic],
        fromBlock,
        address: ethersDriipSettlementState.address
    });
    debug(`# SetMaxNonceByWalletAndCurrencyEvent: ${logs.length}`);

    // console.log(
    await fs.writeFile(
        `${outDir}/max-nonces.json`,
        JSON.stringify(
            logs.map(
                log => coder.decode(['address', 'address', 'uint256', 'uint256'], log.data)
            ).map(
                d => ({wallet: d[0], currency: {ct: d[1], id: d[2].toNumber()}, nonce: d[3].toNumber()})
            ),
            null, 2
        )
    );

    // Total fee
    logs = await provider.getLogs({
        topics: [ethersDriipSettlementState.interface.events.SetTotalFeeEvent.topic],
        fromBlock,
        address: ethersDriipSettlementState.address
    });
    debug(`# SetTotalFeeEvent: ${logs.length}`);

    // console.log(
    await fs.writeFile(
        `${outDir}/total-fees.json`,
        JSON.stringify(
            logs.map(
                log => coder.decode(['address', 'address', 'address', 'address', 'uint256', 'uint256', 'int256'], log.data)
            ).map(
                d => ({
                    wallet: d[0],
                    beneficiary: d[1],
                    destination: d[2],
                    currency: {ct: d[3], id: d[4].toNumber()},
                    totalFee: {nonce: d[5].toNumber(), amount: d[6].toNumber()}
                })
            ),
            null, 2
        )
    );

    callback();
};
