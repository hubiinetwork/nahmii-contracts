/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_driip_settlement_dispute_by_payment');

const DriipSettlementDisputeByPayment = artifacts.require('DriipSettlementDisputeByPayment');

let web3DriipSettlementDisputeByPayment, ethersDriipSettlementDisputeByPayment;
(async function () {
    web3DriipSettlementDisputeByPayment = await DriipSettlementDisputeByPayment.deployed();
    ethersDriipSettlementDisputeByPayment = new Contract(web3DriipSettlementDisputeByPayment.address, DriipSettlementDisputeByPayment.abi, provider);
})();

const outDir = 'state/DriipSettlementDisputeByPayment';
const fromBlock = 0;

// const coder = new utils.AbiCoder();
const iface = new utils.Interface(DriipSettlementDisputeByPayment.abi);

async function exportChallengeByPayment() {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementDisputeByPayment.interface.events.ChallengeByPaymentEvent.topic],
        fromBlock,
        address: ethersDriipSettlementDisputeByPayment.address
    });
    debug(`# ChallengeByPaymentEvent: ${logs.length}`);

    // await fs.writeFile(
    //     `${outDir}/challenge-by-payment.json`,
    //     JSON.stringify(
    //         proposals.sort((p1, p2) => p1.blockNumber - p2.blockNumber),
    //         null, 2
    //     )
    // );
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        await fs.mkdir(outDir, {recursive: true});

        // Challenge by payment
        await exportChallengeByPayment();

    } catch (e) {
        callback(e);
    }

    callback();
};
