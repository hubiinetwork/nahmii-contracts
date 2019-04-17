/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const BalanceTrackerLib = artifacts.require('BalanceTrackerLib');
const BlockNumbDisdIntsLib = artifacts.require('BlockNumbDisdIntsLib');
const BlockNumbFiguresLib = artifacts.require('BlockNumbFiguresLib');
const BlockNumbIntsLib = artifacts.require('BlockNumbIntsLib');
const BlockNumbReferenceCurrenciesLib = artifacts.require('BlockNumbReferenceCurrenciesLib');
const BlockNumbUintsLib = artifacts.require('BlockNumbUintsLib');
const ConstantsLib = artifacts.require('ConstantsLib');
const CurrenciesLib = artifacts.require('CurrenciesLib');
const DriipSettlementTypesLib = artifacts.require('DriipSettlementTypesLib');
const FungibleBalanceLib = artifacts.require('FungibleBalanceLib');
const MonetaryTypesLib = artifacts.require('MonetaryTypesLib');
const NahmiiTypesLib = artifacts.require('NahmiiTypesLib');
const NonFungibleBalanceLib = artifacts.require('NonFungibleBalanceLib');
const PaymentTypesLib = artifacts.require('PaymentTypesLib');
const SafeMathIntLib = artifacts.require('SafeMathIntLib');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');
const SettlementChallengeTypesLib = artifacts.require('SettlementChallengeTypesLib');
const Strings = artifacts.require('Strings');
const TradeTypesLib = artifacts.require('TradeTypesLib');
const TxHistoryLib = artifacts.require('TxHistoryLib');

const debug = require('debug')('3_libraries');
const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

