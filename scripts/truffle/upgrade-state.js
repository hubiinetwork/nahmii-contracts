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

    // const stateDir = '../nahmii-contract-state/import';
    const stateDir = 'state/import';

    const upgradeAgent = Wallet.fromMnemonic('woman year canvas mirror arrest leopard bounce point identify roof water frost')
        .connect(provider);

    try {
        const revenueFundAddress = helpers.parseAddressArg('revenue-fund');

        // #### DriipSettlementChallengeState ####

        console.log('\nUpgrading DriipSettlementChallengeState...');

        const web3DriipSettlementChallengeState = await DriipSettlementChallengeState.deployed();
        const ethersDriipSettlementChallengeState = new Contract(web3DriipSettlementChallengeState.address, DriipSettlementChallengeState.abi, upgradeAgent);

        await ethersDriipSettlementChallengeState.setUpgradeAgent(upgradeAgent.address);

        const dscProposals = await parseJSONFromFile(`${stateDir}/DriipSettlementChallengeState/proposals.json`);
        console.log(`> Upgrading ${dscProposals.length} proposal entries`);
        for (let proposal of dscProposals)
            await ethersDriipSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6});

        // await ethersDriipSettlementChallengeState.freezeUpgrades();

        console.log('done');

        // ### NullSettlementChallengeState ####

        console.log('\nUpgrading NullSettlementChallengeState...');

        const web3NullSettlementChallengeState = await NullSettlementChallengeState.deployed();
        const ethersNullSettlementChallengeState = new Contract(web3NullSettlementChallengeState.address, NullSettlementChallengeState.abi, upgradeAgent);

        await ethersNullSettlementChallengeState.setUpgradeAgent(upgradeAgent.address);

        const nscProposals = await parseJSONFromFile(`${stateDir}/NullSettlementChallengeState/proposals.json`);
        console.log(`> Upgrading ${nscProposals.length} proposal entries`);
        for (let proposal of nscProposals)
            await ethersNullSettlementChallengeState.upgradeProposal(proposal, {gasLimit: 1e6});

        // await ethersNullSettlementChallengeState.freezeUpgrades();

        console.log('done');

        // #### DriipSettlementState ####

        console.log('\nUpgrading DriipSettlementState...');

        const web3DriipSettlementState = await DriipSettlementState.deployed();
        const ethersDriipSettlementState = new Contract(web3DriipSettlementState.address, DriipSettlementState.abi, upgradeAgent);

        await ethersDriipSettlementState.setUpgradeAgent(upgradeAgent.address);

        // await ethersDriipSettlementState.registerService(upgradeAgent.address);
        // await ethersDriipSettlementState.enableServiceAction(upgradeAgent.address, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());
        // await ethersDriipSettlementState.enableServiceAction(upgradeAgent.address, await ethersDriipSettlementState.ADD_SETTLED_AMOUNT_ACTION());
        // await ethersDriipSettlementState.enableServiceAction(upgradeAgent.address, await ethersDriipSettlementState.SET_TOTAL_FEE_ACTION());

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

        // await ethersDriipSettlementState.disableServiceAction(upgradeAgent.address, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());
        // await ethersDriipSettlementState.disableServiceAction(upgradeAgent.address, await ethersDriipSettlementState.ADD_SETTLED_AMOUNT_ACTION());
        // await ethersDriipSettlementState.disableServiceAction(upgradeAgent.address, await ethersDriipSettlementState.SET_TOTAL_FEE_ACTION());
        // await ethersDriipSettlementState.deregisterService(upgradeAgent.address);

        // await ethersDriipSettlementState.freezeUpgrades();

        console.log('done');

        // #### NullSettlementState ####

        console.log('\nUpgrading NullSettlementState...');

        const web3NullSettlementState = await NullSettlementState.deployed();
        const ethersNullSettlementState = new Contract(web3NullSettlementState.address, NullSettlementState.abi, upgradeAgent);

        // await ethersNullSettlementState.registerService(upgradeAgent.address);
        // await ethersNullSettlementState.enableServiceAction(upgradeAgent.address, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());

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

        // await ethersNullSettlementState.disableServiceAction(upgradeAgent.address, await ethersDriipSettlementState.SET_MAX_NONCE_ACTION());
        // await ethersNullSettlementState.deregisterService(upgradeAgent.address);

        console.log('done');

        callback();
    } catch (e) {
        callback(e);
    } finally {
        // await web3.personal.lockAccount(address);
    }
};
// EOF