/*!
 * Hubii Network - DEX Smart Contract Main Test Suite file.
 *
 * Copyright (C) 2017-2018 Hubii
 */

var DexAssetsManager = artifacts.require("DexAssetsManager");

contract('DexAssetsManager', function () {
    async = require('async');
    const user1 = web3.eth.accounts[1];
    const user2 = web3.eth.accounts[2];
    const gasLimit = 1400000;
    const ctraddr = DexAssetsManager.address;

    it("Must successfully deposit ETHERs for two users via default payable() function + successful #getDeposit #getDepositsCount", function (done) {

        var deployedDex = null;

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
                function (cb) {
                    web3.eth.sendTransaction({ from: user1, to: ctraddr, value: web3.toWei(10, 'ether'), gas: gasLimit }, function (err) {
                        assert.equal(err, null);
                        cb(err);
                    });
                },

                function (cb) {
                    web3.eth.sendTransaction({ from: user1, to: ctraddr, value: web3.toWei(15, 'ether'), gas: gasLimit }, function (err) {
                        assert.equal(err, null);
                        cb(err);
                    });
                },

                function (cb) {
                    web3.eth.sendTransaction({ from: user2, to: ctraddr, value: web3.toWei(40, 'ether'), gas: gasLimit }, function (err) {
                        assert.equal(err, null);
                        cb(err);
                    });
                },
                function (cb) {
                    web3.eth.sendTransaction({ from: user2, to: ctraddr, value: web3.toWei(25, 'ether'), gas: gasLimit }, function (err) {
                        assert.equal(err, null);
                        cb(err);
                    });
                },

                //
                // all TXs issued. Verify deposits.
                //
                function (cb) {
                    deployedDex.getDepositsCount(user1).then(function(count) {
                        assert.equal(count, 2);
                        cb(null);
                    });
                },
                function (cb) {
                    deployedDex.getDepositsCount(user2).then(function(count) {
                        assert.equal(count, 2);
                        cb(null);
                    })
                },
                function (cb) {
                    deployedDex.getDeposits(user1, 0).then(function (args) {
                        const amount = args[0];
                        const timestamp = args[1];
                        const token = args[2];
                        assert.equal(web3.fromWei(amount, 'ether'), 10);
                        assert.equal(token, 0);
                        assert.notEqual(timestamp, null);
                        cb(null);
                    })
                },
                function (cb) {
                    deployedDex.getDeposits(user1, 1).then(function (args) {
                        const amount = args[0];
                        const timestamp = args[1];
                        const token = args[2];
                        assert.equal(web3.fromWei(amount, 'ether'), 15);
                        assert.equal(token, 0);
                        assert.notEqual(timestamp, null);
                        cb(null);
                    });
                },
                function (cb) {
                    deployedDex.getDeposits(user2, 0).then(function (args) {
                        const amount = args[0];
                        const timestamp = args[1];
                        const token = args[2];
                        assert.equal(web3.fromWei(amount, 'ether'), 40);
                        assert.equal(token, 0);
                        assert.notEqual(timestamp, null);
                        cb(null);
                    })
                },
                function (cb) {
                    deployedDex.getDeposits(user2, 1).then(function(args) {
                        const amount = args[0];
                        const timestamp = args[1];
                        const token = args[2];
                        assert.equal(web3.fromWei(amount, 'ether'), 25);
                        assert.equal(token, 0);
                        assert.notEqual(timestamp, null);
                        cb(null);
                    });
                }
            ],
            function () {
                done();
            }
        );
    });
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

