/*!
 * Hubii Network - DEX Reserve Funds Smart Contract test suite.
 *
 * Copyright (C) 2017-2018 Hubii
 */

var DexReserveFunds = artifacts.require("DexReserveFunds");
var ERC20Token = artifacts.require("StandardTokenEx");
var keccak256 = require("augmented-keccak256");

contract('DexReserveFunds', function () {
    async = require('async');
    ethers = require('ethers');
    w3prov = new ethers.providers.Web3Provider(web3.currentProvider);
    const address_zero = '0x0000000000000000000000000000000000000000';
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
    const contractAddress = DexReserveFunds.address;
    const kTokenSupply = 1000;
    const kTokensForUser1 = 50;
    var deployedDex = null;
    var deployedDexIo = null; // Uses Ethers.io for convenience using structs,etc.
    var deployedErc20 = null;
    var ltc_signature = null;

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

    before("Preflight: Check available account addresses and balances", function (done) {
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
        DexReserveFunds.deployed().then(function (_d) {
            assert.notEqual(_d, null);
            deployedDex = _d;
            deployedDexIo = new ethers.Contract(_d.address, DexReserveFunds.abi, w3prov);
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

    it("R001: MUST FAIL [payable]: cannot be called from owner", function (done) {
        web3.eth.sendTransaction({ from: coinbase, to: contractAddress, value: web3.toWei(10, 'ether'), gas: gasLimit }, function (err) {
            done(err == null ? new Error('This test must fail') : null);
        });
    });

    it("R002: MUST FAIL [payable]: cannot be called with 0 ethers", function (done) {
        web3.eth.sendTransaction({ from: user_a, to: contractAddress, value: web3.toWei(0, 'ether'), gas: gasLimit }, function (err) {
            done(err == null ? new Error('This test must fail') : null);
        });
    });

    it("R003: MUST SUCCEED [payable]: add 2.5 Ethers to user A aggregate balance", function (done) {
        web3.eth.sendTransaction({ from: user_a, to: contractAddress, value: web3.toWei(2.5, 'ether'), gas: gasLimit }, function (err) {
            done(err != null ? new Error('This test must succeed. Error: ' + err.toString()) : null);
        });
    });

    //-------------------------------------------------------------------------

    it("R004: MUST SUCCEED [payable]: add 6.5 Ethers to user B aggregate balance", function (done) {
        web3.eth.sendTransaction({ from: user_b, to: contractAddress, value: web3.toWei(6.5, 'ether'), gas: gasLimit }, function (err) {
            done(err != null ? new Error('This test must succeed. Error: ' + err.toString()) : null);
        });
    });

    //-------------------------------------------------------------------------

    it("R005: MUST SUCCEED [depositTokens]: 5 tokens added to A aggregate balance", function (done) {
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

    it("R006: MUST FAIL [depositTokens]: Cannot be called from owner address", function (done) {
        deployedDex.depositTokens(deployedErc20.address, 5, { from: coinbase }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R007: MUST FAIL [depositTokens]: Cannot be called with zero address", function (done) {
        deployedDex.depositTokens(0, 5, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R008: MUST FAIL [depositTokens]: Cannot be called with zero amount", function (done) {
        deployedDex.depositTokens(deployedErc20.address, 0, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R009: MUST FAIL [depositTokens]: User does not have enough tokens to deposit.", function (done) {
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

    it("R010: MUST SUCCEED [depositCount]: User A should have 2 deposits", function (done) {
        deployedDex.depositCount(user_a).then(function (count) {
            done(count != 2 ? new Error('This test must succeed. Error: Deposit count: ' + count) : null);
        }, function (err) {
            done(new Error('This test must succeed. Error: ' + err.toString()));
        });
    });

    //-------------------------------------------------------------------------

    it("R011: MUST SUCCEED [depositCount]: User B should have 1 deposit", function (done) {
        deployedDex.depositCount(user_b).then(function (count) {
            done(count != 1 ? new Error('This test must succeed. Error: Deposit count: ' + count) : null);
        }, function (err) {
            done(new Error('This test must succeed. Error: ' + err.toString()));
        });
    });

    //-------------------------------------------------------------------------

    it("R012: MUST FAIL [depositCount]: Cannot be called from non-owner address", function (done) {
        deployedDex.depositCount(user_a, { from: user_a }).then(function (count) {
            done(new Error('This test must fail'));;
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R013: MUST SUCCEED [deposit]: User B should have 6.5 ETH at index 0", function (done) {
        _verifyDeposit(user_b, 0, 0, 6.5, {}, done);
    });

    //-------------------------------------------------------------------------

    it("R014: MUST FAIL [deposit]: Invalid index deposit 1 for user B.", function (done) {
        _verifyDeposit(user_b, 1, 0, 6.5, {}, function (err) {
            done(err == null ? new Error('This test must fail') : null);
        });
    });

    //------------------------------------------------------------------------

    it("R015: MUST SUCCEED [deposit]: User A should have 5 tokens at index 1", function (done) {
        _verifyDeposit(user_a, 1, deployedErc20.address, 5, {}, done);
    });

    //------------------------------------------------------------------------

    it("R016: MUST FAIL [deposit]: Cannot be called from non-owner address", function (done) {
        _verifyDeposit(user_a, 1, deployedErc20.address, 5, { from: user_a }, function (err) {
            done(err == null ? new Error('This test must fail') : null);
        });
    });

    //------------------------------------------------------------------------

    it("R017: MUST SUCCEED [activeBalance]: 2.5 ETH for User A", function (done) {
        deployedDex.activeBalance(user_a, 0, 0).then(function (balance) {
            done(balance != web3.toWei(2.5, 'ether') ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("R018: MUST SUCCEED [activeBalance]: 5 tokens for User A", function (done) {
        deployedDex.activeBalance(user_a, deployedErc20.address, 0).then(function (balance) {
            done(balance != 5 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("R019: MUST SUCCEED [activeBalance]: 0 tokens for User B", function (done) {
        deployedDex.activeBalance(user_b, deployedErc20.address, 0).then(function (balance) {
            done(balance != 0 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("R020: MUST SUCCEED [activeBalance]: can be called from non-owner address", function (done) {
        deployedDex.activeBalance(user_b, deployedErc20.address, 0, { from: user_a }).then(function (balance) {
            done();
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("R021: MUST SUCCEED [stagedBalance]: 0 ETH for User A", function (done) {
        deployedDex.stagedBalance(user_a, 0).then(function (balance) {
            done(balance != 0 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("R022: MUST SUCCEED [stagedBalance]: 0 tokens for User A", function (done) {
        deployedDex.stagedBalance(user_a, deployedErc20.address).then(function (balance) {
            done(balance != 0 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("R023: MUST SUCCEED [stagedBalance]: 0 tokens for User B", function (done) {
        deployedDex.stagedBalance(user_b, deployedErc20.address).then(function (balance) {
            done(balance != 0 ? new Error('This test must succeed') : null);
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //------------------------------------------------------------------------

    it("R024: MUST SUCCEED [stagedBalance]: can be called from non-owner address", function (done) {
        deployedDex.stagedBalance(user_b, deployedErc20.address, { from: user_a }).then(function (balance) {
            done();
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //-------------------------------------------------------------------------

    it("R025: MUST FAIL [stage]: Cannot be called from owner address", function (done) {
        deployedDex.stage(deployedErc20.address, 0, { from: coinbase }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R026: MUST FAIL [stage]: Cannot be called with zero token amount", function (done) {
        deployedDex.stage(deployedErc20.address, 0, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });


    //-------------------------------------------------------------------------

    it("R027: MUST FAIL [stage]: Cannot be called with zero ether amount", function (done) {
        deployedDex.stage(0, 0, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R028: MUST SUCCEED [stage]: Staged 3 tokens for user A balance", function (done) {
        deployedDex.stage(deployedErc20.address, 3, { from: user_a }).then(function () {
            done();
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //-------------------------------------------------------------------------

    it("R029: MUST SUCCEED [stage]: Staged 0.2 ethers for user B balance", function (done) {
        deployedDex.stage(0, web3.toWei(0.2, 'ether'), { from: user_b }).then(function () {
            done();
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //-------------------------------------------------------------------------

    it("R030: MUST FAIL [unstage]: Cannot be called from owner address", function (done) {
        deployedDex.unstage(deployedErc20.address, 0, { from: coinbase }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R031: MUST FAIL [unstage]: Cannot be called with zero token amount", function (done) {
        deployedDex.unstage(deployedErc20.address, 0, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });


    //-------------------------------------------------------------------------

    it("R032: MUST FAIL [unstage]: Cannot be called with zero ether amount", function (done) {
        deployedDex.unstage(0, 0, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R033: MUST SUCCEED [unstage]: Unstaged 2 tokens from user A balance", function (done) {
        deployedDex.unstage(deployedErc20.address, 2, { from: user_a }).then(function () {
            done();
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //-------------------------------------------------------------------------

    it("R034: MUST SUCCEED [unstage]: Staged 0.1 ethers for user B balance", function (done) {
        deployedDex.unstage(0, web3.toWei(0.1, 'ether'), { from: user_b }).then(function () {
            done();
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //-------------------------------------------------------------------------

    it("R035: MUST FAIL [withdrawEther]: Cannot be called from owner address", function (done) {
        deployedDex.withdrawEther(1, { from: coinbase }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R036: MUST FAIL [withdrawEther]: Cannot be called with zero token amount", function (done) {
        deployedDex.withdrawEther(0, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R037: MUST FAIL [withdrawTokens]: Cannot be called from owner address", function (done) {
        deployedDex.withdrawTokens(deployedErc20.address, 1, { from: coinbase }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
        });
    });

    //-------------------------------------------------------------------------

    it("R038: MUST FAIL [withdrawTokens]: Cannot be called with zero token amount", function (done) {
        deployedDex.withdrawTokens(deployedErc20.address, 0, { from: user_a }).then(function (args) {
            done(new Error('This test must fail'));
        }, function (err) {
            done();
            });
    });

    //-------------------------------------------------------------------------

    it("R039: MUST SUCCEED [withdrawTokens]: User A withdrawn 1 token", function (done) {
        deployedDex.withdrawTokens(deployedErc20.address, 1, { from: user_a }).then(function () {
            done();
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });

    //-------------------------------------------------------------------------

    it("R040: MUST SUCCEED [withdrawEther]: User B withdrawn 0.05 ethers", function (done) {
        deployedDex.withdrawEther(web3.toWei(0.05, 'ether'), { from: user_b }).then(function () {
            done();
        },
            function (err) {
                done(new Error('This test must succeed. Error: ' + err.toString()));
            })
    });
});





