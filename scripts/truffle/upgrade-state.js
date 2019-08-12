// cd node_modules/nahmii-contract-abstractions
//
// cat > script.js << EOF

const fs = require('fs').promises;
const {Wallet, Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);

const DriipSettlementChallengeState = artifacts.require('DriipSettlementChallengeState');
const DriipSettlementState = artifacts.require('DriipSettlementState');
const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');
const NullSettlementState = artifacts.require('NullSettlementState');
const RevenueFund1 = artifacts.require('RevenueFund1');

async function parseJSONFromFile(file) {
    return JSON.parse(await fs.readFile(file));
}

const address0 = '0x0000000000000000000000000000000000000000';

function bigNumberifyProposal(proposal) {
    proposal.amounts.cumulativeTransfer = utils.bigNumberify(proposal.amounts.cumulativeTransfer);
    proposal.amounts.stage = utils.bigNumberify(proposal.amounts.stage);
    proposal.amounts.targetBalance = utils.bigNumberify(proposal.amounts.targetBalance);
    return proposal;
}

module.exports = async (callback) => {

    const stateDir = '../nahmii-contract-state/import';
    // const stateDir = 'state/import';

    const upgradeAgent = Wallet.fromMnemonic(process.env.UPGRADEAGENT_MNEMONIC)
        .connect(provider);

    try {
        const web3RevenueFund1 = await RevenueFund1.deployed();

        // #### DriipSettlementChallengeState ####

        console.log('\nUpgrading DriipSettlementChallengeState...');

        const web3DriipSettlementChallengeState = await DriipSettlementChallengeState.deployed();
        const ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, DriipSettlementChallengeState.abi, upgradeAgent);

        await ethersDriipSettlementChallengeState.setUpgradeAgent(upgradeAgent.address);

        const dscProposals = await parseJSONFromFile(`${stateDir}/DriipSettlementChallengeState/proposals.json`);
        console.log(`> Upgrading ${dscProposals.length} proposal entries`);
        for (let proposal of dscProposals.map(bigNumberifyProposal))
            await ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 5e6});

        await ethersDriipSettlementChallengeState.freezeUpgrades();

        console.log('> Done');

        // ### NullSettlementChallengeState ####

        console.log('\nUpgrading NullSettlementChallengeState...');

        const web3NullSettlementChallengeState = await NullSettlementChallengeState.deployed();
        const ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, NullSettlementChallengeState.abi, upgradeAgent);

        await ethersNullSettlementChallengeState.setUpgradeAgent(upgradeAgent.address);

        const nscProposals = await parseJSONFromFile(`${stateDir}/NullSettlementChallengeState/proposals.json`);
        console.log(`> Upgrading ${nscProposals.length} proposal entries`);
        for (let proposal of nscProposals.map(bigNumberifyProposal))
            await ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 5e6});

        await ethersNullSettlementChallengeState.freezeUpgrades();

        console.log('> Done');

        // #### DriipSettlementState ####

        console.log('\nUpgrading DriipSettlementState...');

        const web3DriipSettlementState = await DriipSettlementState.deployed();
        const ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, upgradeAgent);

        await ethersDriipSettlementState.setUpgradeAgent(upgradeAgent.address);

        let walletCurrencyMaxNonce = await parseJSONFromFile(`${stateDir}/DriipSettlementState/walletCurrencyMaxNonce.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(walletCurrencyMaxNonce).length} max nonce by wallet and currency entries`);
        for (let wallet in walletCurrencyMaxNonce)
            for (let currencyCt in walletCurrencyMaxNonce[wallet])
                for (let currencyId in walletCurrencyMaxNonce[wallet][currencyCt])
                    await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                        wallet,
                        {
                            ct: currencyCt,
                            id: utils.bigNumberify(currencyId)
                        },
                        utils.bigNumberify(walletCurrencyMaxNonce[wallet][currencyCt][currencyId]),
                        {gasLimit: 5e6}
                    );

        const walletCurrencyBlockNumberSettledAmount = await parseJSONFromFile(`${stateDir}/DriipSettlementState/walletCurrencyBlockNumberSettledAmount.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(walletCurrencyBlockNumberSettledAmount).length} settled amounts by wallet and currency entries`);
        for (let wallet in walletCurrencyBlockNumberSettledAmount)
            for (let currencyCt in walletCurrencyBlockNumberSettledAmount[wallet])
                for (let currencyId in walletCurrencyBlockNumberSettledAmount[wallet][currencyCt])
                    for (let blockNumber in walletCurrencyBlockNumberSettledAmount[wallet][currencyCt][currencyId])
                        await ethersDriipSettlementState.upgradeSettledAmount(
                            wallet,
                            utils.bigNumberify(walletCurrencyBlockNumberSettledAmount[wallet][currencyCt][currencyId][blockNumber]),
                            {
                                ct: currencyCt,
                                id: utils.bigNumberify(currencyId)
                            },
                            utils.bigNumberify(blockNumber),
                            {gasLimit: 5e6}
                        );

        const totalFeesMap = await parseJSONFromFile(`${stateDir}/DriipSettlementState/totalFeesMap.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(totalFeesMap).length} total fees entries`);
        for (let wallet in totalFeesMap)
            for (let currencyCt in totalFeesMap[wallet])
                for (let currencyId in totalFeesMap[wallet][currencyCt])
                    await ethersDriipSettlementState.setTotalFee(
                        wallet, web3RevenueFund1.address, address0,
                        {
                            ct: currencyCt,
                            id: utils.bigNumberify(currencyId)
                        },
                        {
                            nonce: utils.bigNumberify(totalFeesMap[wallet][currencyCt][currencyId].nonce),
                            amount: utils.bigNumberify(totalFeesMap[wallet][currencyCt][currencyId].amount)
                        },
                        {gasLimit: 5e6}
                    );

        const driipSettlements = await parseJSONFromFile(`${stateDir}/DriipSettlementState/settlements.json`);
        console.log(`> Upgrading ${driipSettlements.length} settlement entries`);
        for (let driipSettlement of driipSettlements)
            await ethersDriipSettlementState.upgradeSettlement(driipSettlement, {gasLimit: 5e6});

        await ethersDriipSettlementState.freezeUpgrades();

        console.log('> Done');

        // #### NullSettlementState ####

        console.log('\nUpgrading NullSettlementState...');

        const web3NullSettlementState = await NullSettlementState.deployed();
        const ethersNullSettlementState = new Contract(web3NullSettlementState.address, NullSettlementState.abi, upgradeAgent);

        walletCurrencyMaxNonce = await parseJSONFromFile(`${stateDir}/NullSettlementState/walletCurrencyMaxNonce.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(walletCurrencyMaxNonce).length} max nonce by wallet and currency entries`);
        for (let wallet in walletCurrencyMaxNonce)
            for (let currencyCt in walletCurrencyMaxNonce[wallet])
                for (let currencyId in walletCurrencyMaxNonce[wallet][currencyCt])
                    await ethersNullSettlementState.setMaxNonceByWalletAndCurrency(
                        wallet,
                        {
                            ct: currencyCt,
                            id: utils.bigNumberify(currencyId)
                        },
                        utils.bigNumberify(walletCurrencyMaxNonce[wallet][currencyCt][currencyId]),
                        {gasLimit: 5e6}
                    );

        console.log('> Done');

        callback();
    } catch (e) {
        callback(e);
    }
};
// EOF
//
// cat script.js
