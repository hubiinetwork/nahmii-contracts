/*!
 * Hubii Network - DEX Trade Smart Contract test suite.
 *
 * Copyright (C) 2017-2018 Hubii
 */

const ethers = require('ethers');
const Helpers = require('./helpers');
const w3prov = new ethers.providers.Web3Provider(web3.currentProvider);

const ClientFund = artifacts.require('ClientFund');
const SignerManager = artifacts.require('SignerManager');
const CommunityVote = artifacts.require('CommunityVote');
const Hasher = artifacts.require('Hasher');
const Validator = artifacts.require('Validator');
const Configuration = artifacts.require('Configuration');
const CancelOrdersChallenge = artifacts.require('CancelOrdersChallenge');
const DriipSettlement = artifacts.require('DriipSettlement');
const DriipSettlementChallenge = artifacts.require('DriipSettlementChallenge');
const DriipSettlementDispute = artifacts.require('DriipSettlementDispute');
const FraudChallenge = artifacts.require('FraudChallenge');
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
const NullSettlement = artifacts.require('NullSettlement');
const NullSettlementChallenge = artifacts.require('NullSettlementChallenge');
const NullSettlementDispute = artifacts.require('NullSettlementDispute');
const TransferControllerManager = artifacts.require('TransferControllerManager');
const PartnerFund = artifacts.require('PartnerFund');
const RevenueFund = artifacts.require('RevenueFund');
const SecurityBond = artifacts.require('SecurityBond');
const TestServable = artifacts.require('TestServable');
const TestAuthorizableServable = artifacts.require('TestAuthorizableServable');
// const TokenHolderRevenueFund = artifacts.require('TokenHolderRevenueFund');

const ERC20Token = artifacts.require('StandardTokenEx');
// const RevenueToken = artifacts.require('RevenueToken');

const UnitTestHelpers = artifacts.require('UnitTestHelpers');

//augmented sendTransaction using promises
Helpers.augmentWeb3(web3);

