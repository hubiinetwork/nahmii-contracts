/*!
 * Hubii Nahmii
 *
 * Copyright (C) 2017-2018 Hubii AS
 */

const AccrualBenefactor = artifacts.require('AccrualBenefactor');
const BalanceTracker = artifacts.require('BalanceTracker');
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
const FungibleBalanceLib = artifacts.require('FungibleBalanceLib');
const MockedBeneficiary = artifacts.require('MockedBeneficiary');
const MockedCancelOrdersChallenge = artifacts.require('MockedCancelOrdersChallenge');
const MockedClientFund = artifacts.require('MockedClientFund');
const MockedConfiguration = artifacts.require('MockedConfiguration');
// const MockedDriipSettlementChallenge = artifacts.require('MockedDriipSettlementChallenge');
const MockedDriipSettlementDisputeByPayment = artifacts.require('MockedDriipSettlementDisputeByPayment');
const MockedDriipSettlementDisputeByTrade = artifacts.require('MockedDriipSettlementDisputeByTrade');
// const MockedNullSettlementChallenge = artifacts.require('MockedNullSettlementChallenge');
// const MockedNullSettlementDispute = artifacts.require('MockedNullSettlementDispute');
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
const PaymentHasher = artifacts.require('PaymentHasher');
const PaymentTypesLib = artifacts.require('PaymentTypesLib');
const RevenueFund = artifacts.require('RevenueFund');
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

        if (helpers.isResetArgPresent())
            addressStorage.clear();

        if (helpers.isTestNetwork(network))
            deployerAccount = accounts[0];

        else {
            deployerAccount = helpers.parseDeployerArg();

            helpers.unlockAddress(web3, deployerAccount, helpers.parsePasswordArg(), 7200);
        }

        try {
            let ctl = {
                deployer: deployer,
                deployFilters: helpers.getFiltersFromArgs(),
                addressStorage: addressStorage,
                deployerAccount: deployerAccount
            };

            BlockNumbDisdIntsLib.address = addressStorage.get('BlockNumbDisdIntsLib');
            BlockNumbFiguresLib.address = addressStorage.get('BlockNumbFiguresLib');
            BlockNumbIntsLib.address = addressStorage.get('BlockNumbIntsLib');
            BlockNumbReferenceCurrenciesLib.address = addressStorage.get('BlockNumbReferenceCurrenciesLib');
            BlockNumbUintsLib.address = addressStorage.get('BlockNumbUintsLib');
            ConstantsLib.address = addressStorage.get('ConstantsLib');
            CurrenciesLib.address = addressStorage.get('CurrenciesLib');
            FungibleBalanceLib.address = addressStorage.get('FungibleBalanceLib');
            MonetaryTypesLib.address = addressStorage.get('MonetaryTypesLib');
            NahmiiTypesLib.address = addressStorage.get('NahmiiTypesLib');
            PaymentTypesLib.address = addressStorage.get('PaymentTypesLib');
            TradeTypesLib.address = addressStorage.get('TradeTypesLib');
            NonFungibleBalanceLib.address = addressStorage.get('NonFungibleBalanceLib');
            SafeMathIntLib.address = addressStorage.get('SafeMathIntLib');
            SafeMathUintLib.address = addressStorage.get('SafeMathUintLib');
            SettlementChallengeTypesLib.address = addressStorage.get('SettlementChallengeTypesLib');
            DriipSettlementTypesLib.address = addressStorage.get('DriipSettlementTypesLib');
            Strings.address = addressStorage.get('Strings');
            TxHistoryLib.address = addressStorage.get('TxHistoryLib');

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
                RevenueFund,
                SecurityBond,
                Validator,
                ValidatorV2

            ]);
            await deployer.link(CurrenciesLib, [
                BalanceTracker,
                PartnerFund,
                RevenueFund,
                SecurityBond,
                TokenHolderRevenueFund
            ]);
            await deployer.link(FungibleBalanceLib, [
                BalanceTracker,
                PartnerFund,
                RevenueFund,
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
                MockedBeneficiary,
                MockedClientFund,
                NullSettlement,
                NullSettlementChallengeState,
                NullSettlementDisputeByPayment,
                NullSettlementDisputeByTrade,
                NullSettlementState,
                PartnerFund,
                PaymentHasher,
                RevenueFund,
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
                FraudChallengeByDuplicateDriipNonceOfPayments,
                FraudChallengeByDuplicateDriipNonceOfTradeAndPayment,
                FraudChallengeByDuplicateDriipNonceOfTrades,
                FraudChallengeByOrder,
                FraudChallengeByPayment,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeByTrade,
                FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment,
                MockedCancelOrdersChallenge,
                // MockedDriipSettlementChallenge,
                // MockedNullSettlementChallenge,
                // MockedNullSettlementDispute,
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
                FraudChallengeByDuplicateDriipNonceOfPayments,
                FraudChallengeByDuplicateDriipNonceOfTradeAndPayment,
                FraudChallengeByPayment,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessivePayments,
                FraudChallengeByTradeSucceedingPayment,
                // MockedDriipSettlementChallenge,
                MockedDriipSettlementDisputeByPayment,
                // MockedNullSettlementChallenge,
                // MockedNullSettlementDispute,
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
                RevenueFund,
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
                NullSettlement,
                NullSettlementChallengeByPayment,
                NullSettlementChallengeByTrade,
                NullSettlementChallengeState,
                NullSettlementDisputeByPayment,
                NullSettlementDisputeByTrade,
                NullSettlementState,
                RevenueFund,
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
                // MockedDriipSettlementChallenge,
                // MockedNullSettlementChallenge,
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
                FraudChallengeByDuplicateDriipNonceOfTradeAndPayment,
                FraudChallengeByDuplicateDriipNonceOfTrades,
                FraudChallengeByOrder,
                FraudChallengeByPaymentSucceedingTrade,
                FraudChallengeBySuccessiveTrades,
                FraudChallengeByTrade,
                FraudChallengeByTradeOrderResiduals,
                FraudChallengeByTradeSucceedingPayment,
                MockedCancelOrdersChallenge,
                // MockedDriipSettlementChallenge,
                MockedDriipSettlementDisputeByTrade,
                // MockedNullSettlementChallenge,
                // MockedNullSettlementDispute,
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
                RevenueFund,
                SecurityBond,
                TokenHolderRevenueFund
            ]);

            if (helpers.isTestNetwork(network) || network.startsWith('ropsten')) {
                await execDeploy(ctl, 'Configuration', '', Configuration);

                await execDeploy(ctl, 'ERC20TransferController', '', ERC20TransferController);

                await execDeploy(ctl, 'ERC721TransferController', '', ERC721TransferController);

                await execDeploy(ctl, 'TransferControllerManager', '', TransferControllerManager);

                await execDeploy(ctl, 'BalanceTracker', '', BalanceTracker);

                await execDeploy(ctl, 'TransactionTracker', '', TransactionTracker);

                await execDeploy(ctl, 'ClientFund', '', ClientFund);

                const delayBlocks = helpers.isTestNetwork(network) ? 1 : 10;

                instance = await Configuration.at(addressStorage.get('Configuration'));
                await instance.setConfirmationBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 12);
                await instance.setTradeMakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                       // 0.1%
                await instance.setTradeMakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                        // 0.00001%
                await instance.setTradeTakerFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e15, [], []);                       // 0.2%
                await instance.setTradeTakerMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2e11);                        // 0.00002%
                await instance.setPaymentFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e15, [], []);                          // 0.1%
                await instance.setPaymentMinimumFee((await web3.eth.getBlockNumberPromise()) + delayBlocks, 1e11);                           // 0.00001%
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
                    // await instance.setUpdateDelayBlocks((await web3.eth.getBlockNumberPromise()) + delayBlocks, 2880);                       // ~12 hours
                    await instance.setEarliestSettlementBlockNumber((await web3.eth.getBlockNumberPromise()) + 172800);                      // In ~30 days
                    // await instance.disableEarliestSettlementBlockNumberUpdate();
                }

                instance = await TransferControllerManager.at(addressStorage.get('TransferControllerManager'));
                await instance.registerTransferController('ERC20', addressStorage.get('ERC20TransferController'), {from: deployerAccount});
                await instance.registerTransferController('ERC721', addressStorage.get('ERC721TransferController'), {from: deployerAccount});

                instance = await BalanceTracker.at(addressStorage.get('BalanceTracker'));
                await instance.registerService(addressStorage.get('ClientFund'));

                instance = await TransactionTracker.at(addressStorage.get('TransactionTracker'));
                await instance.registerService(addressStorage.get('ClientFund'));

                instance = await ClientFund.at(addressStorage.get('ClientFund'));
                await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
                await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
                await instance.freezeBalanceTracker();
                await instance.setTransactionTracker(addressStorage.get('TransactionTracker'));
                await instance.freezeTransactionTracker();

            } else if (network.startsWith('mainnet')) {
                addressStorage.set('Configuration', '0x3dc79902b8f6b2e35e8307bb4238743f8a8e05cb');
                addressStorage.set('ERC20TransferController', '0x42aa8205bfa075d52f904602e631a897fea8651e');
                addressStorage.set('ERC721TransferController', '0x40732b9658431723ac13b132d0430282c7877238');
                addressStorage.set('TransferControllerManager', '0x375cccb1d483088d3d13c6b7536f0ca28622ba7e');
                addressStorage.set('BalanceTracker', '0xbc1bcc29edf605095bf4fe7a953b7c115ecc8cad');
                addressStorage.set('TransactionTracker', '0x8adfe445750937cefe42d9fb428563d61ea1aa02');
                addressStorage.set('ClientFund', '0xcc8d82f6ba952966e63001c7b320eef2ae729099');
            }

            await execDeploy(ctl, 'SignerManager', '', SignerManager);
            await execDeploy(ctl, 'Validator', '', Validator, true);
            await execDeploy(ctl, 'CommunityVote', '', CommunityVote);
            await execDeploy(ctl, 'CancelOrdersChallenge', '', CancelOrdersChallenge);
            await execDeploy(ctl, 'DriipSettlementByPayment', '', DriipSettlementByPayment);
            await execDeploy(ctl, 'DriipSettlementByTrade', '', DriipSettlementByTrade);
            await execDeploy(ctl, 'DriipSettlementChallengeByPayment', '', DriipSettlementChallengeByPayment);
            await execDeploy(ctl, 'DriipSettlementChallengeByTrade', '', DriipSettlementChallengeByTrade);
            await execDeploy(ctl, 'DriipSettlementChallengeState', '', DriipSettlementChallengeState);
            await execDeploy(ctl, 'DriipSettlementDisputeByPayment', '', DriipSettlementDisputeByPayment);
            await execDeploy(ctl, 'DriipSettlementDisputeByTrade', '', DriipSettlementDisputeByTrade);
            await execDeploy(ctl, 'DriipSettlementState', '', DriipSettlementState);
            await execDeploy(ctl, 'FraudChallenge', '', FraudChallenge);
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
            await execDeploy(ctl, 'NullSettlement', '', NullSettlement);
            await execDeploy(ctl, 'NullSettlementChallengeByPayment', '', NullSettlementChallengeByPayment);
            await execDeploy(ctl, 'NullSettlementChallengeByTrade', '', NullSettlementChallengeByTrade);
            await execDeploy(ctl, 'NullSettlementChallengeState', '', NullSettlementChallengeState);
            await execDeploy(ctl, 'NullSettlementDisputeByPayment', '', NullSettlementDisputeByPayment);
            await execDeploy(ctl, 'NullSettlementDisputeByTrade', '', NullSettlementDisputeByTrade);
            await execDeploy(ctl, 'NullSettlementState', '', NullSettlementState);
            await execDeploy(ctl, 'PaymentHasher', '', PaymentHasher);
            await execDeploy(ctl, 'RevenueFund', 'TradesRevenueFund', RevenueFund);
            await execDeploy(ctl, 'RevenueFund', 'PaymentsRevenueFund', RevenueFund);
            await execDeploy(ctl, 'SecurityBond', '', SecurityBond);
            await execDeploy(ctl, 'TokenHolderRevenueFund', '', TokenHolderRevenueFund);
            await execDeploy(ctl, 'TradeHasher', '', TradeHasher);
            await execDeploy(ctl, 'PartnerFund', '', PartnerFund);
            await execDeploy(ctl, 'ValidatorV2', '', ValidatorV2, true);
            await execDeploy(ctl, 'WalletLocker', '', WalletLocker);

            instance = await Configuration.at(addressStorage.get('Configuration'));
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

            instance = await ClientFund.at(addressStorage.get('ClientFund'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.freezeWalletLocker();
            await instance.setTokenHolderRevenueFund(addressStorage.get('TokenHolderRevenueFund'));
            await instance.registerBeneficiary(addressStorage.get('PaymentsRevenueFund'));
            await instance.registerBeneficiary(addressStorage.get('TradesRevenueFund'));
            await instance.registerBeneficiary(addressStorage.get('PartnerFund'));
            await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
            await instance.authorizeInitialService(addressStorage.get('DriipSettlementByPayment'));
            await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
            await instance.authorizeInitialService(addressStorage.get('DriipSettlementByTrade'));
            await instance.registerService(addressStorage.get('NullSettlement'));
            await instance.authorizeInitialService(addressStorage.get('NullSettlement'));
            // await instance.disableInitialServiceAuthorization();

            instance = await CancelOrdersChallenge.at(addressStorage.get('CancelOrdersChallenge'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setConfiguration(addressStorage.get('Configuration'));

            instance = await DriipSettlementChallengeState.at(addressStorage.get('DriipSettlementChallengeState'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), 'add_proposal');
            await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), 'add_proposal');
            await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), 'disqualify_proposal');
            await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), 'disqualify_proposal');
            await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), 'qualify_proposal');

            instance = await DriipSettlementChallengeByPayment.at(addressStorage.get('DriipSettlementChallengeByPayment'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setDriipSettlementDisputeByPayment(addressStorage.get('DriipSettlementDisputeByPayment'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

            instance = await DriipSettlementChallengeByTrade.at(addressStorage.get('DriipSettlementChallengeByTrade'));
            await instance.setValidator(addressStorage.get('ValidatorV2'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setDriipSettlementDisputeByTrade(addressStorage.get('DriipSettlementDisputeByTrade'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            // await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

            instance = await DriipSettlementDisputeByPayment.at(addressStorage.get('DriipSettlementDisputeByPayment'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            await instance.registerService(addressStorage.get('DriipSettlementChallengeByPayment'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByPayment'), 'challenge_by_payment');

            instance = await DriipSettlementDisputeByTrade.at(addressStorage.get('DriipSettlementDisputeByTrade'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('ValidatorV2'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            await instance.registerService(addressStorage.get('DriipSettlementChallengeByTrade'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), 'challenge_by_order');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), 'unchallenge_order_candidate_by_trade');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementChallengeByTrade'), 'challenge_by_trade');

            instance = await DriipSettlementState.at(addressStorage.get('DriipSettlementState'));
            await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            await instance.registerService(addressStorage.get('DriipSettlementByPayment'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), 'init_settlement');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), 'set_settlement_role_done');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), 'set_max_nonce');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), 'set_max_driip_nonce');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByPayment'), 'set_fee_total');
            await instance.registerService(addressStorage.get('DriipSettlementByTrade'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), 'init_settlement');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), 'set_settlement_role_done');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), 'set_max_nonce');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), 'set_max_driip_nonce');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementByTrade'), 'set_fee_total');

            instance = await DriipSettlementByPayment.at(addressStorage.get('DriipSettlementByPayment'));
            await instance.setClientFund(addressStorage.get('ClientFund'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            await instance.setRevenueFund(addressStorage.get('PaymentsRevenueFund'));
            await instance.setPartnerFund(addressStorage.get('PartnerFund'));

            instance = await DriipSettlementByTrade.at(addressStorage.get('DriipSettlementByTrade'));
            await instance.setClientFund(addressStorage.get('ClientFund'));
            await instance.setValidator(addressStorage.get('ValidatorV2'));
            await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setDriipSettlementChallengeState(addressStorage.get('DriipSettlementChallengeState'));
            await instance.setRevenueFund(addressStorage.get('TradesRevenueFund'));
            await instance.setPartnerFund(addressStorage.get('PartnerFund'));

            instance = await NullSettlementChallengeState.at(addressStorage.get('NullSettlementChallengeState'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), 'add_proposal');
            await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), 'add_proposal');
            await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), 'disqualify_proposal');
            await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), 'disqualify_proposal');

            instance = await NullSettlementChallengeByPayment.at(addressStorage.get('NullSettlementChallengeByPayment'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setNullSettlementDisputeByPayment(addressStorage.get('NullSettlementDisputeByPayment'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            await instance.setDriipSettlementState(addressStorage.get('DriipSettlementState'));

            instance = await NullSettlementChallengeByTrade.at(addressStorage.get('NullSettlementChallengeByTrade'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setBalanceTracker(addressStorage.get('BalanceTracker'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setNullSettlementDisputeByTrade(addressStorage.get('NullSettlementDisputeByTrade'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));

            instance = await NullSettlementDisputeByPayment.at(addressStorage.get('NullSettlementDisputeByPayment'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            await instance.registerService(addressStorage.get('NullSettlementChallengeByPayment'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByPayment'), 'challenge_by_payment');

            instance = await NullSettlementDisputeByTrade.at(addressStorage.get('NullSettlementDisputeByTrade'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('ValidatorV2'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));
            await instance.setCancelOrdersChallenge(addressStorage.get('CancelOrdersChallenge'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            await instance.registerService(addressStorage.get('NullSettlementChallengeByTrade'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), 'challenge_by_order');
            await instance.enableServiceAction(addressStorage.get('NullSettlementChallengeByTrade'), 'challenge_by_trade');

            instance = await NullSettlementState.at(addressStorage.get('NullSettlementState'));
            await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            await instance.registerService(addressStorage.get('NullSettlement'));
            await instance.enableServiceAction(addressStorage.get('NullSettlement'), 'set_max_null_nonce');
            await instance.enableServiceAction(addressStorage.get('NullSettlement'), 'set_max_nonce_wallet_currency');

            instance = await NullSettlement.at(addressStorage.get('NullSettlement'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setClientFund(addressStorage.get('ClientFund'));
            await instance.setCommunityVote(addressStorage.get('CommunityVote'));
            await instance.setNullSettlementChallengeState(addressStorage.get('NullSettlementChallengeState'));
            await instance.setNullSettlementState(addressStorage.get('NullSettlementState'));

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

            instance = await FraudChallengeBySuccessivePayments.at(addressStorage.get('FraudChallengeBySuccessivePayments'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));

            instance = await FraudChallengeByPaymentSucceedingTrade.at(addressStorage.get('FraudChallengeByPaymentSucceedingTrade'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));

            instance = await FraudChallengeByTradeSucceedingPayment.at(addressStorage.get('FraudChallengeByTradeSucceedingPayment'));
            await instance.setFraudChallenge(addressStorage.get('FraudChallenge'));
            await instance.setConfiguration(addressStorage.get('Configuration'));
            await instance.setValidator(addressStorage.get('Validator'));
            await instance.setSecurityBond(addressStorage.get('SecurityBond'));
            await instance.setWalletLocker(addressStorage.get('WalletLocker'));

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

            instance = await PartnerFund.at(addressStorage.get('PartnerFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));

            instance = await RevenueFund.at(addressStorage.get('TradesRevenueFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
            await instance.registerFractionalBeneficiary(addressStorage.get('SecurityBond'), 1e16);

            instance = await RevenueFund.at(addressStorage.get('PaymentsRevenueFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.registerFractionalBeneficiary(addressStorage.get('TokenHolderRevenueFund'), 99e16);
            await instance.registerFractionalBeneficiary(addressStorage.get('SecurityBond'), 1e16);

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
            await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), 'reward');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByPayment'), 'deprive');
            await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), 'reward');
            await instance.enableServiceAction(addressStorage.get('DriipSettlementDisputeByTrade'), 'deprive');
            await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), 'reward');
            await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByPayment'), 'deprive');
            await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
            await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), 'reward');
            await instance.enableServiceAction(addressStorage.get('NullSettlementDisputeByTrade'), 'deprive');

            instance = await TokenHolderRevenueFund.at(addressStorage.get('TokenHolderRevenueFund'));
            await instance.setTransferControllerManager(addressStorage.get('TransferControllerManager'));
            await instance.setRevenueTokenManager(addressStorage.get('RevenueTokenManager'));
            await instance.registerService(addressStorage.get('TradesRevenueFund'));
            await instance.enableServiceAction(addressStorage.get('TradesRevenueFund'), 'close_accrual_period');
            await instance.registerService(addressStorage.get('PaymentsRevenueFund'));
            await instance.enableServiceAction(addressStorage.get('PaymentsRevenueFund'), 'close_accrual_period');

            instance = await Validator.at(addressStorage.get('Validator'));
            await instance.setPaymentHasher(addressStorage.get('PaymentHasher'));

            instance = await WalletLocker.at(addressStorage.get('WalletLocker'));
            await instance.registerService(addressStorage.get('DriipSettlementDisputeByPayment'));
            await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByPayment'));
            await instance.registerService(addressStorage.get('DriipSettlementDisputeByTrade'));
            await instance.authorizeInitialService(addressStorage.get('DriipSettlementDisputeByTrade'));
            await instance.registerService(addressStorage.get('NullSettlementDisputeByPayment'));
            await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByPayment'));
            await instance.registerService(addressStorage.get('NullSettlementDisputeByTrade'));
            await instance.authorizeInitialService(addressStorage.get('NullSettlementDisputeByTrade'));

        } finally {
            if (!helpers.isTestNetwork(network))
                helpers.lockAddress(web3, deployerAccount);
        }

        console.log(`Completed deployment as ${deployerAccount} and saving addresses in ${__filename}...`);
        await addressStorage.save();
    });
};

async function execDeploy(ctl, contractName, instanceName, contract, usesAccessManager) {
    let address = ctl.addressStorage.get(instanceName || contractName);

    if (!address || shouldDeploy(contractName, ctl.deployFilters)) {
        let instance;

        if (usesAccessManager) {
            let signerManager = ctl.addressStorage.get('SignerManager');

            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, signerManager, {from: ctl.deployerAccount});

        } else
            instance = await ctl.deployer.deploy(contract, ctl.deployerAccount, {from: ctl.deployerAccount});

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
