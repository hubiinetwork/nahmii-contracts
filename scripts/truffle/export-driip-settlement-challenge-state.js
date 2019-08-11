/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_driip_settlement_challenge_state');

const DriipSettlementChallengeState = artifacts.require('DriipSettlementChallengeState');

let web3DriipSettlementChallengeState, ethersDriipSettlementChallengeState;
(async function () {
    web3DriipSettlementChallengeState = await DriipSettlementChallengeState.deployed();
    ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, DriipSettlementChallengeState.abi, provider);
})();

const outDir = 'state/export/DriipSettlementChallengeState';
const fromBlock = 0;

// const coder = new utils.AbiCoder();
const iface = new utils.Interface(DriipSettlementChallengeState.abi);

async function exportProposals() {
    const proposalsCount = (await ethersDriipSettlementChallengeState.proposalsCount()).toNumber();
    debug(`# proposals: ${proposalsCount}`);

    let proposals = [];
    for (let i = 0; i < proposalsCount; i++)
        proposals.push(await ethersDriipSettlementChallengeState.proposals(i));

    proposals = proposals.map(
        d => ({
            wallet: d.wallet,
            nonce: d.nonce.toNumber(),
            referenceBlockNumber: d.referenceBlockNumber.toNumber(),
            definitionBlockNumber: d.definitionBlockNumber.toNumber(),
            expirationTime: d.expirationTime.toNumber(),
            status: d.status,
            amounts: {
                cumulativeTransfer: d.amounts.cumulativeTransfer.toString(),
                stage: d.amounts.stage.toString(),
                targetBalance: d.amounts.targetBalance.toString()
            },
            currency: {
                ct: d.currency.ct,
                id: d.currency.id.toNumber()
            },
            challenged: {
                kind: d.challenged.kind,
                hash: d.challenged.hash
            },
            walletInitiated: d.walletInitiated,
            terminated: d.terminated,
            disqualification: {
                challenger: d.disqualification.challenger,
                nonce: d.disqualification.nonce.toNumber(),
                blockNumber: d.disqualification.blockNumber.toNumber(),
                candidate: {
                    kind: d.disqualification.candidate.kind,
                    hash: d.disqualification.candidate.hash
                }
            }
        })
    );

    await fs.writeFile(
        `${outDir}/proposals.json`,
        JSON.stringify(
            proposals,
            null, 2
        )
    );
}

async function exportInitiatedProposals() {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementChallengeState.interface.events.InitiateProposalEvent.topic],
        fromBlock,
        address: ethersDriipSettlementChallengeState.address
    });
    debug(`# InitiateProposalEvent: ${logs.length}`);

    let proposals = logs.map(
        log => {
            const d = iface.parseLog(log).values;
            return {
                wallet: d.wallet,
                nonce: d.nonce.toNumber(),
                cumulativeTransferAmount: d.cumulativeTransferAmount.toString(),
                stageAmount: d.stageAmount.toString(),
                targetBalanceAmount: d.targetBalanceAmount.toString(),
                currency: {ct: d.currency[0], id: d.currency[1].toNumber()},
                blockNumber: d.blockNumber.toNumber(),
                walletInitiated: d.walletInitiated,
                challengedHash: d.challengedHash,
                challengedKind: d.challengedKind
            };
        }
    );

    const proposalsByWallet = new Map();
    proposals.reduce((map, p) => {
        if (!map.has(p.wallet))
            map.set(p.wallet, []);
        map.get(p.wallet).push(p);
        return map;
    }, proposalsByWallet);

    for (let p of proposalsByWallet[Symbol.iterator]())
        console.log(p);

    await fs.writeFile(
        `${outDir}/initiated-proposals.json`,
        JSON.stringify(
            proposals.sort((p1, p2) => p1.blockNumber - p2.blockNumber),
            null, 2
        )
    );
}

