module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 6500000
        },
        develop: {
            host: "localhost",
            port: 9545,
            network_id: "*",
            gas: 6500000
        },
        ganache: {
            host: "localhost",
            port: 7545,
            network_id: "*",
            gas: 6500000
        },
        "ganache-cli": {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 6500000
        },
        ropsten: {
            host: "geth-ropsten.ethereum",
            port: 80,
            network_id: "*",
            gas: 6500000
        },
        rinkeby: {
            host: "geth-rinkeby.ethereum",
            port: 80,
            network_id: "*",
            gas: 6500000
        },
        mainnet: {
            host: "geth-homestead.ethereum",
            port: 8545,
            network_id: "1",
            gas: 6500000
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
