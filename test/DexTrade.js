/*!
 * Hubii Network - DEX Trade Smart Contract test suite.
 *
 * Copyright (C) 2017-2018 Hubii
 */

var DexTrade = artifacts.require("DexTrade");
var ERC20Token = artifacts.require("StandardTokenEx");

contract('DexTrade', function () {
    async = require('async');
    const coinbase = web3.eth.coinbase;
    const user_a = web3.eth.accounts[1];
    const user_b = web3.eth.accounts[2];
    const gasLimit = 1400000;
    const ctraddr = DexTrade.address;
    const kTokenSupply = 1000;
    const kTokensForUser1 = 50;
    var deployedDex = null;
    var deployedErc20 = null;

    //-------------------------------------------------------------------------
    // Contract-wide helper functions
    //-------------------------------------------------------------------------

    function _checkActiveBalance(user, etherBalance, tokenBalance, cb) {
        deployedDex.activeBalance(user, 0).then(function (balance) {
            assert.equal(balance, web3.toWei(etherBalance, 'ether'), "Balance (" + balance + ") != " + etherBalance);
            deployedDex.activeBalance(user, deployedErc20.address).then(function (balance) {
                assert.equal(balance, tokenBalance, "Token Balance (" + balance + ") != " + tokenBalance);
                cb(null);
            }, function (err) {
                cb(err);
            });
        }, function (err) {
            cb(err);
        });
    }

    function _checkStagedBalance(user, etherBalance, tokenBalance, cb) {
        deployedDex.stagedBalance(user, 0).then(function (balance) {
            assert.equal(balance, web3.toWei(etherBalance, 'ether'));
            deployedDex.stagedBalance(user, deployedErc20.address).then(function (balance) {
                assert.equal(balance, tokenBalance);
                cb(null);
            }, function (err) {
                cb(err);
            });
        }, function (err) {
            cb(err);
        });
    }

    function _failPayableUserTx(user, ethers, cb) {
        web3.eth.sendTransaction({ from: user, to: ctraddr, value: web3.toWei(ethers, 'ether'), gas: gasLimit }, function (err) {
            cb(null ? new Error('This tx must fail') : null);
        });
    }

    function _sendUserTx(user, ethers, cb) {
        web3.eth.sendTransaction({ from: user, to: ctraddr, value: web3.toWei(ethers, 'ether'), gas: gasLimit }, function (err) {
            cb(err);
        });
    }

    function _verifyDepositsCount(user, n, cb) {
        deployedDex.depositCount(user).then(function (count) {
            cb(count != n ? new Error('Unexpected deposit count for user') : null);
        }, function (err) {
            cb(err);
        });
    }

    function _verifyDeposit(user, index, ethers, cb) {
        deployedDex.deposit(user, index).then(function (args) {
            const amount = args[0];
            const timestamp = args[1];
            const token = args[2];

            if (token != 0) {
                cb(new Error( "Token must be 0 for ethers"));
                return;
            }
            if (web3.fromWei(amount, 'ether') != ethers) {
                cb(new Error("Unexpected deposit amount"));
                return;
            }
            if (timestamp == 0) {
                cb(new Error("Timestamp cannot be null"));
                return;
            }
            cb(null);
        }, function(err) {
            cb(err);
        });
    }


    //-------------------------------------------------------------------------
    // Preflight stage
    //-------------------------------------------------------------------------

    before("Preflight: get deployed contracts", function (done) {
        DexTrade.deployed().then(function (_d) {
            assert.notEqual(_d, null);
            deployedDex = _d;
            deployedErc20 = ERC20Token.new().then(function (_t) {
                assert.notEqual(_t, null);
                deployedErc20 = _t;
                _t.totalSupply = kTokenSupply;
                done();
            },
                function () {
                    done(new Error('Failed to create ERC20Token instance'));
                });
        },
            function () {
                done(new Error('Failed to get deployed contract address'));
            });
    });

    before("Preflight: distribute test tokens", function (done) {
        deployedErc20.testMint(user_a, kTokensForUser1).then(function () {
            done();
        }, function (err) {
            done(new Error('Cannot assign kTokensForUser1: ' + err.toString()));
        });
    });

  
    //-------------------------------------------------------------------------
    // Tests start here
    //-------------------------------------------------------------------------

    it("T001: Must fail call to default payable() contract function from owner", function (done) {
        _failPayableUserTx(coinbase, 10, done);
    });

    //-------------------------------------------------------------------------

    it("T002: Must fail call to default payable() contract function with zero ethers", function (done) {
        _failPayableUserTx(user_a, 0, done);
    });

    //-------------------------------------------------------------------------

    it("T003: Must successfully deposit Ethers for user A via default payable() function", function (done) {
        async.waterfall(
            [
                function (cb) { _sendUserTx(user_a, 1, cb); },
                function (cb) { _sendUserTx(user_a, 1.5, cb); }
            ],
            done
        );
    });

    //-------------------------------------------------------------------------

    it("T004: Must successfully deposit Ethers for user B via default payable() function", function (done) {
        async.waterfall(
            [
                function (cb) { _sendUserTx(user_b, 4, cb); },
                function (cb) { _sendUserTx(user_b, 2.5, cb); }
            ],
            done
        )
    });

    //-------------------------------------------------------------------------

    it("T005: Must return correct number of deposits for User A", function (done) {
        _verifyDepositsCount(user_a, 2, done);
    });

    //-------------------------------------------------------------------------

    it("T006: Must return correct deposit entries for User B", function (done) {
        async.waterfall([
            function (cb) { _verifyDeposit(user_a, 0, 1, cb); },
            function (cb) { _verifyDeposit(user_a, 1, 1.5, cb); },
        ],
        done);
    });

    // //-------------------------------------------------------------------------

    it("T007: Must return correct number of deposits for User B", function (done) {
        _verifyDepositsCount(user_b, 2, done);
    });

    // //-------------------------------------------------------------------------

    it("T008: Must return correct deposit entries for User B", function (done) {
        async.waterfall([
            function (cb) { _verifyDeposit(user_b, 0, 4, cb); },
            function (cb) { _verifyDeposit(user_b, 1, 2.5, cb); }
        ],
            done);
    });

    // //-------------------------------------------------------------------------

    it("T009: Must fail call to #getDeposits with invalid index", function (done) {
        deployedDex.deposit(user_a, 9999).then(function (args) {
            done(new Error('getDeposit with invalid index must fail'));
        },
            function (err) {
                done();
            });
    });

    // //-------------------------------------------------------------------------

    it("T010: Must deposit 5 test tokens in user A balance (#depositTokens)", function (done) {
        deployedErc20.approve(deployedDex.address, 5, { from: user_a } ).then(function (args) {
            deployedDex.depositTokens(deployedErc20.address, 5, { from: user_a }).then(function (args) {
                done();
            }, function (err) {
                done(new Error('token deposit must not fail: ' + err.message));
            });
        }, function () {
            done(new Error('ERC20 failed to approve token transfer'));
        })
    });

     // //-------------------------------------------------------------------------

     it("T011: Must fail if #depositTokens is called from owner", function (done) {
        deployedDex.depositTokens(deployedErc20.address, 1).then(function (args) {
            done(new Error('token deposit must fail: ' + err.message));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("T012: Must fail if #depositTokens is called with zero address", function (done) {
        deployedDex.depositTokens(0x0, 5, { from: user_a }).then(function (args) {
            done(new Error('Zero address must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("T013: Must fail if #depositTokens is called with zero amount", function (done) {
        deployedDex.depositTokens(deployedErc20.address, 0, { from: user_a }).then(function (args) {
            done(new Error('Zero amount must fail'));
        }, function (err) {
            done();
        });
    })

    //-------------------------------------------------------------------------

    it("T014: Must fail if #depositTokens is called with not enough tokens", function (done) {
        deployedDex.depositTokens(deployedErc20.address, 999999, { from: user_a }).then(function (args) {
            done(new Error('Out of tokens condition must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("T015: Must give correct #activeBalance in ETH/tokens for user A", function (done) {
        _checkActiveBalance(user_a, 2.5, 5, function (err) {
            done(err ? new Error('invalid user A active balance') : null);
        });
    });

    //-------------------------------------------------------------------------

    it("T016: Must give correct #activeBalance in ETH/tokens for user B", function (done) {
        _checkActiveBalance(user_b, 6.5, 0, function (err) {
            done(err ? new Error('invalid user B active balance') : null);
        });
    });

    //-------------------------------------------------------------------------

    it("T017: Must give correct #stagedBalance (zero at this point) for user A", function (done) {
        _checkStagedBalance(user_a, 0, 0, function (err) {
            done(err ? new Error('invalid user A staged balance') : null);
        });
    });

    //-------------------------------------------------------------------------

    it("T018: Must give correct #stagedBalance (zero at this point) for user B", function (done) {
        _checkStagedBalance(user_b, 0, 0, function (err) {
            done(err ? new Error('invalid user B staged balance') : null);
        });
    });
});