async function exportTerminatedProposals() {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementChallengeState.interface.events.TerminateProposalEvent.topic],
        fromBlock,
        address: ethersDriipSettlementChallengeState.address
    });
    debug(`# TerminateProposalEvent: ${logs.length}`);

    let proposals = logs.map(
        log => {
            const d = iface.parseLog(log).values;
            return {
                wallet: d.wallet,
                nonce: d.nonce.toNumber(),
                cumulativeTransferAmount: d.cumulativeTransferAmount.toString(),
                stageAmount: d.stageAmount.toString(),
                targetBalanceAmount: d.targetBalanceAmount.toString(),
                currency: {ct: d.currency[0], id: d.currency[1].toNumber()},
                blockNumber: d.blockNumber.toNumber(),
                walletInitiated: d.walletInitiated,
                challengedHash: d.challengedHash,
                challengedKind: d.challengedKind
            };
        }
    );

    await fs.writeFile(
        `${outDir}/terminated-proposals.json`,
        JSON.stringify(
            proposals.sort((p1, p2) => p1.blockNumber - p2.blockNumber),
            null, 2
        )
    );
}

async function exportRemovedProposals() {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementChallengeState.interface.events.RemoveProposalEvent.topic],
        fromBlock,
        address: ethersDriipSettlementChallengeState.address
    });
    debug(`# RemoveProposalEvent: ${logs.length}`);

    let proposals = logs.map(
        log => {
            const d = iface.parseLog(log).values;
            return {
                wallet: d.wallet,
                nonce: d.nonce.toNumber(),
                cumulativeTransferAmount: d.cumulativeTransferAmount.toString(),
                stageAmount: d.stageAmount.toString(),
                targetBalanceAmount: d.targetBalanceAmount.toString(),
                currency: {ct: d.currency[0], id: d.currency[1].toNumber()},
                blockNumber: d.blockNumber.toNumber(),
                walletInitiated: d.walletInitiated,
                challengedHash: d.challengedHash,
                challengedKind: d.challengedKind
            };
        }
    );

    await fs.writeFile(
        `${outDir}/removed-proposals.json`,
        JSON.stringify(
            proposals.sort((p1, p2) => p1.blockNumber - p2.blockNumber),
            null, 2
        )
    );
}

async function exportDisqualifiedProposals() {
    const logs = await provider.getLogs({
        topics: [ethersDriipSettlementChallengeState.interface.events.DisqualifyProposalEvent.topic],
        fromBlock,
        address: ethersDriipSettlementChallengeState.address
    });
    debug(`# DisqualifyProposalEvent: ${logs.length}`);

    let proposals = logs.map(
        log => {
            const d = iface.parseLog(log).values;
            return {
                wallet: d.wallet,
                nonce: d.nonce.toNumber(),
                cumulativeTransferAmount: d.cumulativeTransferAmount.toString(),
                stageAmount: d.stageAmount.toString(),
                targetBalanceAmount: d.targetBalanceAmount.toString(),
                currency: {ct: d.currency[0], id: d.currency[1].toNumber()},
                blockNumber: d.blockNumber.toNumber(),
                walletInitiated: d.walletInitiated,
                challengedHash: d.challengedHash,
                challengedKind: d.challengedKind
            };
        }
    );

    await fs.writeFile(
        `${outDir}/disqualified-proposals.json`,
        JSON.stringify(
            proposals.sort((p1, p2) => p1.blockNumber - p2.blockNumber),
            null, 2
        )
    );
}

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        await fs.mkdir(outDir, {recursive: true});

        // Proposals
        await exportProposals();

        // // Initiated proposals
        // await exportInitiatedProposals();
        //
        // // Terminated proposals
        // await exportTerminatedProposals();
        //
        // // Removed proposals
        // await exportRemovedProposals();
        //
        // // Disqualified proposals
        // await exportDisqualifiedProposals();

    } catch (e) {
        callback(e);
    }

    callback();
};
