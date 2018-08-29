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

//test smart contracts
const StandardTokenEx = artifacts.require('StandardTokenEx');
const UnitTestHelpers = artifacts.require('UnitTestHelpers');

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

            //deploy test smart contracts if on a developer network
            if (helpers.isTestNetwork(network)) {
                instance = await deployer.deploy(StandardTokenEx, { from: ownerAccount });
                addressStorage.set('StandardTokenEx', instance.address);

                instance = await deployer.deploy(UnitTestHelpers, { from: ownerAccount });
                addressStorage.set('UnitTestHelpers', instance.address);
            }

            //deploy transfer controllers
            let erc20controller = await execDeploy(deployer, 'ERC20TransferController', ERC20TransferController, deployFilters, addressStorage, ownerAccount);
            let erc721controller = await execDeploy(deployer, 'ERC721TransferController', ERC721TransferController, deployFilters, addressStorage, ownerAccount);
            instance = await execDeploy(deployer, 'TransferControllerManager', TransferControllerManager, deployFilters, addressStorage, ownerAccount);

            //register transfer controllers
            tx = await instance.registerTransferController('erc20', erc20controller.address, { from: ownerAccount });
            tx = await instance.registerTransferController('erc721', erc721controller.address, { from: ownerAccount });
            //register currencies on developer network
            if (helpers.isTestNetwork(network)) {
                tx = await instance.registerCurrency(addressStorage.get('ERC20TransferController'), "erc20");
            }

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
            await execDeploy(deployer, 'Hasher', Hasher, deployFilters, addressStorage, ownerAccount);
            await execDeploy(deployer, 'Validator', Validator, deployFilters, addressStorage, ownerAccount);
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
