/*!
 * Hubii Striim
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const BalanceLib = artifacts.require('BalanceLib');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const Challenge = artifacts.require('Challenge');
const ClientFund = artifacts.require('ClientFund');
const CommunityVote = artifacts.require('CommunityVote');
const Configuration = artifacts.require('Configuration');
const DriipSettlementChallenge = artifacts.require('DriipSettlementChallenge');
const DriipSettlementDispute = artifacts.require('DriipSettlementDispute');
const DriipSettlementTypes = artifacts.require('DriipSettlementTypes');
const ERC20TransferController = artifacts.require('ERC20TransferController');
const ERC721TransferController = artifacts.require('ERC721TransferController');
const Exchange = artifacts.require('Exchange');
const Hasher = artifacts.require('Hasher');
const FraudChallenge = artifacts.require('FraudChallenge');
const FraudChallengeByDoubleSpentOrders = artifacts.require('FraudChallengeByDoubleSpentOrders');
const FraudChallengeByDuplicateDriipNonceOfPayments = artifacts.require('FraudChallengeByDuplicateDriipNonceOfPayments');
const FraudChallengeByDuplicateDriipNonceOfTradeAndPayment = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment');
const FraudChallengeByDuplicateDriipNonceOfTrades = artifacts.require('FraudChallengeByDuplicateDriipNonceOfTrades');
const FraudChallengeByOrder = artifacts.require('FraudChallengeByOrder');
const FraudChallengeByPayment = artifacts.require('FraudChallengeByPayment');
const FraudChallengeByPaymentSucceedingTrade = artifacts.require('FraudChallengeByPaymentSucceedingTrade');
const FraudChallengeBySuccessivePayments = artifacts.require('FraudChallengeBySuccessivePayments');
const FraudChallengeBySuccessiveTrades = artifacts.require('FraudChallengeBySuccessiveTrades');
const FraudChallengeByTrade = artifacts.require('FraudChallengeByTrade');
const FraudChallengeByTradeOrderResiduals = artifacts.require('FraudChallengeByTradeOrderResiduals');
const FraudChallengeByTradeSucceedingPayment = artifacts.require('FraudChallengeByTradeSucceedingPayment');
const InUseCurrencyLib = artifacts.require('InUseCurrencyLib');
const MonetaryTypes = artifacts.require('MonetaryTypes');
const PartnerFund = artifacts.require('PartnerFund');
const RevenueFund = artifacts.require('RevenueFund');
const SafeMathInt = artifacts.require('SafeMathInt');
const SafeMathUint = artifacts.require('SafeMathUint');
const SecurityBond = artifacts.require('SecurityBond');
const StriimChallenge = artifacts.require('StriimChallenge');
const StriimTypes = artifacts.require('StriimTypes');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const TxHistoryLib = artifacts.require('TxHistoryLib');
const Validator = artifacts.require('Validator');

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

        if (helpers.isResetArgPresent())
            addressStorage.clear();

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
            const deployFilters = helpers.getFiltersFromArgs();

            await execDeploy(deployer, 'MonetaryTypes', '', MonetaryTypes, deployFilters, addressStorage, ownerAccount);

            await deployer.link(MonetaryTypes, [
                ClientFund, Configuration, DriipSettlementChallenge, DriipSettlementDispute, Exchange, StriimTypes, StriimChallenge, TokenHolderRevenueFund, Validator
            ]);

            //deploy base libraries
            await execDeploy(deployer, 'SafeMathInt', '', SafeMathInt, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'SafeMathUint', '', SafeMathUint, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'StriimTypes', '', StriimTypes, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'BalanceLib', '', BalanceLib, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'InUseCurrencyLib', '', InUseCurrencyLib, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'TxHistoryLib', '', TxHistoryLib, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'DriipSettlementTypes', '', DriipSettlementTypes, deployFilters, addressStorage, ownerAccount);

            //link dependencies
            await deployer.link(SafeMathInt, [
                BalanceLib, CancelOrdersChallenge, ClientFund, CommunityVote, Configuration, DriipSettlementChallenge, DriipSettlementDispute,
                Exchange, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund, Validator
            ]);
            await deployer.link(SafeMathUint, [
                CancelOrdersChallenge, Exchange, RevenueFund, TokenHolderRevenueFund, Validator
            ]);
            await deployer.link(StriimTypes, [
                CancelOrdersChallenge, DriipSettlementChallenge, DriipSettlementDispute, Exchange, FraudChallenge,
                FraudChallengeByDoubleSpentOrders, FraudChallengeByDuplicateDriipNonceOfPayments, FraudChallengeByDuplicateDriipNonceOfTradeAndPayment,
                FraudChallengeByDuplicateDriipNonceOfTrades, FraudChallengeByOrder, FraudChallengeByPayment, FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments, FraudChallengeBySuccessiveTrades, FraudChallengeByTrade, FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment, Hasher, StriimChallenge, Validator
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
            await deployer.link(DriipSettlementTypes, [
                DriipSettlementChallenge, DriipSettlementDispute, Exchange
            ]);

            //deploy transfer controllers
            await execDeploy(deployer, 'ERC20TransferController', '', ERC20TransferController, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'ERC721TransferController', '', ERC721TransferController, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'TransferControllerManager', '', TransferControllerManager, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'Hasher', '', Hasher, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'Validator', '', Validator, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'ClientFund', '', ClientFund, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'CommunityVote', '', CommunityVote, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'Configuration', '', Configuration, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'Exchange', '', Exchange, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'CancelOrdersChallenge', '', CancelOrdersChallenge, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'DriipSettlementChallenge', '', DriipSettlementChallenge, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'DriipSettlementDispute', '', DriipSettlementDispute, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByOrder', '', FraudChallengeByOrder, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByTrade', '', FraudChallengeByTrade, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByPayment', '', FraudChallengeByPayment, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeBySuccessiveTrades', '', FraudChallengeBySuccessiveTrades, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeBySuccessivePayments', '', FraudChallengeBySuccessivePayments, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByPaymentSucceedingTrade', '', FraudChallengeByPaymentSucceedingTrade, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByTradeSucceedingPayment', '', FraudChallengeByTradeSucceedingPayment, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByTradeOrderResiduals', '', FraudChallengeByTradeOrderResiduals, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByDoubleSpentOrders', '', FraudChallengeByDoubleSpentOrders, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfTrades', '', FraudChallengeByDuplicateDriipNonceOfTrades, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfPayments', '', FraudChallengeByDuplicateDriipNonceOfPayments, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallengeByDuplicateDriipNonceOfTradeAndPayment', '', FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'FraudChallenge', '', FraudChallenge, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'RevenueFund', 'TradesRevenueFund', RevenueFund, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'RevenueFund', 'PaymentsRevenueFund', RevenueFund, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'SecurityBond', '', SecurityBond, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'TokenHolderRevenueFund', '', TokenHolderRevenueFund, deployFilters, addressStorage, ownerAccount);

            await execDeploy(deployer, 'PartnerFund', '', PartnerFund, deployFilters, addressStorage, ownerAccount);

            //configure smart contracts

            const configuration = Configuration.at(addressStorage.get('Configuration'));

            //register transfer controllers
            instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerTransferController('erc20', addressStorage.get('ERC20TransferController'), {from: ownerAccount});
            tx = await instance.registerTransferController('erc721', addressStorage.get('ERC721TransferController'), {from: ownerAccount});

            instance = await Validator.at(addressStorage.get('Validator'));
            tx = await instance.changeHasher(addressStorage.get('Hasher'));

            instance = await ClientFund.at(addressStorage.get('ClientFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerService(addressStorage.get('Exchange'));
            // TODO Activate exchange for all wallets
            //Beneficiary, Benefactor, AuthorizableServable

            instance = await Exchange.at(addressStorage.get('Exchange'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeCommunityVote(addressStorage.get('CommunityVote'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeDriipSettlementChallenge(addressStorage.get('DriipSettlementChallenge'));
            tx = await instance.changeTradesRevenueFund(addressStorage.get('TradesRevenueFund'));
            tx = await instance.changePaymentsRevenueFund(addressStorage.get('PaymentsRevenueFund'));

            instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));

            instance = await DriipSettlementChallenge.at(addressStorage.get('DriipSettlementChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeDriipSettlementDispute(addressStorage.get('DriipSettlementDispute'));

            instance = await DriipSettlementDispute.at(addressStorage.get('DriipSettlementDispute'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
            tx = await instance.changeDriipSettlementChallenge(addressStorage.get('DriipSettlementChallenge'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));

            instance = await FraudChallengeByOrder.at(addressStorage.get('FraudChallengeByOrder'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByTrade.at(addressStorage.get('FraudChallengeByTrade'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeByPayment.at(addressStorage.get('FraudChallengeByPayment'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeBySuccessiveTrades.at(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeBySuccessivePayments.at(addressStorage.get('FraudChallengeBySuccessivePayments'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeByPaymentSucceedingTrade.at(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeByTradeOrderResiduals.at(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeByDoubleSpentOrders.at(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfTrades.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfPayments.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfTradeAndPayment.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            const partsPer = await configuration.getPartsPer();

            instance = await RevenueFund.at(addressStorage.get('TradesRevenueFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), partsPer.div(100).mul(99));
            tx = await instance.registerFractionalBeneficiary(addressStorage.get('PartnerFund'), partsPer.div(100));

            instance = await RevenueFund.at(addressStorage.get('PaymentsRevenueFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), partsPer.div(100).mul(99));
            tx = await instance.registerFractionalBeneficiary(addressStorage.get('PartnerFund'), partsPer.div(100));

            instance = await SecurityBond.at(addressStorage.get('SecurityBond'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));

            instance = await TokenHolderRevenueFund.at(addressStorage.get('TokenHolderRevenueFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));

            instance = await PartnerFund.at(addressStorage.get('PartnerFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));

            console.log('Saving addresses...');
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

async function execDeploy(deployer, contractName, instanceName, contract, deployFilters, addressStorage, ownerAccount) {
    let instance, address = addressStorage.get(instanceName || contractName);

    if ((!address) || shouldDeploy(contractName, deployFilters)) {
        instance = await deployer.deploy(contract, ownerAccount, {from: ownerAccount});
        addressStorage.set(instanceName || contractName, instance.address);
    }
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
