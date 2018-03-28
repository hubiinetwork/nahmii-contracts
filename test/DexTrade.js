/*!
 * Hubii Network - DEX Trade Smart Contract test suite.
 *
 * Copyright (C) 2017-2018 Hubii
 */

var DexTrade = artifacts.require("DexTrade");
var ERC20Token = artifacts.require("StandardTokenEx");
var keccak256 = require("augmented-keccak256");

contract('DexTrade', function () {
    async = require('async');
    ethers = require('ethers');
    w3prov = new ethers.providers.Web3Provider(web3.currentProvider);
    const coinbase = web3.eth.coinbase;
    const user_a = web3.eth.accounts[1];
    const user_b = web3.eth.accounts[2];
    const user_c = web3.eth.accounts[3];
    const user_d = web3.eth.accounts[4];
    const signer_a = w3prov.getSigner(user_a);
    const signer_b = w3prov.getSigner(user_b);
    const signer_c = w3prov.getSigner(user_c);
    const signer_d = w3prov.getSigner(user_d);
    const signer_owner = w3prov.getSigner(coinbase);
    const gasLimit = 1800000;
    const ctraddr = DexTrade.address;
    const kTokenSupply = 1000;
    const kTokensForUser1 = 50;
    var deployedDex = null;
    var deployedDexIo = null; // Uses Ethers.io for convenience using structs,etc.
    var deployedErc20 = null;

    //-------------------------------------------------------------------------
    // Contract-wide helper functions
    //-------------------------------------------------------------------------

    function _verifyDeposit(user, index, token, amount, opts, cb) {
        deployedDex.deposit(user, index, opts).then(function (args) {
            const _amount = args[0];
            const _timestamp = args[1];
            const _token = args[2];

            if (token == 0 && (web3.toWei(amount, 'ether') != _amount)) {
                cb(new Error("Unexpected ether deposit amount"));
                return;
            }
            if (token != 0 && amount != _amount) {
                cb(new Error("Unexpeced token deposit amount"));
                return;
            }
            if (_timestamp == 0) {
                cb(new Error("Timestamp cannot be null"));
                return;
            }
            cb(null);
        }, function (err) {
            cb(err);
        });
    }

    function signTrade(t, signer) {
        var hash = keccak256.create();
        hash.update(t);
        var tradeHashWithoutSignature = hash.digest();
        var signedMessage = web3.eth.sign(signer, '0x' + tradeHashWithoutSignature);
 
        var result = {};
        result.r = "0x" + signedMessage.substr(2, 64);
        result.s = "0x" + signedMessage.substr(66, 64);
        result.v = parseInt(signedMessage.substr(130, 2), 16) + 27;
        return result;
    }

    //-------------------------------------------------------------------------
    // Preflight stage
    //-------------------------------------------------------------------------

    before("Preflight: Check available account addresses and balances", function(done) {
        assert.notEqual(user_a, null);
        assert.notEqual(user_b, null);
        assert.notEqual(user_c, null);
        assert.notEqual(user_d, null);

        assert.ok(web3.fromWei(web3.eth.getBalance(user_a), "ether") > 10);
        assert.ok(web3.fromWei(web3.eth.getBalance(user_b), "ether") > 10);
        assert.ok(web3.fromWei(web3.eth.getBalance(user_c), "ether") > 10);
        assert.ok(web3.fromWei(web3.eth.getBalance(user_d), "ether") > 10);
    
        done();        
    });

    before("Preflight: get deployed contracts", function (done) {
        DexTrade.deployed().then(function (_d) {
            assert.notEqual(_d, null);
            deployedDex = _d;
            deployedDexIo = new ethers.Contract(_d.address, DexTrade.abi, w3prov);
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

    it("T001: MUST FAIL [payable]: cannot be called from owner", function (done) {
        web3.eth.sendTransaction({ from: coinbase, to: ctraddr, value: web3.toWei(10, 'ether'), gas: gasLimit }, function (err) {
            done(err == null ? new Error('This test must fail') : null);
        });
    });

    //-------------------------------------------------------------------------

    it("T002: MUST FAIL [payable]: cannot be called with 0 ethers", function (done) {
        web3.eth.sendTransaction({ from: user_a, to: ctraddr, value: web3.toWei(0, 'ether'), gas: gasLimit }, function (err) {
            done(err == null ? new Error('This test must fail') : null);
        });
    });

    //-------------------------------------------------------------------------

    it("T003: MUST SUCCEED [payable]: add 2.5 Ethers to user A active balance", function (done) {
        web3.eth.sendTransaction({ from: user_a, to: ctraddr, value: web3.toWei(2.5, 'ether'), gas: gasLimit }, function (err) {
            done(err != null ? new Error('This test must succeed. Error: ' + err.toString()) : null);
        });
    });

    //-------------------------------------------------------------------------

    it("T004: MUST SUCCEED [payable]: add 6.5 Ethers to user B active balance", function (done) {
        web3.eth.sendTransaction({ from: user_b, to: ctraddr, value: web3.toWei(6.5, 'ether'), gas: gasLimit }, function (err) {
            done(err != null ? new Error('This test must succeed. Error: ' + err.toString()) : null);
        });
    });

    //-------------------------------------------------------------------------

    it("T005: MUST SUCCEED [depositTokens]: 5 tokens added to A active balance", function (done) {
        deployedErc20.approve(deployedDex.address, 5, { from: user_a }).then(function (args) {
            deployedDex.depositTokens(deployedErc20.address, 5, { from: user_a }).then(function (args) {
                done();
            }, function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            });
        }, function () {
            done(new Error('This test must succeed. Error: ERC20 failed to approve token transfer'));
        })
    });

    //-------------------------------------------------------------------------

    it("T006: MUST FAIL [depositTokens]: Cannot be called from owner address", function (done) {
        deployedDex.depositTokens(deployedErc20.address, 5, { from: coinbase }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("T007: MUST FAIL [depositTokens]: Cannot be called with zero address", function (done) {
        deployedDex.depositTokens(0, 5, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("T008: MUST FAIL [depositTokens]: Cannot be called with zero amount", function (done) {
        deployedDex.depositTokens(deployedErc20.address, 0, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("T009: MUST FAIL [depositTokens]: User does not have enough tokens to deposit.", function (done) {
        deployedErc20.approve(deployedDex.address, 9999, { from: user_a }).then(function (args) {
            deployedDex.depositTokens(deployedErc20.address, 9999, { from: user_a }).then(function (args) {
                done(new Error('This test must fail'));
            }, function (err) {
                done();
            });
        }, function () {
            done(new Error('This test must fail. Error: ERC20 failed to approve token transfer'));
        })
    });

    //-------------------------------------------------------------------------

    it("T010: MUST SUCCEED [depositCount]: User A should have 2 deposits", function (done) {
        deployedDex.depositCount(user_a).then(function (count) {
            done(count != 2 ? new Error('This test must succeed. Error: Deposit count: ' + count) : null);
        }, function (err) {
            done(new Error('This test must succeed. Error: ' + err.toString()));
        });
    });

    //-------------------------------------------------------------------------

    it("T011: MUST SUCCEED [depositCount]: User B should have 1 deposit", function (done) {
        deployedDex.depositCount(user_b).then(function (count) {
            done(count != 1 ? new Error('This test must succeed. Error: Deposit count: ' + count) : null);
        }, function (err) {
            done(new Error('This test must succeed. Error: ' + err.toString()));
        });
    });

    //-------------------------------------------------------------------------

    it("T012: MUST FAIL [depositCount]: Cannot be called from non-owner address", function (done) {
        deployedDex.depositCount(user_a, { from: user_a }).then(function (count) {
            done(new Error('This test must fail'));;
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("T013: MUST SUCCEED [deposit]: User B should have 6.5 ETH at index 0", function (done) {
        _verifyDeposit(user_b, 0, 0, 6.5, {}, done);
    });

    //-------------------------------------------------------------------------

    it("T014: MUST FAIL [deposit]: Invalid index deposit 1 for user B.", function (done) {
        _verifyDeposit(user_b, 1, 0, 6.5, {}, function (err) {
            done(err == null ? new Error('This test must fail') : null);
        });
    });

    //------------------------------------------------------------------------

    it("T015: MUST SUCCEED [deposit]: User A should have 5 tokens at index 1", function (done) {
        _verifyDeposit(user_a, 1, deployedErc20.address, 5, {}, done);
    });

    //------------------------------------------------------------------------

    it("T016: MUST FAIL [deposit]: Cannot be called from non-owner address", function (done) {
        _verifyDeposit(user_a, 1, deployedErc20.address, 5, { from: user_a }, function (err) {
            done(err == null ? new Error('This test must fail') : null);
        });
    });

    //------------------------------------------------------------------------

    it("T017: MUST SUCCEED [activeBalance]: 2.5 ETH for User A", function (done) {
        deployedDex.activeBalance(user_a, 0).then(function (balance) {
            done(balance != web3.toWei(2.5, 'ether') ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("T018: MUST SUCCEED [activeBalance]: 5 tokens for User A", function (done) {
        deployedDex.activeBalance(user_a, deployedErc20.address).then(function (balance) {
            done(balance != 5 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("T019: MUST SUCCEED [activeBalance]: 0 tokens for User B", function (done) {
        deployedDex.activeBalance(user_b, deployedErc20.address).then(function (balance) {
            done(balance != 0 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("T020: MUST FAIL [activeBalance]: cannot be called from non-owner address", function (done) {
        deployedDex.activeBalance(user_b, deployedErc20.address, { from: user_a }).then(function (balance) {
            done(new Error('This test must fail'));
        },
            function (err) {
                done();
            })
    });

    //------------------------------------------------------------------------

    it("T021: MUST SUCCEED [stagedBalance]: 0 ETH for User A", function (done) {
        deployedDex.stagedBalance(user_a, 0).then(function (balance) {
            done(balance != 0 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("T022: MUST SUCCEED [stagedBalance]: 0 tokens for User A", function (done) {
        deployedDex.stagedBalance(user_a, deployedErc20.address).then(function (balance) {
            done(balance != 0 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("T023: MUST SUCCEED [stagedBalance]: 0 tokens for User B", function (done) {
        deployedDex.stagedBalance(user_b, deployedErc20.address).then(function (balance) {
            done(balance != 0 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("T024: MUST SUCCEED [stagedBalance]: cannot be called from non-owner address", function (done) {
        deployedDex.stagedBalance(user_b, deployedErc20.address, { from: user_a }).then(function (balance) {
            done(new Error('This test must fail'));
        },
            function (err) {
                done();
            })
    });

    //------------------------------------------------------------------------

    it("T025: MUST FAIL [startLastTradeChallenge]: cannot be called with address zero", function (done) {
        var trade = {
            buyOrderHash: 0,
            sellOrderHash: 0,
            buyerOrderNonce: 1,
            sellerOrderNonce: 1,
            buyer: user_a,
            seller: user_c,
            tokenAmount: 0,
            etherAmount: 0,
            token: deployedErc20.address,
            immediateSettlement: false
        }
        
        trade.signature = signTrade(trade, coinbase);

        var d = deployedDexIo.connect(signer_owner);
        d.startLastTradeChallenge(trade, user_a, 0, [ethers.utils.bigNumberify("0")]).
            then(function () {
                done(new Error('This test must fail'));
            },
                function (err) {
                    done();
                });
    });
    
    //------------------------------------------------------------------------

    it("T026: MUST FAIL [startLastTradeChallenge]: cannot be called with invalid signature in Trade", function (done) {
        var trade = {
            buyOrderHash: 0,
            sellOrderHash: 0,
            buyerOrderNonce: 1,
            sellerOrderNonce: 1,
            buyer: user_a,
            seller: user_c,
            tokenAmount: 10,
            etherAmount: 80000000000,
            token: deployedErc20.address,
            signature: { s: [], r: [], v: [] },
            immediateSettlement: false
        }
        var d = deployedDexIo.connect(signer_a);
        d.startLastTradeChallenge(trade, user_a, 0, [ethers.utils.bigNumberify("0")]).
            then(function () {
                done(new Error('This test must fail'));
            },
                function (err) {
                    done();
                });
    });
    
    //------------------------------------------------------------------------

    it("T027: MUST FAIL [startLastTradeChallenge]: cannot be called with invalid nonce in Trade", function (done) {
        var trade = {
            buyOrderHash: 0,
            sellOrderHash: 0,
            buyerOrderNonce: 178,
            sellerOrderNonce: 286,
            buyer: user_a,
            seller: user_c,
            tokenAmount: 8,
            etherAmount: 33350000000000,
            token: deployedErc20.address,
            immediateSettlement: false
        }        
        
        trade.signature = signTrade(trade, coinbase);

        var d = deployedDexIo.connect(signer_a);
        d.startLastTradeChallenge(trade, user_a, 0, [ethers.utils.bigNumberify("0")]).
            then(function () {
                done(new Error('This test must fail'));
            },
                function (err) {
                    done();
                });
    });
    
    //------------------------------------------------------------------------
    
    it("T028: MUST SUCCEED [startLastTradeChallenge]: LTC opened for user A", function (done) {
        var trade = {
            buyOrderHash: 0,
            sellOrderHash: 0,
            buyerOrderNonce: 1,
            sellerOrderNonce: 1,
            buyer: user_a,
            seller: user_c,
            tokenAmount: 3,
            etherAmount: 500000000,
            token: deployedErc20.address,
            immediateSettlement: false
        };

        trade.signature = signTrade(trade, coinbase);

        var d = deployedDexIo.connect(signer_a);
        d.startLastTradeChallenge(trade, user_a, 0, [ethers.utils.bigNumberify("0")], { gasLimit: 600000 }).
            then(function () {
                done();
            },
                function (err) {
                    done(new Error('This test must succeed. Error:' + err.toString()));
                });
    });
 
    //------------------------------------------------------------------------

    it("T029: MUST FAIL [startLastTradeChallenge]: LTC already open for user A", function (done) {
        var trade = {
            buyOrderHash: 0,
            sellOrderHash: 0,
            buyerOrderNonce: 1,
            sellerOrderNonce: 1,
            buyer: user_b,
            seller: user_a,
            tokenAmount: 3,
            etherAmount: 500000000,
            token: deployedErc20.address,
            immediateSettlement: false
        };

        trade.signature = signTrade(trade, coinbase);

        var d = deployedDexIo.connect(signer_a);
        d.startLastTradeChallenge(trade, user_a, 0, [ethers.utils.bigNumberify("0")]).
            then(function () {
                done(new Error('This test must fail'));
            },
                function (err) {
                    done();
                });
    });

    
    it("T030: MUST SUCCEED [startLastTradeChallenge]: LTC opened for user B", function (done) {
        var trade = {
            buyOrderHash: 0,
            sellOrderHash: 0,
            buyerOrderNonce: 2,
            sellerOrderNonce: 2,
            buyer: user_d,
            seller: user_b,
            tokenAmount: 3,
            etherAmount: 500000000,
            token: deployedErc20.address,
            immediateSettlement: false
        };

        trade.signature = signTrade(trade, coinbase);

        var d = deployedDexIo.connect(signer_b);
        d.startLastTradeChallenge(trade, user_b, 0, [ethers.utils.bigNumberify("0")], { gasLimit: 600000 }).
            then(function () {
                done();
            },
                function (err) {
                    done(new Error('This test must succeed. Error:' + err.toString()));
                });
    });


    it("T031: MUST SUCCEED [lastTradeChallengeStage]: LTC for user A w/nonce=1, dispute stage", function (done) {
        deployedDexIo.lastTradeChallengeStage(user_a).then (function (result) {
            if (result != null && result.nonce.eq(1) && result.stage == 1) {
                done();
            } else {
                done(new Error('This test must succeed. Invalid result (nonce=' + result.nonce.toNumber() +' stage=' + result.stage));
            }
        },
        function (err) {
            done(new Error('This test must succeed. Error:' + err.toString()));
        });
    });

    it("T032: MUST FAIL [lastTradeChallengeStage]: Wallet cannot be owner", function (done) {
        deployedDexIo.lastTradeChallengeStage(coinbase).then (function (result) {
                done(new Error('This test must fail'));
            },
        function (err) {
            done();
        });
    });

    it("T033: MUST SUCCEED [lastTradeChallengeStage]: LTC for user B w/nonce=2, dispute stage", function (done) {
        deployedDexIo.lastTradeChallengeStage(user_b).then (function (result) {
            if (result != null && result.nonce.eq(2) && result.stage == 1) {
                done();
            } else {
                done(new Error('This test must succeed. Invalid result (nonce=' + result.nonce.toNumber() +' stage=' + result.stage));
            }
        },
        function (err) {
            done(new Error('This test must succeed. Error:' + err.toString()));
        });
    });

    it("T034: MUST SUCCEED [lastTradeChallengeStage]: LTC for user C w/nonce=0, closed stage", function (done) {
        deployedDexIo.lastTradeChallengeStage(user_c).then (function (result) {
            if (result != null && result.nonce.eq(0) && result.stage == 0) {
                done();
            } else {
                done(new Error('This test must succeed. Invalid result (nonce=' + result.nonce.toNumber() +' stage=' + result.stage));
            }
        },
        function (err) {
            done(new Error('This test must succeed. Error:' + err.toString()));
        });
    });
/*
    it("T033: MUST FAIL [lastTradeChallengeStage]: cannot be called with address zero", function (done) {});
    it("T034: MUST SUCCEED [lastTradeChallengeStage]: cannot be called with address zero", function (done) {});
    it("T035: MUST SUCCEED [challengeLastTrade]: cannot be called with address zero", function (done) {});
    it("T036: MUST SUCCEED [challengeLastTrade]: cannot be called with address zero", function (done) {});
    it("T037: MUST SUCCEED [challengeLastTrade]: cannot be called with address zero", function (done) {});
    it("T038: MUST SUCCEED [challengeLastTrade]: cannot be called with address zero", function (done) {});
    it("T039: MUST SUCCEED [lastTradeChallengeResult]: cannot be called with address zero", function (done) {});
    it("T040: MUST SUCCEED [lastTradeChallengeResult]: cannot be called with address zero", function (done) {});
    it("T041: MUST SUCCEED [lastTradeChallengeResult]: cannot be called with address zero", function (done) {});
    it("T042: MUST SUCCEED [startTradePropertiesChallenge]: cannot be called with address zero", function (done) {});
    it("T043: MUST SUCCEED [startTradePropertiesChallenge]: cannot be called with address zero", function (done) {});
    it("T044: MUST SUCCEED [startTradePropertiesChallenge]: cannot be called with address zero", function (done) {});
    it("T045: MUST SUCCEED [challengeTradeProperties]: cannot be called with address zero", function (done) {});
    it("T046: MUST SUCCEED [challengeTradeProperties]: cannot be called with address zero", function (done) {});


*/


    // //-------------------------------------------------------------------------

   
    // Test: Unstage

});





