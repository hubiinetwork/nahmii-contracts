// cd node_modules/nahmii-contract-abstractions-ropsten
//
// cat > script.js << EOF

const fs = require('fs').promises;
const {Wallet, Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);
const helpers = require('../common/helpers.js');

const DriipSettlementChallengeState = artifacts.require('DriipSettlementChallengeState');
const DriipSettlementState = artifacts.require('DriipSettlementState');
const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');
const NullSettlementState = artifacts.require('NullSettlementState');

async function parseJSONFromFile(file) {
    return JSON.parse(await fs.readFile(file));
}

const address0 = '0x0000000000000000000000000000000000000000';

module.exports = async (callback) => {
    // const address = '%eth.testnet.account%';
    // const password = '%eth.testnet.secret%';
    //
    // await web3.personal.unlockAccount(address, password, 600);

    // const stateDir = '../nahmii-contract-state/import';
    const stateDir = 'state/import';

    const signer = new Wallet('0xf6561b9249c9091d8e4169adef713aa669700e2327eb7e5ccaac93b990ad7d3d', provider);

    try {
        const deployer = helpers.parseDeployerArg();
        const revenueFundAddress = helpers.parseAddressArg('revenue-fund');

        // #### DriipSettlementChallengeState ####

        console.log('\nDriipSettlementChallengeState');

        const web3DriipSettlementChallengeState = await DriipSettlementChallengeState.deployed();
        const ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, DriipSettlementChallengeState.abi, signer);

        await ethersDriipSettlementChallengeState.setUpgradeAgent(deployer);

        const dscProposals = await parseJSONFromFile(`${stateDir}/DriipSettlementChallengeState/proposals.json`);
        console.log(`> Upgrading ${dscProposals.length} proposal entries`);
        for (let proposal of dscProposals)
            await ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6});

        await ethersDriipSettlementChallengeState.freezeUpgrades();

        // ### NullSettlementChallengeState ####

        console.log('\nNullSettlementChallengeState');

        const web3NullSettlementChallengeState = await NullSettlementChallengeState.deployed();
        const ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, NullSettlementChallengeState.abi, signer);

        await ethersNullSettlementChallengeState.setUpgradeAgent(deployer);

        const nscProposals = await parseJSONFromFile(`${stateDir}/NullSettlementChallengeState/proposals.json`);
        console.log(`> Upgrading ${nscProposals.length} proposal entries`);
        for (let proposal of nscProposals)
            await ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6});

        await ethersNullSettlementChallengeState.freezeUpgrades();

        // #### DriipSettlementState ####

        console.log('\nDriipSettlementState');

        const web3DriipSettlementState = await DriipSettlementState.deployed();
        const ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, signer);

        await ethersDriipSettlementState.setUpgradeAgent(deployer);

        await ethersDriipSettlementState.registerService(deployer);
        await ethersDriipSettlementState.enableServiceAction(deployer, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());
        await ethersDriipSettlementState.enableServiceAction(deployer, await ethersDriipSettlementState.ADD_SETTLED_AMOUNT_ACTION());
        await ethersDriipSettlementState.enableServiceAction(deployer, await ethersDriipSettlementState.SET_TOTAL_FEE_ACTION());

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
                            utils.bigNumberify(blockNumber)
                        );

        const totalFeesMap = await parseJSONFromFile(`${stateDir}/DriipSettlementState/totalFeesMap.json`);
        console.log(`> Upgrading ${Object.getOwnPropertyNames(totalFeesMap).length} total fees entries`);
        for (let wallet in totalFeesMap)
            for (let currencyCt in totalFeesMap[wallet])
                for (let currencyId in totalFeesMap[wallet][currencyCt])
                    await ethersDriipSettlementState.setTotalFee(
                        wallet, revenueFundAddress, address0,
                        {
                            ct: currencyCt,
                            id: utils.bigNumberify(currencyId)
                        },
                        {
                            nonce: utils.bigNumberify(totalFeesMap[wallet][currencyCt][currencyId].nonce),
                            amount: utils.bigNumberify(totalFeesMap[wallet][currencyCt][currencyId].amount)
                        }
                    );

        const driipSettlements = await parseJSONFromFile(`${stateDir}/DriipSettlementState/settlements.json`);
        console.log(`> Upgrading ${nscProposals.length} settlement entries`);
        for (let driipSettlement of driipSettlements)
            await ethersDriipSettlementState.upgradeSettlement(driipSettlement, {gasLimit: 1e6});

        await ethersDriipSettlementState.disableServiceAction(deployer, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());
        await ethersDriipSettlementState.disableServiceAction(deployer, await ethersDriipSettlementState.ADD_SETTLED_AMOUNT_ACTION());
        await ethersDriipSettlementState.disableServiceAction(deployer, await ethersDriipSettlementState.SET_TOTAL_FEE_ACTION());
        await ethersDriipSettlementState.deregisterService(deployer);

        await ethersDriipSettlementState.freezeUpgrades();

        // #### NullSettlementState ####

        console.log('\nNullSettlementState');

        const web3NullSettlementState = await NullSettlementState.deployed();
        const ethersNullSettlementState = new Contract(web3NullSettlementState.address, NullSettlementState.abi, signer);

        await ethersNullSettlementState.registerService(deployer);
        await ethersNullSettlementState.enableServiceAction(deployer, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());

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
                    );

        await ethersNullSettlementState.disableServiceAction(deployer, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());
        await ethersNullSettlementState.deregisterService(deployer);

        callback();
    } catch (e) {
        callback(e);
    } finally {
        // await web3.personal.lockAccount(address);
    }
};
// EOF