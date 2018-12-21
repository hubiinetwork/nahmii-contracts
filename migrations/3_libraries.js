/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const BlockNumbCurrenciesLib = artifacts.require('BlockNumbCurrenciesLib');
const BlockNumbDisdIntsLib = artifacts.require('BlockNumbDisdIntsLib');
const BlockNumbIntsLib = artifacts.require('BlockNumbIntsLib');
const BlockNumbUintsLib = artifacts.require('BlockNumbUintsLib');
const ConstantsLib = artifacts.require('ConstantsLib');
const CurrenciesLib = artifacts.require('CurrenciesLib');
const FungibleBalanceLib = artifacts.require('FungibleBalanceLib');
const MonetaryTypesLib = artifacts.require('MonetaryTypesLib');
const NahmiiTypesLib = artifacts.require('NahmiiTypesLib');
const NonFungibleBalanceLib = artifacts.require('NonFungibleBalanceLib');
const SafeMathIntLib = artifacts.require('SafeMathIntLib');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');

const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

require('../scripts/common/promisify_web3.js')(web3);

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let ownerAccount;

        await addressStorage.load();

        // if (helpers.isResetArgPresent())
        //     addressStorage.clear();

        if (helpers.isTestNetwork(network))
            ownerAccount = accounts[0];

        else {
            ownerAccount = helpers.getOwnerAccountFromArgs();

            if (web3.eth.personal)
                web3.eth.personal.unlockAccount(ownerAccount, helpers.getPasswordFromArgs(), 7200); //120 minutes
            else
                web3.personal.unlockAccount(ownerAccount, helpers.getPasswordFromArgs(), 7200); //120 minutes
        }

        try {
            let ctl = {
                deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage,
                ownerAccount
            };

            if (helpers.isTestNetwork(network) || network.startsWith('ropsten')) {
                await execDeploy(ctl, 'BlockNumbIntsLib', '', BlockNumbIntsLib);
                await execDeploy(ctl, 'BlockNumbUintsLib', '', BlockNumbUintsLib);
                await execDeploy(ctl, 'ConstantsLib', '', ConstantsLib);
                await execDeploy(ctl, 'MonetaryTypesLib', '', MonetaryTypesLib);
                await execDeploy(ctl, 'SafeMathIntLib', '', SafeMathIntLib);
                await execDeploy(ctl, 'SafeMathUintLib', '', SafeMathUintLib);
                // await execDeploy(ctl, 'Strings', '', Strings);
                // await execDeploy(ctl, 'TxHistoryLib', '', TxHistoryLib);

                await deployer.link(ConstantsLib, [
                    BlockNumbDisdIntsLib
                ]);
                await deployer.link(MonetaryTypesLib, [
                    BlockNumbCurrenciesLib, CurrenciesLib, NahmiiTypesLib
                ]);
                await deployer.link(SafeMathIntLib, [
                    FungibleBalanceLib, BlockNumbDisdIntsLib, NonFungibleBalanceLib
                ]);
                await deployer.link(SafeMathUintLib, [
                    FungibleBalanceLib, CurrenciesLib, NonFungibleBalanceLib
                ]);

                await execDeploy(ctl, 'BlockNumbCurrenciesLib', '', BlockNumbCurrenciesLib);
                await execDeploy(ctl, 'BlockNumbDisdIntsLib', '', BlockNumbDisdIntsLib);
                await execDeploy(ctl, 'CurrenciesLib', '', CurrenciesLib);

                await deployer.link(CurrenciesLib, [
                    FungibleBalanceLib, NonFungibleBalanceLib
                ]);

                await execDeploy(ctl, 'FungibleBalanceLib', '', FungibleBalanceLib);
                await execDeploy(ctl, 'NonFungibleBalanceLib', '', NonFungibleBalanceLib);
                // await execDeploy(ctl, 'NahmiiTypesLib', '', NahmiiTypesLib);

                // await deployer.link(NahmiiTypesLib, [
                //     SettlementTypesLib
                // ]);

                // await execDeploy(ctl, 'SettlementTypesLib', '', SettlementTypesLib);

            } else if (network.startsWith('mainnet')) {
                addressStorage.set('BlockNumbDisdIntsLib', '0x92caece328a4f746c18630c6289d74a5417185b2');
                addressStorage.set('BlockNumbCurrenciesLib', '0x1285bdda4c9353bd0ae87af7e9433f9cfd7a4029');
                addressStorage.set('BlockNumbIntsLib', '0xcb1a97acac9597b9ea177348ed669667ecea9657');
                addressStorage.set('BlockNumbUintsLib', '0x412be41435959fb66540ad1d4c41bf85216a7369');
                addressStorage.set('ConstantsLib', '0x5fcf3704016b90ded3c81d75613ceab0a6a26025');
                addressStorage.set('CurrenciesLib', '0xa22d375e6e62512e0f4161604ac7a2fb2e9b456c');
                addressStorage.set('FungibleBalanceLib', '0x64dbf08fd66c408f1205e6107c60d05ab3ad872d');
                addressStorage.set('MonetaryTypesLib', '0x73b58f0d337b596e534a8385399f6bcce1f2ce0e');
                addressStorage.set('NonFungibleBalanceLib', '0x4f6f9422b8509b4df036c738f9d3e2827e29af6a');
                addressStorage.set('SafeMathIntLib', '0x2fcb98529d58669e229c453de4b4705bb6b2d414');
                addressStorage.set('SafeMathUintLib', '0x0ff948c236c8d4dfcd0168bf243314c8ff8ec967');
            }

        } finally {
            if (!helpers.isTestNetwork(network)) {
                if (web3.eth.personal)
                    web3.eth.personal.lockAccount(ownerAccount);
                else
                    web3.personal.lockAccount(ownerAccount);
            }
        }

        console.log(`Saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract, usesAccessManager) {
    let address = ctl.addressStorage.get(instanceName || contractName);

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        let instance;

        if (usesAccessManager) {
            let signerManager = ctl.addressStorage.get('SignerManager');

            instance = await ctl.deployer.deploy(contract, ctl.ownerAccount, signerManager, {from: ctl.ownerAccount});

        } else
            instance = await ctl.deployer.deploy(contract, ctl.ownerAccount, {from: ctl.ownerAccount});

        ctl.addressStorage.set(instanceName || contractName, instance.address);
    }
}

function shouldDeploy(contractName, deployFilters) {
    if (!deployFilters) {
        return true;
    }
    for (let i = 0; i < deployFilters.length; i++) {
        if (deployFilters[i].test(contractName))
            return true;
    }
    return false;
}
