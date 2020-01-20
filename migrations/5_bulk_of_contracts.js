/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2019 Hubii AS
 */

const AccrualBenefactor = artifacts.require('AccrualBenefactor');
const BalanceAucCalculator = artifacts.require('BalanceAucCalculator');
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
const RevenueFundAccrualMonitor = artifacts.require('RevenueFundAccrualMonitor');
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
            RevenueFundAccrualMonitor,
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
            RevenueFundAccrualMonitor,
            SecurityBond,
            TokenHolderRevenueFund,
            Validator,
            ValidatorV2
        ]);
        await deployer.link(SafeMathUintLib, [
            BalanceAucCalculator,
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
            RevenueFundAccrualMonitor,
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
        await deployer.link(TxHistoryLib, [
            ClientFund,
            PartnerFund,
            RevenueFund1,
            SecurityBond,
            TokenHolderRevenueFund
        ]);

        const delayBlocks = helpers.isTestNetwork(network) ? 1 : 10;

        if (helpers.isTestNetwork(network)) {
            TradeTypesLib.address = addressStorage.get('TradeTypesLib');

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

            await execDeploy(ctl, 'BalanceAucCalculator', BalanceAucCalculator);
            await execDeploy(ctl, 'BalanceTracker', BalanceTracker, [ctl.deployerAccount]);
            await execDeploy(ctl, 'CancelOrdersChallenge', CancelOrdersChallenge, [ctl.deployerAccount]);
            await execDeploy(ctl, 'ClientFund', ClientFund, [ctl.deployerAccount]);
            await execDeploy(ctl, 'CommunityVote', CommunityVote, [ctl.deployerAccount]);
            await execDeploy(ctl, 'Configuration', Configuration, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementByPayment', DriipSettlementByPayment, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementByTrade', DriipSettlementByTrade, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementChallengeByOrder', DriipSettlementChallengeByOrder, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementChallengeByPayment', DriipSettlementChallengeByPayment, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementChallengeByTrade', DriipSettlementChallengeByTrade, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementChallengeState', DriipSettlementChallengeState, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementDisputeByOrder', DriipSettlementDisputeByOrder, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementDisputeByPayment', DriipSettlementDisputeByPayment, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementDisputeByTrade', DriipSettlementDisputeByTrade, [ctl.deployerAccount]);
            await execDeploy(ctl, 'DriipSettlementState', DriipSettlementState, [ctl.deployerAccount]);
            await execDeploy(ctl, 'ERC20TransferController', ERC20TransferController, [ctl.deployerAccount]);
            await execDeploy(ctl, 'ERC721TransferController', ERC721TransferController, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallenge', FraudChallenge, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeByDoubleSpentOrders', FraudChallengeByDoubleSpentOrders, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeByOrder', FraudChallengeByOrder, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeByPayment', FraudChallengeByPayment, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeByPaymentSucceedingTrade', FraudChallengeByPaymentSucceedingTrade, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeBySuccessivePayments', FraudChallengeBySuccessivePayments, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeBySuccessiveTrades', FraudChallengeBySuccessiveTrades, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeByTrade', FraudChallengeByTrade, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeByTradeOrderResiduals', FraudChallengeByTradeOrderResiduals, [ctl.deployerAccount]);
            await execDeploy(ctl, 'FraudChallengeByTradeSucceedingPayment', FraudChallengeByTradeSucceedingPayment, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlement', NullSettlement, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlementChallengeByOrder', NullSettlementChallengeByOrder, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlementChallengeByPayment', NullSettlementChallengeByPayment, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlementChallengeByTrade', NullSettlementChallengeByTrade, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlementChallengeState', NullSettlementChallengeState, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlementDisputeByOrder', NullSettlementDisputeByOrder, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlementDisputeByPayment', NullSettlementDisputeByPayment, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlementDisputeByTrade', NullSettlementDisputeByTrade, [ctl.deployerAccount]);
            await execDeploy(ctl, 'NullSettlementState', NullSettlementState, [ctl.deployerAccount]);
            await execDeploy(ctl, 'PartnerBenefactor', PartnerBenefactor, [ctl.deployerAccount]);
            await execDeploy(ctl, 'PaymentHasher', PaymentHasher, [ctl.deployerAccount]);
            await execDeploy(ctl, 'RevenueFund1', RevenueFund1, [ctl.deployerAccount]);
            await execDeploy(ctl, 'RevenueFundAccrualMonitor', RevenueFundAccrualMonitor, [ctl.deployerAccount]);
            await execDeploy(ctl, 'SecurityBond', SecurityBond, [ctl.deployerAccount]);
            await execDeploy(ctl, 'SignerManager', SignerManager, [ctl.deployerAccount]);
            await execDeploy(ctl, 'TokenHolderRevenueFund', TokenHolderRevenueFund, [ctl.deployerAccount]);
            await execDeploy(ctl, 'TradeHasher', TradeHasher, [ctl.deployerAccount]);
            await execDeploy(ctl, 'TransactionTracker', TransactionTracker, [ctl.deployerAccount]);
            await execDeploy(ctl, 'TransferControllerManager', TransferControllerManager, [ctl.deployerAccount]);
            await execDeploy(ctl, 'Validator', Validator, [ctl.deployerAccount, ctl.addressStorage.get('SignerManager')]);
            await execDeploy(ctl, 'ValidatorV2', ValidatorV2, [ctl.deployerAccount, ctl.addressStorage.get('SignerManager')]);
            await execDeploy(ctl, 'WalletLocker', WalletLocker, [ctl.deployerAccount]);

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

            instance = await RevenueFundAccrualMonitor.at(addressStorage.get('RevenueFundAccrualMonitor'));
            await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
            await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
            await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
            await instance.setBalanceBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
            await instance.setReleasedAmountBlocksCalculator(addressStorage.get('BalanceAucCalculator'));

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
            await instance.setBalanceBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
            await instance.setReleasedAmountBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
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
            TradeTypesLib.address = addressStorage.get('TradeTypesLib');

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

            await execDeploy(ctl, 'BalanceAucCalculator', BalanceAucCalculator);
            // addressStorage.set('BalanceAucCalculator', '0xb7f08c21c5be246609dc7f250be83e8f72bfa2ee');
            addressStorage.set('BalanceTracker', '0x0593bd7bce0b8fb7c06a71be3c1494d72a269cd8');
            addressStorage.set('CancelOrdersChallenge', '0x6243a3c3a7753b7c2f41b531141a1e9f71581c89');
            addressStorage.set('ClientFund', '0x621204591f5940dba89db37d7ed74a51e5903d89');
            addressStorage.set('CommunityVote', '0xbed9099f2123144f96bdb6e0988cd557358deb69');
            addressStorage.set('Configuration', '0xba820a11cbc2bd013d3577606a9487b44207ba28');
            addressStorage.set('DriipSettlementByPayment', '0x9894aa6fd62a0e8bf0378f7cd24721caf29ac82f');
            addressStorage.set('DriipSettlementByTrade', '0x2ec66b6dfc3254d7f4e64a5e0c4c8dd3caaeba13');
            addressStorage.set('DriipSettlementChallengeByOrder', '0xa73966b3a276adb6d05019e61aad449a0cf032db');
            addressStorage.set('DriipSettlementChallengeByPayment', '0xd87fb8947a44704a429acf7b2f9fb3fa4ca3a294');
            addressStorage.set('DriipSettlementChallengeByTrade', '0x002058506498a1c143517cb450dd306c2d58bcf2');
            addressStorage.set('DriipSettlementChallengeState', '0xf142e5f6778d15e01cb59ed67d8c071a70ecf679');
            addressStorage.set('DriipSettlementDisputeByOrder', '0x02fb56b670fd50b7b34ac6ab700ce885a8aa16bf');
            addressStorage.set('DriipSettlementDisputeByPayment', '0x981f42fee01ac0b3aae803c11de1c6e8127cc55d');
            addressStorage.set('DriipSettlementDisputeByTrade', '0x1eb1c780ebfbbbf327c378d9fe4b43f0fe8a323f');
            addressStorage.set('DriipSettlementState', '0x450f79045308944fd098d127c931bbc1a8bb033a');
            addressStorage.set('ERC20TransferController', '0xd24aeebd6c43bc153335f8f51dac0ab618ba5a49');
            addressStorage.set('ERC721TransferController', '0x0490a18920d2cfc299c8f72ec3b954cdcacc17e4');
            addressStorage.set('FraudChallenge', '0x3236f3bbb3cd569ec506f0cb73e834b067076a61');
            addressStorage.set('FraudChallengeByDoubleSpentOrders', '0x2e82fa203032f905caf28d7293f5e74932e8885a');
            addressStorage.set('FraudChallengeByOrder', '0x779ea32715994fce420b588067bf3b6816165ad8');
            addressStorage.set('FraudChallengeByPayment', '0x527cb9432dc25386c7a99ba0d701d62114b624dc');
            addressStorage.set('FraudChallengeByPaymentSucceedingTrade', '0x902b4d8229fe95ea546fc4b3ef3c77cffd9d2b08');
            addressStorage.set('FraudChallengeBySuccessivePayments', '0xe97ade7a5b9f3e3f23ce8cee2a2672ee4a896764');
            addressStorage.set('FraudChallengeBySuccessiveTrades', '0xbbda8fa7ad6e42999b1c2bca2ebc132f8e47f710');
            addressStorage.set('FraudChallengeByTrade', '0x3b257ac87b3bd9184d818607d4587170af16a1ac');
            addressStorage.set('FraudChallengeByTradeOrderResiduals', '0x0b69a2a2ac2101eb9a1065e6b9962d857de0bf06');
            addressStorage.set('FraudChallengeByTradeSucceedingPayment', '0x80c98a5f81658267e2b9f94621b67b65037c2675');
            addressStorage.set('NullSettlement', '0x84e06e198c904371034157aba0ac17136e6b0afd');
            addressStorage.set('NullSettlementChallengeByOrder', '0x252103a97f02eee93caa1549d2c43544ddaafff8');
            addressStorage.set('NullSettlementChallengeByPayment', '0x6264a4071c6dfc7b4a4b6980094c7e7a73952b95');
            addressStorage.set('NullSettlementChallengeByTrade', '0xcc64c7c9e9e913ffaa2c35a96cbf7efd1db61993');
            addressStorage.set('NullSettlementChallengeState', '0x6bb6b0f2acad6cd35074b93b706a8f397208d1ec');
            addressStorage.set('NullSettlementDisputeByOrder', '0x2a60d3954101b45c5bccd7d3cdd54f5010266f5e');
            addressStorage.set('NullSettlementDisputeByPayment', '0xe0ce4c8ae168d052797d99dc40a497ca48524ade');
            addressStorage.set('NullSettlementDisputeByTrade', '0xa405264f1819c7ea4ce224c306a87b26e72eb29c');
            addressStorage.set('NullSettlementState', '0xa07373145ec71b74acf6da428c0fbc8336a7e359');
            addressStorage.set('PartnerBenefactor', '0x55103eb32d8bcbf90003879a26db8dfb18175fed');
            addressStorage.set('PaymentHasher', '0x684d22495c0ee89d74fe37e132d4cef771b6ded6');
            addressStorage.set('RevenueFund1', '0x46c63c4d9c137b5883687d08d78c603a22e195e7');
            addressStorage.set('RevenueFundAccrualMonitor', '0x0f0c0e67b74f444cf64344dcf442d1ef6753fa84');
            addressStorage.set('SecurityBond', '0x6e72335e13358f43e39bba87e709bfda7e9a9d1c');
            addressStorage.set('SignerManager', '0x0f8af4aaf302e2fd6883e20a3451606522ed9ea4');
            addressStorage.set('TokenHolderRevenueFund', '0xce09065ce0a830c43456c61b9cc97f340541aa49');
            addressStorage.set('TradeHasher', '0xad3d1bbd54801a0057d6d3c38bdf3f53dd1fcdde');
            addressStorage.set('TransactionTracker', '0x57ded91a8ee6b53cbb85424867aae288dd70ca28');
            addressStorage.set('TransferControllerManager', '0x69cc78214eb94bc365b145bbab8790cd91b45590');
            addressStorage.set('Validator', '0x9c46df42d43957b88ac765dec2115b2cef228d4d');
            addressStorage.set('ValidatorV2', '0x64a563bf62c7cfebe5e9f21336a3871789a7c3c2');
            addressStorage.set('WalletLocker', '0xa0a69d43cad45f8bd0c87b643b452dbe1b0ea3b7');

            // instance = await BalanceTracker.at(addressStorage.get('BalanceTracker'));
            // await instance.registerService(addressStorage.get('ClientFund'));

            // instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));

            // instance = await ClientFund.at(addressStorage.get('ClientFund'));
            // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.freezeBalanceTracker();
            // await instance.setTransactionTracker(addressStorage.get('TransactionTracker'));
            // await instance.freezeTransactionTracker();
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.freezeWalletLocker();
            // await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
            // await instance.registerBeneficiary(addressStorage.get('RevenueFund1'));
            // // await instance.registerBeneficiary(addressStorage.get('PartnerFund'));
            // await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
            // await instance.authorizeInitialService(addressStorage.get('DriipSettlementByPayment'));
            // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
            // await instance.authorizeInitialService(addressStorage.get('DriipSettlementByTrade'));
            // await instance.registerService(addressStorage.get('NullSettlement'));
            // await instance.authorizeInitialService(addressStorage.get('NullSettlement'));
            // // await instance.disableInitialServiceAuthorization();

            // instance = await Configuration.at(addressStorage.get('Configuration'));
            // await instance.setConfirmationBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 12);
            // await instance.setTradeMakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                       // 0.1%
            // await instance.setTradeMakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                        // 0.00001%
            // await instance.setTradeTakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e15, [], []);                       // 0.2%
            // await instance.setTradeTakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e11);                        // 0.00002%
            // await instance.setPaymentFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                          // 0.1%
            // await instance.setPaymentMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                           // 0.00001%
            // await instance.setWalletLockTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 60 * 24 * 30);              // 30 days
            // await instance.setCancelOrderChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 3);               // 3 minutes
            // await instance.setSettlementChallengeTimeout((await web3.eth.getBlockNumberPromise()) + delayBlocks, 60 * 5);                // 5 minutes
            // await instance.setWalletSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e17);               // 10%
            // await instance.setOperatorSettlementStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);             // 50%
            // await instance.setFraudStakeFraction((await web3.eth.getBlockNumberPromise()) + delayBlocks, 5e17);                          // 50%
            // // await instance.setUpdateDelayBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2880);                           // ~12 hours
            // // await instance.setEarliestSettlementBlockNumber((await web3.eth.getBlockNumberPromise()) + 172800);                          // In ~30 days
            // // await instance.disableEarliestSettlementBlockNumberUpdate();
            // await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.OPERATIONAL_MODE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.OPERATIONAL_MODE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.OPERATIONAL_MODE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.OPERATIONAL_MODE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.OPERATIONAL_MODE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.OPERATIONAL_MODE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.OPERATIONAL_MODE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.OPERATIONAL_MODE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.OPERATIONAL_MODE_ACTION.call());

            // instance = await DriipSettlementChallengeState.at(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.INITIATE_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // // await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
            // // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.INITIATE_PROPOSAL_ACTION.call());
            // // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.QUALIFY_PROPOSAL_ACTION.call());

            // instance = await DriipSettlementChallengeByOrder.at(addressStorage.get('DriipSettlementChallengeByOrder'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setDriipSettlementDisputeByOrder(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

            // instance = await DriipSettlementChallengeByPayment.at(addressStorage.get('DriipSettlementChallengeByPayment'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setDriipSettlementDisputeByPayment(addressStorage.get('DriipSettlementDisputeByPayment'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

            // instance = await DriipSettlementChallengeByTrade.at(addressStorage.get('DriipSettlementChallengeByTrade'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setDriipSettlementDisputeByTrade(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

            // instance = await DriipSettlementDisputeByOrder.at(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

            // instance = await DriipSettlementDisputeByPayment.at(addressStorage.get('DriipSettlementDisputeByPayment'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

            // instance = await DriipSettlementDisputeByTrade.at(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

            // instance = await DriipSettlementState.at(addressStorage.get('DriipSettlementState'));
            // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            // await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.INIT_SETTLEMENT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_MAX_NONCE_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_TOTAL_FEE_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.INIT_SETTLEMENT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_MAX_NONCE_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_TOTAL_FEE_ACTION.call());

            // instance = await DriipSettlementByPayment.at(addressStorage.get('DriipSettlementByPayment'));
            // await instance.setClientFund(addressStorage.get('ClientFund'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
            // await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
            // // await instance.setPartnerBenefactor(addressStorage.get('PartnerBenefactor'));

            // instance = await DriipSettlementByTrade.at(addressStorage.get('DriipSettlementByTrade'));
            // await instance.setClientFund(addressStorage.get('ClientFund'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
            // await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
            // // await instance.setPartnerFund(addressStorage.get('PartnerFund'));

            // instance = await NullSettlementChallengeState.at(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.registerService(addressStorage.get('NullSettlement'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.INITIATE_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

            // instance = await NullSettlementChallengeByOrder.at(addressStorage.get('NullSettlementChallengeByOrder'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setNullSettlementDisputeByOrder(addressStorage.get('NullSettlementDisputeByOrder'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

            // instance = await NullSettlementChallengeByPayment.at(addressStorage.get('NullSettlementChallengeByPayment'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setNullSettlementDisputeByPayment(addressStorage.get('NullSettlementDisputeByPayment'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

            // instance = await NullSettlementChallengeByTrade.at(addressStorage.get('NullSettlementChallengeByTrade'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setNullSettlementDisputeByTrade(addressStorage.get('NullSettlementDisputeByTrade'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

            // instance = await NullSettlementDisputeByOrder.at(addressStorage.get('NullSettlementDisputeByOrder'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

            // instance = await NullSettlementDisputeByPayment.at(addressStorage.get('NullSettlementDisputeByPayment'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

            // instance = await NullSettlementDisputeByTrade.at(addressStorage.get('NullSettlementDisputeByTrade'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

            // instance = await NullSettlementState.at(addressStorage.get('NullSettlementState'));
            // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            // await instance.registerService(addressStorage.get('NullSettlement'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NULL_NONCE_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NONCE_ACTION.call());

            // instance = await NullSettlement.at(addressStorage.get('NullSettlement'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setClientFund(addressStorage.get('ClientFund'));
            // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setNullSettlementState(addressStorage.get('NullSettlementState'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

            // instance = await FraudChallenge.at(addressStorage.get('FraudChallenge'));
            // await instance.registerService(addressStorage.get('FraudChallengeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByOrder'), await instance.ADD_FRAUDULENT_ORDER_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTrade'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeOrderResiduals'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByDoubleSpentOrders'), await instance.ADD_DOUBLE_SPENDER_WALLET_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeBySuccessiveTrades'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessiveTrades'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByTradeSucceedingPayment'), await instance.ADD_FRAUDULENT_TRADE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'), await instance.ADD_FRAUDULENT_PAYMENT_ACTION.call());

            // instance = await FraudChallengeByOrder.at(addressStorage.get('FraudChallengeByOrder'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));

            // instance = await FraudChallengeByTrade.at(addressStorage.get('FraudChallengeByTrade'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
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
            // await instance.setValidator(addressStorage.get('Validator'));
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
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

            // instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));

            // instance = await FraudChallengeByTradeOrderResiduals.at(addressStorage.get('FraudChallengeByTradeOrderResiduals'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));

            // instance = await FraudChallengeByDoubleSpentOrders.at(addressStorage.get('FraudChallengeByDoubleSpentOrders'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));

            // instance = await PartnerFund.at(addressStorage.get('PartnerFund'));
            // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));

            // instance = await RevenueFund1.at(addressStorage.get('RevenueFund1'));
            // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            // await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
            // await instance.registerFractionalBeneficiary(addressStorage.get('SecurityBond'), 1e16);

            instance = await RevenueFundAccrualMonitor.at(addressStorage.get('RevenueFundAccrualMonitor'));
            // await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
            // await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
            // await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
            await instance.setBalanceBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
            await instance.setReleasedAmountBlocksCalculator(addressStorage.get('BalanceAucCalculator'));

            // instance = await SecurityBond.at(addressStorage.get('SecurityBond'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.REWARD_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DEPRIVE_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.REWARD_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DEPRIVE_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeByPayment'), await instance.REWARD_ACTION.call());
            // await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            // await instance.enableServiceAction(addressStorage.get('FraudChallengeBySuccessivePayments'), await instance.REWARD_ACTION.call());
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
            // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            // await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
            await instance.setBalanceBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
            await instance.setReleasedAmountBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
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
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
            // await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByPayment'));
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
            // await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByPayment'));
            // await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
            // await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPayment'));
            // await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
            // await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessivePayments'));
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
            await execDeploy(ctl, 'BalanceAucCalculator', BalanceAucCalculator);
            addressStorage.set('BalanceTracker', '0xbc1bcc29edf605095bf4fe7a953b7c115ecc8cad');
            // await execDeploy(ctl, 'CancelOrdersChallenge', CancelOrdersChallenge, [ctl.deployerAccount]);
            addressStorage.set('ClientFund', '0xcc8d82f6ba952966e63001c7b320eef2ae729099');
            addressStorage.set('CommunityVote', '0xbb0eed554080e05e1f14796f94ffbf95f081544d');
            addressStorage.set('Configuration', '0x78966acb215bfe03dc5d41a1c0689bff4a0d5352');
            addressStorage.set('DriipSettlementByPayment', '0xd2600fd59786b44c4869066018870aa33417f8f2');
            // await execDeploy(ctl, 'DriipSettlementByTrade', DriipSettlementByTrade, [ctl.deployerAccount]);
            // await execDeploy(ctl, 'DriipSettlementChallengeByOrder', DriipSettlementChallengeByOrder, [ctl.deployerAccount]);
            addressStorage.set('DriipSettlementChallengeByPayment', '0x906fd331f5e382f05b8ae26900140c37f0db139a');
            // await execDeploy(ctl, 'DriipSettlementChallengeByTrade', DriipSettlementChallengeByTrade, [ctl.deployerAccount]);
            // addressStorage.set('DriipSettlementChallengeState', '0xe2257105097e367eb38ddcd951db9718c234d328');
            await execDeploy(ctl, 'DriipSettlementChallengeState', DriipSettlementChallengeState, [ctl.deployerAccount]);
            // await execDeploy(ctl, 'DriipSettlementDisputeByOrder', DriipSettlementDisputeByOrder, [ctl.deployerAccount]);
            addressStorage.set('DriipSettlementDisputeByPayment', '0x8f50e4b36fe1c34cdee57094b19c0d92ab46d153');
            // await execDeploy(ctl, 'DriipSettlementDisputeByTrade', DriipSettlementDisputeByTrade, [ctl.deployerAccount]);
            // addressStorage.set('DriipSettlementState', '0x16ea9ca8a824aa7484658acde7b71c2e2e390574');
            await execDeploy(ctl, 'DriipSettlementState', DriipSettlementState, [ctl.deployerAccount]);
            addressStorage.set('ERC20TransferController', '0xde1586fb826fbd11bedb1b59e76d9e1b9e69e3ca');
            addressStorage.set('ERC721TransferController', '0x47321aa5facc22245dc05482e74385292aee7f9d');
            addressStorage.set('FraudChallenge', '0x95990bc424c1adf7d10488f2af59b7f42f464d9c');
            // await execDeploy(ctl, 'FraudChallengeByDoubleSpentOrders', FraudChallengeByDoubleSpentOrders, [ctl.deployerAccount]);
            // await execDeploy(ctl, 'FraudChallengeByOrder', FraudChallengeByOrder, [ctl.deployerAccount]);
            addressStorage.set('FraudChallengeByPayment', '0x4ae18c683d240b2ed73353f5e68c885ae4585f3a');
            // await execDeploy(ctl, 'FraudChallengeByPaymentSucceedingTrade', FraudChallengeByPaymentSucceedingTrade, [ctl.deployerAccount]);
            addressStorage.set('FraudChallengeBySuccessivePayments', '0xc4f14c4cd7ce3d03374a8c7b0fe8a8ce79bfdb22');
            // await execDeploy(ctl, 'FraudChallengeBySuccessiveTrades', FraudChallengeBySuccessiveTrades, [ctl.deployerAccount]);
            // await execDeploy(ctl, 'FraudChallengeByTrade', FraudChallengeByTrade, [ctl.deployerAccount]);
            // await execDeploy(ctl, 'FraudChallengeByTradeOrderResiduals', FraudChallengeByTradeOrderResiduals, [ctl.deployerAccount]);
            // await execDeploy(ctl, 'FraudChallengeByTradeSucceedingPayment', FraudChallengeByTradeSucceedingPayment, [ctl.deployerAccount]);
            addressStorage.set('NullSettlement', '0x4dd0200874480fa4a6e72a6a9a4d020aff338085');
            // await execDeploy(ctl, 'NullSettlementChallengeByOrder', NullSettlementChallengeByOrder, [ctl.deployerAccount]);
            addressStorage.set('NullSettlementChallengeByPayment', '0x34fe0c8100dc8ec65e50ff195faa93297ebf4f19');
            // await execDeploy(ctl, 'NullSettlementChallengeByTrade', NullSettlementChallengeByTrade, [ctl.deployerAccount]);
            // addressStorage.set('NullSettlementChallengeState', '0x0034ac166b6771fb749ef179284de36437c36374');
            await execDeploy(ctl, 'NullSettlementChallengeState', NullSettlementChallengeState, [ctl.deployerAccount]);
            // await execDeploy(ctl, 'NullSettlementDisputeByOrder', NullSettlementDisputeByOrder, [ctl.deployerAccount]);
            addressStorage.set('NullSettlementDisputeByPayment', '0xee322a2e5e54e92b19125dfa8c52c9ab31c9cffe');
            // await execDeploy(ctl, 'NullSettlementDisputeByTrade', NullSettlementDisputeByTrade, [ctl.deployerAccount]);
            // addressStorage.set('NullSettlementState', '0x0c8abec84b5ef992c3fba2389d72fe98206bbd3c');
            await execDeploy(ctl, 'NullSettlementState', NullSettlementState, [ctl.deployerAccount]);
            addressStorage.set('PartnerBenefactor', '0xb4cb77714c236b73f63684863554e0323fe00345');
            addressStorage.set('PaymentHasher', '0x9dd11966d74b477a001808976db9e708add2ddfc');
            addressStorage.set('RevenueFund1', '0x7f11c2e1b54650c9064e202eb46e6113f8e6cab7');
            await execDeploy(ctl, 'RevenueFundAccrualMonitor', RevenueFundAccrualMonitor, [ctl.deployerAccount]);
            addressStorage.set('SecurityBond', '0xc0354bdaf2966bffe4e7237166be42ef2ad252af');
            addressStorage.set('SignerManager', '0x78ac6bb4e09b4d8be7eaddcc7dce567298980fe2');
            addressStorage.set('TokenHolderRevenueFund', '0x6ce039eb8ccbe7e5eeb09ebf131efb5556bfdec2');
            // await execDeploy(ctl, 'TradeHasher', TradeHasher, [ctl.deployerAccount]);
            addressStorage.set('TransactionTracker', '0x8adfe445750937cefe42d9fb428563d61ea1aa02');
            addressStorage.set('TransferControllerManager', '0x7e88793fb8ee4f3c827027206223ba586218d58f');
            addressStorage.set('Validator', '0x41bf1a5879ce7daef38bd2abbe3e016ec6f16dca');
            // await execDeploy(ctl, 'ValidatorV2', ValidatorV2, [ctl.deployerAccount]);
            addressStorage.set('WalletLocker', '0x0e3b42f7c307a9b0541b46e9a2be320caafd1da4');

            // instance = await BalanceTracker.at(addressStorage.get('BalanceTracker'));
            // await instance.registerService(addressStorage.get('ClientFund'));

            // instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));

            // instance = await ClientFund.at(addressStorage.get('ClientFund'));
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
            // await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
            // await instance.authorizeInitialService(addressStorage.get('DriipSettlementByPayment'));
            // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
            // await instance.authorizeInitialService(addressStorage.get('DriipSettlementByTrade'));
            // await instance.registerService(addressStorage.get('NullSettlement'));
            // await instance.authorizeInitialService(addressStorage.get('NullSettlement'));
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
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.INITIATE_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.QUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.QUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

            // instance = await DriipSettlementChallengeByOrder.at(addressStorage.get('DriipSettlementChallengeByOrder'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setDriipSettlementDisputeByOrder(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

            instance = await DriipSettlementChallengeByPayment.at(addressStorage.get('DriipSettlementChallengeByPayment'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setDriipSettlementDisputeByPayment(addressStorage.get('DriipSettlementDisputeByPayment'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

            // instance = await DriipSettlementChallengeByTrade.at(addressStorage.get('DriipSettlementChallengeByTrade'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setDriipSettlementDisputeByTrade(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

            // instance = await DriipSettlementDisputeByOrder.at(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

            instance = await DriipSettlementDisputeByPayment.at(addressStorage.get('DriipSettlementDisputeByPayment'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

            // instance = await DriipSettlementDisputeByTrade.at(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
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
            // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.INIT_SETTLEMENT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.COMPLETE_SETTLEMENT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_MAX_NONCE_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.ADD_SETTLED_AMOUNT_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_TOTAL_FEE_ACTION.call());

            instance = await DriipSettlementByPayment.at(addressStorage.get('DriipSettlementByPayment'));
            // await instance.setClientFund(addressStorage.get('ClientFund'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
            // await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
            // await instance.setPartnerBenefactor(addressStorage.get('PartnerBenefactor'));

            // instance = await DriipSettlementByTrade.at(addressStorage.get('DriipSettlementByTrade'));
            // await instance.setClientFund(addressStorage.get('ClientFund'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
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
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByOrder'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByOrder'), await instance.TERMINATE_PROPOSAL_ACTION.call());
            // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

            // instance = await NullSettlementChallengeByOrder.at(addressStorage.get('NullSettlementChallengeByOrder'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setNullSettlementDisputeByOrder(addressStorage.get('NullSettlementDisputeByOrder'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

            instance = await NullSettlementChallengeByPayment.at(addressStorage.get('NullSettlementChallengeByPayment'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setNullSettlementDisputeByPayment(addressStorage.get('NullSettlementDisputeByPayment'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

            // instance = await NullSettlementChallengeByTrade.at(addressStorage.get('NullSettlementChallengeByTrade'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setNullSettlementDisputeByTrade(addressStorage.get('NullSettlementDisputeByTrade'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

            // instance = await NullSettlementDisputeByOrder.at(addressStorage.get('NullSettlementDisputeByOrder'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByOrder'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByOrder'), await instance.CHALLENGE_BY_ORDER_ACTION.call());

            instance = await NullSettlementDisputeByPayment.at(addressStorage.get('NullSettlementDisputeByPayment'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('Validator'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), await instance.CHALLENGE_BY_PAYMENT_ACTION.call());

            // instance = await NullSettlementDisputeByTrade.at(addressStorage.get('NullSettlementDisputeByTrade'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setValidator(addressStorage.get('ValidatorV2'));
            // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            // await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
            // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

            instance = await NullSettlementState.at(addressStorage.get('NullSettlementState'));
            await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            await instance.registerService(addressStorage.get('NullSettlement'));
            await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NULL_NONCE_ACTION.call());
            await instance.enableServiceAction(addressStorage.get('NullSettlement'), await instance.SET_MAX_NONCE_ACTION.call());

            instance = await NullSettlement.at(addressStorage.get('NullSettlement'));
            // await instance.setConfiguration(addressStorage.get('Configuration'));
            // await instance.setClientFund(addressStorage.get('ClientFund'));
            // await instance.setCommunityVote(addressStorage.get('CommunityVote'));
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

            instance = await RevenueFundAccrualMonitor.at(addressStorage.get('RevenueFundAccrualMonitor'));
            await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
            await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
            await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
            await instance.setBalanceBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
            await instance.setReleasedAmountBlocksCalculator(addressStorage.get('BalanceAucCalculator'));

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

            instance = await TokenHolderRevenueFund.at(addressStorage.get('TokenHolderRevenueFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
            await instance.setBalanceBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
            await instance.setReleasedAmountBlocksCalculator(addressStorage.get('BalanceAucCalculator'));
            await instance.registerService(addressStorage.get('RevenueFund1'));
            await instance.enableServiceAction(addressStorage.get('RevenueFund1'), await instance.CLOSE_ACCRUAL_PERIOD_ACTION.call());

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
        }

        debug(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, contract, args, instanceName) {
    let address = ctl.addressStorage.get(instanceName || contractName);
    let instance;

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        if (args)
            instance = await ctl.deployer.deploy(contract, ...args, {from: ctl.deployerAccount});
        else
            instance = await ctl.deployer.deploy(contract, {from: ctl.deployerAccount});

        ctl.addressStorage.set(instanceName || contractName, instance.address);
    }

    return instance;
}

function shouldDeploy(contractName, deployFilters) {
    if (!deployFilters)
        return true;

    for (let i = 0; i < deployFilters.length; i++)
        if (deployFilters[i].test(contractName))
            return true;

    return false;
}
