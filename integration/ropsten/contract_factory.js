const {Contract, providers} = require('ethers');
const addresses = require(`../../build/addresses.json`);

const provider = new providers.InfuraProvider('ropsten', '36deff216fd744b9bfba9f884df9fdc3');

module.exports = {
    create: async (contractName, network, wallet) => {
        const {abi} = require(`../../build/contracts/${contractName}.json`);
        const contractAddress = addresses.networks[network][contractName];

        const contract = new Contract(contractAddress, abi, wallet || provider);
        return contract;
    },
    getDeployTransaction: (contractName, deployer) => {
        const {abi, bytecode, deployedBytecode} = require(`../../build/contracts/${contractName}.json`);
        return Contract.getDeployTransaction(deployedBytecode, abi, deployer);
    },
    provider
};

