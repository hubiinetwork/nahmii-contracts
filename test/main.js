/*!
 * Hubii Network - DEX Trade Smart Contract test suite.
 *
 * Copyright (C) 2017-2018 Hubii
 */

var async = require('async');
var ethers = require('ethers');
var keccak256 = require("augmented-keccak256");
var Helpers = require('./helpers');
var w3prov = new ethers.providers.Web3Provider(web3.currentProvider);

var ClientFund = artifacts.require("ClientFund");
var CommunityVote = artifacts.require("CommunityVote");
var Hasher = artifacts.require("Hasher");
var Validator = artifacts.require("Validator");
var Configuration = artifacts.require("Configuration");
var Exchange = artifacts.require("Exchange");
var CancelOrdersChallenge = artifacts.require("CancelOrdersChallenge");
var DealSettlementChallenge = artifacts.require("DealSettlementChallenge");
// var FraudChallenge = artifacts.require("FraudChallenge");
var ReserveFund = artifacts.require("ReserveFund");
var RevenueFund = artifacts.require("RevenueFund");
var SecurityBond = artifacts.require("SecurityBond");
var TokenHolderRevenueFund = artifacts.require("TokenHolderRevenueFund");
var ERC20Token = artifacts.require("StandardTokenEx");
var UnitTestHelpers = artifacts.require("UnitTestHelpers");

//augmented sendTransaction using promises
Helpers.augmentWeb3(web3);

