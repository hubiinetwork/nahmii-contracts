/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const AccrualBenefactor = artifacts.require('AccrualBenefactor');
const BalanceTracker = artifacts.require('BalanceTracker');
const BalanceTrackerLib = artifacts.require('BalanceTrackerLib');
const BlockNumbDisdIntsLib = artifacts.require('BlockNumbDisdIntsLib');
const BlockNumbFiguresLib = artifacts.require('BlockNumbFiguresLib');
const BlockNumbIntsLib = artifacts.require('BlockNumbIntsLib');
const BlockNumbReferenceCurrenciesLib = artifacts.require('BlockNumbReferenceCurrenciesLib');
const BlockNumbUintsLib = artifacts.require('BlockNumbUintsLib');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const ClientFund = artifacts.require('ClientFund');
const ClientFundable = artifacts.require('ClientFundable');
const CommunityVote = artifacts.require('CommunityVote');
const Configuration = artifacts.require('Configuration');
const ConstantsLib = artifacts.require('ConstantsLib');
const CurrenciesLib = artifacts.require('CurrenciesLib');
const DriipSettlementByPayment = artifacts.require('DriipSettlementByPayment');
const DriipSettlementByTrade = artifacts.require('DriipSettlementByTrade');
const DriipSettlementChallengeState = artifacts.require('DriipSettlementChallengeState');
const DriipSettlementChallengeByOrder = artifacts.require('DriipSettlementChallengeByOrder');
const DriipSettlementChallengeByPayment = artifacts.require('DriipSettlementChallengeByPayment');
const DriipSettlementChallengeByTrade = artifacts.require('DriipSettlementChallengeByTrade');
const DriipSettlementDisputeByOrder = artifacts.require('DriipSettlementDisputeByOrder');
const DriipSettlementDisputeByPayment = artifacts.require('DriipSettlementDisputeByPayment');
const DriipSettlementDisputeByTrade = artifacts.require('DriipSettlementDisputeByTrade');
const DriipSettlementState = artifacts.require('DriipSettlementState');
const DriipSettlementTypesLib = artifacts.require('DriipSettlementTypesLib');
const ERC20TransferController = artifacts.require('ERC20TransferController');
const ERC721TransferController = artifacts.require('ERC721TransferController');
const FraudChallenge = artifacts.require('FraudChallenge');
const FraudChallengeByDoubleSpentOrders = artifacts.require('FraudChallengeByDoubleSpentOrders');
const FraudChallengeByOrder = artifacts.require('FraudChallengeByOrder');
const FraudChallengeByPayment = artifacts.require('FraudChallengeByPayment');
const FraudChallengeByPaymentSucceedingTrade = artifacts.require('FraudChallengeByPaymentSucceedingTrade');
const FraudChallengeBySuccessivePayments = artifacts.require('FraudChallengeBySuccessivePayments');
const FraudChallengeBySuccessiveTrades = artifacts.require('FraudChallengeBySuccessiveTrades');
const FraudChallengeByTrade = artifacts.require('FraudChallengeByTrade');
const FraudChallengeByTradeOrderResiduals = artifacts.require('FraudChallengeByTradeOrderResiduals');
const FraudChallengeByTradeSucceedingPayment = artifacts.require('FraudChallengeByTradeSucceedingPayment');
const FungibleBalanceLib = artifacts.require('FungibleBalanceLib');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');
const MockedClientFund = artifacts.require('MockedClientFund');
const MockedConfiguration = artifacts.require('MockedConfiguration');
const MockedDriipSettlementDisputeByPayment = artifacts.require('MockedDriipSettlementDisputeByPayment');
const MockedDriipSettlementDisputeByOrder = artifacts.require('MockedDriipSettlementDisputeByOrder');
const MockedDriipSettlementDisputeByTrade = artifacts.require('MockedDriipSettlementDisputeByTrade');
const MockedDriipSettlementState = artifacts.require('MockedDriipSettlementState');
const MockedValidator = artifacts.require('MockedValidator');
const MonetaryTypesLib = artifacts.require('MonetaryTypesLib');
const NahmiiTypesLib = artifacts.require('NahmiiTypesLib');
const NonFungibleBalanceLib = artifacts.require('NonFungibleBalanceLib');
const NullSettlement = artifacts.require('NullSettlement');
const NullSettlementChallengeByOrder = artifacts.require('NullSettlementChallengeByOrder');
const NullSettlementChallengeByPayment = artifacts.require('NullSettlementChallengeByPayment');
const NullSettlementChallengeByTrade = artifacts.require('NullSettlementChallengeByTrade');
const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');
const NullSettlementDisputeByOrder = artifacts.require('NullSettlementDisputeByOrder');
const NullSettlementDisputeByPayment = artifacts.require('NullSettlementDisputeByPayment');
const NullSettlementDisputeByTrade = artifacts.require('NullSettlementDisputeByTrade');
const NullSettlementState = artifacts.require('NullSettlementState');
const PartnerFund = artifacts.require('PartnerFund');
const PartnerBenefactor = artifacts.require('PartnerBenefactor');
const PaymentHasher = artifacts.require('PaymentHasher');
const PaymentTypesLib = artifacts.require('PaymentTypesLib');
const RevenueFund1 = artifacts.require('RevenueFund1');
const RevenueTokenManager = artifacts.require('RevenueTokenManager');
const SafeMathIntLib = artifacts.require('SafeMathIntLib');
const SafeMathUintLib = artifacts.require('SafeMathUintLib');
const SecurityBond = artifacts.require('SecurityBond');
const SettlementChallengeTypesLib = artifacts.require('SettlementChallengeTypesLib');
const SignerManager = artifacts.require('SignerManager');
const Strings = artifacts.require('Strings');
const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');
const TradeHasher = artifacts.require('TradeHasher');
const TradeTypesLib = artifacts.require('TradeTypesLib');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const TransactionTracker = artifacts.require('TransactionTracker');
const TxHistoryLib = artifacts.require('TxHistoryLib');
const Validatable = artifacts.require('Validatable');
const ValidatableV2 = artifacts.require('ValidatableV2');
const Validator = artifacts.require('Validator');
const ValidatorV2 = artifacts.require('ValidatorV2');
const WalletLocker = artifacts.require('WalletLocker');

const debug = require('debug')('5_bulk_of_contract');
const path = require('path');
const helpers = require('../scripts/common/helpers.js');
const AddressStorage = require('../scripts/common/address_storage.js');

require('../scripts/common/promisify_web3.js')(web3);

// -----------------------------------------------------------------------------------------------------------------

