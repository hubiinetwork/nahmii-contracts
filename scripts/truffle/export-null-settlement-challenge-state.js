/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const fs = require('fs').promises;
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const debug = require('debug')('export_null_settlement_challenge_state');

const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');

let web3NullSettlementChallengeState, ethersNullSettlementChallengeState;
(async function () {
    web3NullSettlementChallengeState = await NullSettlementChallengeState.deployed();
    ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, NullSettlementChallengeState.abi, provider);
})();

const outDir = 'state/export/NullSettlementChallengeState';
const fromBlock = 0;

// const coder = new utils.AbiCoder();
const iface = new utils.Interface(NullSettlementChallengeState.abi);

async function exportProposals() {
    const proposalsCount = (await ethersNullSettlementChallengeState.proposalsCount()).toNumber();
    debug(`# proposals: ${proposalsCount}`);

    let proposals = [];
    for (let i = 0; i < proposalsCount; i++)
        proposals.push(await ethersNullSettlementChallengeState.proposals(i));

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

// NOTE This script requires ethers@^4.0.0
module.exports = async (callback) => {

    try {
        await fs.mkdir(outDir, {recursive: true});

        // Proposals
        await exportProposals();

    } catch (e) {
        callback(e);
    }

    callback();
};
