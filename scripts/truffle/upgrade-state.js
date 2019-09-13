// cd node_modules/nahmii-contract-abstractions
//
// cat > script.js << EOF

const fs = require('fs');
const {Wallet, Contract, utils, constants, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);

const DriipSettlementChallengeState = artifacts.require('DriipSettlementChallengeState');
const DriipSettlementState = artifacts.require('DriipSettlementState');
const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');
const NullSettlementState = artifacts.require('NullSettlementState');
const RevenueFund1 = artifacts.require('RevenueFund1');

async function parseJSONFromFile(file) {
    return JSON.parse(fs.readFileSync(file));
}

function bigNumberifyProposal(proposal) {
    proposal.amounts.cumulativeTransfer = utils.bigNumberify(proposal.amounts.cumulativeTransfer);
    proposal.amounts.stage = utils.bigNumberify(proposal.amounts.stage);
    proposal.amounts.targetBalance = utils.bigNumberify(proposal.amounts.targetBalance);
    return proposal;
}

function confirm(tx, timeout = 600) {
    return Promise.retry(() => {
        return deferredIsNotNull(provider.getTransactionReceipt(tx.hash));
    }, Math.ceil(timeout), 1000)
        .then(result => {
            if (result.status === 0) throw new Error('Transaction failed');
            return result;
        });
}

function deferredIsNotNull(promise) {
    return new Promise((resolve, reject) => {
        promise.then(res => {
            if (res !== null)
                resolve(res);
            else
                reject();
        });
    });
}

Promise.retry = function (attemptFn, times, delay) {
    return new Promise(function (resolve, reject) {
        let error;

        function attempt() {
            if (!times)
                return reject(error);

            attemptFn()
                .then(resolve)
                .catch(function (e) {
                    times--;
                    error = e;
                    setTimeout(function () {
                        attempt();
                    }, delay);
                });
        }

        attempt();
    });
};

