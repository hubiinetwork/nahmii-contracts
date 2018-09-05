/*!
 * Hubii Striim
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const SafeMathInt = artifacts.require('SafeMathInt');
const SafeMathUint = artifacts.require('SafeMathUint');
const BalanceLib = artifacts.require('BalanceLib');
const InUseCurrencyLib = artifacts.require('InUseCurrencyLib');
const TxHistoryLib = artifacts.require('TxHistoryLib');
const MonetaryTypes = artifacts.require('MonetaryTypes');
const StriimTypes = artifacts.require('StriimTypes');
const Challenge = artifacts.require('Challenge');
const ERC20TransferController = artifacts.require('ERC20TransferController');
const ERC721TransferController = artifacts.require('ERC721TransferController');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const ClientFund = artifacts.require('ClientFund');
const CommunityVote = artifacts.require('CommunityVote');
const Configuration = artifacts.require('Configuration');
const Exchange = artifacts.require('Exchange');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const DriipSettlementChallenge = artifacts.require('DriipSettlementChallenge');
const DriipSettlementChallenger = artifacts.require('DriipSettlementChallenger');
const Hasher = artifacts.require('Hasher');
const Validator = artifacts.require('Validator');
const FraudChallengeByOrder = artifacts.require('FraudChallengeByOrder');
const FraudChallengeByTrade = artifacts.require('FraudChallengeByTrade');
const FraudChallengeByPayment = artifacts.require('FraudChallengeByPayment');
const FraudChallengeBySuccessiveTrades = artifacts.require('FraudChallengeBySuccessiveTrades');
const FraudChallengeBySuccessivePayments = artifacts.require('FraudChallengeBySuccessivePayments');
const FraudChallengeByPaymentSucceedingTrade = artifacts.require('FraudChallengeByPaymentSucceedingTrade');
const FraudChallengeByTradeSucceedingPayment = artifacts.require('FraudChallengeByTradeSucceedingPayment');
const FraudChallengeByTradeOrderResiduals = artifacts.require('FraudChallengeByTradeOrderResiduals');
const FraudChallengeByDoubleSpentOrders = artifacts.require('FraudChallengeByDoubleSpentOrders');
const FraudChallengeByDuplicateDriipNonceOfTrades = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTrades');
const FraudChallengeByDuplicateDriipNonceOfPayments = artifacts.require('FraudChallengeByDuplicateDriipNonceOfPayments');
const FraudChallengeByDuplicateDriipNonceOfTradeAndPayment = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment');
const FraudChallenge = artifacts.require('FraudChallenge');
const RevenueFund = artifacts.require('RevenueFund');
const SecurityBond = artifacts.require('SecurityBond');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const PartnerFund = artifacts.require('PartnerFund');

const path = require('path');
const helpers = require('./helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {
    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let ownerAccount;
        let instance, tx;

        await addressStorage.load();

        if (helpers.isResetArgPresent()) {
            addressStorage.clear();
        }

        if (helpers.isTestNetwork(network)) {
            ownerAccount = accounts[0];
        }
        else {
            ownerAccount = helpers.getOwnerAccountFromArgs();

            if (web3.eth.personal)
                web3.eth.personal.unlockAccount(ownerAccount, helpers.getPasswordFromArgs(), 7200); //120 minutes
            else
                web3.personal.unlockAccount(ownerAccount, helpers.getPasswordFromArgs(), 7200); //120 minutes
        }

        try {
            const deployFilters = helpers.getFiltersFromArgs();

            //deploy base libraries
            await execDeploy(deployer, 'SafeMathInt', SafeMathInt, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'SafeMathUint', SafeMathUint, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'StriimTypes', StriimTypes, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'MonetaryTypes', MonetaryTypes, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'BalanceLib', BalanceLib, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'InUseCurrencyLib', InUseCurrencyLib, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'TxHistoryLib', TxHistoryLib, deployFilters, addressStorage, ownerAccount);

            //link dependencies
            await deployer.link(MonetaryTypes, [
                Challenge, ClientFund, Configuration, DriipSettlementChallenge, DriipSettlementChallenger, Exchange, StriimTypes, FraudChallenge, TokenHolderRevenueFund, Validator
            ]);
            await deployer.link(SafeMathInt, [
                BalanceLib, CancelOrdersChallenge, ClientFund, CommunityVote, Configuration, DriipSettlementChallenge, DriipSettlementChallenger,
                Exchange, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund, Validator
            ]);
            await deployer.link(SafeMathUint, [
                CancelOrdersChallenge, Exchange, RevenueFund, TokenHolderRevenueFund, Validator
            ]);
            await deployer.link(StriimTypes, [
                CancelOrdersChallenge, DriipSettlementChallenge, DriipSettlementChallenger, Exchange, FraudChallenge,
                FraudChallengeByDoubleSpentOrders, FraudChallengeByDuplicateDriipNonceOfPayments, FraudChallengeByDuplicateDriipNonceOfTradeAndPayment,
                FraudChallengeByDuplicateDriipNonceOfTrades, FraudChallengeByOrder, FraudChallengeByPayment, FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments, FraudChallengeBySuccessiveTrades, FraudChallengeByTrade, FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment, Hasher, Validator
            ]);
            await deployer.link(BalanceLib, [
                ClientFund, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
            ]);
            await deployer.link(InUseCurrencyLib, [
                ClientFund, RevenueFund, SecurityBond
            ]);
            await deployer.link(TxHistoryLib, [
                ClientFund, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
            ]);

            //deploy transfer controllers
            await execDeploy(deployer, 'ERC20TransferController', ERC20TransferController, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'ERC721TransferController', ERC721TransferController, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'TransferControllerManager', TransferControllerManager, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'Hasher', Hasher, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'Validator', Validator, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'ClientFund', ClientFund, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'CommunityVote', CommunityVote, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'Configuration', Configuration, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'Exchange', Exchange, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'CancelOrdersChallenge', CancelOrdersChallenge, deployFilters, addressStorage, ownerAccount);

            if ((!addressStorage.get('DriipSettlementChallenge')) || (!addressStorage.get('DriipSettlementChallenger')) || shouldDeploy('DriipSettlementChallenge', deployFilters)) {
                instance = await deployer.deploy(DriipSettlementChallenge, ownerAccount, { from: ownerAccount });
                addressStorage.set('DriipSettlementChallenge' , instance.address);

                instance = await deployer.deploy(DriipSettlementChallenger, ownerAccount, { from: ownerAccount, overwrite: true });
                addressStorage.set('DriipSettlementChallenger', instance.address);
            }

            await execDeploy(deployer, 'FraudChallengeByOrder', FraudChallengeByOrder, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByTrade', FraudChallengeByTrade, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByPayment', FraudChallengeByPayment, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeBySuccessiveTrades', FraudChallengeBySuccessiveTrades, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeBySuccessivePayments', FraudChallengeBySuccessivePayments, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByPaymentSucceedingTrade', FraudChallengeByPaymentSucceedingTrade, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByTradeSucceedingPayment', FraudChallengeByTradeSucceedingPayment, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByTradeOrderResiduals', FraudChallengeByTradeOrderResiduals, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByDoubleSpentOrders', FraudChallengeByDoubleSpentOrders, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfTrades', FraudChallengeByDuplicateDriipNonceOfTrades, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfPayments', FraudChallengeByDuplicateDriipNonceOfPayments, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfTradeAndPayment', FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallenge', FraudChallenge, deployFilters, addressStorage, ownerAccount);

            if ((!addressStorage.get('RevenueFund')) || shouldDeploy('RevenueFund', deployFilters)) {
                instance = await deployer.deploy(RevenueFund, ownerAccount, { from: ownerAccount });
                addressStorage.set('RevenueFund1' , instance.address);

                instance = await deployer.deploy(RevenueFund, ownerAccount, { from: ownerAccount, overwrite: true });
                addressStorage.set('RevenueFund2' , instance.address);
            }

            await execDeploy(deployer, 'SecurityBond', SecurityBond, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'TokenHolderRevenueFund', TokenHolderRevenueFund, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'PartnerFund', PartnerFund, deployFilters, addressStorage, ownerAccount);

            //configure smart contracts

            //register transfer controllers
            instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerTransferController('erc20', addressStorage.get('ERC20TransferController'), { from: ownerAccount });
            tx = await instance.registerTransferController('erc721', addressStorage.get('ERC721TransferController'), { from: ownerAccount });

            instance = await Validator.at(addressStorage.get('Validator'));
            tx = await instance.changeHasher(addressStorage.get('Hasher'));

            instance = await ClientFund.at(addressStorage.get('ClientFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            //Beneficiary, Benefactor, AuthorizableServable

            instance = await Exchange.at(addressStorage.get('Exchange'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeCommunityVote(addressStorage.get('CommunityVote'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));

            instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));

            if ((!addressStorage.get('DriipSettlementChallenge')) || (!addressStorage.get('DriipSettlementChallenger')) || shouldDeploy('DriipSettlementChallenge', deployFilters)) {
                instance = await DriipSettlementChallenge.at(addressStorage.get('DriipSettlementChallenge'));
                tx = await instance.changeValidator(addressStorage.get('Validator'));
                tx = await instance.changeConfiguration(addressStorage.get('Configuration'));

                instance = await DriipSettlementChallenger.at(addressStorage.get('DriipSettlementChallenger'));
                tx = await instance.changeDriipSettlementChallenge(addressStorage.get('DriipSettlementChallenge'));
                tx = await instance.changeValidator(addressStorage.get('Validator'));
                tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
                tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
                tx = await instance.changeCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
            }

            instance = await FraudChallengeByOrder.at(addressStorage.get('FraudChallengeByOrder'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByTrade.at(addressStorage.get('FraudChallengeByTrade'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));

            instance = await FraudChallengeByPayment.at(addressStorage.get('FraudChallengeByPayment'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeBySuccessiveTrades.at(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));

            instance = await FraudChallengeBySuccessivePayments.at(addressStorage.get('FraudChallengeBySuccessivePayments'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));

            instance = await FraudChallengeByPaymentSucceedingTrade.at(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));

            instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));

            instance = await FraudChallengeByTradeOrderResiduals.at(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));

            instance = await FraudChallengeByDoubleSpentOrders.at(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfTrades.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfPayments.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfTradeAndPayment.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            //instance = await FraudChallenge.at(addressStorage.get('FraudChallenge'));

            if ((!addressStorage.get('RevenueFund')) || shouldDeploy('RevenueFund', deployFilters)) {
                instance = await RevenueFund.at(addressStorage.get('RevenueFund1'));
                tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));

                instance = await RevenueFund.at(addressStorage.get('RevenueFund2'));
                tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            }

            instance = await SecurityBond.at(addressStorage.get('SecurityBond'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));

            instance = await TokenHolderRevenueFund.at(addressStorage.get('TokenHolderRevenueFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));

            instance = await PartnerFund.at(addressStorage.get('PartnerFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));

            console.log("Saving addresses...");
            await addressStorage.save();
        }
        catch (err) {
            if (!helpers.isTestNetwork(network)) {
                if (web3.eth.personal)
                    web3.eth.personal.lockAccount(ownerAccount);
                else
                    web3.personal.lockAccount(ownerAccount);
            }
            throw err;
        }

        if (!helpers.isTestNetwork(network)) {
            if (web3.eth.personal)
                web3.eth.personal.lockAccount(ownerAccount);
            else
                web3.personal.lockAccount(ownerAccount);
        }
    });
};

async function execDeploy(deployer, contractName, contract, deployFilters, addressStorage, ownerAccount)
{
    let instance, address = addressStorage.get(contractName);

    if ((!address) || shouldDeploy(contractName, deployFilters)) {
        instance = await deployer.deploy(contract, ownerAccount, { from: ownerAccount });
        addressStorage.set(contractName, instance.address);
    }
    else {
        instance = contract.at();
    }
    return instance;
}

function shouldDeploy(contractName, deployFilters) {
    if (!deployFilters) {
        return true;
    }
    for (var i = 0; i < deployFilters.length; i++) {
        if (deployFilters[i].test(contractName))
            return true;
    }
    return false;
}
