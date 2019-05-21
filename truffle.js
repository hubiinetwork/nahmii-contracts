const HDWalletProvider = require("truffle-hdwallet-provider");

// For read-only interaction
const mnemonic = 'paddle envelope cage erupt lake unaware genre captain thunder spread hollow hybrid notice kangaroo wasp';

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 8000000
        },
        develop: {
            host: "localhost",
            port: 9545,
            network_id: "*",
            gas: 8000000
        },
        ganache: {
            host: "localhost",
            port: 7545,
            network_id: "*",
            gas: 100000000
        },
        "ganache-cli": {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 8000000
        },
        ropsten: {
            host: "geth-ropsten.ethereum",
            port: 80,
            network_id: "*",
            gas: 8000000
        },
        "ropsten-infura": {
            provider: function () {
                return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/36deff216fd744b9bfba9f884df9fdc3");
            },
            network_id: "*",
            gas: 8000000
        },
        rinkeby: {
            host: "geth-rinkeby.ethereum",
            port: 80,
            network_id: "*",
            gas: 8000000
        },
        mainnet: {
            host: "geth-homestead.ethereum",
            port: 80,
            network_id: "1",
            gas: 8000000
        },
        "mainnet-infura": {
            provider: function () {
                return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/36deff216fd744b9bfba9f884df9fdc3");
            },
            network_id: "*",
            gas: 8000000
        },
        "mainnet-hubii": {
            host: "ethereum.hubii.com",
            port: 8545,
            network_id: "1",
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
