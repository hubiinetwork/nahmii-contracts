/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const AccrualBenefactor = artifacts.require('AccrualBenefactor');
const BalanceLib = artifacts.require('BalanceLib');
const BalanceLogLib = artifacts.require('BalanceLogLib');
const BalanceTracker = artifacts.require('BalanceTracker');
const BlockNumbDisdIntsLib = artifacts.require('BlockNumbDisdIntsLib');
const BlockNumbIntsLib = artifacts.require('BlockNumbIntsLib');
const BlockNumbUintsLib = artifacts.require('BlockNumbUintsLib');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const SignerManager = artifacts.require('SignerManager');
const ClientFund = artifacts.require('ClientFund');
const ClientFundable = artifacts.require('ClientFundable');
const CommunityVote = artifacts.require('CommunityVote');
const Configuration = artifacts.require('Configuration');
const ConstantsLib = artifacts.require('ConstantsLib');
const DriipSettlement = artifacts.require('DriipSettlement');
const DriipSettlementChallenge = artifacts.require('DriipSettlementChallenge');
const DriipSettlementDispute = artifacts.require('DriipSettlementDispute');
const ERC20TransferController = artifacts.require('ERC20TransferController');
const ERC721TransferController = artifacts.require('ERC721TransferController');
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
const Hasher = artifacts.require('Hasher');
const InUseCurrencyLib = artifacts.require('InUseCurrencyLib');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');
const MockedClientFund = artifacts.require('MockedClientFund');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedDriipSettlementChallenge = artifacts.require('MockedDriipSettlementChallenge');
const MockedDriipSettlementDispute = artifacts.require('MockedDriipSettlementDispute');
const MockedNullSettlementChallenge = artifacts.require('MockedNullSettlementChallenge');
const MockedNullSettlementDispute = artifacts.require('MockedNullSettlementDispute');
const MockedValidator = artifacts.require('MockedValidator');
const MonetaryTypesLib = artifacts.require('MonetaryTypesLib');
const NahmiiTypesLib = artifacts.require('NahmiiTypesLib');
const NullSettlement = artifacts.require('NullSettlement');
const NullSettlementChallenge = artifacts.require('NullSettlementChallenge');
const NullSettlementDispute = artifacts.require('NullSettlementDispute');
const PartnerFund = artifacts.require('PartnerFund');
const RevenueFund = artifacts.require('RevenueFund');
const SafeMathIntLib = artifacts.require('SafeMathIntLib');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');
const SecurityBond = artifacts.require('SecurityBond');
const SettlementTypesLib = artifacts.require('SettlementTypesLib');
const StandardTokenEx = artifacts.require('StandardTokenEx');
const Strings = artifacts.require('Strings');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const TransactionTracker = artifacts.require('TransactionTracker');
const TxHistoryLib = artifacts.require('TxHistoryLib');
const UnitTestHelpers = artifacts.require('UnitTestHelpers');
const Validatable = artifacts.require('Validatable');
const Validator = artifacts.require('Validator');
const WalletLocker = artifacts.require('WalletLocker');

const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

