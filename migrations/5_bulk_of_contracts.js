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
const DriipSettlementChallengeByPayment = artifacts.require('DriipSettlementChallengeByPayment');
const DriipSettlementChallengeByTrade = artifacts.require('DriipSettlementChallengeByTrade');
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
const MockedDriipSettlementDisputeByTrade = artifacts.require('MockedDriipSettlementDisputeByTrade');
const MockedDriipSettlementState = artifacts.require('MockedDriipSettlementState');
const MockedValidator = artifacts.require('MockedValidator');
const MonetaryTypesLib = artifacts.require('MonetaryTypesLib');
const NahmiiTypesLib = artifacts.require('NahmiiTypesLib');
const NonFungibleBalanceLib = artifacts.require('NonFungibleBalanceLib');
const NullSettlement = artifacts.require('NullSettlement');
const NullSettlementChallengeByPayment = artifacts.require('NullSettlementChallengeByPayment');
const NullSettlementChallengeByTrade = artifacts.require('NullSettlementChallengeByTrade');
const NullSettlementChallengeState = artifacts.require('NullSettlementChallengeState');
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
            TradeTypesLib.address = addressStorage.get('TradeTypesLib');
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
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
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
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
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
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
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
                NullSettlementChallengeByPayment,
                NullSettlementChallengeByTrade,
                NullSettlementChallengeState,
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
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
                DriipSettlementDisputeByPayment,
                DriipSettlementDisputeByTrade,
                DriipSettlementState,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeByTradeSucceedingPayment,
                MockedDriipSettlementState,
                NullSettlement,
                NullSettlementChallengeByPayment,
                NullSettlementChallengeByTrade,
                NullSettlementChallengeState,
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
                DriipSettlementChallengeByPayment,
                DriipSettlementChallengeByTrade,
                DriipSettlementChallengeState,
                DriipSettlementDisputeByPayment,
                DriipSettlementDisputeByTrade,
                NullSettlement,
                NullSettlementChallengeByPayment,
                NullSettlementChallengeByTrade,
                NullSettlementChallengeState,
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
                DriipSettlementChallengeByTrade,
                DriipSettlementDisputeByTrade,
                FraudChallengeByDoubleSpentOrders,
                FraudChallengeByOrder,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeByTrade,
                FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment,
                MockedCancelOrdersChallenge,
                MockedDriipSettlementDisputeByTrade,
                MockedValidator,
                NullSettlementChallengeByTrade,
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

            if (helpers.isTestNetwork(network) || network.startsWith('ropsten')) {
                await execDeploy(ctl, 'BalanceTracker', '', BalanceTracker);
                await execDeploy(ctl, 'CancelOrdersChallenge', '', CancelOrdersChallenge);
                await execDeploy(ctl, 'ClientFund', '', ClientFund);
                await execDeploy(ctl, 'CommunityVote', '', CommunityVote);
                await execDeploy(ctl, 'Configuration', '', Configuration);
                await execDeploy(ctl, 'DriipSettlementByPayment', '', DriipSettlementByPayment);
                await execDeploy(ctl, 'DriipSettlementByTrade', '', DriipSettlementByTrade);
                await execDeploy(ctl, 'DriipSettlementChallengeByPayment', '', DriipSettlementChallengeByPayment);
                await execDeploy(ctl, 'DriipSettlementChallengeByTrade', '', DriipSettlementChallengeByTrade);
                await execDeploy(ctl, 'DriipSettlementChallengeState', '', DriipSettlementChallengeState);
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
                await execDeploy(ctl, 'NullSettlementChallengeByPayment', '', NullSettlementChallengeByPayment);
                await execDeploy(ctl, 'NullSettlementChallengeByTrade', '', NullSettlementChallengeByTrade);
                await execDeploy(ctl, 'NullSettlementChallengeState', '', NullSettlementChallengeState);
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
                await instance.disableInitialServiceAuthorization();

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
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.QUALIFY_PROPOSAL_ACTION.call());

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
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByTrade(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

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
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.CHALLENGE_BY_ORDER_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

                instance = await DriipSettlementState.at(addressStorage.get('DriipSettlementState'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_SETTLEMENT_ROLE_DONE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_FEE_TOTAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_SETTLEMENT_ROLE_DONE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_FEE_TOTAL_ACTION.call());

                instance = await DriipSettlementByPayment.at(addressStorage.get('DriipSettlementByPayment'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
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
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

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
                await instance.setNullSettlementState(addressStorage.get('NullSettlementState'));

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
                await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.CHALLENGE_BY_ORDER_ACTION.call());
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
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), await instance.DEPRIVE_ACTION.call());
                await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());

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
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByPayment'));
                await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.registerService(addressStorage.get('FraudChallengeByPayment'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeByPayment'));
                await instance.registerService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.authorizeInitialService(addressStorage.get('FraudChallengeBySuccessivePayments'));
                await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByTrade'));
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

            } else if (network.startsWith('mainnet')) {
                addressStorage.set('BalanceTracker', '0xbc1bcc29edf605095bf4fe7a953b7c115ecc8cad');
                // await execDeploy(ctl, 'CancelOrdersChallenge', '', CancelOrdersChallenge);
                addressStorage.set('ClientFund', '0xcc8d82f6ba952966e63001c7b320eef2ae729099');
                await execDeploy(ctl, 'CommunityVote', '', CommunityVote);
                // addressStorage.set('Configuration', '0x3dc79902b8f6b2e35e8307bb4238743f8a8e05cb');
                await execDeploy(ctl, 'Configuration', '', Configuration);
                await execDeploy(ctl, 'DriipSettlementByPayment', '', DriipSettlementByPayment);
                // await execDeploy(ctl, 'DriipSettlementByTrade', '', DriipSettlementByTrade);
                await execDeploy(ctl, 'DriipSettlementChallengeByPayment', '', DriipSettlementChallengeByPayment);
                // await execDeploy(ctl, 'DriipSettlementChallengeByTrade', '', DriipSettlementChallengeByTrade);
                await execDeploy(ctl, 'DriipSettlementChallengeState', '', DriipSettlementChallengeState);
                await execDeploy(ctl, 'DriipSettlementDisputeByPayment', '', DriipSettlementDisputeByPayment);
                // await execDeploy(ctl, 'DriipSettlementDisputeByTrade', '', DriipSettlementDisputeByTrade);
                await execDeploy(ctl, 'DriipSettlementState', '', DriipSettlementState);
                addressStorage.set('ERC20TransferController', '0x42aa8205bfa075d52f904602e631a897fea8651e');
                addressStorage.set('ERC721TransferController', '0x40732b9658431723ac13b132d0430282c7877238');
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
                await execDeploy(ctl, 'NullSettlementChallengeByPayment', '', NullSettlementChallengeByPayment);
                // await execDeploy(ctl, 'NullSettlementChallengeByTrade', '', NullSettlementChallengeByTrade);
                await execDeploy(ctl, 'NullSettlementChallengeState', '', NullSettlementChallengeState);
                await execDeploy(ctl, 'NullSettlementDisputeByPayment', '', NullSettlementDisputeByPayment);
                // await execDeploy(ctl, 'NullSettlementDisputeByTrade', '', NullSettlementDisputeByTrade);
                await execDeploy(ctl, 'NullSettlementState', '', NullSettlementState);
                await execDeploy(ctl, 'PartnerBenefactor', '', PartnerBenefactor);
                await execDeploy(ctl, 'PaymentHasher', '', PaymentHasher);
                await execDeploy(ctl, 'RevenueFund1', '', RevenueFund1);
                await execDeploy(ctl, 'SecurityBond', '', SecurityBond);
                await execDeploy(ctl, 'SignerManager', '', SignerManager);
                await execDeploy(ctl, 'TokenHolderRevenueFund', '', TokenHolderRevenueFund);
                addressStorage.set('TransferControllerManager', '0x375cccb1d483088d3d13c6b7536f0ca28622ba7e');
                addressStorage.set('TransactionTracker', '0x8adfe445750937cefe42d9fb428563d61ea1aa02');
                // await execDeploy(ctl, 'TradeHasher', '', TradeHasher);
                await execDeploy(ctl, 'Validator', '', Validator, true);
                // await execDeploy(ctl, 'ValidatorV2', '', ValidatorV2, true);
                await execDeploy(ctl, 'WalletLocker', '', WalletLocker);

                // NOTE Fully configured in v1.0.0
                // instance = await BalanceTracker.at(addressStorage.get('BalanceTracker'));
                // await instance.registerService(addressStorage.get('ClientFund'));

                // instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));

                // NOTE Partially configured in v1.0.0
                instance = await ClientFund.at(addressStorage.get('ClientFund'));
                // await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.freezeBalanceTracker();
                // await instance.setTransactionTracker(addressStorage.get('TransactionTracker'));
                // await instance.freezeTransactionTracker();
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.freezeWalletLocker();
                await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
                await instance.registerBeneficiary(addressStorage.get('RevenueFund1'));
                // await instance.registerBeneficiary(addressStorage.get('PartnerFund'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.authorizeInitialService(addressStorage.get('DriipSettlementByPayment'));
                // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                // await instance.authorizeInitialService(addressStorage.get('DriipSettlementByTrade'));
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
                // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.QUALIFY_PROPOSAL_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

                instance = await DriipSettlementChallengeByPayment.at(addressStorage.get('DriipSettlementChallengeByPayment'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setDriipSettlementDisputeByPayment(addressStorage.get('DriipSettlementDisputeByPayment'));
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

                // instance = await DriipSettlementDisputeByTrade.at(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                // await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.CHALLENGE_BY_ORDER_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.UNCHALLENGE_ORDER_CANDIDATE_BY_TRADE_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.CHALLENGE_BY_TRADE_ACTION.call());

                instance = await DriipSettlementState.at(addressStorage.get('DriipSettlementState'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.INIT_SETTLEMENT_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_SETTLEMENT_ROLE_DONE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_MAX_NONCE_ACTION.call());
                await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), await instance.SET_FEE_TOTAL_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.INIT_SETTLEMENT_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_SETTLEMENT_ROLE_DONE_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_MAX_NONCE_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), await instance.SET_FEE_TOTAL_ACTION.call());

                instance = await DriipSettlementByPayment.at(addressStorage.get('DriipSettlementByPayment'));
                await instance.setClientFund(addressStorage.get('ClientFund'));
                await instance.setValidator(addressStorage.get('Validator'));
                await instance.setCommunityVote(addressStorage.get('CommunityVote'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
                await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
                await instance.setRevenueFund(addressStorage.get('RevenueFund1'));
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
                // await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.INITIATE_PROPOSAL_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                // await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), await instance.DISQUALIFY_PROPOSAL_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.TERMINATE_PROPOSAL_ACTION.call());

                instance = await NullSettlementChallengeByPayment.at(addressStorage.get('NullSettlementChallengeByPayment'));
                await instance.setConfiguration(addressStorage.get('Configuration'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                await instance.setNullSettlementDisputeByPayment(addressStorage.get('NullSettlementDisputeByPayment'));
                await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));

                // instance = await NullSettlementChallengeByTrade.at(addressStorage.get('NullSettlementChallengeByTrade'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setNullSettlementDisputeByTrade(addressStorage.get('NullSettlementDisputeByTrade'));
                // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                // await instance.setNullSettlementState(addressStorage.get('NullSettlementState'));

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

                // instance = await NullSettlementDisputeByTrade.at(addressStorage.get('NullSettlementDisputeByTrade'));
                // await instance.setConfiguration(addressStorage.get('Configuration'));
                // await instance.setValidator(addressStorage.get('ValidatorV2'));
                // await instance.setSecurityBond(addressStorage.get('SecurityBond'));
                // await instance.setWalletLocker(addressStorage.get('WalletLocker'));
                // await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
                // await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
                // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
                // await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), await instance.CHALLENGE_BY_ORDER_ACTION.call());
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
                await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
                await instance.registerFractionalBeneficiary(addressStorage.get('SecurityBond'), 1e16);

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
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.REWARD_ACTION.call());
                // await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), await instance.DEPRIVE_ACTION.call());
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
                await instance.registerService(addressStorage.get('RevenueFund1'));
                await instance.enableServiceAction(addressStorage.get('RevenueFund1'), await instance.CLOSE_ACCRUAL_PERIOD_ACTION.call());

                // NOTE Fully configured in v1.0.0
                // instance = await TransactionTracker.at(addressStorage.get('TransactionTracker'));
                // await instance.registerService(addressStorage.get('ClientFund'));

                // NOTE Fully configured in v1.0.0
                // instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
                // await instance.registerTransferController('ERC20', addressStorage.get('ERC20TransferController'), {from: deployerAccount});
                // await instance.registerTransferController('ERC721', addressStorage.get('ERC721TransferController'), {from: deployerAccount});

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
                // await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
                // await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByTrade'));
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
