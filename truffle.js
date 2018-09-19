module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 6000000
        },
        mainnet: {
            host: "ethereum.hubii.com",
            port: 8545,
            network_id: "1",
            gas: 6000000
        },
        develop: {
            host: "localhost",
            port: 9545,
            network_id: "*",
            gas: 6000000
        },
        ganache: {
            host: "localhost",
            port: 7545,
            network_id: "*",
            gas: 6000000
        },
        "ganache-cli": {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 6000000
        },
        "ganache-cli-for-test": {
            host: "localhost",
            port: 8456,
            network_id: "*",
            gas: 6000000
        },
        "hubii-ropsten": {
            host: "geth-ropsten.ethereum",
            port: 80,
            network_id: "*",
            gas: 6000000
        },
        "hubii-rinkeby": {
            host: "geth-rinkeby.ethereum",
            port: 80,
            network_id: "*",
            gas: 6000000
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