contract('Smart contract checks', function () {
    var glob = {
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

    before("Preflight: Check available account addresses and balances", async () => {
        assert.notEqual(glob.user_a, null);
        assert.notEqual(glob.user_b, null);
        assert.notEqual(glob.user_c, null);
        assert.notEqual(glob.user_d, null);
        assert.notEqual(glob.user_e, null);
        assert.notEqual(glob.user_f, null);
        assert.notEqual(glob.user_g, null);
        assert.notEqual(glob.user_h, null);
        assert.notEqual(glob.user_i, null);

        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_a), "ether") >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_b), "ether") >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_c), "ether") >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_d), "ether") >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_e), "ether") >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_f), "ether") >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_g), "ether") >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_h), "ether") >= minRequiredEthersPerUser);
        assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_i), "ether") >= minRequiredEthersPerUser);
    });

    before("Preflight: Instantiate test token", async () => {
        try {
            glob.web3Erc20 = await ERC20Token.new();
            assert.notEqual(glob.web3Erc20, null);

            glob.web3Erc20.totalSupply = initialTokensSupply;
        }
        catch (err) {
            assert(false, 'Failed to instantiate ERC20Token instance. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Deploy several unit test helper contracts for validation tests", async () => {
        try {
            glob.web3UnitTestHelpers_SUCCESS_TESTS = await UnitTestHelpers.new();
            assert.notEqual(glob.web3UnitTestHelpers_SUCCESS_TESTS, null);
            glob.ethersUnitTestHelpers_SUCCESS_TESTS = new ethers.Contract(glob.web3UnitTestHelpers_SUCCESS_TESTS.address, UnitTestHelpers.abi, glob.signer_owner);

            glob.web3UnitTestHelpers_FAIL_TESTS = await UnitTestHelpers.new();
            assert.notEqual(glob.web3UnitTestHelpers_FAIL_TESTS, null);
            glob.ethersUnitTestHelpers_FAIL_TESTS = new ethers.Contract(glob.web3UnitTestHelpers_FAIL_TESTS.address, UnitTestHelpers.abi, glob.signer_owner);

            glob.web3UnitTestHelpers_MISC_1 = await UnitTestHelpers.new();
            assert.notEqual(glob.web3UnitTestHelpers_MISC_1, null);
            glob.web3UnitTestHelpers_MISC_1 = new ethers.Contract(glob.web3UnitTestHelpers_MISC_1.address, UnitTestHelpers.abi, glob.signer_owner);

            glob.web3UnitTestHelpers_MISC_2 = await UnitTestHelpers.new();
            assert.notEqual(glob.web3UnitTestHelpers_MISC_2, null);
            glob.web3UnitTestHelpers_MISC_2 = new ethers.Contract(glob.web3UnitTestHelpers_MISC_2.address, UnitTestHelpers.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to create an instance of UnitTestHelpers. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate ClientFund contract", async () => {
        try {
            glob.web3ClientFund = await ClientFund.deployed();
            assert.notEqual(glob.web3ClientFund, null);
            glob.ethersIoClientFund = new ethers.Contract(glob.web3ClientFund.address, ClientFund.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate ClientFund contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate Hasher contract", async () => {
        try {
            glob.web3Hasher = await Hasher.deployed();
            assert.notEqual(glob.web3Hasher, null);
            glob.ethersIoHasher = new ethers.Contract(glob.web3Hasher.address, Hasher.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate Hasher contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate Validator contract", async () => {
        try {
            glob.web3Validator = await Validator.deployed();
            assert.notEqual(glob.web3Validator, null);
            glob.ethersIoValidator = new ethers.Contract(glob.web3Validator.address, Validator.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate Validator contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate CommunityVote contract", async () => {
        try {
            glob.web3CommunityVote = await CommunityVote.deployed();
            assert.notEqual(glob.web3CommunityVote, null);
            glob.ethersIoCommunityVote = new ethers.Contract(glob.web3CommunityVote.address, CommunityVote.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate CommunityVote contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate Configuration contract", async () => {
        try {
            glob.web3Configuration = await Configuration.deployed();
            assert.notEqual(glob.web3Configuration, null);
            glob.ethersIoConfiguration = new ethers.Contract(glob.web3Configuration.address, Configuration.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate Configuration contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate Exchange contract", async () => {
        try {
            glob.web3Exchange = await Exchange.deployed();
            assert.notEqual(glob.web3Exchange, null);
            glob.ethersIoExchange = new ethers.Contract(glob.web3Exchange.address, Exchange.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate Exchange contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate CancelOrdersChallenge contract", async () => {
        try {
            glob.web3CancelOrdersChallenge = await CancelOrdersChallenge.deployed();
            assert.notEqual(glob.web3CancelOrdersChallenge, null);
            glob.ethersIoCancelOrdersChallenge = new ethers.Contract(glob.web3CancelOrdersChallenge.address, CancelOrdersChallenge.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate CancelOrdersChallenge contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate DealSettlementChallenge contract", async () => {
        try {
            glob.web3DealSettlementChallenge = await DealSettlementChallenge.deployed();
            assert.notEqual(glob.web3DealSettlementChallenge, null);
            glob.ethersIoDealSettlementChallenge = new ethers.Contract(glob.web3DealSettlementChallenge.address, DealSettlementChallenge.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate DealSettlementChallenge contract address. [Error: ' + err.toString() + ']');
        }
    });

    // before("Preflight: Instantiate FraudChallenge contract", async () => {
    //     try {
    //         glob.web3FraudChallenge = await FraudChallenge.deployed();
    //         assert.notEqual(glob.web3FraudChallenge, null);
    //         glob.ethersIoFraudChallenge = new ethers.Contract(glob.web3FraudChallenge.address, FraudChallenge.abi, glob.signer_owner);
    //     }
    //     catch (err) {
    //         assert(false, 'Failed to instantiate FraudChallenge contract address. [Error: ' + err.toString() + ']');
    //     }
    // });

    before("Preflight: Instantiate ReserveFund contract", async () => {
        try {
            glob.web3ReserveFund = await ReserveFund.deployed();
            assert.notEqual(glob.web3ReserveFund, null);
            glob.ethersIoReserveFund = new ethers.Contract(glob.web3ReserveFund.address, ReserveFund.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate ReserveFund contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate RevenueFund contract", async () => {
        try {
            glob.web3RevenueFund = await RevenueFund.deployed();
            assert.notEqual(glob.web3RevenueFund, null);
            glob.ethersIoRevenueFund = new ethers.Contract(glob.web3RevenueFund.address, RevenueFund.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate RevenueFund contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate SecurityBond contract", async () => {
        try {
            glob.web3SecurityBond = await SecurityBond.deployed();
            assert.notEqual(glob.web3SecurityBond, null);
            glob.ethersIoSecurityBond = new ethers.Contract(glob.web3SecurityBond.address, SecurityBond.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate SecurityBond contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Instantiate TokenHolderRevenueFund contract", async () => {
        try {
            glob.web3TokenHolderRevenueFund = await TokenHolderRevenueFund.deployed();
            assert.notEqual(glob.web3TokenHolderRevenueFund, null);
            glob.ethersIoTokenHolderRevenueFund = new ethers.Contract(glob.web3TokenHolderRevenueFund.address, TokenHolderRevenueFund.abi, glob.signer_owner);
        }
        catch (err) {
            assert(false, 'Failed to instantiate TokenHolderRevenueFund contract address. [Error: ' + err.toString() + ']');
        }
    });

    before("Preflight: Distribute test ethers", async () => {
        try {
            await web3.eth.sendTransactionPromise({
                from: glob.owner,
                to: glob.web3UnitTestHelpers_SUCCESS_TESTS.address,
                value: web3.toWei('10', "ether")
            });
            await web3.eth.sendTransactionPromise({
                from: glob.owner,
                to: glob.web3UnitTestHelpers_FAIL_TESTS.address,
                value: web3.toWei('10', "ether")
            });
            await web3.eth.sendTransactionPromise({
                from: glob.owner,
                to: glob.web3UnitTestHelpers_MISC_1.address,
                value: web3.toWei('10', "ether")
            });
            await web3.eth.sendTransactionPromise({
                from: glob.owner,
                to: glob.web3UnitTestHelpers_MISC_2.address,
                value: web3.toWei('10', "ether")
            });
        }
        catch (err) {
            assert(false, 'Cannot distribute money to smart contracts. [Error: ' + err.toString() + ']');
        }
    });

	before("Preflight: Distribute test tokens", async() => {
		try {
			await glob.web3Erc20.testMint(glob.owner, 100);
			await glob.web3Erc20.testMint(glob.user_a, initialTokensForAll);
			await glob.web3Erc20.testMint(glob.user_b, initialTokensForAll);
			await glob.web3Erc20.testMint(glob.user_c, initialTokensForAll);
			await glob.web3Erc20.testMint(glob.user_d, initialTokensForAll);
			await glob.web3Erc20.testMint(glob.web3UnitTestHelpers_SUCCESS_TESTS.address, initialTokensForAll);
			await glob.web3Erc20.testMint(glob.web3UnitTestHelpers_FAIL_TESTS.address, initialTokensForAll);
			await glob.web3Erc20.testMint(glob.web3UnitTestHelpers_MISC_1.address, initialTokensForAll);
			await glob.web3Erc20.testMint(glob.web3UnitTestHelpers_MISC_2.address, initialTokensForAll);
		}
		catch (err) {
			assert(false, 'Cannot assign tokens for users and smart contracts. [Error: ' + err.toString() + ']');
		}
	});

    //-------------------------------------------------------------------------
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
    //-------------------------------------------------------------------------

    require('./scenarios/ClientFund')(glob);
    require('./scenarios/Hasher')(glob);
    // require('./scenarios/Validator')(glob);
    require('./scenarios/CommunityVote')(glob);
    require('./scenarios/Configuration')(glob);
    require('./scenarios/Exchange')(glob);
    require('./scenarios/CancelOrdersChallenge')(glob);
    require('./scenarios/DealSettlementChallenge')(glob);
    // require('./scenarios/FraudChallenge')(glob);
    require('./scenarios/ReserveFund')(glob);
    require('./scenarios/RevenueFund')(glob);
    require('./scenarios/SecurityBond')(glob);
    require('./scenarios/TokenHolderRevenueFund')(glob);
});