require('../scripts/common/promisify_web3.js')(web3);

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let deployerAccount;

        await addressStorage.load();

        // if (helpers.isResetArgPresent())
        //     addressStorage.clear();

        if (helpers.isTestNetwork(network))
            deployerAccount = accounts[0];

        else {
            deployerAccount = helpers.parseDeployerArg();

            if (web3.eth.personal)
                await web3.eth.personal.unlockAccount(deployerAccount, helpers.parsePasswordArg(), 14400); // 4h
            else
                await web3.personal.unlockAccount(deployerAccount, helpers.parsePasswordArg(), 14400); // 4h
        }

        debug(`deployerAccount: ${deployerAccount}`);

        try {
            let ctl = {
                deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage,
                deployerAccount
            };

            if (helpers.isTestNetwork(network) || network.startsWith('ropsten')) {
                await execDeploy(ctl, 'BlockNumbIntsLib', '', BlockNumbIntsLib);
                await execDeploy(ctl, 'BlockNumbUintsLib', '', BlockNumbUintsLib);
                await execDeploy(ctl, 'ConstantsLib', '', ConstantsLib);
                await execDeploy(ctl, 'DriipSettlementTypesLib', '', DriipSettlementTypesLib);
                await execDeploy(ctl, 'MonetaryTypesLib', '', MonetaryTypesLib);
                await execDeploy(ctl, 'SafeMathIntLib', '', SafeMathIntLib);
                await execDeploy(ctl, 'SafeMathUintLib', '', SafeMathUintLib);

                await deployer.link(ConstantsLib, [
                    BlockNumbDisdIntsLib
                ]);
                await deployer.link(MonetaryTypesLib, [
                    BalanceTrackerLib,
                    BlockNumbFiguresLib,
                    BlockNumbReferenceCurrenciesLib,
                    CurrenciesLib,
                    DriipSettlementTypesLib,
                    NahmiiTypesLib,
                    PaymentTypesLib,
                    SettlementChallengeTypesLib,
                    TradeTypesLib
                ]);
                await deployer.link(SafeMathIntLib, [
                    BalanceTrackerLib,
                    BlockNumbDisdIntsLib,
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);
                await deployer.link(SafeMathUintLib, [
                    BalanceTrackerLib,
                    CurrenciesLib,
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);

                await execDeploy(ctl, 'BalanceTrackerLib', '', BalanceTrackerLib);
                await execDeploy(ctl, 'BlockNumbDisdIntsLib', '', BlockNumbDisdIntsLib);
                await execDeploy(ctl, 'BlockNumbFiguresLib', '', BlockNumbFiguresLib);
                await execDeploy(ctl, 'BlockNumbReferenceCurrenciesLib', '', BlockNumbReferenceCurrenciesLib);
                await execDeploy(ctl, 'CurrenciesLib', '', CurrenciesLib);
                await execDeploy(ctl, 'SettlementChallengeTypesLib', '', SettlementChallengeTypesLib);

                await deployer.link(CurrenciesLib, [
                    FungibleBalanceLib,
                    NonFungibleBalanceLib
                ]);

                await execDeploy(ctl, 'FungibleBalanceLib', '', FungibleBalanceLib);
                await execDeploy(ctl, 'NonFungibleBalanceLib', '', NonFungibleBalanceLib);
                await execDeploy(ctl, 'NahmiiTypesLib', '', NahmiiTypesLib);
                await execDeploy(ctl, 'Strings', '', Strings);
                await execDeploy(ctl, 'TxHistoryLib', '', TxHistoryLib);

                await deployer.link(NahmiiTypesLib, [
                    PaymentTypesLib,
                    TradeTypesLib
                ]);

                await execDeploy(ctl, 'PaymentTypesLib', '', PaymentTypesLib);
                await execDeploy(ctl, 'TradeTypesLib', '', TradeTypesLib);

            } else if (network.startsWith('mainnet')) {
                // addressStorage.set('BlockNumbCurrenciesLib', '0x1285bdda4c9353bd0ae87af7e9433f9cfd7a4029');
                addressStorage.set('BlockNumbDisdIntsLib', '0x92caece328a4f746c18630c6289d74a5417185b2');
                addressStorage.set('BlockNumbIntsLib', '0xcb1a97acac9597b9ea177348ed669667ecea9657');
                addressStorage.set('BlockNumbUintsLib', '0x412be41435959fb66540ad1d4c41bf85216a7369');
                addressStorage.set('ConstantsLib', '0x5fcf3704016b90ded3c81d75613ceab0a6a26025');
                addressStorage.set('CurrenciesLib', '0xa22d375e6e62512e0f4161604ac7a2fb2e9b456c');
                addressStorage.set('FungibleBalanceLib', '0x64dbf08fd66c408f1205e6107c60d05ab3ad872d');
                addressStorage.set('MonetaryTypesLib', '0x73b58f0d337b596e534a8385399f6bcce1f2ce0e');
                addressStorage.set('NonFungibleBalanceLib', '0x4f6f9422b8509b4df036c738f9d3e2827e29af6a');
                addressStorage.set('SafeMathIntLib', '0x2fcb98529d58669e229c453de4b4705bb6b2d414');
                addressStorage.set('SafeMathUintLib', '0x0ff948c236c8d4dfcd0168bf243314c8ff8ec967');

                const monetaryTypesLib = await MonetaryTypesLib.at(addressStorage.get('MonetaryTypesLib'));
                const safeMathIntLib = await SafeMathIntLib.at(addressStorage.get('SafeMathIntLib'));
                const safeMathUintLib = await SafeMathUintLib.at(addressStorage.get('SafeMathUintLib'));

                await deployer.link(monetaryTypesLib.constructor, [
                    BalanceTrackerLib,
                    BlockNumbFiguresLib,
                    BlockNumbReferenceCurrenciesLib,
                    DriipSettlementTypesLib,
                    NahmiiTypesLib,
                    PaymentTypesLib,
                    SettlementChallengeTypesLib
                ]);
                await deployer.link(safeMathIntLib.constructor, [
                    BalanceTrackerLib
                ]);
                await deployer.link(safeMathUintLib.constructor, [
                    BalanceTrackerLib
                ]);

                await execDeploy(ctl, 'BalanceTrackerLib', '', BalanceTrackerLib);
                await execDeploy(ctl, 'BlockNumbFiguresLib', '', BlockNumbFiguresLib);
                await execDeploy(ctl, 'BlockNumbReferenceCurrenciesLib', '', BlockNumbReferenceCurrenciesLib);
                await execDeploy(ctl, 'SettlementChallengeTypesLib', '', SettlementChallengeTypesLib);
                await execDeploy(ctl, 'NahmiiTypesLib', '', NahmiiTypesLib);
                await execDeploy(ctl, 'Strings', '', Strings);
                await execDeploy(ctl, 'TxHistoryLib', '', TxHistoryLib);

                const nahmiiTypesLib = await NahmiiTypesLib.at(addressStorage.get('NahmiiTypesLib'));

                await deployer.link(nahmiiTypesLib.constructor, [
                    PaymentTypesLib
                ]);

                await execDeploy(ctl, 'PaymentTypesLib', '', PaymentTypesLib);
            }

        } finally {
            if (!helpers.isTestNetwork(network))
                if (web3.eth.personal)
                    await web3.eth.personal.lockAccount(deployerAccount);
                else
                    await web3.personal.lockAccount(deployerAccount);
        }

        debug(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract, usesAccessManager) {
    let address = ctl.addressStorage.get(instanceName || contractName);
    let instance;

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        if (usesAccessManager) {
            let signerManager = ctl.addressStorage.get('SignerManager');

            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, signerManager, {from: ctl.deployerAccount});

        } else
            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, {from: ctl.deployerAccount});

        ctl.addressStorage.set(instanceName || contractName, instance.address);
    }

    return instance;
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
