// cd node_modules/nahmii-contract-abstractions-ropsten
//
// cat > script.js << EOF

const fs = require('fs').promises;
const path = require('path');
const {Contract, utils, providers} = require('ethers');
const provider = new providers.Web3Provider(web3.currentProvider);

const ClientFund = artifacts.require('ClientFund');
const BalanceTracker = artifacts.require('BalanceTracker');

async function parseJSONFromFile(file) {
    return JSON.parse(await fs.readFile(file));
}

// const stateDir = '../nahmii-contract-state';
const stateDir = 'state';

async function writeJSONToFile(data, fileName) {
    if (!data)
        return;

    await fs.mkdir(path.dirname(fileName), {recursive: true});

    return fs.writeFile(fileName, JSON.stringify(data, null, 2));
}

const bn = utils.bigNumberify;

module.exports = async (callback) => {
    try {
        const web3BalanceTracker = await BalanceTracker.deployed();
        const ethersBalanceTracker = new Contract(web3BalanceTracker.address, BalanceTracker.abi, provider);

        const state = await parseJSONFromFile(`${stateDir}/import/ClientFund/state.json`);

        const [depositedType, settledType, stagedType] = await Promise.all([
            ethersBalanceTracker.depositedBalanceType(),
            ethersBalanceTracker.settledBalanceType(),
            ethersBalanceTracker.stagedBalanceType()
        ]);

        for (let wallet in state) {
            for (let stateEntry of state[wallet]) {
                stateEntry.offChainBalanceAmounts = stateEntry.balanceAmounts;
                delete stateEntry.balanceAmounts;

                const [deposited, settled, staged] = (await Promise.all([
                    ethersBalanceTracker.get(wallet, depositedType, stateEntry.currency.ct, stateEntry.currency.id),
                    ethersBalanceTracker.get(wallet, settledType, stateEntry.currency.ct, stateEntry.currency.id),
                    ethersBalanceTracker.get(wallet, stagedType, stateEntry.currency.ct, stateEntry.currency.id),
                ])).map(d => d.toString());

                stateEntry.onChainBalanceAmounts = {deposited, settled, staged};

                stateEntry.absoluteDeltaAmounts = Object.getOwnPropertyNames(stateEntry.offChainBalanceAmounts).reduce((m, t) => {
                    m[t] = bn(stateEntry.onChainBalanceAmounts[t]).sub(
                        bn(stateEntry.offChainBalanceAmounts[t])
                    ).toString();
                    return m;
                }, {});

                // stateEntry.relativeDeltaAmounts = Object.getOwnPropertyNames(stateEntry.offChainBalanceAmounts).reduce((m, t) => {
                //     m[t] = bn(stateEntry.onChainBalanceAmounts[t]).isZero() ? '0' : bn(stateEntry.onChainBalanceAmounts[t])
                //         .sub(
                //             bn(stateEntry.offChainBalanceAmounts[t])
                //         )
                //         .mul(100)
                //         .div(bn(stateEntry.onChainBalanceAmounts[t]))
                //         .toString();
                //     return m;
                // }, {});
            }
        }

        await writeJSONToFile(state, `${stateDir}/compare/ClientFund/state.json`);

        // console.log(JSON.stringify(state, null, 2));

        callback();
    } catch (e) {
        callback(e);
    }
};
// EOF