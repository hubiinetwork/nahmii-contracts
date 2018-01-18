/*!
 * Hubii Network - DEX Smart Contract Main Test Suite file.
 *
 * Copyright (C) 2017-2018 Hubii
 */

var DexAssetsManager = artifacts.require("DexAssetsManager");

contract('DexAssetsManager', function () {
    async = require('async');
    const coinbase = web3.eth.coinbase;
    const user1 = web3.eth.accounts[1];
    const user2 = web3.eth.accounts[2];
    const gasLimit = 1400000;
    const ctraddr = DexAssetsManager.address;
    var deployedDex = null;

    //-------------------------------------------------------------------------

    before("Test setup", function(done) {
        DexAssetsManager.deployed().then(function (_d) {
            assert.notEqual(_d, null);
            deployedDex = _d;
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("Must successfully deposit ETHERs for two users via default payable() function + successful #getDeposit #getDepositsCount", function (done) {

        //
        // Helper functions
        //

        function _sendUserTx(user, ethers, cb) {
            web3.eth.sendTransaction({ from: user, to: ctraddr, value: web3.toWei(ethers, 'ether'), gas: gasLimit }, function (err) {
                assert.equal(err, null, "This default payable function TX must succeed");
                cb(err);
            });
        }

        function _verifyDepositCount(user, n, cb) {
            deployedDex.getDepositsCount(user1).then(function (count) {
                assert.equal(count, n, "Unexpected deposit count for user");
                cb(null);
            });
        }

        function _verifyDeposit(user, index, ethers, cb) {
            deployedDex.getDeposits(user, index).then(function (args) {
                const amount = args[0];
                const timestamp = args[1];
                const token = args[2];
                assert.equal(web3.fromWei(amount, 'ether'), ethers, "Unexpected deposit amount");
                assert.equal(token, 0, "Token must be 0 for ethers");
                assert.notEqual(timestamp, null, "Timestamp cannot be null");
                cb(null);
            });
        }

        //

        async.waterfall(
            [
                //
                // Issue TXs
                //
                function (cb) { _sendUserTx(user1, 1, cb); },
                function (cb) { _sendUserTx(user1, 1.5, cb); },
                function (cb) { _sendUserTx(user2, 4, cb); },
                function (cb) { _sendUserTx(user2, 2.5, cb); },
                //
                // Verify deposits.
                //
                function (cb) { _verifyDepositCount(user1, 2, cb);  },
                function (cb) { _verifyDepositCount(user2, 2, cb);  },
                function (cb) { _verifyDeposit(user1, 0, 1, cb); },
                function (cb) { _verifyDeposit(user1, 1, 1.5, cb); },
                function (cb) { _verifyDeposit(user2, 0, 4, cb); },
                function (cb) { _verifyDeposit(user2, 1, 2.5, cb); }
            ],
            function () {
                done();
            }
        );
    });

    //-------------------------------------------------------------------------
    
    it("Must fail call to default payable() contract function from owner or invalid value", function (done) {

        function _failUserTx(user, ethers, cb) {
            web3.eth.sendTransaction({ from: user, to: ctraddr, value: web3.toWei(ethers, 'ether'), gas: gasLimit }, function (err) {
                assert.notEqual(err, null, "This default payable function TX must fail");
                cb(null);
            });
        }
        
        async.waterfall([
            function (cb) { _failUserTx(coinbase, 10, cb); },
            function (cb) { _failUserTx(user1, 0, cb); }
        ], function () { done(); });

    });

    //-------------------------------------------------------------------------

    it("Must fail call to #getDeposits with invalid index", function (done) {
        deployedDex.getDeposits(user1, 9999).then(function(args)  { 
            done(new Error('getDeposit with invalid index must fail'));
        },
        function(err) {
            done();
        });
    });

    

    //-------------------------------------------------------------------------

});




     
