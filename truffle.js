const HDWalletProvider = require('@truffle/hdwallet-provider');
const keythereum = require('keythereum');
const path = require('path');
const findUp = require('find-up');

module.exports = {
    networks: {
        'develop': {
            host: 'localhost',
            port: 9545,
            network_id: '*',
            gas: 8000000
        },
        'development': {
            host: 'localhost',
            port: 8545,
            network_id: '*',
            gas: 8000000
        },
        'ganache': {
            host: 'localhost',
            port: 7545,
            network_id: '*',
            gas: 8000000
        },
        'ganache-cli': {
            host: 'localhost',
            port: 8545,
            network_id: '*',
            gas: 8000000
        },
        'mainnet': {
            provider: () => {
                const dataDir = path.dirname(findUp.sync('keystore', {type: 'directory'}));
                const keyObject = keythereum.importFromFile(process.env.ETH_MAINNET_ACCOUNT, dataDir);
                const privateKey = keythereum.recover(process.env.ETH_MAINNET_SECRET, keyObject).toString('hex');
                return new HDWalletProvider(privateKey, 'https://ethereum.hubii.com')
            },
            network_id: '1',
            gas: 8000000
        },
        'mainnet-infura': {
            provider: () => {
                const dataDir = path.dirname(findUp.sync('keystore', {type: 'directory'}));
                const keyObject = keythereum.importFromFile(process.env.ETH_MAINNET_ACCOUNT, dataDir);
                const privateKey = keythereum.recover(process.env.ETH_MAINNET_SECRET, keyObject).toString('hex');
                return new HDWalletProvider(privateKey, 'https://mainnet.infura.io/v3/36deff216fd744b9bfba9f884df9fdc3')
            },
            network_id: '1',
            gas: 8000000
        },
        'ropsten': {
            provider: () => {
                const dataDir = path.dirname(findUp.sync('keystore', {type: 'directory'}));
                const keyObject = keythereum.importFromFile(process.env.ETH_TESTNET_ACCOUNT, dataDir);
                const privateKey = keythereum.recover(process.env.ETH_TESTNET_SECRET, keyObject).toString('hex');
                return new HDWalletProvider(privateKey, 'https://geth-ropsten.dev.hubii.net')
            },
            network_id: '3',
            gas: 8000000
        },
        'ropsten-infura': {
            provider: () => {
                const dataDir = path.dirname(findUp.sync('keystore', {type: 'directory'}));
                const keyObject = keythereum.importFromFile(process.env.ETH_TESTNET_ACCOUNT, dataDir);
                const privateKey = keythereum.recover(process.env.ETH_TESTNET_SECRET, keyObject).toString('hex');
                return new HDWalletProvider(privateKey, 'https://ropsten.infura.io/v3/36deff216fd744b9bfba9f884df9fdc3')
            },
            network_id: '3',
            gas: 8000000
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 0
        }
    },
    mocha: {
        reporter: process.env.MOCHA_REPORTER || 'spec'
    }
};
