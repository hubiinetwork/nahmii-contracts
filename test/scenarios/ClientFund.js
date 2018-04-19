module.exports = function (glob) {
	describe("ClientFund", function () {
		it("T001: MUST FAIL [payable]: cannot be called from owner", function (done) {
			web3.eth.sendTransactionPromise(
				{
					from: glob.owner,
					to: glob.web3ClientFund.address,
					value: web3.toWei(10, 'ether'),
					gas: glob.gasLimit
				}
			).then(
				function () {
					done(new Error('This test must fail'));
				},
				function (err) {
					done();
				}
			);
		});

		//-------------------------------------------------------------------------

		it("T002: MUST FAIL [payable]: cannot be called with 0 ethers", function (done) {
			web3.eth.sendTransactionPromise(
				{
					from: glob.user_a,
					to: glob.web3ClientFund.address,
					value: web3.toWei(0, 'ether'),
					gas: glob.gasLimit
				}
			).then(
				function () {
					done(new Error('This test must fail'));
				},
				function (err) {
					done();
				}
			);
		});

		//-------------------------------------------------------------------------

		it("T003: MUST SUCCEED [payable]: add 2.5 Ethers to user A active balance", function (done) {
			web3.eth.sendTransactionPromise(
				{
					from: glob.user_a,
					to: glob.web3ClientFund.address,
					value: web3.toWei(2.5, 'ether'),
					gas: glob.gasLimit
				}
			).then(
				function (args) {
					done();
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});

		//-------------------------------------------------------------------------

		it("T004: MUST SUCCEED [payable]: add 6.5 Ethers to user B active balance", function (done) {
			web3.eth.sendTransactionPromise(
				{
					from: glob.user_b,
					to: glob.web3ClientFund.address,
					value: web3.toWei(6.5, 'ether'),
					gas: glob.gasLimit
				}
			).then(
				function (args) {
					done();
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});
	
		//-------------------------------------------------------------------------
	
		it("T005: MUST SUCCEED [depositTokens]: 5 tokens added to A active balance", function (done) {
			glob.web3Erc20.approve(glob.web3ClientFund.address, 5, { from: glob.user_a }).then(
				function (args) {
					glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 5, { from: glob.user_a }).then(
						function (args) {
							done();
						},
						function (err) {
							done(new Error('This test must succeed. Error: ' + err.toString()));
						}
					);
				},
				function (err) {
					done(new Error('This test must succeed. Error: ERC20 failed to approve token transfer. Error: ' + err.toString()));
				}
			);
		});

		//-------------------------------------------------------------------------

		it("T006: MUST FAIL [depositTokens]: Cannot be called from owner address", function (done) {
			glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 5, { from: glob.owner }).then(
				function (args) {
					done(new Error('This test must fail.'));
				},
				function (err) {
					done();
				}
			);
		});
	
		//-------------------------------------------------------------------------
	
		it("T007: MUST FAIL [depositTokens]: Cannot be called with zero address", function (done) {
			glob.web3ClientFund.depositTokens(0, 5, { from: glob.user_a }).then(
				function (args) {
					done(new Error('This test must fail.'));
				},
				function (err) {
					done();
				}
			);
		});
	
		//-------------------------------------------------------------------------
	
		it("T008: MUST FAIL [depositTokens]: Cannot be called with zero amount", function (done) {
			glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 0, { from: glob.user_a }).then(
				function (args) {
					done(new Error('This test must fail'));
				},
				function (err) {
					done();
				}
			);
		});
	
		//-------------------------------------------------------------------------
	
		it("T009: MUST FAIL [depositTokens]: User does not have enough tokens to deposit.", function (done) {
			glob.web3Erc20.approve(glob.web3ClientFund.address, 9999, { from: glob.user_a }).then(
				function (args) {
					glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 9999, { from: glob.user_a }).then(
						function (args) {
							done(new Error('This test must fail'));
						},
						function (err) {
							done();
						}
					);
				},
				function () {
					done(new Error('This test must fail. Error: ERC20 failed to approve token transfer'));
				}
			);
		});
	
		//-------------------------------------------------------------------------
	
		it("T010: MUST SUCCEED [depositCount]: User A should have 2 deposits", function (done) {
			glob.web3ClientFund.depositCount(glob.user_a).then(
				function (count) {
					if (count != 2) {
						done(new Error('This test must succeed. Error: Deposit count: ' + count.toString()));
						return;
					}
					done();
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});
	
		//-------------------------------------------------------------------------
	
		it("T011: MUST SUCCEED [depositCount]: User B should have 1 deposit", function (done) {
			glob.web3ClientFund.depositCount(glob.user_b).then(
				function (count) {
					if (count != 1) {
						done(new Error('This test must succeed. Error: Deposit count: ' + count.toString()));
						return;
					}
					done();
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});
	
		//-------------------------------------------------------------------------
	
		it("T012: MUST FAIL [depositCount]: Cannot be called from non-owner address", function (done) {
			glob.web3ClientFund.depositCount(glob.user_a, { from: glob.user_a }).then(
				function (count) {
					done(new Error('This test must fail.'));;
				},
				function (err) {
					done();
				}
			);
		});
	
		//-------------------------------------------------------------------------

		it("T013: MUST SUCCEED [deposit]: User B should have 6.5 ETH at index 0", function (done) {
			glob.web3ClientFund.deposit(glob.user_b, 0).then(
				function (args) {
					const _amount = args[0];
					const _timestamp = args[1];
					const _token = args[2];

					if (_token != 0) {
						done(new Error("Unexpected token deposit."));
						return;
					}
					if (_amount != web3.toWei(6.5, 'ether')) {
						done(new Error("Unexpected ether deposit amount."));
						return;
					}
					if (_timestamp == 0) {
						done(new Error("Timestamp cannot be null."));
						return;
					}
					done();
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});
	
		//-------------------------------------------------------------------------

		it("T014: MUST FAIL [deposit]: Invalid index deposit 1 for user B.", function (done) {
			glob.web3ClientFund.deposit(glob.user_b, 1).then(
				function (args) {
					done(new Error('This test must fail.'));;
				},
				function (err) {
					done();
				}
			);
		});

		//------------------------------------------------------------------------

		it("T015: MUST SUCCEED [deposit]: User A should have 5 tokens at index 1", function (done) {
			glob.web3ClientFund.deposit(glob.user_a, 1).then(
				function (args) {
					const _amount = args[0];
					const _timestamp = args[1];
					const _token = args[2];

					if (_token != glob.web3Erc20.address) {
						done(new Error("Unexpected ether or other token deposit."));
						return;
					}
					if (_amount != 5) {
						done(new Error("Unexpeced token deposit amount."));
						return;
					}
					if (_timestamp == 0) {
						done(new Error("Timestamp cannot be null."));
						return;
					}
					done();
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});

		//------------------------------------------------------------------------

		it("T016: MUST SUCCEED [activeBalance]: 2.5 ETH for User A", function (done) {
			glob.web3ClientFund.activeBalance(glob.user_a, 0).then(
				function (balance) {
					done(balance != web3.toWei(2.5, 'ether') ? new Error('This test must succeed') : null);
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});

		//------------------------------------------------------------------------

		it("T017: MUST SUCCEED [activeBalance]: 5 tokens for User A", function (done) {
			glob.web3ClientFund.activeBalance(glob.user_a, glob.web3Erc20.address).then(
				function (balance) {
					done(balance != 5 ? new Error('This test must succeed') : null);
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});

		//------------------------------------------------------------------------

		it("T018: MUST SUCCEED [activeBalance]: 0 tokens for User B", function (done) {
			glob.web3ClientFund.activeBalance(glob.user_b, glob.web3Erc20.address).then(
				function (balance) {
					done(balance != 0 ? new Error('This test must succeed') : null);
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});

		//------------------------------------------------------------------------

		it("T019: MUST SUCCEED [stagedBalance]: 0 ETH for User A", function (done) {
			glob.web3ClientFund.stagedBalance(glob.user_a, 0).then(
				function (balance) {
					done(balance != 0 ? new Error('This test must succeed') : null);
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});

		//------------------------------------------------------------------------

		it("T020: MUST SUCCEED [stagedBalance]: 0 tokens for User A", function (done) {
			glob.web3ClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address).then(
				function (balance) {
					done(balance != 0 ? new Error('This test must succeed') : null);
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});

		//------------------------------------------------------------------------

		it("T021: MUST SUCCEED [stagedBalance]: 0 tokens for User B", function (done) {
			glob.web3ClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address).then(
				function (balance) {
					done(balance != 0 ? new Error('This test must succeed') : null);
				},
				function (err) {
					done(new Error('This test must succeed. Error: ' + err.toString()));
				}
			);
		});
	});
};