module.exports = async (callback) => {

    try {
        const upgradeAgent = Wallet.fromMnemonic(process.env.UPGRADEAGENT_MNEMONIC)
            .connect(provider);
        const stateImportDir = process.env.STATE_IMPORT_DIR;
        const gasPrice = utils.bigNumberify(process.env.GAS_PRICE);

        const web3RevenueFund1 = await RevenueFund1.deployed();

        // #### DriipSettlementChallengeState ####

        console.log('Upgrading DriipSettlementChallengeState...');

        const web3DriipSettlementChallengeState = await DriipSettlementChallengeState.deployed();
        const ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, DriipSettlementChallengeState.abi, upgradeAgent);

        await confirm(await ethersDriipSettlementChallengeState.setUpgradeAgent(upgradeAgent.address, {gasPrice}));

        const dscProposals = await parseJSONFromFile(`${stateImportDir}/DriipSettlementChallengeState/proposals.json`);
        console.log(`> Upgrading ${dscProposals.length} proposal entries`);
        for (let proposal of dscProposals.map(bigNumberifyProposal))
            await confirm(await ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasPrice, gasLimit: 5e6}));

        console.log('> Done');

        // ### NullSettlementChallengeState ####

        console.log('Upgrading NullSettlementChallengeState...');

        const web3NullSettlementChallengeState = await NullSettlementChallengeState.deployed();
        const ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, NullSettlementChallengeState.abi, upgradeAgent);

        await confirm(await ethersNullSettlementChallengeState.setUpgradeAgent(upgradeAgent.address, {gasPrice}));

        const nscProposals = await parseJSONFromFile(`${stateImportDir}/NullSettlementChallengeState/proposals.json`);
        console.log(`> Upgrading ${nscProposals.length} proposal entries`);
        for (let proposal of nscProposals.map(bigNumberifyProposal))
            await confirm(await ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasPrice, gasLimit: 5e6}));

        console.log('> Done');

        // #### DriipSettlementState ####

        console.log('Upgrading DriipSettlementState...');

        const web3DriipSettlementState = await DriipSettlementState.deployed();
        const ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, upgradeAgent);

        await confirm(await ethersDriipSettlementState.setUpgradeAgent(upgradeAgent.address, {gasPrice}));

        let walletCurrencyMaxNonce = await parseJSONFromFile(`${stateImportDir}/DriipSettlementState/walletCurrencyMaxNonce.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(walletCurrencyMaxNonce).length} max nonce by wallet and currency entries`);
        for (let wallet in walletCurrencyMaxNonce)
            for (let currencyCt in walletCurrencyMaxNonce[wallet])
                for (let currencyId in walletCurrencyMaxNonce[wallet][currencyCt])
                    await confirm(await ethersDriipSettlementState.setMaxNonceByWalletAndCurrency(
                        wallet,
                        {
                            ct: currencyCt,
                            id: utils.bigNumberify(currencyId)
                        },
                        utils.bigNumberify(walletCurrencyMaxNonce[wallet][currencyCt][currencyId]),
                        {gasPrice, gasLimit: 5e6}
                    ));

        const walletCurrencyBlockNumberSettledAmount = await parseJSONFromFile(`${stateImportDir}/DriipSettlementState/walletCurrencyBlockNumberSettledAmount.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(walletCurrencyBlockNumberSettledAmount).length} settled amounts by wallet and currency entries`);
        for (let wallet in walletCurrencyBlockNumberSettledAmount)
            for (let currencyCt in walletCurrencyBlockNumberSettledAmount[wallet])
                for (let currencyId in walletCurrencyBlockNumberSettledAmount[wallet][currencyCt])
                    for (let blockNumber in walletCurrencyBlockNumberSettledAmount[wallet][currencyCt][currencyId])
                        await confirm(await ethersDriipSettlementState.upgradeSettledAmount(
                            wallet,
                            utils.bigNumberify(walletCurrencyBlockNumberSettledAmount[wallet][currencyCt][currencyId][blockNumber]),
                            {
                                ct: currencyCt,
                                id: utils.bigNumberify(currencyId)
                            },
                            utils.bigNumberify(blockNumber),
                            {gasPrice, gasLimit: 5e6}
                        ));

        const walletCurrencySettledBlockNumbers = await parseJSONFromFile(`${stateImportDir}/DriipSettlementState/walletCurrencySettledBlockNumbers.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(walletCurrencySettledBlockNumbers).length} settled block numbers by wallet and currency entries`);
        for (let wallet in walletCurrencySettledBlockNumbers)
            for (let currencyCt in walletCurrencySettledBlockNumbers[wallet])
                for (let currencyId in walletCurrencySettledBlockNumbers[wallet][currencyCt]) {
                    const settledBlockNumbers = walletCurrencySettledBlockNumbers[wallet][currencyCt][currencyId];
                    await confirm(await ethersDriipSettlementState.upgradeSettledAmount(
                        wallet,
                        constants.Zero,
                        {
                            ct: currencyCt,
                            id: utils.bigNumberify(currencyId)
                        },
                        utils.bigNumberify(settledBlockNumbers[settledBlockNumbers.length - 1]),
                        {gasPrice, gasLimit: 5e6}
                    ));
                }

        const totalFeesMap = await parseJSONFromFile(`${stateImportDir}/DriipSettlementState/totalFeesMap.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(totalFeesMap).length} total fees entries`);
        for (let wallet in totalFeesMap)
            for (let currencyCt in totalFeesMap[wallet])
                for (let currencyId in totalFeesMap[wallet][currencyCt])
                    await confirm(await ethersDriipSettlementState.setTotalFee(
                        wallet, web3RevenueFund1.address, constants.AddressZero,
                        {
                            ct: currencyCt,
                            id: utils.bigNumberify(currencyId)
                        },
                        {
                            nonce: utils.bigNumberify(totalFeesMap[wallet][currencyCt][currencyId].nonce),
                            amount: utils.bigNumberify(totalFeesMap[wallet][currencyCt][currencyId].amount)
                        },
                        {gasPrice, gasLimit: 5e6}
                    ));

        const driipSettlements = await parseJSONFromFile(`${stateImportDir}/DriipSettlementState/settlements.json`);
        console.log(`> Upgrading ${driipSettlements.length} settlement entries`);
        for (let driipSettlement of driipSettlements)
            await confirm(await ethersDriipSettlementState.upgradeSettlement(driipSettlement, {gasPrice, gasLimit: 5e6}));

        console.log('> Done');

        // #### NullSettlementState ####

        console.log('Upgrading NullSettlementState...');

        const web3NullSettlementState = await NullSettlementState.deployed();
        const ethersNullSettlementState = new Contract(web3NullSettlementState.address, NullSettlementState.abi, upgradeAgent);

        walletCurrencyMaxNonce = await parseJSONFromFile(`${stateImportDir}/NullSettlementState/walletCurrencyMaxNonce.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(walletCurrencyMaxNonce).length} max nonce by wallet and currency entries`);
        for (let wallet in walletCurrencyMaxNonce)
            for (let currencyCt in walletCurrencyMaxNonce[wallet])
                for (let currencyId in walletCurrencyMaxNonce[wallet][currencyCt])
                    await confirm(await ethersNullSettlementState.setMaxNonceByWalletAndCurrency(
                        wallet,
                        {
                            ct: currencyCt,
                            id: utils.bigNumberify(currencyId)
                        },
                        utils.bigNumberify(walletCurrencyMaxNonce[wallet][currencyCt][currencyId]),
                        {gasPrice, gasLimit: 5e6}
                    ));

        console.log('> Done');

        callback();
    } catch (e) {
        callback(e);
    }
};
// EOF
//
// cat script.js
