/*!
 * Hubii Network - DEX Trade Smart Contract test suite.
 *
 * Copyright (C) 2017-2018 Hubii
 */

var async = require('async');
var ethers = require('ethers');
var keccak256 = require("augmented-keccak256");
var w3prov = new ethers.providers.Web3Provider(web3.currentProvider);

var ClientFund = artifacts.require("ClientFund");
var CommunityVote = artifacts.require("CommunityVote");
var Configuration = artifacts.require("Configuration");
var Exchange = artifacts.require("Exchange");
var ReserveFund = artifacts.require("ReserveFund");
var RevenueFund = artifacts.require("RevenueFund");
var SecurityBond = artifacts.require("SecurityBond");
var TokenHolderRevenueFund = artifacts.require("TokenHolderRevenueFund");
var ERC20Token = artifacts.require("StandardTokenEx");

//augmented sendTransaction using promises
web3.eth.sendTransactionPromise = function(transactionObject) {
	return new Promise((resolve, reject) => {
		web3.eth.sendTransaction(transactionObject, function (err) {
			if (!err)
				resolve();
			else
				reject(err);
		});
	});
}

contract('Smart contract checks', function () {
	var glob = {
		owner: web3.eth.coinbase,
		user_a: web3.eth.accounts[1],
		user_b: web3.eth.accounts[2],
		user_c: web3.eth.accounts[3],
		user_d: web3.eth.accounts[4],
		signer_owner: w3prov.getSigner(this.owner),
		signer_a: w3prov.getSigner(this.user_a),
		signer_b: w3prov.getSigner(this.user_b),
		signer_c: w3prov.getSigner(this.user_c),
		signer_d: w3prov.getSigner(this.user_d),

		gasLimit: 1800000

		//var web3ClientFund = null;
		//var ethersIoClientFund = null; // Uses Ethers.io for convenience using structs,etc.
		//var web3Erc20 = null;
	};

	const minRequiredEthersPerUser = 10;
	const initialTokensSupply = 1000;
	const initialTokensForUserA = 10;

	//-------------------------------------------------------------------------
	// Preflight stage
	//-------------------------------------------------------------------------

	before("Preflight: Check available account addresses and balances", function(done) {
		assert.notEqual(glob.user_a, null);
		assert.notEqual(glob.user_b, null);
		assert.notEqual(glob.user_c, null);
		assert.notEqual(glob.user_d, null);

		assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_a), "ether") >= minRequiredEthersPerUser);
		assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_b), "ether") >= minRequiredEthersPerUser);
		assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_c), "ether") >= minRequiredEthersPerUser);
		assert.ok(web3.fromWei(web3.eth.getBalance(glob.user_d), "ether") >= minRequiredEthersPerUser);

		done();
	});

	before("Preflight: Instantiate test token", function (done) {
		ERC20Token.new().then(
			function (_t) {
				assert.notEqual(_t, null);
				glob.web3Erc20 = _t;

				glob.web3Erc20.totalSupply = initialTokensSupply;

				done();
			},
			function () {
				done(new Error('Failed to instantiate ERC20Token instance'));
			}
		);
	});

	before("Preflight: Instantiate ClientFund contract", function (done) {
		ClientFund.deployed().then(
			function (_d) {
				assert.notEqual(_d, null);

				glob.web3ClientFund = _d;
				glob.ethersIoClientFund = new ethers.Contract(_d.address, ClientFund.abi, w3prov);

				done();
			},
			function () {
				done(new Error('Failed to instantiate ClientFund contract address'));
			}
		);
	});

	before("Preflight: Instantiate CommunityVote contract", function (done) {
		CommunityVote.deployed().then(
			function (_d) {
				assert.notEqual(_d, null);

				glob.web3CommunityVote = _d;
				glob.ethersIoCommunityVote = new ethers.Contract(_d.address, CommunityVote.abi, w3prov);

				done();
			},
			function () {
				done(new Error('Failed to instantiate CommunityVote contract address'));
			}
		);
	});

	before("Preflight: Instantiate Configuration contract", function (done) {
		Configuration.deployed().then(
			function (_d) {
				assert.notEqual(_d, null);

				glob.web3Configuration = _d;
				glob.ethersIoConfiguration = new ethers.Contract(_d.address, Configuration.abi, w3prov);

				done();
			},
			function () {
				done(new Error('Failed to instantiate Configuration contract address'));
			}
		);
	});

	before("Preflight: Instantiate Exchange contract", function (done) {
		Exchange.deployed().then(
			function (_d) {
				assert.notEqual(_d, null);

				glob.web3Exchange = _d;
				glob.ethersIoExchange = new ethers.Contract(_d.address, Exchange.abi, w3prov);

				done();
			},
			function () {
				done(new Error('Failed to instantiate Exchange contract address'));
			}
		);
	});

	before("Preflight: Instantiate ReserveFund contract", function (done) {
		ReserveFund.deployed().then(
			function (_d) {
				assert.notEqual(_d, null);

				glob.web3ReserveFund = _d;
				glob.ethersIoReserveFund = new ethers.Contract(_d.address, ReserveFund.abi, w3prov);

				done();
			},
			function () {
				done(new Error('Failed to instantiate ReserveFund contract address'));
			}
		);
	});

	before("Preflight: Instantiate RevenueFund contract", function (done) {
		RevenueFund.deployed().then(
			function (_d) {
				assert.notEqual(_d, null);

				glob.web3RevenueFund = _d;
				glob.ethersIoRevenueFund = new ethers.Contract(_d.address, RevenueFund.abi, w3prov);

				done();
			},
			function () {
				done(new Error('Failed to instantiate RevenueFund contract address'));
			}
		);
	});

	before("Preflight: Instantiate SecurityBond contract", function (done) {
		SecurityBond.deployed().then(
			function (_d) {
				assert.notEqual(_d, null);

				glob.web3SecurityBond = _d;
				glob.ethersIoSecurityBond = new ethers.Contract(_d.address, SecurityBond.abi, w3prov);

				done();
			},
			function () {
				done(new Error('Failed to instantiate SecurityBond contract address'));
			}
		);
	});

	before("Preflight: Instantiate TokenHolderRevenueFund contract", function (done) {
		TokenHolderRevenueFund.deployed().then(
			function (_d) {
				assert.notEqual(_d, null);

				glob.web3TokenHolderRevenueFund = _d;
				glob.ethersIoTokenHolderRevenueFund = new ethers.Contract(_d.address, TokenHolderRevenueFund.abi, w3prov);

				done();
			},
			function () {
				done(new Error('Failed to instantiate TokenHolderRevenueFund contract address'));
			}
		);
	});

	before("Preflight: distribute test tokens", function (done) {
		glob.web3Erc20.testMint(glob.user_a, initialTokensForUserA).then(
			function () {
				done();
			},
			function (err) {
				done(new Error('Cannot assign tokens for user A: ' + err.toString()));
			}
		);
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
	require('./scenarios/CommunityVote')(glob);
	require('./scenarios/Configuration')(glob);
	require('./scenarios/Exchange')(glob);
	require('./scenarios/ReserveFund')(glob);
	require('./scenarios/RevenueFund')(glob);
	require('./scenarios/SecurityBond')(glob);
	require('./scenarios/TokenHolderRevenueFund')(glob);
});
