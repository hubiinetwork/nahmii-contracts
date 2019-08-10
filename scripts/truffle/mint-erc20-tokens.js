/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const TestERC20 = artifacts.require('TestERC20');
const helpers = require('../common/helpers.js');
const debug = require('debug')('mint_erc20_tokens');

// A script for the minting of an mintable ERC20 token, i.e. the token
// contract supports a mint function with the following signature of ERC20Mintable
// (https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/ERC20Mintable.sol)
//
//    function mint(address to, uint256 value) public returns (bool);
//
// This script may be run as follows:
//
//    DEBUG=mint_erc20_tokens npm run exec:mint_erc20_tokens -- --network ganache --deployer 0xc31Eb6E317054A79bb5E442D686CB9b225670c1D --contract 0xfd1de38dc456112c55c3e6bc6134b2f545b91386 --beneficiary 0x97026a8157f39101aefc4A81496C161a6b1Ce46A --amount 1e24

module.exports = async (callback) => {

    const network = helpers.parseNetworkArg();
    const deployerAccount = helpers.parseDeployerArg();
    const contractAddress = helpers.parseAddressArg('contract');
    const beneficiaryAccount = helpers.parseAddressArg('beneficiary');
    const amount = helpers.parseStringArg('amount');

    if (!helpers.isTestNetwork(network))
        helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 14400);

    try {
        const instance = await TestERC20.at(contractAddress);

        if (!await instance.mint(beneficiaryAccount, amount))
            throw new Error('Unable to mint');

        debug(`Balance of beneficiary: ${(await instance.balanceOf(beneficiaryAccount)).toString()}`);

        callback();
    } catch (err) {
        callback(err);
    } finally {
        if (!helpers.isTestNetwork(network))
            helpers.lockAddress(web3, deployerAccount);
    }
};