module.exports = (deployer, network, accounts) => {

    deployer.then(async () => {
        let addressStorage = new AddressStorage(deployer.basePath + path.sep + '..' + path.sep + 'build' + path.sep + 'addresses.json', network);
        let deployerAccount;
        let instance;

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
                deployer: deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage: addressStorage,
                deployerAccount: deployerAccount
            };

            BalanceTrackerLib.address = addressStorage.get('BalanceTrackerLib');
            BlockNumbDisdIntsLib.address = addressStorage.get('BlockNumbDisdIntsLib');
            BlockNumbFiguresLib.address = addressStorage.get('BlockNumbFiguresLib');
            BlockNumbIntsLib.address = addressStorage.get('BlockNumbIntsLib');
            BlockNumbReferenceCurrenciesLib.address = addressStorage.get('BlockNumbReferenceCurrenciesLib');
            BlockNumbUintsLib.address = addressStorage.get('BlockNumbUintsLib');
            ConstantsLib.address = addressStorage.get('ConstantsLib');
            CurrenciesLib.address = addressStorage.get('CurrenciesLib');
            DriipSettlementTypesLib.address = addressStorage.get('DriipSettlementTypesLib');
            FungibleBalanceLib.address = addressStorage.get('FungibleBalanceLib');
            MonetaryTypesLib.address = addressStorage.get('MonetaryTypesLib');
            NahmiiTypesLib.address = addressStorage.get('NahmiiTypesLib');
            NonFungibleBalanceLib.address = addressStorage.get('NonFungibleBalanceLib');
            PaymentTypesLib.address = addressStorage.get('PaymentTypesLib');
            SafeMathIntLib.address = addressStorage.get('SafeMathIntLib');
            SafeMathUintLib.address = addressStorage.get('SafeMathUintLib');
            SettlementChallengeTypesLib.address = addressStorage.get('SettlementChallengeTypesLib');
            Strings.address = addressStorage.get('Strings');
            TradeTypesLib.address = addressStorage.get('TradeTypesLib');
            TxHistoryLib.address = addressStorage.get('TxHistoryLib');

            await deployer.link(BalanceTrackerLib, [
                DriipSettlementChallengeByPayment,
                DriipSettlementDisputeByPayment,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeByTradeSucceedingPayment,
                NullSettlementChallengeByPayment,
                NullSettlementChallengeByOrder,
                NullSettlementChallengeByTrade,
                NullSettlementDisputeByPayment
            ]);
            await deployer.link(BlockNumbDisdIntsLib, [
                Configuration
            ]);
            await deployer.link(BlockNumbFiguresLib, [
                Configuration
            ]);
            await deployer.link(BlockNumbIntsLib, [
                Configuration
            ]);
            await deployer.link(BlockNumbReferenceCurrenciesLib, [
                Configuration
            ]);
            await deployer.link(BlockNumbUintsLib, [
                Configuration
            ]);
            await deployer.link(ConstantsLib, [
                AccrualBenefactor,
                Configuration,
                MockedConfiguration,
                RevenueFund1,
                SecurityBond,
                Validator,
                ValidatorV2
            ]);
            await deployer.link(CurrenciesLib, [
                PartnerFund,
                RevenueFund1,
                SecurityBond,
                TokenHolderRevenueFund
            ]);
            await deployer.link(FungibleBalanceLib, [
                BalanceTracker,
                PartnerFund,
                RevenueFund1,
                SecurityBond,
                TokenHolderRevenueFund
            ]);
            await deployer.link(MonetaryTypesLib, [
                Configuration,
                DriipSettlementByPayment,
                DriipSettlementByTrade,
                DriipSettlementChallengeByOrder,
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
                DriipSettlementDisputeByOrder,
                DriipSettlementDisputeByPayment,
                DriipSettlementDisputeByTrade,
                DriipSettlementState,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeBySuccessivePayments,
                FraudChallengeByTradeSucceedingPayment,
                MockedBeneficiary,
                MockedClientFund,
                NullSettlement,
                NullSettlementChallengeState,
                NullSettlementDisputeByOrder,
                NullSettlementDisputeByPayment,
                NullSettlementDisputeByTrade,
                NullSettlementState,
                PartnerFund,
                PaymentHasher,
                RevenueFund1,
                SecurityBond,
                TokenHolderRevenueFund,
                TradeHasher,
                Validator,
                ValidatorV2
            ]);
            await deployer.link(NahmiiTypesLib, [
                CancelOrdersChallenge,
                ClientFundable,
                DriipSettlementByPayment,
                DriipSettlementByTrade,
                DriipSettlementChallengeByOrder,
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
                DriipSettlementDisputeByOrder,
                DriipSettlementDisputeByPayment,
                DriipSettlementDisputeByTrade,
                DriipSettlementState,
                FraudChallengeByDoubleSpentOrders,
                FraudChallengeByOrder,
                FraudChallengeByPayment,
                FraudChallengeBySuccessivePayments,
                FraudChallengeByTrade,
                FraudChallengeByTradeOrderResiduals,
                MockedCancelOrdersChallenge,
                MockedValidator,
                NullSettlementChallengeState,
                PaymentHasher,
                TradeHasher,
                Validatable,
                Validator,
                ValidatorV2
            ]);
            await deployer.link(NonFungibleBalanceLib, [
                BalanceTracker
            ]);
            await deployer.link(PaymentTypesLib, [
                DriipSettlementByPayment,
                DriipSettlementChallengeByPayment,
                DriipSettlementDisputeByPayment,
                FraudChallengeByPayment,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments,
                FraudChallengeByTradeSucceedingPayment,
                MockedDriipSettlementDisputeByPayment,
                MockedValidator,
                NullSettlementChallengeByPayment,
                NullSettlementDisputeByPayment,
                PaymentHasher,
                Validatable,
                ValidatableV2,
                Validator,
                ValidatorV2
            ]);
            await deployer.link(SafeMathIntLib, [
                AccrualBenefactor,
                BalanceTracker,
                CancelOrdersChallenge,
                ClientFund,
                Configuration,
                DriipSettlementByPayment,
                DriipSettlementByTrade,
                DriipSettlementChallengeByOrder,
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
                DriipSettlementDisputeByOrder,
                DriipSettlementDisputeByPayment,
                DriipSettlementDisputeByTrade,
                DriipSettlementState,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeByTrade,
                FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment,
                NullSettlement,
                NullSettlementChallengeByOrder,
                NullSettlementChallengeByPayment,
                NullSettlementChallengeByTrade,
                NullSettlementChallengeState,
                NullSettlementDisputeByOrder,
                NullSettlementDisputeByPayment,
                NullSettlementDisputeByTrade,
                NullSettlementState,
                PartnerFund,
                RevenueFund1,
                SecurityBond,
                TokenHolderRevenueFund,
                Validator,
                ValidatorV2
            ]);
            await deployer.link(SafeMathUintLib, [
                BalanceTracker,
                CancelOrdersChallenge,
                ClientFund,
                DriipSettlementByPayment,
                DriipSettlementByTrade,
                DriipSettlementChallengeByOrder,
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
                DriipSettlementDisputeByOrder,
                DriipSettlementDisputeByPayment,
                DriipSettlementDisputeByTrade,
                DriipSettlementState,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeByTradeSucceedingPayment,
                MockedDriipSettlementState,
                NullSettlement,
                NullSettlementChallengeByOrder,
                NullSettlementChallengeByPayment,
                NullSettlementChallengeByTrade,
                NullSettlementChallengeState,
                NullSettlementDisputeByOrder,
                NullSettlementDisputeByPayment,
                NullSettlementDisputeByTrade,
                NullSettlementState,
                RevenueFund1,
                RevenueTokenManager,
                SecurityBond,
                SignerManager,
                TokenHolderRevenueFund,
                Validator,
                ValidatorV2,
                WalletLocker
            ]);
            await deployer.link(SettlementChallengeTypesLib, [
                DriipSettlementByPayment,
                DriipSettlementByTrade,
                DriipSettlementChallengeByOrder,
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
                DriipSettlementDisputeByOrder,
                DriipSettlementDisputeByPayment,
                DriipSettlementDisputeByTrade,
                NullSettlement,
                NullSettlementChallengeByOrder,
                NullSettlementChallengeByPayment,
                NullSettlementChallengeByTrade,
                NullSettlementChallengeState,
                NullSettlementDisputeByOrder,
                NullSettlementDisputeByPayment,
                NullSettlementDisputeByTrade
            ]);
            await deployer.link(DriipSettlementTypesLib, [
                DriipSettlementByPayment,
                DriipSettlementByTrade,
                DriipSettlementState
            ]);
            await deployer.link(Strings, [
                PartnerFund
            ]);
            await deployer.link(TradeTypesLib, [
                CancelOrdersChallenge,
                DriipSettlementByTrade,
                DriipSettlementChallengeByOrder,
                DriipSettlementChallengeByTrade,
                DriipSettlementDisputeByOrder,
                DriipSettlementDisputeByTrade,
                FraudChallengeByDoubleSpentOrders,
                FraudChallengeByOrder,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeByTrade,
                FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment,
                MockedCancelOrdersChallenge,
                MockedDriipSettlementDisputeByOrder,
                MockedDriipSettlementDisputeByTrade,
                MockedValidator,
                NullSettlementChallengeByOrder,
                NullSettlementChallengeByTrade,
                NullSettlementDisputeByOrder,
                NullSettlementDisputeByTrade,
                TradeHasher,
                Validatable,
                ValidatableV2,
                Validator,
                ValidatorV2
            ]);
            await deployer.link(TxHistoryLib, [
                ClientFund,
                PartnerFund,
                RevenueFund1,
                SecurityBond,
                TokenHolderRevenueFund
            ]);

            const delayBlocks = helpers.isTestNetwork(network) ? 1 : 10;

            if (helpers.isTestNetwork(network)) {
                await execDeploy(ctl, 'BalanceTracker', '', BalanceTracker);
                await execDeploy(ctl, 'CancelOrdersChallenge', '', CancelOrdersChallenge);
                await execDeploy(ctl, 'ClientFund', '', ClientFund);
                await execDeploy(ctl, 'CommunityVote', '', CommunityVote);
                await execDeploy(ctl, 'Configuration', '', Configuration);
                await execDeploy(ctl, 'DriipSettlementByPayment', '', DriipSettlementByPayment);
                await execDeploy(ctl, 'DriipSettlementByTrade', '', DriipSettlementByTrade);
                await execDeploy(ctl, 'DriipSettlementChallengeByOrder', '', DriipSettlementChallengeByOrder);
                await execDeploy(ctl, 'DriipSettlementChallengeByPayment', '', DriipSettlementChallengeByPayment);
                await execDeploy(ctl, 'DriipSettlementChallengeByTrade', '', DriipSettlementChallengeByTrade);
                await execDeploy(ctl, 'DriipSettlementChallengeState', '', DriipSettlementChallengeState);
                await execDeploy(ctl, 'DriipSettlementDisputeByOrder', '', DriipSettlementDisputeByOrder);
                await execDeploy(ctl, 'DriipSettlementDisputeByPayment', '', DriipSettlementDisputeByPayment);
                await execDeploy(ctl, 'DriipSettlementDisputeByTrade', '', DriipSettlementDisputeByTrade);
                await execDeploy(ctl, 'DriipSettlementState', '', DriipSettlementState);
                await execDeploy(ctl, 'ERC20TransferController', '', ERC20TransferController);
                await execDeploy(ctl, 'ERC721TransferController', '', ERC721TransferController);
                await execDeploy(ctl, 'FraudChallenge', '', FraudChallenge);
                await execDeploy(ctl, 'FraudChallengeByDoubleSpentOrders', '', FraudChallengeByDoubleSpentOrders);
                await execDeploy(ctl, 'FraudChallengeByOrder', '', FraudChallengeByOrder);
                await execDeploy(ctl, 'FraudChallengeByPayment', '', FraudChallengeByPayment);
                await execDeploy(ctl, 'FraudChallengeByPaymentSucceedingTrade', '', FraudChallengeByPaymentSucceedingTrade);
                await execDeploy(ctl, 'FraudChallengeBySuccessivePayments', '', FraudChallengeBySuccessivePayments);
                await execDeploy(ctl, 'FraudChallengeBySuccessiveTrades', '', FraudChallengeBySuccessiveTrades);
                await execDeploy(ctl, 'FraudChallengeByTrade', '', FraudChallengeByTrade);
                await execDeploy(ctl, 'FraudChallengeByTradeOrderResiduals', '', FraudChallengeByTradeOrderResiduals);
                await execDeploy(ctl, 'FraudChallengeByTradeSucceedingPayment', '', FraudChallengeByTradeSucceedingPayment);
                await execDeploy(ctl, 'NullSettlement', '', NullSettlement);
                await execDeploy(ctl, 'NullSettlementChallengeByOrder', '', NullSettlementChallengeByOrder);
                await execDeploy(ctl, 'NullSettlementChallengeByPayment', '', NullSettlementChallengeByPayment);
                await execDeploy(ctl, 'NullSettlementChallengeByTrade', '', NullSettlementChallengeByTrade);
                await execDeploy(ctl, 'NullSettlementChallengeState', '', NullSettlementChallengeState);
                await execDeploy(ctl, 'NullSettlementDisputeByOrder', '', NullSettlementDisputeByOrder);
                await execDeploy(ctl, 'NullSettlementDisputeByPayment', '', NullSettlementDisputeByPayment);
                await execDeploy(ctl, 'NullSettlementDisputeByTrade', '', NullSettlementDisputeByTrade);
                await execDeploy(ctl, 'NullSettlementState', '', NullSettlementState);
                await execDeploy(ctl, 'PartnerBenefactor', '', PartnerBenefactor);
                await execDeploy(ctl, 'PaymentHasher', '', PaymentHasher);
                await execDeploy(ctl, 'RevenueFund1', '', RevenueFund1);
                await execDeploy(ctl, 'SecurityBond', '', SecurityBond);
                await execDeploy(ctl, 'SignerManager', '', SignerManager);
                await execDeploy(ctl, 'TokenHolderRevenueFund', '', TokenHolderRevenueFund);
                await execDeploy(ctl, 'TransferControllerManager', '', TransferControllerManager);
                await execDeploy(ctl, 'TransactionTracker', '', TransactionTracker);
                await execDeploy(ctl, 'TradeHasher', '', TradeHasher);
                await execDeploy(ctl, 'Validator', '', Validator, true);
                await execDeploy(ctl, 'ValidatorV2', '', ValidatorV2, true);
                await execDeploy(ctl, 'WalletLocker', '', WalletLocker);

                instance = await BalanceTracker.at(addressStorage.get('BalanceTracker'));
                await instance.registerService(addressStorage.get('ClientFund'));

                instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setConfiguration(addressStorage.get('Configuration'));

                instance = await ClientFund.at(addressStorage.get('ClientFund'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.freezeBalanceTracker();
                await instance.setTransactionTracker(addressStorage.get('TransactionTracker'));
                await instance.freezeTransactionTracker();
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.freezeWalletLocker();
                await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
                await instance.registerBeneficiary(addressStorage.get('RevenueFund1'));
                // await instance.registerBeneficiary(addressStorage.get('PartnerFund'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementByPayment'));
                await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementByTrade'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlement'));
                // await instance.disableInitialServiceAuthorization();

                instance = await Configuration.at(addressStorage.get('Configuration'));
                await instance.setConfirmationBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 12);
                await instance.setTradeMakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                       // 0.1%
                await instance.setTradeMakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                        // 0.00001%
                await instance.setTradeTakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e15, [], []);                       // 0.2%
                await instance.setTradeTakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e11);                        // 0.00002%
                await instance.setPaymentFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                          // 0.1%
                await instance.setPaymentMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                           // 0.00001%
                await instance.setWalletLockTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 30);              // 30 days
                await instance.setCancelOrderChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 3);               // 3 minutes
                await instance.setSettlementChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 5);                // 5 minutes
                await instance.setWalletSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e17);               // 10%
                await instance.setOperatorSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);             // 50%
                await instance.setFraudStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);                          // 50%
                // await instance.setUpdateDelayBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2880);                           // ~12 hours
                // await instance.setEarliestSettlementBlockNumber((await web3.eth.getBlockNumberPromise()) + 172800);                          // In ~30 days
                // await instance.disableEarliestSettlementBlockNumberUpdate();
                await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.OPERATIONAL_MODE_ACTION.call());

                instance = await DriipSettlementChallengeState.at(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.INITIATE_PROPOSAL_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.QUALIFY_PROPOSAL_ACTION.call());

                instance = await DriipSettlementChallengeByOrder.at(addressStorage.get('DriipSettlementChallengeByOrder'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByOrder(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementChallengeByPayment.at(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByPayment(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementChallengeByTrade.at(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByTrade(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementDisputeByOrder.at(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

                instance = await DriipSettlementDisputeByPayment.at(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

                instance = await DriipSettlementDisputeByTrade.at(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

                instance = await DriipSettlementState.at(addressStorage.get('DriipSettlementState'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_TOTAL_FEE_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_TOTAL_FEE_ACTION.call());

                instance = await DriipSettlementByPayment.at(addressStorage.get('DriipSettlementByPayment'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
                await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
                // await instance.setPartnerBenefactor(addressStorage.get('PartnerBenefactor'));

                instance = await DriipSettlementByTrade.at(addressStorage.get('DriipSettlementByTrade'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
                await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
                // await instance.setPartnerFund(addressStorage.get('PartnerFund'));

                instance = await NullSettlementChallengeState.at(addressStorage.get('NullSettlementChallengeState'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

                instance = await NullSettlementChallengeByOrder.at(addressStorage.get('NullSettlementChallengeByOrder'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setNullSettlementDisputeByOrder(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

                instance = await NullSettlementChallengeByPayment.at(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setNullSettlementDisputeByPayment(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                instance = await NullSettlementChallengeByTrade.at(addressStorage.get('NullSettlementChallengeByTrade'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setNullSettlementDisputeByTrade(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                instance = await NullSettlementDisputeByOrder.at(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('NullSettlementChallengeByOrder'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

                instance = await NullSettlementDisputeByPayment.at(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

                instance = await NullSettlementDisputeByTrade.at(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

                instance = await NullSettlementState.at(addressStorage.get('NullSettlementState'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NULL_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NONCE_ACTION.call());

                instance = await NullSettlement.at(addressStorage.get('NullSettlement'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setNullSettlementState(addressStorage.get('NullSettlementState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                instance = await FraudChallenge.at(addressStorage.get('FraudChallenge'));
                await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.ADD_FRAUDULENT_ORDER_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.ADD_DOUBLE_SPENDER_WALLET_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());

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
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                instance = await FraudChallengeByPayment.at(addressStorage.get('FraudChallengeByPayment'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                instance = await FraudChallengeBySuccessiveTrades.at(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                instance = await FraudChallengeBySuccessivePayments.at(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                instance = await FraudChallengeByPaymentSucceedingTrade.at(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                instance = await FraudChallengeByTradeOrderResiduals.at(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                instance = await FraudChallengeByDoubleSpentOrders.at(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));

                // instance = await PartnerFund.at(addressStorage.get('PartnerFund'));
                // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));

                instance = await RevenueFund1.at(addressStorage.get('RevenueFund1'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
                await instance.registerFractionalBeneficiary(addressStorage.get('SecurityBond'), 1e16);

                instance = await SecurityBond.at(addressStorage.get('SecurityBond'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.REWARD_ACTION.call());

                instance = await TokenHolderRevenueFund.at(addressStorage.get('TokenHolderRevenueFund'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
                await instance.registerService(addressStorage.get('RevenueFund1'));
                await instance.enableServiceAction(addressStorage.get('RevenueFund1'), await instance.CLOSE_ACCRUAL_PERIOD_ACTION.call());

                instance = await TransactionTracker.at(addressStorage.get('TransactionTracker'));
                await instance.registerService(addressStorage.get('ClientFund'));

                instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
                await instance.registerTransferController('ERC20', addressStorage.get('ERC20TransferController'), {from: deployerAccount});
                await instance.registerTransferController('ERC721', addressStorage.get('ERC721TransferController'), {from: deployerAccount});

                instance = await Validator.at(addressStorage.get('Validator'));
                await instance.setPaymentHasher(addressStorage.get('PaymentHasher'));

                instance = await ValidatorV2.at(addressStorage.get('ValidatorV2'));
                await instance.setPaymentHasher(addressStorage.get('PaymentHasher'));
                await instance.setTradeHasher(addressStorage.get('TradeHasher'));

                instance = await WalletLocker.at(addressStorage.get('WalletLocker'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPayment'));
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTrade'));
                await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));

            } else if (network.startsWith('ropsten')) {
                addressStorage.set('BalanceTracker', '0xb6ca09b4ab57d97d39cf8b9398b268c67be5d6d1');
                addressStorage.set('CancelOrdersChallenge', '0x9a21bb069ca0da711d28da602293557be8ca91b3');
                addressStorage.set('ClientFund', '0x498415a27f4db112289ddc85527ef8bbd01182b5');
                addressStorage.set('CommunityVote', '0xc7a0fded2fce1862d39101f833dac82e82254938');
                addressStorage.set('Configuration', '0xa1c8e9a9147a2b95e5e09ba17fcf6c55781688a2');
                await execDeploy(ctl, 'DriipSettlementByPayment', '', DriipSettlementByPayment);
                addressStorage.set('DriipSettlementByTrade', '0x69af2da11c038053983c7e77fe803fee2d22ea1c');
                addressStorage.set('DriipSettlementChallengeByOrder', '0xf2e93abec604400d5712578715ee580436026dba');
                await execDeploy(ctl, 'DriipSettlementChallengeByPayment', '', DriipSettlementChallengeByPayment);
                addressStorage.set('DriipSettlementChallengeByTrade', '0x20331cdba761540fdddc5cf33fabaf5f9db5c4c1');
                await execDeploy(ctl, 'DriipSettlementChallengeState', '', DriipSettlementChallengeState);
                addressStorage.set('DriipSettlementDisputeByOrder', '0xc20f55808e27c2d4a164d25d47c7d97093d9dd12');
                await execDeploy(ctl, 'DriipSettlementDisputeByPayment', '', DriipSettlementDisputeByPayment);
                addressStorage.set('DriipSettlementDisputeByTrade', '0x5765a45c11a2f698ac4fd85add87417bce8f1017');
                await execDeploy(ctl, 'DriipSettlementState', '', DriipSettlementState);
                addressStorage.set('ERC20TransferController', '0xab904a284a97428a7dc0ac918ef7a0b952e57a60');
                addressStorage.set('ERC721TransferController', '0x4b40c23432f1af4b9813e336e65a518e2486fe4a');
                addressStorage.set('FraudChallenge', '0x791e33fb6e660383747ab03b3ba61aa15cd38158');
                // await execDeploy(ctl, 'FraudChallengeByDoubleSpentOrders', '', FraudChallengeByDoubleSpentOrders);
                // await execDeploy(ctl, 'FraudChallengeByOrder', '', FraudChallengeByOrder);
                addressStorage.set('FraudChallengeByPayment', '0xe87c3b5f47ce9261ff7d9f01940389772798119e');
                // await execDeploy(ctl, 'FraudChallengeByPaymentSucceedingTrade', '', FraudChallengeByPaymentSucceedingTrade);
                addressStorage.set('FraudChallengeBySuccessivePayments', '0xa223c1c06a8d6f962a08b4ac6bd86dc4e1744db7');
                // await execDeploy(ctl, 'FraudChallengeBySuccessiveTrades', '', FraudChallengeBySuccessiveTrades);
                // await execDeploy(ctl, 'FraudChallengeByTrade', '', FraudChallengeByTrade);
                // await execDeploy(ctl, 'FraudChallengeByTradeOrderResiduals', '', FraudChallengeByTradeOrderResiduals);
                // await execDeploy(ctl, 'FraudChallengeByTradeSucceedingPayment', '', FraudChallengeByTradeSucceedingPayment);
                await execDeploy(ctl, 'NullSettlement', '', NullSettlement);
                addressStorage.set('NullSettlementChallengeByOrder', '0xc3766e1bf065613f99b7a2b8fe98281a7700ff9e');
                await execDeploy(ctl, 'NullSettlementChallengeByPayment', '', NullSettlementChallengeByPayment);
                addressStorage.set('NullSettlementChallengeByTrade', '0xc2964f33c8ab292844bc3376a1e0df93b602fea9');
                await execDeploy(ctl, 'NullSettlementChallengeState', '', NullSettlementChallengeState);
                addressStorage.set('NullSettlementDisputeByOrder', '0x81b32924d65df123de6ecdc9085d22b16bda0e80');
                await execDeploy(ctl, 'NullSettlementDisputeByPayment', '', NullSettlementDisputeByPayment);
                addressStorage.set('NullSettlementDisputeByTrade', '0x159dd94a91d987823ef5695bbe5e5adcc66d97b8');
                await execDeploy(ctl, 'NullSettlementState', '', NullSettlementState);
                addressStorage.set('PartnerBenefactor', '0xf513697f023013aba82146cecc32b50b543d7b19');
                addressStorage.set('PaymentHasher', '0x6bc3a42823d78dda3d57c3ca09f62198d4196393');
                addressStorage.set('RevenueFund1', '0x744aa6717140664031dab8ef61b4acf1acf691ed');
                addressStorage.set('SecurityBond', '0x4686d214e5f070e7c44652af15e70c5ef364f7ff');
                addressStorage.set('SignerManager', '0x04ee36463184815fac38d522c7bdbe8cf861db79');
                addressStorage.set('TokenHolderRevenueFund', '0x345d03eb4dfdb27d67afc0de808d056a12834a37');
                addressStorage.set('TradeHasher', '0x613cb841e8c008de9eb4cbc57677676ce336de1b');
                addressStorage.set('TransactionTracker', '0x92aabb89d4833e866cdafe0d1beca4939925dc61');
                addressStorage.set('TransferControllerManager', '0x164cdbdc5c28bca159a4188bb960095b2c0ed85c');
                addressStorage.set('Validator', '0xf62d86b3b4122eb8572eef80ebddf5adc95a0a0f');
                addressStorage.set('ValidatorV2', '0x10959bd0a71454c8a8c8ba2c6a182f977508cd29');
                addressStorage.set('WalletLocker', '0xa032f37e992585cb202b8cc51812932684b00bcc');

                // instance = await BalanceTracker.at(addressStorage.get('BalanceTracker'));
                // await instance.registerService(addressStorage.get('ClientFund'));

                // instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));

                instance = await ClientFund.at(addressStorage.get('ClientFund'));
                // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.freezeBalanceTracker();
                // await instance.setTransactionTracker(addressStorage.get('TransactionTracker'));
                // await instance.freezeTransactionTracker();
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.freezeWalletLocker();
                // await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
                // await instance.registerBeneficiary(addressStorage.get('RevenueFund1'));
                // await instance.registerBeneficiary(addressStorage.get('PartnerFund'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementByPayment'));
                // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                // await instance.authorizeInitialService(addressStorage.get('DriipSettlementByTrade'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlement'));
                // await instance.disableInitialServiceAuthorization();

                // instance = await Configuration.at(addressStorage.get('Configuration'));
                // await instance.setConfirmationBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 12);
                // await instance.setTradeMakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                       // 0.1%
                // await instance.setTradeMakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                        // 0.00001%
                // await instance.setTradeTakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e15, [], []);                       // 0.2%
                // await instance.setTradeTakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e11);                        // 0.00002%
                // await instance.setPaymentFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                          // 0.1%
                // await instance.setPaymentMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                           // 0.00001%
                // await instance.setWalletLockTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 30);              // 30 days
                // await instance.setCancelOrderChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 3);     // 3 days
                // await instance.setSettlementChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 5);      // 5 days
                // await instance.setWalletSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e17);               // 10%
                // await instance.setOperatorSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);             // 50%
                // await instance.setFraudStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);                          // 50%
                // await instance.setUpdateDelayBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2880);                           // ~12 hours
                // await instance.setEarliestSettlementBlockNumber((await web3.eth.getBlockNumberPromise()) + 172800);                          // In ~30 days
                // await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.disableEarliestSettlementBlockNumberUpdate();
                // await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.OPERATIONAL_MODE_ACTION.call());

                instance = await DriipSettlementChallengeState.at(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.QUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.QUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

                instance = await DriipSettlementChallengeByOrder.at(addressStorage.get('DriipSettlementChallengeByOrder'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.setDriipSettlementDisputeByOrder(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementChallengeByPayment.at(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByPayment(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementChallengeByTrade.at(addressStorage.get('DriipSettlementChallengeByTrade'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.setDriipSettlementDisputeByTrade(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementDisputeByOrder.at(addressStorage.get('DriipSettlementDisputeByOrder'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                // await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

                instance = await DriipSettlementDisputeByPayment.at(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

                instance = await DriipSettlementDisputeByTrade.at(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

                instance = await DriipSettlementState.at(addressStorage.get('DriipSettlementState'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_TOTAL_FEE_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_TOTAL_FEE_ACTION.call());

                instance = await DriipSettlementByPayment.at(addressStorage.get('DriipSettlementByPayment'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
                await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
                // await instance.setPartnerBenefactor(addressStorage.get('PartnerBenefactor'));

                instance = await DriipSettlementByTrade.at(addressStorage.get('DriipSettlementByTrade'));
                // await instance.setClientFund(addressStorage.get('ClientFund'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
                // await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
                // await instance.setPartnerBenefactor(addressStorage.get('PartnerBenefactor'));

                instance = await NullSettlementChallengeState.at(addressStorage.get('NullSettlementChallengeState'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

                instance = await NullSettlementChallengeByOrder.at(addressStorage.get('NullSettlementChallengeByOrder'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setNullSettlementDisputeByOrder(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

                instance = await NullSettlementChallengeByPayment.at(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setNullSettlementDisputeByPayment(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                instance = await NullSettlementChallengeByTrade.at(addressStorage.get('NullSettlementChallengeByTrade'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setNullSettlementDisputeByTrade(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                instance = await NullSettlementDisputeByOrder.at(addressStorage.get('NullSettlementDisputeByOrder'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                // await instance.registerService(addressStorage.get('NullSettlementChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

                instance = await NullSettlementDisputeByPayment.at(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

                instance = await NullSettlementDisputeByTrade.at(addressStorage.get('NullSettlementDisputeByTrade'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                // await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

                instance = await NullSettlementState.at(addressStorage.get('NullSettlementState'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NULL_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NONCE_ACTION.call());

                instance = await NullSettlement.at(addressStorage.get('NullSettlement'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setNullSettlementState(addressStorage.get('NullSettlementState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                // instance = await FraudChallenge.at(addressStorage.get('FraudChallenge'));
                // await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.ADD_DOUBLE_SPENDER_WALLET_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.ADD_FRAUDULENT_ORDER_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());

                // instance = await FraudChallengeByOrder.at(addressStorage.get('FraudChallengeByOrder'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));

                // instance = await FraudChallengeByTrade.at(addressStorage.get('FraudChallengeByTrade'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                // instance = await FraudChallengeByPayment.at(addressStorage.get('FraudChallengeByPayment'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                // instance = await FraudChallengeBySuccessiveTrades.at(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                // instance = await FraudChallengeBySuccessivePayments.at(addressStorage.get('FraudChallengeBySuccessivePayments'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                // instance = await FraudChallengeByPaymentSucceedingTrade.at(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                // instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                // instance = await FraudChallengeByTradeOrderResiduals.at(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                // instance = await FraudChallengeByDoubleSpentOrders.at(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));

                // instance = await PartnerFund.at(addressStorage.get('PartnerFund'));
                // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));

                // instance = await RevenueFund1.at(addressStorage.get('RevenueFund1'));
                // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                // await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
                // await instance.registerFractionalBeneficiary(addressStorage.get('SecurityBond'), 1e16);

                // instance = await SecurityBond.at(addressStorage.get('SecurityBond'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
                // await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.REWARD_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DEPRIVE_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
                // await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.REWARD_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DEPRIVE_ACTION.call());
                // await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.REWARD_ACTION.call());

                // instance = await TokenHolderRevenueFund.at(addressStorage.get('TokenHolderRevenueFund'));
                // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                // await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
                // await instance.registerService(addressStorage.get('RevenueFund1'));
                // await instance.enableServiceAction(addressStorage.get('RevenueFund1'), await instance.CLOSE_ACCRUAL_PERIOD_ACTION.call());

                // instance = await TransactionTracker.at(addressStorage.get('TransactionTracker'));
                // await instance.registerService(addressStorage.get('ClientFund'));

                // instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
                // await instance.registerTransferController('ERC20', addressStorage.get('ERC20TransferController'), {from: deployerAccount});
                // await instance.registerTransferController('ERC721', addressStorage.get('ERC721TransferController'), {from: deployerAccount});

                // instance = await Validator.at(addressStorage.get('Validator'));
                // await instance.setPaymentHasher(addressStorage.get('PaymentHasher'));

                // instance = await ValidatorV2.at(addressStorage.get('ValidatorV2'));
                // await instance.setPaymentHasher(addressStorage.get('PaymentHasher'));
                // await instance.setTradeHasher(addressStorage.get('TradeHasher'));

                // instance = await WalletLocker.at(addressStorage.get('WalletLocker'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                // await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByPayment'));
                // await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                // await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByPayment'));
                // await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPayment'));
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                // await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByOrder'));
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                // await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByOrder'));
                // await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                // await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByTrade'));
                // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));

            } else if (network.startsWith('mainnet')) {
                addressStorage.set('BalanceTracker', '0xbc1bcc29edf605095bf4fe7a953b7c115ecc8cad');
                await execDeploy(ctl, 'CancelOrdersChallenge', '', CancelOrdersChallenge);
                addressStorage.set('ClientFund', '0xcc8d82f6ba952966e63001c7b320eef2ae729099');
                await execDeploy(ctl, 'CommunityVote', '', CommunityVote);
                await execDeploy(ctl, 'Configuration', '', Configuration);
                await execDeploy(ctl, 'DriipSettlementByPayment', '', DriipSettlementByPayment);
                await execDeploy(ctl, 'DriipSettlementByTrade', '', DriipSettlementByTrade);
                await execDeploy(ctl, 'DriipSettlementChallengeByOrder', '', DriipSettlementChallengeByOrder);
                await execDeploy(ctl, 'DriipSettlementChallengeByPayment', '', DriipSettlementChallengeByPayment);
                await execDeploy(ctl, 'DriipSettlementChallengeByTrade', '', DriipSettlementChallengeByTrade);
                addressStorage.set('DriipSettlementChallengeState', '0x9b5b87ad686a55b59354f88a6a048c03b0495b62');
                await execDeploy(ctl, 'DriipSettlementDisputeByOrder', '', DriipSettlementDisputeByOrder);
                await execDeploy(ctl, 'DriipSettlementDisputeByPayment', '', DriipSettlementDisputeByPayment);
                await execDeploy(ctl, 'DriipSettlementDisputeByTrade', '', DriipSettlementDisputeByTrade);
                await execDeploy(ctl, 'DriipSettlementState', '', DriipSettlementState);
                await execDeploy(ctl, 'ERC20TransferController', '', ERC20TransferController);
                await execDeploy(ctl, 'ERC721TransferController', '', ERC721TransferController);
                await execDeploy(ctl, 'FraudChallenge', '', FraudChallenge);
                // await execDeploy(ctl, 'FraudChallengeByDoubleSpentOrders', '', FraudChallengeByDoubleSpentOrders);
                // await execDeploy(ctl, 'FraudChallengeByOrder', '', FraudChallengeByOrder);
                await execDeploy(ctl, 'FraudChallengeByPayment', '', FraudChallengeByPayment);
                // await execDeploy(ctl, 'FraudChallengeByPaymentSucceedingTrade', '', FraudChallengeByPaymentSucceedingTrade);
                await execDeploy(ctl, 'FraudChallengeBySuccessivePayments', '', FraudChallengeBySuccessivePayments);
                // await execDeploy(ctl, 'FraudChallengeBySuccessiveTrades', '', FraudChallengeBySuccessiveTrades);
                // await execDeploy(ctl, 'FraudChallengeByTrade', '', FraudChallengeByTrade);
                // await execDeploy(ctl, 'FraudChallengeByTradeOrderResiduals', '', FraudChallengeByTradeOrderResiduals);
                // await execDeploy(ctl, 'FraudChallengeByTradeSucceedingPayment', '', FraudChallengeByTradeSucceedingPayment);
                await execDeploy(ctl, 'NullSettlement', '', NullSettlement);
                await execDeploy(ctl, 'NullSettlementChallengeByOrder', '', NullSettlementChallengeByOrder);
                await execDeploy(ctl, 'NullSettlementChallengeByPayment', '', NullSettlementChallengeByPayment);
                await execDeploy(ctl, 'NullSettlementChallengeByTrade', '', NullSettlementChallengeByTrade);
                addressStorage.set('NullSettlementChallengeState', '0xb4379689bc570e5e2a415fcc700fd562cec0f123');
                await execDeploy(ctl, 'NullSettlementDisputeByOrder', '', NullSettlementDisputeByOrder);
                await execDeploy(ctl, 'NullSettlementDisputeByPayment', '', NullSettlementDisputeByPayment);
                await execDeploy(ctl, 'NullSettlementDisputeByTrade', '', NullSettlementDisputeByTrade);
                await execDeploy(ctl, 'NullSettlementState', '', NullSettlementState);
                await execDeploy(ctl, 'PartnerBenefactor', '', PartnerBenefactor);
                await execDeploy(ctl, 'PaymentHasher', '', PaymentHasher);
                addressStorage.set('RevenueFund1', '0x7f11c2e1b54650c9064e202eb46e6113f8e6cab7');
                addressStorage.set('SecurityBond', '0xc0354bdaf2966bffe4e7237166be42ef2ad252af');
                await execDeploy(ctl, 'SignerManager', '', SignerManager);
                await execDeploy(ctl, 'TokenHolderRevenueFund', '', TokenHolderRevenueFund);
                await execDeploy(ctl, 'TransferControllerManager', '', TransferControllerManager);
                addressStorage.set('TransactionTracker', '0x8adfe445750937cefe42d9fb428563d61ea1aa02');
                // await execDeploy(ctl, 'TradeHasher', '', TradeHasher);
                await execDeploy(ctl, 'Validator', '', Validator, true);
                // await execDeploy(ctl, 'ValidatorV2', '', ValidatorV2, true);
                addressStorage.set('WalletLocker', '0x0e3b42f7c307a9b0541b46e9a2be320caafd1da4');

                // instance = await BalanceTracker.at(addressStorage.get('BalanceTracker'));
                // await instance.registerService(addressStorage.get('ClientFund'));

                // instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));

                instance = await ClientFund.at(addressStorage.get('ClientFund'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.freezeBalanceTracker();
                // await instance.setTransactionTracker(addressStorage.get('TransactionTracker'));
                // await instance.freezeTransactionTracker();
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.freezeWalletLocker();
                await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
                // await instance.registerBeneficiary(addressStorage.get('RevenueFund1'));
                // await instance.registerBeneficiary(addressStorage.get('PartnerFund'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementByPayment'));
                await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementByTrade'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlement'));
                // await instance.disableInitialServiceAuthorization();

                instance = await Configuration.at(addressStorage.get('Configuration'));
                await instance.setConfirmationBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 12);
                await instance.setTradeMakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                       // 0.1%
                await instance.setTradeMakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                        // 0.00001%
                await instance.setTradeTakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e15, [], []);                       // 0.2%
                await instance.setTradeTakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e11);                        // 0.00002%
                await instance.setPaymentFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                          // 0.1%
                await instance.setPaymentMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                           // 0.00001%
                await instance.setWalletLockTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 30);              // 30 days
                await instance.setCancelOrderChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 3);     // 3 days
                await instance.setSettlementChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 5);      // 5 days
                await instance.setWalletSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e17);               // 10%
                await instance.setOperatorSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);             // 50%
                await instance.setFraudStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);                          // 50%
                await instance.setUpdateDelayBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2880);                           // ~12 hours
                await instance.setEarliestSettlementBlockNumber((await web3.eth.getBlockNumberPromise()) + 172800);                          // In ~30 days
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.OPERATIONAL_MODE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.disableEarliestSettlementBlockNumberUpdate();
                // await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.OPERATIONAL_MODE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.OPERATIONAL_MODE_ACTION.call());

                instance = await DriipSettlementChallengeState.at(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.INITIATE_PROPOSAL_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.QUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.QUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

                instance = await DriipSettlementChallengeByOrder.at(addressStorage.get('DriipSettlementChallengeByOrder'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByOrder(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementChallengeByPayment.at(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByPayment(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementChallengeByTrade.at(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByTrade(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

                instance = await DriipSettlementDisputeByOrder.at(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

                instance = await DriipSettlementDisputeByPayment.at(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

                instance = await DriipSettlementDisputeByTrade.at(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

                instance = await DriipSettlementState.at(addressStorage.get('DriipSettlementState'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_TOTAL_FEE_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_TOTAL_FEE_ACTION.call());

                instance = await DriipSettlementByPayment.at(addressStorage.get('DriipSettlementByPayment'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
                await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
                // await instance.setPartnerBenefactor(addressStorage.get('PartnerBenefactor'));

                instance = await DriipSettlementByTrade.at(addressStorage.get('DriipSettlementByTrade'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
                await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
                // await instance.setPartnerBenefactor(addressStorage.get('PartnerBenefactor'));

                instance = await NullSettlementChallengeState.at(addressStorage.get('NullSettlementChallengeState'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

                instance = await NullSettlementChallengeByOrder.at(addressStorage.get('NullSettlementChallengeByOrder'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setNullSettlementDisputeByOrder(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

                instance = await NullSettlementChallengeByPayment.at(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setNullSettlementDisputeByPayment(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                instance = await NullSettlementChallengeByTrade.at(addressStorage.get('NullSettlementChallengeByTrade'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setNullSettlementDisputeByTrade(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                instance = await NullSettlementDisputeByOrder.at(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('NullSettlementChallengeByOrder'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

                instance = await NullSettlementDisputeByPayment.at(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

                instance = await NullSettlementDisputeByTrade.at(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('ValidatorV2'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

                instance = await NullSettlementState.at(addressStorage.get('NullSettlementState'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.registerService(addressStorage.get('NullSettlement'));
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NULL_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NONCE_ACTION.call());

                instance = await NullSettlement.at(addressStorage.get('NullSettlement'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setNullSettlementState(addressStorage.get('NullSettlementState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                instance = await FraudChallenge.at(addressStorage.get('FraudChallenge'));
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.ADD_DOUBLE_SPENDER_WALLET_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.ADD_FRAUDULENT_ORDER_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());

                // instance = await FraudChallengeByOrder.at(addressStorage.get('FraudChallengeByOrder'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));

                // instance = await FraudChallengeByTrade.at(addressStorage.get('FraudChallengeByTrade'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                instance = await FraudChallengeByPayment.at(addressStorage.get('FraudChallengeByPayment'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                // instance = await FraudChallengeBySuccessiveTrades.at(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                instance = await FraudChallengeBySuccessivePayments.at(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                // instance = await FraudChallengeByPaymentSucceedingTrade.at(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                // instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

                // instance = await FraudChallengeByTradeOrderResiduals.at(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));

                // instance = await FraudChallengeByDoubleSpentOrders.at(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('Validator2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));

                // instance = await PartnerFund.at(addressStorage.get('PartnerFund'));
                // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));

                instance = await RevenueFund1.at(addressStorage.get('RevenueFund1'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                // await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
                // await instance.registerFractionalBeneficiary(addressStorage.get('SecurityBond'), 1e16);

                instance = await SecurityBond.at(addressStorage.get('SecurityBond'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.REWARD_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.REWARD_ACTION.call());
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.REWARD_ACTION.call());

                instance = await TokenHolderRevenueFund.at(addressStorage.get('TokenHolderRevenueFund'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
                await instance.registerService(addressStorage.get('RevenueFund1'));
                await instance.enableServiceAction(addressStorage.get('RevenueFund1'), await instance.CLOSE_ACCRUAL_PERIOD_ACTION.call());

                // instance = await TransactionTracker.at(addressStorage.get('TransactionTracker'));
                // await instance.registerService(addressStorage.get('ClientFund'));

                instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
                await instance.registerTransferController('ERC20', addressStorage.get('ERC20TransferController'), {from: deployerAccount});
                await instance.registerTransferController('ERC721', addressStorage.get('ERC721TransferController'), {from: deployerAccount});

                instance = await Validator.at(addressStorage.get('Validator'));
                await instance.setPaymentHasher(addressStorage.get('PaymentHasher'));

                // instance = await ValidatorV2.at(addressStorage.get('ValidatorV2'));
                // await instance.setPaymentHasher(addressStorage.get('PaymentHasher'));
                // await instance.setTradeHasher(addressStorage.get('TradeHasher'));

                instance = await WalletLocker.at(addressStorage.get('WalletLocker'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPayment'));
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByOrder'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByOrder'));
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByTrade'));
                // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
                // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
                // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTrade'));
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
                // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
                // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
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
