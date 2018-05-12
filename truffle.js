module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
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
        ganachecli: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 6000000
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 0
        }
    }
};