contract('Smart contract checks', function () {
    const glob = {
        owner: web3.eth.coinbase,
        user_a: web3.eth.accounts[1],
        user_b: web3.eth.accounts[2],
        user_c: web3.eth.accounts[3],
        user_d: web3.eth.accounts[4],
        user_e: web3.eth.accounts[5],
        user_f: web3.eth.accounts[6],
        user_g: web3.eth.accounts[7],
        user_h: web3.eth.accounts[8],
        user_i: web3.eth.accounts[9],

        gasLimit: 1800000
    };

    glob.signer_owner = w3prov.getSigner(glob.owner);
    glob.signer_a = w3prov.getSigner(glob.user_a);
    glob.signer_b = w3prov.getSigner(glob.user_b);
    glob.signer_c = w3prov.getSigner(glob.user_c);
    glob.signer_d = w3prov.getSigner(glob.user_d);
    glob.signer_e = w3prov.getSigner(glob.user_e);
    glob.signer_f = w3prov.getSigner(glob.user_f);
    glob.signer_g = w3prov.getSigner(glob.user_g);
    glob.signer_h = w3prov.getSigner(glob.user_h);
    glob.signer_i = w3prov.getSigner(glob.user_i);

    const minRequiredEthersPerUser = 10;
    const initialTokensSupply = 1000;
    const initialTokensForAll = 100;

    //-------------------------------------------------------------------------
    // Preflight stage
    //-------------------------------------------------------------------------

    before('Preflight: Check available account addresses and balances', async () => {
        assert.notEqual(glob.user_a, null);
        assert.notEqual(glob.user_b, null);
        assert.notEqual(glob.user_c, null);
        assert.notEqual(glob.user_d, null);
        assert.notEqual(glob.user_e, null);
        assert.notEqual(glob.user_f, null);
        assert.notEqual(glob.user_g, null);
        assert.notEqual(glob.user_h, null);
        assert.notEqual(glob.user_i, null);

        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_a), 'ether') >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_b), 'ether') >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_c), 'ether') >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_d), 'ether') >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_e), 'ether') >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_f), 'ether') >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_g), 'ether') >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_h), 'ether') >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_i), 'ether') >= minRequiredEthersPerUser);
    });

    before('Preflight: Instantiate and register test token in transfer controller manager', async () => {
        try {
            glob.web3Erc20 = await ERC20Token.new();
            assert.notEqual(glob.web3Erc20, null);
            console.log('Sample ERC20 token deployed at address: ' + glob.web3Erc20.address);

            glob.web3Erc20.totalSupply = initialTokensSupply;

            let instance = await TransferControllerManager.deployed();
            await instance.registerCurrency(glob.web3Erc20.address, 'ERC20', { from: glob.owner });
        }
        catch (err) {
            assert(false, 'Failed to instantiate ERC20Token instance. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Deploy several unit test helper contracts for validation tests', async () => {
        try {
            let instance = await TransferControllerManager.deployed();

            glob.web3UnitTestHelpers_SUCCESS_TESTS = await UnitTestHelpers.new(glob.owner);
            assert.notEqual(glob.web3UnitTestHelpers_SUCCESS_TESTS, null);
            glob.ethersUnitTestHelpers_SUCCESS_TESTS = new ethers.Contract(glob.web3UnitTestHelpers_SUCCESS_TESTS.address, UnitTestHelpers.abi, glob.signer_owner);
            await glob.web3UnitTestHelpers_SUCCESS_TESTS.setTransferControllerManager(instance.address);

            glob.web3UnitTestHelpers_FAIL_TESTS = await UnitTestHelpers.new(glob.owner);
            assert.notEqual(glob.web3UnitTestHelpers_FAIL_TESTS, null);
            glob.ethersUnitTestHelpers_FAIL_TESTS = new ethers.Contract(glob.web3UnitTestHelpers_FAIL_TESTS.address, UnitTestHelpers.abi, glob.signer_owner);
            await glob.ethersUnitTestHelpers_FAIL_TESTS.setTransferControllerManager(instance.address);

            glob.web3UnitTestHelpers_MISC_1 = await UnitTestHelpers.new(glob.owner);
            assert.notEqual(glob.web3UnitTestHelpers_MISC_1, null);
            glob.web3UnitTestHelpers_MISC_1 = new ethers.Contract(glob.web3UnitTestHelpers_MISC_1.address, UnitTestHelpers.abi, glob.signer_owner);
            await glob.web3UnitTestHelpers_MISC_1.setTransferControllerManager(instance.address);

            glob.web3UnitTestHelpers_MISC_2 = await UnitTestHelpers.new(glob.owner);
            assert.notEqual(glob.web3UnitTestHelpers_MISC_2, null);
            glob.web3UnitTestHelpers_MISC_2 = new ethers.Contract(glob.web3UnitTestHelpers_MISC_2.address, UnitTestHelpers.abi, glob.signer_owner);
            await glob.web3UnitTestHelpers_MISC_2.setTransferControllerManager(instance.address);
        }
        catch (err) {
            assert(false, 'Failed to create an instance of UnitTestHelpers. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate SignerManager contract', async () => {
        try {
            glob.web3SignerManager = await SignerManager.deployed();
            assert.notEqual(glob.web3SignerManager, null);
            glob.ethersIoSignerManager = new ethers.Contract(glob.web3SignerManager.address, SignerManager.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate SignerManager contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate Servable contract', async () => {
        try {
            glob.web3Servable = await TestServable.new(glob.owner);
            assert.notEqual(glob.web3Servable, null);
            glob.ethersIoServable = new ethers.Contract(glob.web3Servable.address, TestServable.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate Servable contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate AuthorizableServable contract', async () => {
        try {
            glob.web3AuthorizableServable = await TestAuthorizableServable.new(glob.owner);
            assert.notEqual(glob.web3AuthorizableServable, null);
            glob.ethersIoAuthorizableServable = new ethers.Contract(glob.web3AuthorizableServable.address, TestAuthorizableServable.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate AuthorizableServable contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate ClientFund contract', async () => {
        try {
            glob.web3ClientFund = await ClientFund.deployed();
            assert.notEqual(glob.web3ClientFund, null);
            glob.ethersIoClientFund = new ethers.Contract(glob.web3ClientFund.address, ClientFund.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate ClientFund contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate Hasher contract', async () => {
        try {
            glob.web3Hasher = await Hasher.deployed();
            assert.notEqual(glob.web3Hasher, null);
            glob.ethersIoHasher = new ethers.Contract(glob.web3Hasher.address, Hasher.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate Hasher contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate Validator contract', async () => {
        try {
            glob.web3Validator = await Validator.deployed();
            assert.notEqual(glob.web3Validator, null);
            glob.ethersIoValidator = new ethers.Contract(glob.web3Validator.address, Validator.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate Validator contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate CommunityVote contract', async () => {
        try {
            glob.web3CommunityVote = await CommunityVote.deployed();
            assert.notEqual(glob.web3CommunityVote, null);
            glob.ethersIoCommunityVote = new ethers.Contract(glob.web3CommunityVote.address, CommunityVote.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate CommunityVote contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate Configuration contract', async () => {
        try {
            glob.web3Configuration = await Configuration.deployed();
            assert.notEqual(glob.web3Configuration, null);
            glob.ethersIoConfiguration = new ethers.Contract(glob.web3Configuration.address, Configuration.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate Configuration contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate CancelOrdersChallenge contract', async () => {
        try {
            glob.web3CancelOrdersChallenge = await CancelOrdersChallenge.deployed();
            assert.notEqual(glob.web3CancelOrdersChallenge, null);
            glob.ethersIoCancelOrdersChallenge = new ethers.Contract(glob.web3CancelOrdersChallenge.address, CancelOrdersChallenge.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate CancelOrdersChallenge contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate DriipSettlement contract', async () => {
        try {
            glob.web3DriipSettlement = await DriipSettlement.deployed();
            assert.notEqual(glob.web3DriipSettlement, null);
            glob.ethersIoDriipSettlement = new ethers.Contract(glob.web3DriipSettlement.address, DriipSettlement.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate DriipSettlement contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate DriipSettlementChallenge contract', async () => {
        try {
            glob.web3DriipSettlementChallenge = await DriipSettlementChallenge.deployed();
            assert.notEqual(glob.web3DriipSettlementChallenge, null);
            glob.ethersIoDriipSettlementChallenge = new ethers.Contract(glob.web3DriipSettlementChallenge.address, DriipSettlementChallenge.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate DriipSettlementChallenge contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate DriipSettlementDispute contract', async () => {
        try {
            glob.web3DriipSettlementDispute = await DriipSettlementDispute.deployed();
            assert.notEqual(glob.web3DriipSettlementDispute, null);
            glob.ethersIoDriipSettlementDispute = new ethers.Contract(glob.web3DriipSettlementDispute.address, DriipSettlementDispute.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate DriipSettlementDispute contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate NullSettlement contract', async () => {
        try {
            glob.web3NullSettlement = await NullSettlement.deployed();
            assert.notEqual(glob.web3NullSettlement, null);
            glob.ethersIoNullSettlement = new ethers.Contract(glob.web3NullSettlement.address, NullSettlement.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate NullSettlement contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate NullSettlementChallenge contract', async () => {
        try {
            glob.web3NullSettlementChallenge = await NullSettlementChallenge.deployed();
            assert.notEqual(glob.web3NullSettlementChallenge, null);
            glob.ethersIoNullSettlementChallenge = new ethers.Contract(glob.web3NullSettlementChallenge.address, NullSettlementChallenge.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate NullSettlementChallenge contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate NullSettlementDispute contract', async () => {
        try {
            glob.web3NullSettlementDispute = await NullSettlementDispute.deployed();
            assert.notEqual(glob.web3NullSettlementDispute, null);
            glob.ethersIoNullSettlementDispute = new ethers.Contract(glob.web3NullSettlementDispute.address, NullSettlementDispute.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate NullSettlementDispute contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallenge contract', async () => {
        try {
            glob.web3FraudChallenge = await FraudChallenge.deployed();
            assert.notEqual(glob.web3FraudChallenge, null);
            glob.ethersIoFraudChallenge = new ethers.Contract(glob.web3FraudChallenge.address, FraudChallenge.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallenge contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByOrder contract', async () => {
        try {
            glob.web3FraudChallengeByOrder = await FraudChallengeByOrder.deployed();
            assert.notEqual(glob.web3FraudChallengeByOrder, null);
            glob.ethersIoFraudChallengeByOrder = new ethers.Contract(glob.web3FraudChallengeByOrder.address, FraudChallengeByOrder.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByOrder contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByTrade contract', async () => {
        try {
            glob.web3FraudChallengeByTrade = await FraudChallengeByTrade.deployed();
            assert.notEqual(glob.web3FraudChallengeByTrade, null);
            glob.ethersIoFraudChallengeByTrade = new ethers.Contract(glob.web3FraudChallengeByTrade.address, FraudChallengeByTrade.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByTrade contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByPayment contract', async () => {
        try {
            glob.web3FraudChallengeByPayment = await FraudChallengeByPayment.deployed();
            assert.notEqual(glob.web3FraudChallengeByPayment, null);
            glob.ethersIoFraudChallengeByPayment = new ethers.Contract(glob.web3FraudChallengeByPayment.address, FraudChallengeByPayment.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByPayment contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeBySuccessiveTrades contract', async () => {
        try {
            glob.web3FraudChallengeBySuccessiveTrades = await FraudChallengeBySuccessiveTrades.deployed();
            assert.notEqual(glob.web3FraudChallengeBySuccessiveTrades, null);
            glob.ethersIoFraudChallengeBySuccessiveTrades = new ethers.Contract(glob.web3FraudChallengeBySuccessiveTrades.address, FraudChallengeBySuccessiveTrades.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeBySuccessiveTrades contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeBySuccessivePayments contract', async () => {
        try {
            glob.web3FraudChallengeBySuccessivePayments = await FraudChallengeBySuccessivePayments.deployed();
            assert.notEqual(glob.web3FraudChallengeBySuccessivePayments, null);
            glob.ethersIoFraudChallengeBySuccessivePayments = new ethers.Contract(glob.web3FraudChallengeBySuccessivePayments.address, FraudChallengeBySuccessivePayments.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeBySuccessivePayments contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByPaymentSucceedingTrade contract', async () => {
        try {
            glob.web3FraudChallengeByPaymentSucceedingTrade = await FraudChallengeByPaymentSucceedingTrade.deployed();
            assert.notEqual(glob.web3FraudChallengeByPaymentSucceedingTrade, null);
            glob.ethersIoFraudChallengeByPaymentSucceedingTrade = new ethers.Contract(glob.web3FraudChallengeByPaymentSucceedingTrade.address, FraudChallengeByPaymentSucceedingTrade.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByPaymentSucceedingTrade contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByTradeSucceedingPayment contract', async () => {
        try {
            glob.web3FraudChallengeByTradeSucceedingPayment = await FraudChallengeByTradeSucceedingPayment.deployed();
            assert.notEqual(glob.web3FraudChallengeByTradeSucceedingPayment, null);
            glob.ethersIoFraudChallengeByTradeSucceedingPayment = new ethers.Contract(glob.web3FraudChallengeByTradeSucceedingPayment.address, FraudChallengeByTradeSucceedingPayment.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByTradeSucceedingPayment contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByTradeOrderResiduals contract', async () => {
        try {
            glob.web3FraudChallengeByTradeOrderResiduals = await FraudChallengeByTradeOrderResiduals.deployed();
            assert.notEqual(glob.web3FraudChallengeByTradeOrderResiduals, null);
            glob.ethersIoFraudChallengeByTradeOrderResiduals = new ethers.Contract(glob.web3FraudChallengeByTradeOrderResiduals.address, FraudChallengeByTradeOrderResiduals.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByTradeOrderResiduals contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByDoubleSpentOrders contract', async () => {
        try {
            glob.web3FraudChallengeByDoubleSpentOrders = await FraudChallengeByDoubleSpentOrders.deployed();
            assert.notEqual(glob.web3FraudChallengeByDoubleSpentOrders, null);
            glob.ethersIoFraudChallengeByDoubleSpentOrders = new ethers.Contract(glob.web3FraudChallengeByDoubleSpentOrders.address, FraudChallengeByDoubleSpentOrders.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByDoubleSpentOrders contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByDuplicateDriipNonceOfTrades contract', async () => {
        try {
            glob.web3FraudChallengeByDuplicateDriipNonceOfTrades = await FraudChallengeByDuplicateDriipNonceOfTrades.deployed();
            assert.notEqual(glob.web3FraudChallengeByDuplicateDriipNonceOfTrades, null);
            glob.ethersIoFraudChallengeByDuplicateDriipNonceOfTrades = new ethers.Contract(glob.web3FraudChallengeByDuplicateDriipNonceOfTrades.address, FraudChallengeByDuplicateDriipNonceOfTrades.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByDuplicateDriipNonceOfTrades contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByDuplicateDriipNonceOfPayments contract', async () => {
        try {
            glob.web3FraudChallengeByDuplicateDriipNonceOfPayments = await FraudChallengeByDuplicateDriipNonceOfPayments.deployed();
            assert.notEqual(glob.web3FraudChallengeByDuplicateDriipNonceOfPayments, null);
            glob.ethersIoFraudChallengeByDuplicateDriipNonceOfPayments = new ethers.Contract(glob.web3FraudChallengeByDuplicateDriipNonceOfPayments.address, FraudChallengeByDuplicateDriipNonceOfPayments.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByDuplicateDriipNonceOfPayments contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate FraudChallengeByDuplicateDriipNonceOfTradeAndPayment contract', async () => {
        try {
            glob.web3FraudChallengeByDuplicateDriipNonceOfTradeAndPayment = await FraudChallengeByDuplicateDriipNonceOfTradeAndPayment.deployed();
            assert.notEqual(glob.web3FraudChallengeByDuplicateDriipNonceOfTradeAndPayment, null);
            glob.ethersIoFraudChallengeByDuplicateDriipNonceOfTradeAndPayment = new ethers.Contract(glob.web3FraudChallengeByDuplicateDriipNonceOfTradeAndPayment.address, FraudChallengeByDuplicateDriipNonceOfTradeAndPayment.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate FraudChallengeByDuplicateDriipNonceOfTradeAndPayment contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate RevenueFund contract', async () => {
        try {
            glob.web3RevenueFund = await RevenueFund.deployed();
            assert.notEqual(glob.web3RevenueFund, null);
            glob.ethersIoRevenueFund = new ethers.Contract(glob.web3RevenueFund.address, RevenueFund.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate RevenueFund contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Instantiate SecurityBond contract', async () => {
        try {
            glob.web3SecurityBond = await SecurityBond.deployed();
            assert.notEqual(glob.web3SecurityBond, null);
            glob.ethersIoSecurityBond = new ethers.Contract(glob.web3SecurityBond.address, SecurityBond.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate SecurityBond contract address. [Error: ' + err.toString() + ']');
        }
    });

    // before('Preflight: Instantiate TokenHolderRevenueFund contract', async () => {
    //     try {
    //         glob.web3TokenHolderRevenueFund = await TokenHolderRevenueFund.deployed();
    //         assert.notEqual(glob.web3TokenHolderRevenueFund, null);
    //         glob.ethersIoTokenHolderRevenueFund = new ethers.Contract(glob.web3TokenHolderRevenueFund.address, TokenHolderRevenueFund.abi, glob.signer_owner);
    //
    //         glob.web3RevenueToken = await RevenueToken.new();
    //         assert.notEqual(glob.web3RevenueToken, null);
    //         console.log('Sample RevenueToken deployed at address: ' + glob.web3RevenueToken.address);
    //         glob.web3TokenHolderRevenueFund.setRevenueToken(glob.web3RevenueToken.address);
    //     }
    //     catch (err) {
    //         assert(false, 'Failed to instantiate TokenHolderRevenueFund contract address. [Error: ' + err.toString() + ']');
    //     }
    // });

    before('Preflight: Instantiate PartnerFund contract', async () => {
        try {
            glob.web3PartnerFund = await PartnerFund.deployed();
            assert.notEqual(glob.web3PartnerFund, null);
            glob.ethersIoPartnerFund = new ethers.Contract(glob.web3PartnerFund.address, PartnerFund.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate PartnerFund contract address. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Distribute test ethers', async () => {
        try {
            await web3.eth.sendTransactionPromise({
                from: glob.owner,
                to: glob.web3UnitTestHelpers_SUCCESS_TESTS.address,
                value: web3.toWei('10', 'ether')
            });
            await web3.eth.sendTransactionPromise({
                from: glob.owner,
                to: glob.web3UnitTestHelpers_FAIL_TESTS.address,
                value: web3.toWei('10', 'ether')
            });
            await web3.eth.sendTransactionPromise({
                from: glob.owner,
                to: glob.web3UnitTestHelpers_MISC_1.address,
                value: web3.toWei('10', 'ether')
            });
            await web3.eth.sendTransactionPromise({
                from: glob.owner,
                to: glob.web3UnitTestHelpers_MISC_2.address,
                value: web3.toWei('10', 'ether')
            });
        }
        catch (err) {
            assert(false, 'Cannot distribute money to smart contracts. [Error: ' + err.toString() + ']');
        }
    });

    before('Preflight: Distribute test tokens', async() => {
        try {
            await glob.web3Erc20.testMint(glob.owner, 100);
            await glob.web3Erc20.testMint(glob.user_a, initialTokensForAll);
            await glob.web3Erc20.testMint(glob.user_b, initialTokensForAll);
            await glob.web3Erc20.testMint(glob.user_c, initialTokensForAll);
            await glob.web3Erc20.testMint(glob.user_d, initialTokensForAll);
            await glob.web3Erc20.testMint(glob.user_e, initialTokensForAll);
            await glob.web3Erc20.testMint(glob.web3UnitTestHelpers_SUCCESS_TESTS.address, initialTokensForAll);
            await glob.web3Erc20.testMint(glob.web3UnitTestHelpers_FAIL_TESTS.address, initialTokensForAll);
            await glob.web3Erc20.testMint(glob.web3UnitTestHelpers_MISC_1.address, initialTokensForAll);
            await glob.web3Erc20.testMint(glob.web3UnitTestHelpers_MISC_2.address, initialTokensForAll);
        }
        catch (err) {
            assert(false, 'Cannot assign tokens for users and smart contracts. [Error: ' + err.toString() + ']');
        }
    });

    // -------------------------------------------------------------------------
    // Tests start here
    //
    //
    // Test description format:
    // TXX: MUST {SUCCEED/FAIL} [function_name]: result of successful execution, or reason for fail.
    //
    // Returned error strings in Done() callback function:
    // 'This test must fail'
    // 'This test must succeed'
    // Additional info can be provided after the messages above. e.g: err.toString()
    //
    // -------------------------------------------------------------------------

    require('./scenarios/NahmiiToken')(glob);
    require('./scenarios/AuthorizableServable')(glob);
    require('./scenarios/BalanceTracker')(glob);
    require('./scenarios/CancelOrdersChallenge')(glob);
    require('./scenarios/ClientFund')(glob);
    require('./scenarios/CommunityVote')(glob);
    require('./scenarios/Configuration')(glob);
    require('./scenarios/DriipSettlement')(glob);
    require('./scenarios/DriipSettlementChallenge')(glob);
    require('./scenarios/DriipSettlementDispute')(glob);
    require('./scenarios/ERC20TransferController')(glob);
    require('./scenarios/FraudChallenge')(glob);
    require('./scenarios/FraudChallengeByOrder')(glob);
    require('./scenarios/FraudChallengeByTrade')(glob);
    require('./scenarios/FraudChallengeByPayment')(glob);
    require('./scenarios/FraudChallengeBySuccessiveTrades')(glob);
    require('./scenarios/FraudChallengeBySuccessivePayments')(glob);
    require('./scenarios/FraudChallengeByPaymentSucceedingTrade')(glob);
    require('./scenarios/FraudChallengeByTradeSucceedingPayment')(glob);
    require('./scenarios/FraudChallengeByTradeOrderResiduals')(glob);
    require('./scenarios/FraudChallengeByDoubleSpentOrders')(glob);
    require('./scenarios/FraudChallengeByDuplicateDriipNonceOfTrades')(glob);
    require('./scenarios/FraudChallengeByDuplicateDriipNonceOfPayments')(glob);
    require('./scenarios/FraudChallengeByDuplicateDriipNonceOfTradeAndPayment')(glob);
    require('./scenarios/Hasher')(glob);
    require('./scenarios/NullSettlement')(glob);
    require('./scenarios/NullSettlementChallenge')(glob);
    require('./scenarios/NullSettlementDispute')(glob);
    // require('./scenarios/RevenueFund')(glob);
    require('./scenarios/RevenueTokenManager')(glob);
    require('./scenarios/SecurityBond')(glob);
    require('./scenarios/Servable')(glob);
    require('./scenarios/SignerManager')(glob);
    require('./scenarios/PartnerFund')(glob);
    require('./scenarios/TokenHolderRevenueFund')(glob);
    require('./scenarios/TokenMultiTimelock')(glob);
    require('./scenarios/TransactionTracker')(glob);
    require('./scenarios/Validator')(glob);
    require('./scenarios/WalletLocker')(glob);
});
