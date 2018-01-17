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

    //-------------------------------------------------------------------------

    it("Must successfully deposit ETHERs for two users via default payable() function + successful #getDeposit #getDepositsCount", function (done) {

        var deployedDex = null;

        //
        // Helper functions
        //

        function _sendUserTx(user, ethers, cb) {
            web3.eth.sendTransaction({ from: user, to: ctraddr, value: web3.toWei(ethers, 'ether'), gas: gasLimit }, function (err) {
                assert.equal(err, null, "This default payable function TX must succeed");
                cb(err);
            });
        }

        function _verifyDepositCount(deployed, user, n, cb) {
            deployed.getDepositsCount(user1).then(function (count) {
                assert.equal(count, n, "Unexpected deposit count for user");
                cb(null);
            });
        }

        function _verifyDeposit(deployed, user, index, ethers, cb) {
            deployed.getDeposits(user, index).then(function (args) {
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
                // Get deployed contract
                //
                function (cb) {
                    DexAssetsManager.deployed().then(function (_d) {
                        deployedDex = _d;
                        cb(null);
                    });
                },
                //
                // Issue TXs
                //
                function (cb) { _sendUserTx(user1, 10, cb); },
                function (cb) { _sendUserTx(user1, 15, cb); },
                function (cb) { _sendUserTx(user2, 40, cb); },
                function (cb) { _sendUserTx(user2, 25, cb); },
                //
                // Verify deposits.
                //
                function (cb) { _verifyDepositCount(deployedDex, user1, 2, cb);  },
                function (cb) { _verifyDepositCount(deployedDex, user2, 2, cb);  },
                function (cb) { _verifyDeposit(deployedDex, user1, 0, 10, cb); },
                function (cb) { _verifyDeposit(deployedDex, user1, 1, 15, cb); },
                function (cb) { _verifyDeposit(deployedDex, user2, 0, 40, cb); },
                function (cb) { _verifyDeposit(deployedDex, user2, 1, 25, cb); }
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

        var deployedDex = null;

        async.waterfall([
            function (cb) { _failUserTx(coinbase, 10, cb); },
            function (cb) { _failUserTx(user1, 0, cb); }
        ], function () { done(); });

    });

    //-------------------------------------------------------------------------
   
});




        // it("Must fail call to default payable() contract function from owner or invalid value"), function () {

        //     web3.eth.sendTransaction({ from: web3.eth.accounts[1], to: DexAssetsManager.address, value: web3.toWei(10, 'ether'), gas: 1400000 },
        //         function (err) {
        //             assert.equal(err == null);
        //             web3.eth.sendTransaction({ from: web3.eth.accounts[1], to: DexAssetsManager.address, value: web3.toWei(15, 'ether'), gas: 1400000 },
        //                 function (err) {
        //                     assert.equal(err == null);
        //                     web3.eth.sendTransaction({ from: web3.eth.accounts[2], to: DexAssetsManager.address, value: web3.toWei(40, 'ether'), gas: 1400000 },
        //                         function (err) {
        //                             assert.equal(err == null);
        //                             web3.eth.sendTransaction({ from: web3.eth.accounts[2], to: DexAssetsManager.address, value: web3.toWei(25, 'ether'), gas: 1400000 },
        //                                 function (err) {
        //                                     assert.equal(err == null);

        //                                     // verify balances

        //                                     DexAssetsManager.
        //                                 });
        //                         });
        //                 });
        //         });
        // }