require('../scripts/common/promisify_web3.js')(web3);

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

            await execDeploy(ctl, 'BlockNumbIntsLib', '', BlockNumbIntsLib);
            await execDeploy(ctl, 'BlockNumbUintsLib', '', BlockNumbUintsLib);
            await execDeploy(ctl, 'ConstantsLib', '', ConstantsLib);
            await execDeploy(ctl, 'MonetaryTypesLib', '', MonetaryTypesLib);
            await execDeploy(ctl, 'SafeMathIntLib', '', SafeMathIntLib);
            await execDeploy(ctl, 'SafeMathUintLib', '', SafeMathUintLib);
            await execDeploy(ctl, 'Strings', '', Strings);
            await execDeploy(ctl, 'TxHistoryLib', '', TxHistoryLib);

            await deployer.link(BlockNumbIntsLib, [
                Configuration
            ]);
            await deployer.link(BlockNumbUintsLib, [
                Configuration
            ]);
            await deployer.link(ConstantsLib, [
                AccrualBenefactor, BlockNumbDisdIntsLib, Configuration, MockedConfiguration,
                RevenueFund, SecurityBond, Validator
            ]);
            await deployer.link(MonetaryTypesLib, [
                DriipSettlement, DriipSettlementChallenge, DriipSettlementDispute, Hasher, InUseCurrencyLib,
                MockedBeneficiary, MockedClientFund, NahmiiTypesLib, NullSettlementDispute,
                PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund, Validator
            ]);
            await deployer.link(SafeMathIntLib, [
                AccrualBenefactor, BalanceLib, BalanceTracker, BlockNumbDisdIntsLib, CancelOrdersChallenge, ClientFund,
                Configuration, DriipSettlement, DriipSettlementChallenge, DriipSettlementDispute, NullSettlement,
                NullSettlementChallenge, NullSettlementDispute, PartnerFund, RevenueFund, SecurityBond,
                TokenHolderRevenueFund, Validator
            ]);
            await deployer.link(SafeMathUintLib, [
                CancelOrdersChallenge, ClientFund, DriipSettlement, DriipSettlementChallenge, DriipSettlementDispute,
                NullSettlement, NullSettlementChallenge, NullSettlementDispute, RevenueFund, SecurityBond, StandardTokenEx,
                TokenHolderRevenueFund, UnitTestHelpers, Validator, WalletLocker
            ]);
            await deployer.link(Strings, [
                PartnerFund
            ]);
            await deployer.link(TxHistoryLib, [
                ClientFund, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
            ]);

            await execDeploy(ctl, 'InUseCurrencyLib', '', InUseCurrencyLib);

            await deployer.link(InUseCurrencyLib, [
                BalanceLib, BalanceTracker, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
            ]);

            await execDeploy(ctl, 'BalanceLib', '', BalanceLib);
            await execDeploy(ctl, 'BalanceLogLib', '', BalanceLogLib);
            await execDeploy(ctl, 'NahmiiTypesLib', '', NahmiiTypesLib);

            await deployer.link(BalanceLib, [
                BalanceTracker, PartnerFund, RevenueFund, SecurityBond, TokenHolderRevenueFund
            ]);
            await deployer.link(BalanceLogLib, [
                BalanceTracker
            ]);
            await deployer.link(NahmiiTypesLib, [
                CancelOrdersChallenge, ClientFundable, DriipSettlement, DriipSettlementChallenge, DriipSettlementDispute,
                FraudChallengeByDoubleSpentOrders, FraudChallengeByDuplicateDriipNonceOfPayments, FraudChallengeByDuplicateDriipNonceOfTradeAndPayment,
                FraudChallengeByDuplicateDriipNonceOfTrades, FraudChallengeByOrder, FraudChallengeByPayment, FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments, FraudChallengeBySuccessiveTrades, FraudChallengeByTrade, FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment, Hasher, MockedCancelOrdersChallenge, MockedDriipSettlementChallenge, MockedDriipSettlementDispute,
                MockedNullSettlementChallenge, MockedNullSettlementDispute, MockedValidator, NullSettlementChallenge, NullSettlementDispute,
                SettlementTypesLib, Validatable, Validator
            ]);

            await execDeploy(ctl, 'BlockNumbDisdIntsLib', '', BlockNumbDisdIntsLib);
            await execDeploy(ctl, 'SettlementTypesLib', '', SettlementTypesLib);

            await deployer.link(BlockNumbDisdIntsLib, [
                Configuration
            ]);
            await deployer.link(SettlementTypesLib, [
                DriipSettlement, DriipSettlementChallenge, DriipSettlementDispute,
                MockedDriipSettlementChallenge, MockedNullSettlementChallenge,
                NullSettlement, NullSettlementChallenge, NullSettlementDispute
            ]);

            await execDeploy(ctl, 'ERC20TransferController', '', ERC20TransferController);

            await execDeploy(ctl, 'ERC721TransferController', '', ERC721TransferController);

            await execDeploy(ctl, 'TransferControllerManager', '', TransferControllerManager);

            await execDeploy(ctl, 'SignerManager', '', SignerManager);

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

            await execDeploy(ctl, 'BalanceTracker', '', BalanceTracker);

            await execDeploy(ctl, 'TransactionTracker', '', TransactionTracker);

            await execDeploy(ctl, 'WalletLocker', '', WalletLocker);

            const delayBlocks = helpers.isTestNetwork(network) ? 1 : 10;

            instance = await Configuration.at(addressStorage.get('Configuration'));
            await instance.setConfirmationBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 12);
            await instance.setTradeMakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                       // 0.1%
            await instance.setTradeMakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e14);                        // 0.01%
            await instance.setTradeTakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e15, [], []);                       // 0.2%
            await instance.setTradeTakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e14);                        // 0.02%
            await instance.setPaymentFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                          // 0.1%
            await instance.setPaymentMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e14);                           // 0.01%
            await instance.setWalletLockTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 30);              // 30 days
            if (network.startsWith('mainnet')) {
                await instance.setCancelOrderChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 3); // 3 days
                await instance.setSettlementChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 5);  // 5 days
            } else {
                await instance.setCancelOrderChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 3);           // 3 minutes
                await instance.setSettlementChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 5);            // 5 minutes
            }
            await instance.setWalletSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e17);               // 10%
            await instance.setOperatorSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);             // 50%
            await instance.setFraudStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);                          // 50%
            if (network.startsWith('mainnet')) {
                await instance.setUpdateDelayBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2880);                       // ~12 hours
                await instance.setEarliestSettlementBlockNumber((await web3.eth.getBlockNumberPromise()) + 172800);                      // In ~30 days
                // await instance.disableEarliestSettlementBlockNumberUpdate();
            }
            await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), 'operational_mode');
            await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), 'operational_mode');

            //register transfer controllers
            instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
            await instance.registerTransferController('ERC20', addressStorage.get('ERC20TransferController'), {from: ownerAccount});
            await instance.registerTransferController('ERC721', addressStorage.get('ERC721TransferController'), {from: ownerAccount});

            instance = await Validator.at(addressStorage.get('Validator'));
            await instance.setHasher(addressStorage.get('Hasher'));

            instance = await ClientFund.at(addressStorage.get('ClientFund'));
            await instance.setBalanceTracker(addressStorage.get('BalanceTracker'), true);
            await instance.setTransactionTracker(addressStorage.get('TransactionTracker'), true);
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), true);
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.registerService(addressStorage.get('DriipSettlement'));
            await instance.authorizeInitialService(addressStorage.get('DriipSettlement'));
            await instance.registerService(addressStorage.get('DriipSettlementDispute'));
            await instance.authorizeInitialService(addressStorage.get('DriipSettlementDispute'));
            await instance.registerService(addressStorage.get('NullSettlement'));
            await instance.authorizeInitialService(addressStorage.get('NullSettlement'));
            await instance.registerService(addressStorage.get('NullSettlementDispute'));
            await instance.authorizeInitialService(addressStorage.get('NullSettlementDispute'));
            await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPayment'));
            await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
            await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTrade'));
            await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            // await instance.disableInitialServiceAuthorization();
            await instance.registerBeneficiary(addressStorage.get('PaymentsRevenueFund'));
            await instance.registerBeneficiary(addressStorage.get('TradesRevenueFund'));

            instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setConfiguration(addressStorage.get('Configuration'));

            instance = await DriipSettlement.at(addressStorage.get('DriipSettlement'));
            await instance.setClientFund(addressStorage.get('ClientFund'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setDriipSettlementChallenge(addressStorage.get('DriipSettlementChallenge'));
            await instance.setTradesRevenueFund(addressStorage.get('TradesRevenueFund'));
            await instance.setPaymentsRevenueFund(addressStorage.get('PaymentsRevenueFund'));
            await instance.setPartnerFund(addressStorage.get('PartnerFund'));

            instance = await DriipSettlementChallenge.at(addressStorage.get('DriipSettlementChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setDriipSettlementDispute(addressStorage.get('DriipSettlementDispute'));

            instance = await DriipSettlementDispute.at(addressStorage.get('DriipSettlementDispute'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            await instance.setDriipSettlementChallenge(addressStorage.get('DriipSettlementChallenge'));

            instance = await NullSettlement.at(addressStorage.get('NullSettlement'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setClientFund(addressStorage.get('ClientFund'));
            await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            await instance.setNullSettlementChallenge(addressStorage.get('NullSettlementChallenge'));

            instance = await NullSettlementChallenge.at(addressStorage.get('NullSettlementChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setBalanceTracker(addressStorage.get('BalanceTracker'), false);
            await instance.setNullSettlementDispute(addressStorage.get('NullSettlementDispute'));

            instance = await NullSettlementDispute.at(addressStorage.get('NullSettlementDispute'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            await instance.setNullSettlementChallenge(addressStorage.get('NullSettlementChallenge'));

            instance = await FraudChallenge.at(addressStorage.get('FraudChallenge'));
            await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), 'add_fraudulent_order');
            await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), 'add_fraudulent_trade');
            await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), 'add_fraudulent_payment');
            await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), 'add_fraudulent_trade');
            await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), 'add_fraudulent_trade');
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), 'add_double_spender_wallet');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'), 'add_fraudulent_trade');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'), 'add_fraudulent_payment');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'), 'add_fraudulent_trade');
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'), 'add_fraudulent_payment');
            await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), 'add_fraudulent_trade');
            await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), 'add_fraudulent_payment');
            await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), 'add_fraudulent_trade');
            await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), 'add_fraudulent_payment');

            instance = await FraudChallengeByOrder.at(addressStorage.get('FraudChallengeByOrder'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByTrade.at(addressStorage.get('FraudChallengeByTrade'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);

            instance = await FraudChallengeByPayment.at(addressStorage.get('FraudChallengeByPayment'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);

            instance = await FraudChallengeBySuccessiveTrades.at(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);

            instance = await FraudChallengeBySuccessivePayments.at(addressStorage.get('FraudChallengeBySuccessivePayments'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);

            instance = await FraudChallengeByPaymentSucceedingTrade.at(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);

            instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);

            instance = await FraudChallengeByTradeOrderResiduals.at(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'), false);

            instance = await FraudChallengeByDoubleSpentOrders.at(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfTrades.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfPayments.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));

            instance = await FraudChallengeByDuplicateDriipNonceOfTradeAndPayment.at(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));

            instance = await RevenueFund.at(addressStorage.get('TradesRevenueFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
            await instance.registerFractionalBeneficiary(addressStorage.get('PartnerFund'), 1e16);

            instance = await RevenueFund.at(addressStorage.get('PaymentsRevenueFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
            await instance.registerFractionalBeneficiary(addressStorage.get('PartnerFund'), 1e16);

            instance = await SecurityBond.at(addressStorage.get('SecurityBond'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), 'reward');
            await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), 'reward');
            await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), 'reward');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTrades'), 'reward');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfPayments'), 'reward');
            await instance.registerService(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'));
            await instance.enableServiceAction(addressStorage.get('FraudChallengeByDuplicateDriipNonceOfTradeAndPayment'), 'reward');
            await instance.registerService(addressStorage.get('DriipSettlementDispute'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDispute'), 'reward');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDispute'), 'deprive');
            await instance.registerService(addressStorage.get('NullSettlementDispute'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementDispute'), 'reward');

            instance = await TokenHolderRevenueFund.at(addressStorage.get('TokenHolderRevenueFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.setRevenueToken(addressStorage.get('NahmiiToken'));

            instance = await PartnerFund.at(addressStorage.get('PartnerFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));

            instance = await BalanceTracker.at(addressStorage.get('BalanceTracker'));
            await instance.registerService(addressStorage.get('ClientFund'));

            instance = await TransactionTracker.at(addressStorage.get('TransactionTracker'));
            await instance.registerService(addressStorage.get('ClientFund'));

            instance = await WalletLocker.at(addressStorage.get('WalletLocker'));
            await instance.registerService(addressStorage.get('DriipSettlementDispute'));
            await instance.authorizeInitialService(addressStorage.get('DriipSettlementDispute'));
            await instance.registerService(addressStorage.get('NullSettlementDispute'));
            await instance.authorizeInitialService(addressStorage.get('NullSettlementDispute'));

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
