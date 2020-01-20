/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2019 Hubii AS
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

        if (helpers.isTestNetwork(network))
            deployerAccount = accounts[0];
        else
            deployerAccount = helpers.parseDeployerArg();

        debug(`deployerAccount: ${deployerAccount}`);

        let ctl = {
            deployer,
            deployFilters: helpers.getFiltersFromArgs(),
            addressStorage,
            deployerAccount
        };

        if (helpers.isTestNetwork(network)) {
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
            await execDeploy(ctl, 'NahmiiTypesLib', '', NahmiiTypesLib);
            await execDeploy(ctl, 'SettlementChallengeTypesLib', '', SettlementChallengeTypesLib);

            await deployer.link(CurrenciesLib, [
                FungibleBalanceLib,
                NonFungibleBalanceLib
            ]);

            await execDeploy(ctl, 'FungibleBalanceLib', '', FungibleBalanceLib);
            await execDeploy(ctl, 'NonFungibleBalanceLib', '', NonFungibleBalanceLib);
            await execDeploy(ctl, 'Strings', '', Strings);
            await execDeploy(ctl, 'TxHistoryLib', '', TxHistoryLib);

            await deployer.link(NahmiiTypesLib, [
                PaymentTypesLib,
                TradeTypesLib
            ]);

            await execDeploy(ctl, 'PaymentTypesLib', '', PaymentTypesLib);
            await execDeploy(ctl, 'TradeTypesLib', '', TradeTypesLib);

        } else if (network.startsWith('ropsten')) {
            addressStorage.set('BalanceTrackerLib', '0x04d0af263fe204e6a02f5ce62f0a121c14553803');
            addressStorage.set('BlockNumbDisdIntsLib', '0x6b25a5d99ade3288313e47a5051f5b8a34bb682e');
            addressStorage.set('BlockNumbFiguresLib', '0xf402f0ff8c3c7b31e5e31bc09a506b43e200ee71');
            addressStorage.set('BlockNumbIntsLib', '0x50a824fb2a7728d5129dabdcdbc421bfe66f8541');
            addressStorage.set('BlockNumbReferenceCurrenciesLib', '0xc2c2070eab1e3da7f1aafdff792a404017eea7df');
            addressStorage.set('BlockNumbUintsLib', '0xddd95bceb3d33141daa349c932952929623d06cb');
            addressStorage.set('ConstantsLib', '0xc4ce8a5bfd7f9b0b029aecea88a9ac7557a00bf3');
            addressStorage.set('CurrenciesLib', '0x5eb1bd5d39221cd7144e4535e30ffbbe254557fe');
            addressStorage.set('DriipSettlementTypesLib', '0x0dc258ecbdc453f1c4aa6476013338a750106578');
            addressStorage.set('FungibleBalanceLib', '0x8ac0db055cabe5aa1fa8f4302a7df1c15a6c4afe');
            addressStorage.set('MonetaryTypesLib', '0x154b70382b9d09e32a411a4be9a6239e2f182a93');
            addressStorage.set('NahmiiTypesLib', '0xffdfa37bb4123e3c650ba84f11f180202e670c62');
            addressStorage.set('NonFungibleBalanceLib', '0xc6d7414101fe070e4e5c3876a7534cb88be802f9');
            addressStorage.set('PaymentTypesLib', '0x0a3c442c5fa9f1efc57e1008e0b599f50905c3a0');
            addressStorage.set('SafeMathIntLib', '0x1cf7adfb21d87d82d4caafdd368a40e85b4f8311');
            addressStorage.set('SafeMathUintLib', '0x2372b2677b58f834b52266d13e9b2cfc8f339d2e');
            addressStorage.set('SettlementChallengeTypesLib', '0x4ef8a1de09cb3c190b6d47f20372d3282e4b4748');
            addressStorage.set('Strings', '0xb8eed225c41b8bf98d0fb91bb449f874a848b7ef');
            addressStorage.set('TradeTypesLib', '0x7255df349ad869adbedd0dcaf808f4b4e20ad1bb');
            addressStorage.set('TxHistoryLib', '0x705c22764b35de57958ebd8f26ebbc7aa3ac4614');

            ConstantsLib.address = addressStorage.get('ConstantsLib');
            MonetaryTypesLib.address = addressStorage.get('MonetaryTypesLib');
            SafeMathIntLib.address = addressStorage.get('SafeMathIntLib');
            SafeMathUintLib.address = addressStorage.get('SafeMathUintLib');

            await deployer.link(ConstantsLib, [
                BlockNumbDisdIntsLib
            ]);
            await deployer.link(MonetaryTypesLib, [
                BalanceTrackerLib,
                BlockNumbFiguresLib,
                BlockNumbReferenceCurrenciesLib,
                CurrenciesLib,
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

            CurrenciesLib.address = addressStorage.get('CurrenciesLib');

            await deployer.link(CurrenciesLib, [
                FungibleBalanceLib,
                NonFungibleBalanceLib
            ]);

            NahmiiTypesLib.address = addressStorage.get('NahmiiTypesLib');

            await deployer.link(NahmiiTypesLib, [
                PaymentTypesLib,
                TradeTypesLib
            ]);

        } else if (network.startsWith('mainnet')) {
            addressStorage.set('BalanceTrackerLib', '0xc62e6b5c5d1cfb97c992cf065ed74eda82553028');
            // addressStorage.set('BlockNumbCurrenciesLib', '0x1285bdda4c9353bd0ae87af7e9433f9cfd7a4029'); // Only v1.0.0
            addressStorage.set('BlockNumbDisdIntsLib', '0x1be1f7bcde90976e9cd18dfbfa6bb973c204122a');
            addressStorage.set('BlockNumbFiguresLib', '0x3cf037f87fa2ca78ca57337e485fc81780155376');
            addressStorage.set('BlockNumbIntsLib', '0x278243860d8502fdee4fa4e7cace4a2471fd88c7');
            addressStorage.set('BlockNumbReferenceCurrenciesLib', '0x1fcde74c0512e9e060b5f09e34045813a2b70321');
            addressStorage.set('BlockNumbUintsLib', '0x3853145139641bc7cb723c2c476d1887157734b7');
            addressStorage.set('ConstantsLib', '0x5fcf3704016b90ded3c81d75613ceab0a6a26025');
            addressStorage.set('CurrenciesLib', '0xa22d375e6e62512e0f4161604ac7a2fb2e9b456c');
            addressStorage.set('DriipSettlementTypesLib', '0xf20c875ff24087dd3395342901870b855eddab20');
            addressStorage.set('FungibleBalanceLib', '0x64dbf08fd66c408f1205e6107c60d05ab3ad872d');
            addressStorage.set('MonetaryTypesLib', '0x73b58f0d337b596e534a8385399f6bcce1f2ce0e');
            addressStorage.set('NahmiiTypesLib', '0xa858c8c47a4e4586339c9aef15f41a3f620f9da7');
            addressStorage.set('NonFungibleBalanceLib', '0x4f6f9422b8509b4df036c738f9d3e2827e29af6a');
            addressStorage.set('PaymentTypesLib', '0xb99f3f4aacb6e1197a623919103b99f4b41aaef0');
            addressStorage.set('SafeMathIntLib', '0x2fcb98529d58669e229c453de4b4705bb6b2d414');
            addressStorage.set('SafeMathUintLib', '0x0ff948c236c8d4dfcd0168bf243314c8ff8ec967');
            addressStorage.set('SettlementChallengeTypesLib', '0xeb3acd17194fb4e88c68bbaf094098763b59f97b');
            addressStorage.set('Strings', '0x4dd9167e4e8d622ba819972a716898e214599012');
            addressStorage.set('TxHistoryLib', '0x218bd5021efbf45f7afd853ac8ce28528f409d50');

            ConstantsLib.address = addressStorage.get('ConstantsLib');
            MonetaryTypesLib.address = addressStorage.get('MonetaryTypesLib');
            SafeMathIntLib.address = addressStorage.get('SafeMathIntLib');
            SafeMathUintLib.address = addressStorage.get('SafeMathUintLib');

            await deployer.link(ConstantsLib, [
                BlockNumbDisdIntsLib
            ]);
            await deployer.link(MonetaryTypesLib, [
                BalanceTrackerLib,
                BlockNumbFiguresLib,
                BlockNumbReferenceCurrenciesLib,
                CurrenciesLib,
                NahmiiTypesLib,
                PaymentTypesLib,
                SettlementChallengeTypesLib/*,
                    TradeTypesLib*/
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

            CurrenciesLib.address = addressStorage.get('CurrenciesLib');

            await deployer.link(CurrenciesLib, [
                FungibleBalanceLib,
                NonFungibleBalanceLib
            ]);

            NahmiiTypesLib.address = addressStorage.get('NahmiiTypesLib');

            await deployer.link(NahmiiTypesLib, [
                PaymentTypesLib/*,
                    TradeTypesLib*/
            ]);

            // await execDeploy(ctl, 'TradeTypesLib', '', TradeTypesLib);
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
