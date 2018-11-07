/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const BalanceLib = artifacts.require('BalanceLib');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const SignerManager = artifacts.require('SignerManager');
const ClientFund = artifacts.require('ClientFund');
const CommunityVote = artifacts.require('CommunityVote');
const Configuration = artifacts.require('Configuration');
const DriipSettlement = artifacts.require('DriipSettlement');
const DriipSettlementChallenge = artifacts.require('DriipSettlementChallenge');
const DriipSettlementDispute = artifacts.require('DriipSettlementDispute');
const ERC20TransferController = artifacts.require('ERC20TransferController');
const ERC721TransferController = artifacts.require('ERC721TransferController');
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
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MonetaryTypesLib = artifacts.require('MonetaryTypesLib');
const NullSettlement = artifacts.require('NullSettlement');
const NullSettlementChallenge = artifacts.require('NullSettlementChallenge');
const NullSettlementDispute = artifacts.require('NullSettlementDispute');
const PartnerFund = artifacts.require('PartnerFund');
const RevenueFund = artifacts.require('RevenueFund');
const SafeMathIntLib = artifacts.require('SafeMathIntLib');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');
const SecurityBond = artifacts.require('SecurityBond');
const SettlementTypesLib = artifacts.require('SettlementTypesLib');
const DriipStorable = artifacts.require('DriipStorable');
const NahmiiTypesLib = artifacts.require('NahmiiTypesLib');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const TxHistoryLib = artifacts.require('TxHistoryLib');
const BlockNumbUintsLib = artifacts.require('BlockNumbUintsLib');
const BlockNumbIntsLib = artifacts.require('BlockNumbIntsLib');
const BlockNumbDisdIntsLib = artifacts.require('BlockNumbDisdIntsLib');
const ConstantsLib = artifacts.require('ConstantsLib');
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
            let ctl = {
                deployer: deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage: addressStorage,
                ownerAccount: ownerAccount
            };

            await execDeploy(ctl, 'ConstantsLib', '', ConstantsLib);
            await execDeploy(ctl, 'MonetaryTypesLib', '', MonetaryTypesLib);

            await deployer.link(ConstantsLib, [
                BlockNumbDisdIntsLib, Configuration, MockedConfiguration, RevenueFund, SecurityBond, Validator
            ]);
            await deployer.link(MonetaryTypesLib, [
                ClientFund, DriipSettlement, DriipSettlementChallenge, DriipSettlementDispute, DriipStorable, NahmiiTypesLib,
                NullSettlement, TokenHolderRevenueFund, Validator
            ]);

            //deploy base libraries
            await execDeploy(ctl, 'SafeMathIntLib', '', SafeMathIntLib);
            await execDeploy(ctl, 'SafeMathUintLib', '', SafeMathUintLib);
            await execDeploy(ctl, 'NahmiiTypesLib', '', NahmiiTypesLib);
            await execDeploy(ctl, 'BalanceLib', '', BalanceLib);
            await execDeploy(ctl, 'InUseCurrencyLib', '', InUseCurrencyLib);
            await execDeploy(ctl, 'TxHistoryLib', '', TxHistoryLib);
            await execDeploy(ctl, 'SettlementTypesLib', '', SettlementTypesLib);
            await execDeploy(ctl, 'BlockNumbUintsLib', '', BlockNumbUintsLib);
            await execDeploy(ctl, 'BlockNumbIntsLib', '', BlockNumbIntsLib);
            await execDeploy(ctl, 'BlockNumbDisdIntsLib', '', BlockNumbDisdIntsLib);

            //link dependencies
            await deployer.link(SafeMathIntLib, [
                BalanceLib, CancelOrdersChallenge, ClientFund, CommunityVote, Configuration, DriipSettlement, DriipSettlementChallenge,
                DriipSettlementDispute, NullSettlement, NullSettlementChallenge, NullSettlementDispute, PartnerFund, RevenueFund,
                SecurityBond, TokenHolderRevenueFund, Validator
            ]);
            await deployer.link(SafeMathUintLib, [
                CancelOrdersChallenge, DriipSettlement, DriipSettlementChallenge, DriipSettlementDispute, NullSettlement,
                NullSettlementChallenge, NullSettlementDispute, /*RevenueFund, */, SecurityBond, TokenHolderRevenueFund,
                Validator
            ]);
            await deployer.link(NahmiiTypesLib, [
                CancelOrdersChallenge, DriipSettlement, DriipSettlementChallenge, DriipSettlementDispute, DriipStorable, FraudChallenge,
                FraudChallengeByDoubleSpentOrders, FraudChallengeByDuplicateDriipNonceOfPayments, FraudChallengeByDuplicateDriipNonceOfTradeAndPayment,
                FraudChallengeByDuplicateDriipNonceOfTrades, FraudChallengeByOrder, FraudChallengeByPayment, FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments, FraudChallengeBySuccessiveTrades, FraudChallengeByTrade, FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment, Hasher, NullSettlement, Validator
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
            await deployer.link(SettlementTypesLib, [
                NullSettlement, NullSettlementChallenge, NullSettlementDispute
            ]);
            await deployer.link(BlockNumbUintsLib, [
                Configuration
            ]);
            await deployer.link(BlockNumbIntsLib, [
                Configuration
            ]);
            await deployer.link(BlockNumbDisdIntsLib, [
                Configuration
            ]);

            //deploy transfer controllers
            await execDeploy(ctl, 'ERC20TransferController', '', ERC20TransferController);

            await execDeploy(ctl, 'ERC721TransferController', '', ERC721TransferController);

            await execDeploy(ctl, 'TransferControllerManager', '', TransferControllerManager);

            //deploy signer manager
            await execDeploy(ctl, 'SignerManager', '', SignerManager);

            //deploy other contracts
            await execDeploy(ctl, 'Hasher', '', Hasher);

            await execDeploy(ctl, 'Validator', '', Validator, true);

            await execDeploy(ctl, 'ClientFund', '', ClientFund);

            await execDeploy(ctl, 'CommunityVote', '', CommunityVote);

            await execDeploy(ctl, 'Configuration', '', Configuration);

            await execDeploy(ctl, 'DriipSettlement', '', DriipSettlement);

            await execDeploy(ctl, 'NullSettlement', '', NullSettlement);

            await execDeploy(ctl, 'CancelOrdersChallenge', '', CancelOrdersChallenge);

            await execDeploy(ctl, 'DriipSettlementChallenge', '', DriipSettlementChallenge);

            await execDeploy(ctl, 'DriipSettlementDispute', '', DriipSettlementDispute);

            await execDeploy(ctl, 'NullSettlementChallenge', '', NullSettlementChallenge);

            await execDeploy(ctl, 'NullSettlementDispute', '', NullSettlementDispute);

            await execDeploy(ctl, 'FraudChallengeByOrder', '', FraudChallengeByOrder);

            await execDeploy(ctl, 'FraudChallengeByTrade', '', FraudChallengeByTrade);

            await execDeploy(ctl, 'FraudChallengeByPayment', '', FraudChallengeByPayment);

            await execDeploy(ctl, 'FraudChallengeBySuccessiveTrades', '', FraudChallengeBySuccessiveTrades);

            await execDeploy(ctl, 'FraudChallengeBySuccessivePayments', '', FraudChallengeBySuccessivePayments);

            await execDeploy(ctl, 'FraudChallengeByPaymentSucceedingTrade', '', FraudChallengeByPaymentSucceedingTrade);

            await execDeploy(ctl, 'FraudChallengeByTradeSucceedingPayment', '', FraudChallengeByTradeSucceedingPayment);

            await execDeploy(ctl, 'FraudChallengeByTradeOrderResiduals', '', FraudChallengeByTradeOrderResiduals);

            await execDeploy(ctl, 'FraudChallengeByDoubleSpentOrders', '', FraudChallengeByDoubleSpentOrders);

            await execDeploy(ctl, 'FraudChallengeByDuplicateDriipNonceOfTrades', '', FraudChallengeByDuplicateDriipNonceOfTrades);

            await execDeploy(ctl, 'FraudChallengeByDuplicateDriipNonceOfPayments', '', FraudChallengeByDuplicateDriipNonceOfPayments);

            await execDeploy(ctl, 'FraudChallengeByDuplicateDriipNonceOfTradeAndPayment', '', FraudChallengeByDuplicateDriipNonceOfTradeAndPayment);

            await execDeploy(ctl, 'FraudChallenge', '', FraudChallenge);

            await execDeploy(ctl, 'RevenueFund', 'TradesRevenueFund', RevenueFund);

            await execDeploy(ctl, 'RevenueFund', 'PaymentsRevenueFund', RevenueFund);

            await execDeploy(ctl, 'SecurityBond', '', SecurityBond);

            await execDeploy(ctl, 'TokenHolderRevenueFund', '', TokenHolderRevenueFund);

            await execDeploy(ctl, 'PartnerFund', '', PartnerFund);

            //configure smart contracts
            instance = Configuration.at(addressStorage.get('Configuration'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), 'operational_mode');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), 'operational_mode');

            //register transfer controllers
            instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerTransferController('ERC20', addressStorage.get('ERC20TransferController'), {from: ownerAccount});
            tx = await instance.registerTransferController('ERC721', addressStorage.get('ERC721TransferController'), {from: ownerAccount});

            instance = await Validator.at(addressStorage.get('Validator'));
            tx = await instance.changeHasher(addressStorage.get('Hasher'));

            instance = await ClientFund.at(addressStorage.get('ClientFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerService(addressStorage.get('DriipSettlement'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('DriipSettlement'));
            tx = await instance.registerService(addressStorage.get('DriipSettlementDispute'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('DriipSettlementDispute'));
            tx = await instance.registerService(addressStorage.get('NullSettlement'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('NullSettlement'));
            tx = await instance.registerService(addressStorage.get('NullSettlementDispute'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('NullSettlementDispute'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('FraudChallengeByPayment'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('FraudChallengeByTrade'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            tx = await instance.authorizeInitiallyRegisteredService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            // tx = await instance.disableInitialServiceAuthorization();
            tx = await instance.registerBeneficiary(addressStorage.get('PaymentsRevenueFund'));
            tx = await instance.registerBeneficiary(addressStorage.get('TradesRevenueFund'));
            // TODO Whitelist all ClientFundable contracts in ClientFund

            instance = await DriipSettlement.at(addressStorage.get('DriipSettlement'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeCommunityVote(addressStorage.get('CommunityVote'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeDriipSettlementChallenge(addressStorage.get('DriipSettlementChallenge'));
            tx = await instance.changeTradesRevenueFund(addressStorage.get('TradesRevenueFund'));
            tx = await instance.changePaymentsRevenueFund(addressStorage.get('PaymentsRevenueFund'));

            instance = await NullSettlement.at(addressStorage.get('NullSettlement'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeCommunityVote(addressStorage.get('CommunityVote'));
            tx = await instance.changeNullSettlementChallenge(addressStorage.get('NullSettlementChallenge'));

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
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            tx = await instance.changeDriipSettlementChallenge(addressStorage.get('DriipSettlementChallenge'));

            instance = await NullSettlementChallenge.at(addressStorage.get('NullSettlementChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeNullSettlementDispute(addressStorage.get('NullSettlementDispute'));

            instance = await NullSettlementDispute.at(addressStorage.get('NullSettlementDispute'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            tx = await instance.changeNullSettlementChallenge(addressStorage.get('NullSettlementChallenge'));

            instance = await FraudChallenge.at(addressStorage.get('FraudChallenge'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), 'add_fraudulent_order');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), 'add_fraudulent_trade');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), 'add_fraudulent_payment');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), 'add_fraudulent_trade');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), 'add_fraudulent_trade');
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), 'add_double_spender_wallet');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'), 'add_fraudulent_trade');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'), 'add_fraudulent_payment');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'), 'add_fraudulent_trade');
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'), 'add_fraudulent_payment');
            tx = await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), 'add_fraudulent_trade');
            tx = await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), 'add_fraudulent_payment');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), 'add_fraudulent_trade');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), 'add_fraudulent_payment');

            instance = await FraudChallengeByOrder.at(addressStorage.get('FraudChallengeByOrder'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByTrade.at(addressStorage.get('FraudChallengeByTrade'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
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
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeBySuccessivePayments.at(addressStorage.get('FraudChallengeBySuccessivePayments'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeByPaymentSucceedingTrade.at(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
            tx = await instance.changeClientFund(addressStorage.get('ClientFund'));

            instance = await FraudChallengeByTradeOrderResiduals.at(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            tx = await instance.changeFraudChallenge(addressStorage.get('FraudChallenge'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeValidator(addressStorage.get('Validator'));
            tx = await instance.changeSecurityBond(addressStorage.get('SecurityBond'));
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

            instance = await RevenueFund.at(addressStorage.get('TradesRevenueFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
            tx = await instance.registerFractionalBeneficiary(addressStorage.get('PartnerFund'), 1e16);

            instance = await RevenueFund.at(addressStorage.get('PaymentsRevenueFund'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
            tx = await instance.registerFractionalBeneficiary(addressStorage.get('PartnerFund'), 1e16);

            instance = await SecurityBond.at(addressStorage.get('SecurityBond'));
            tx = await instance.changeConfiguration(addressStorage.get('Configuration'));
            tx = await instance.changeTransferControllerManager(addressStorage.get('TransferControllerManager'));
            tx = await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), 'reward');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), 'reward');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), 'reward');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'), 'reward');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'), 'reward');
            tx = await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            tx = await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'), 'reward');
            tx = await instance.registerService(addressStorage.get('DriipSettlementDispute'));
            tx = await instance.enableServiceAction(addressStorage.get('DriipSettlementDispute'), 'reward');
            tx = await instance.registerService(addressStorage.get('NullSettlementDispute'));
            tx = await instance.enableServiceAction(addressStorage.get('NullSettlementDispute'), 'reward');

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
