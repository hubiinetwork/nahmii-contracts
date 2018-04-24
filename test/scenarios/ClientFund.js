module.exports = function (glob) {
	describe("ClientFund", function () {
		it("T001: MUST FAIL [payable]: cannot be called from owner", function (done) {
			web3.eth.sendTransactionPromise({
				from: glob.owner,
				to: glob.web3ClientFund.address,
				value: web3.toWei(10, 'ether'),
				gas: glob.gasLimit
			}).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		//-------------------------------------------------------------------------

		it("T002: MUST FAIL [payable]: cannot be called with 0 ethers", function (done) {
			web3.eth.sendTransactionPromise({
				from: glob.user_a,
				to: glob.web3ClientFund.address,
				value: web3.toWei(0, 'ether'),
				gas: glob.gasLimit
			}).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		//-------------------------------------------------------------------------

		it("T003: MUST SUCCEED [payable]: add 2.5 Ethers to user A active balance", function (done) {
			web3.eth.sendTransactionPromise({
				from: glob.user_a,
				to: glob.web3ClientFund.address,
				value: web3.toWei(2.5, 'ether'),
				gas: glob.gasLimit
			}).then(function () {
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//-------------------------------------------------------------------------

		it("T004: MUST SUCCEED [payable]: add 6.5 Ethers to user B active balance", function (done) {
			web3.eth.sendTransactionPromise({
				from: glob.user_b,
				to: glob.web3ClientFund.address,
				value: web3.toWei(6.5, 'ether'),
				gas: glob.gasLimit
			}).then(function () {
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//-------------------------------------------------------------------------

		it("T005: MUST SUCCEED [depositTokens]: 5 tokens added to A active balance", function (done) {
			glob.web3Erc20.approve(glob.web3ClientFund.address, 5, { from: glob.user_a }).then(function () {
				glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 5, { from: glob.user_a }).then(function () {
					done();
				}).catch(function (err) {
					done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
				});
			}).catch(function (err) {
				done(new Error('This test must succeed. Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']'));
			});
		});

		//-------------------------------------------------------------------------

		it("T006: MUST FAIL [depositTokens]: Cannot be called from owner address", function (done) {
			glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 5, { from: glob.owner }).then(function () {
				done(new Error('This test must fail.'));
			}).catch(function (err) {
				done();
			});
		});

		//-------------------------------------------------------------------------

		it("T007: MUST FAIL [depositTokens]: Cannot be called with zero address", function (done) {
			glob.web3ClientFund.depositTokens(0, 5, { from: glob.user_a }).then(function () {
				done(new Error('This test must fail.'));
			}).catch(function (err) {
				done();
			});
		});

		//-------------------------------------------------------------------------

		it("T008: MUST FAIL [depositTokens]: Cannot be called with zero amount", function (done) {
			glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 0, { from: glob.user_a }).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		//-------------------------------------------------------------------------

		it("T009: MUST FAIL [depositTokens]: User does not have enough tokens to deposit.", function (done) {
			glob.web3Erc20.approve(glob.web3ClientFund.address, 9999, { from: glob.user_a }).then(function () {
				glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 9999, { from: glob.user_a }).then(function () {
					done(new Error('This test must fail'));
				}).catch(function (err) {
					done();
				});
			}).catch(function (err) {
				done(new Error('This test must fail. Error: ERC20 failed to approve token transfer'));
			});
		});

		//-------------------------------------------------------------------------

		it("T010: MUST SUCCEED [depositCount]: User A should have 2 deposits", function (done) {
			glob.web3ClientFund.depositCount(glob.user_a).then(function (count) {
				if (count != 2) {
					done(new Error('This test must succeed. Error: Deposit count: ' + count.toString()));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//-------------------------------------------------------------------------

		it("T011: MUST SUCCEED [depositCount]: User B should have 1 deposit", function (done) {
			glob.web3ClientFund.depositCount(glob.user_b).then(function (count) {
				if (count != 1) {
					done(new Error('This test must succeed. Error: Deposit count: ' + count.toString()));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//-------------------------------------------------------------------------

		it("T012: MUST FAIL [depositCount]: Cannot be called from non-owner address", function (done) {
			glob.web3ClientFund.depositCount(glob.user_a, { from: glob.user_a }).then(function () {
				done(new Error('This test must fail.'));;
			}).catch(function (err) {
				done();
			});
		});

		//-------------------------------------------------------------------------

		it("T013: MUST SUCCEED [deposit]: User B should have 6.5 ETH at index 0", function (done) {
			glob.web3ClientFund.deposit(glob.user_b, 0).then(function (args) {
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
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//-------------------------------------------------------------------------

		it("T014: MUST FAIL [deposit]: Invalid index deposit 1 for user B.", function (done) {
			glob.web3ClientFund.deposit(glob.user_b, 1).then(function () {
				done(new Error('This test must fail.'));;
			}).catch(function (err) {
				done();
			});
		});

		//------------------------------------------------------------------------

		it("T015: MUST SUCCEED [deposit]: User A should have 5 tokens at index 1", function (done) {
			glob.web3ClientFund.deposit(glob.user_a, 1).then(function (args) {
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
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//------------------------------------------------------------------------

		it("T016: MUST SUCCEED [activeBalance]: 2.5 ETH for User A", function (done) {
			glob.web3ClientFund.activeBalance(glob.user_a, 0).then(function (balance) {
				if (balance != web3.toWei(2.5, 'ether')) {
					done(new Error('Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//------------------------------------------------------------------------

		it("T017: MUST SUCCEED [activeBalance]: 5 tokens for User A", function (done) {
			glob.web3ClientFund.activeBalance(glob.user_a, glob.web3Erc20.address).then(function (balance) {
				if (balance != 5) {
					done(new Error('Wrong balance [' + balance.toString() + ' tokens].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//------------------------------------------------------------------------

		it("T018: MUST SUCCEED [activeBalance]: 0 tokens for User B", function (done) {
			glob.web3ClientFund.activeBalance(glob.user_b, glob.web3Erc20.address).then(function (balance) {
				if (balance != 0) {
					done(new Error('Wrong balance [' + balance.toString() + ' tokens].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//------------------------------------------------------------------------

		it("T019: MUST SUCCEED [stagedBalance]: 0 ETH for User A", function (done) {
			glob.web3ClientFund.stagedBalance(glob.user_a, 0).then(function (balance) {
				if (balance != web3.toWei(0, 'ether')) {
					done(new Error('Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//------------------------------------------------------------------------

		it("T020: MUST SUCCEED [stagedBalance]: 0 tokens for User A", function (done) {
		glob.web3ClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address).then(function (balance) {
				if (balance != 0) {
					done(new Error('Wrong balance [' + balance.toString() + ' tokens].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//------------------------------------------------------------------------

		it("T021: MUST SUCCEED [stagedBalance]: 0 tokens for User B", function (done) {
			glob.web3ClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address).then(function (balance) {
				if (balance != 0) {
					done(new Error('Wrong balance [' + balance.toString() + ' tokens].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//------------------------------------------------------------------------

		it("T022: MUST SUCCEED [setServiceActivationTimeout]: Set the service activation timeout to 0", function (done) {
			glob.web3ClientFund.setServiceActivationTimeout(0).then(function () {
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T023: MUST SUCCEED [registerService]: Register ReserveFunds SC as a service", function (done) {
			glob.web3ClientFund.registerService(glob.web3ReserveFund.address).then(function () {
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T024: MUST FAIL [registerService]: Register ClientFund SC as a service", function (done) {
			glob.web3ClientFund.registerService(glob.web3ClientFund.address).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		it("T025: MUST FAIL [registerService]: Register UnitTestHelpers_FAIL SC as a service from non-owner", function (done) {
			glob.web3ClientFund.registerService(glob.web3UnitTestHelpers_FAIL_TESTS.address, { from: glob.user_a }).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		it("T026: MUST SUCCEED [registerService]: Register UnitTestHelpers_SUCCESS SC as a service", function (done) {
			glob.web3ClientFund.registerService(glob.web3UnitTestHelpers_SUCCESS_TESTS.address).then(function () {
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T027: MUST SUCCEED [registerService]: Register UnitTestHelpers_FAIL SC as a service", function (done) {
			glob.web3ClientFund.registerService(glob.web3UnitTestHelpers_FAIL_TESTS.address).then(function () {
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T028: MUST SUCCEED [disableRegisteredService]: Disable UnitTestHelpers_FAIL as a service for User A", function (done) {
			glob.web3ClientFund.disableRegisteredService(glob.web3UnitTestHelpers_FAIL_TESTS.address, { from: glob.user_a }).then(function () {
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		//------------------------------------------------------------------------

		it("T029: MUST SUCCEED [transferFromActiveToStagedBalance]: User A uses UnitTestHelpers_SUCCESS as a service to send 0.2 ETH to User D", function (done) {
			var oldStagedBalance, oldActiveBalance, newActiveBalance;

			glob.web3ClientFund.activeBalance(glob.user_a, 0).then(function (balance) {
				oldActiveBalance = balance;
				return glob.web3ClientFund.stagedBalance(glob.user_d, 0);
			}).then(function (balance) {
				oldStagedBalance = balance;
				return glob.web3UnitTestHelpers_SUCCESS_TESTS.callToTransferFromActiveToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.2, 'ether'), 0);
			}).then(function () {
				return glob.web3ClientFund.activeBalance(glob.user_a, 0);
			}).then(function (balance) {
				newActiveBalance = balance;
				return glob.web3ClientFund.stagedBalance(glob.user_d, 0);
			}).then(function (balance) {
				if (balance - oldStagedBalance != web3.toWei(0.2, 'ether')) {
					done(new Error('Wrong staged balance [Diff ' + web3.fromWei(balance - oldStagedBalance, 'ether') + ' ethers].'));
					return;
				}
				if (oldActiveBalance - newActiveBalance != web3.toWei(0.2, 'ether')) {
					done(new Error('Wrong active balance [Diff ' + web3.fromWei(oldActiveBalance - newActiveBalance, 'ether') + ' ethers].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T030: MUST FAIL [transferFromActiveToStagedBalance]: User A disabled UnitTestHelpers_FAIL as a service to send 0.2 ETH to User D", function (done) {
			glob.web3UnitTestHelpers_FAIL_TESTS.callToTransferFromActiveToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.2, 'ether'), 0).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		it("T031: MUST SUCCEED [transferFromActiveToStagedBalance]: User A uses UnitTestHelpers_SUCCESS as a service to send 2 tokens to User D", function (done) {
			var oldStagedBalance, oldActiveBalance, newActiveBalance;

			glob.web3ClientFund.activeBalance(glob.user_a, glob.web3Erc20.address).then(function (balance) {
				oldActiveBalance = balance;
				return glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
			}).then(function (balance) {
				oldStagedBalance = balance;
				return glob.web3UnitTestHelpers_SUCCESS_TESTS.callToTransferFromActiveToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, 2, glob.web3Erc20.address);
			}).then(function () {
				return glob.web3ClientFund.activeBalance(glob.user_a, glob.web3Erc20.address);
			}).then(function (balance) {
				newActiveBalance = balance;
				return glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
			}).then(function (balance) {
				if (balance - oldStagedBalance != 2) {
					done(new Error('Wrong staged balance [Diff ' + (balance - oldStagedBalance).toString() + ' tokens].'));
					return;
				}
				if (oldActiveBalance - newActiveBalance != 2) {
					done(new Error('Wrong active balance [Diff ' + (oldActiveBalance - newActiveBalance).toString() + ' tokens].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T032: MUST FAIL [transferFromActiveToStagedBalance]: User A disabled UnitTestHelpers_FAIL as a service to send 2 tokens to User D", function (done) {
			glob.web3UnitTestHelpers_FAIL_TESTS.callToTransferFromActiveToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, 2, glob.web3Erc20.address).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		//------------------------------------------------------------------------

		it("T033: MUST SUCCEED [withdrawFromActiveBalance]: User A uses UnitTestHelpers_SUCCESS as a service to withdraw 0.3 ETH to User D", function (done) {
			var oldEthersBalance, oldActiveBalance, newActiveBalance;

			glob.web3ClientFund.activeBalance(glob.user_a, 0).then(function (balance) {
				oldActiveBalance = balance;
				return web3.eth.getBalancePromise(glob.user_d);
			}).then(function (balance) {
				oldEthersBalance = balance;
				return glob.web3UnitTestHelpers_SUCCESS_TESTS.callToWithdrawFromActiveBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.3, 'ether'), 0);
			}).then(function () {
				return glob.web3ClientFund.activeBalance(glob.user_a, 0);
			}).then(function (balance) {
				newActiveBalance = balance;
				return web3.eth.getBalancePromise(glob.user_d);
			}).then(function (balance) {
				if (balance - oldEthersBalance != web3.toWei(0.3, 'ether')) {
					done(new Error('Wrong balance [Diff ' + web3.fromWei(balance - oldEthersBalance, 'ether') + ' ethers].'));
					return;
				}
				if (oldActiveBalance - newActiveBalance != web3.toWei(0.3, 'ether')) {
					done(new Error('Wrong balance [Diff ' + web3.fromWei(oldActiveBalance - newActiveBalance, 'ether') + ' ethers].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T034: MUST FAIL [withdrawFromActiveBalance]: User A disabled unit test helper SC as a service to withdraw 0.3 ETH to User D", function (done) {
			glob.web3UnitTestHelpers_FAIL_TESTS.callToWithdrawFromActiveBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.3, 'ether'), 0).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		//------------------------------------------------------------------------

		it("T035: MUST SUCCEED [depositEthersToStagedBalance]: UnitTestHelpers_SUCCESS deposits 0.4 ETH to User C", function (done) {
			var oldStagedBalance, newStagedBalance, oldEthersBalance;

			glob.web3ClientFund.stagedBalance(glob.user_c, 0).then(function (balance) {
				oldStagedBalance = balance;
				return web3.eth.getBalancePromise(glob.web3ClientFund.address);
			}).then(function (balance) {
				oldEthersBalance = balance;
				return glob.web3UnitTestHelpers_SUCCESS_TESTS.callToDepositEthersToStagedBalance(glob.web3ClientFund.address, glob.user_c, { value: web3.toWei(0.4, 'ether') });
			}).then(function () {
				return glob.web3ClientFund.stagedBalance(glob.user_c, 0);
			}).then(function (balance) {
				newStagedBalance = balance;
				return web3.eth.getBalancePromise(glob.web3ClientFund.address);
			}).then(function (balance) {
				if (balance - oldEthersBalance != web3.toWei(0.4, 'ether')) {
					done(new Error('Wrong SC balance [Diff ' + web3.fromWei(balance - oldBalance, 'ether') + ' ethers].'));
					return;
				}
				if (newStagedBalance - oldStagedBalance != web3.toWei(0.4, 'ether')) {
					done(new Error('Wrong balance [Diff ' + web3.fromWei(newStagedBalance - oldStagedBalance, 'ether') + ' ethers].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T036: MUST FAIL [depositEthersToStagedBalance]: UnitTestHelpers_FAIL deposits 0.4 ETH to User A", function (done) {
			glob.web3UnitTestHelpers_FAIL_TESTS.callToDepositEthersToStagedBalance(glob.web3ClientFund.address, glob.user_a, { value: web3.toWei(0.4, 'ether') }).then(function () {
				done(new Error('This test must fail'));
			}).catch(function (err) {
				done();
			});
		});

		//------------------------------------------------------------------------

/*
.
		depositTokensToStagedBalance(address destWallet, address token, uint256 amount)

		unstage(uint256 amount, address token) 
		withdrawEthers(uint256 amount) 
		withdrawTokens(uint256 amount, address token)
		*/


		//------------------------------------------------------------------------

		it("T035: MUST SUCCEED [withdrawEthers]: User D wants to withdraw 0.1 ETH", function (done) {
			var oldStagedBalance, newStagedBalance, oldEthersBalance, totalGasPrice;

			glob.web3ClientFund.stagedBalance(glob.user_d, 0).then(function (balance) {
				oldStagedBalance = balance;
				return web3.eth.getBalancePromise(glob.user_d);
			}).then(function (balance) {
				oldEthersBalance = balance;
				return glob.web3ClientFund.withdrawEthers(web3.toWei(0.1, 'ether'), { from: glob.user_d });
			}).then(function (result) {
				var tx = web3.eth.getTransaction(result.tx);
				totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
				totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));
				return glob.web3ClientFund.stagedBalance(glob.user_d, 0);
			}).then(function (balance) {
				newStagedBalance = balance;
				return web3.eth.getBalancePromise(glob.user_d);
			}).then(function (balance) {
				if (balance.add(totalGasPrice) - oldEthersBalance != web3.toWei(0.1, 'ether')) {
					done(new Error('Wrong user D balance [Diff ' + web3.fromWei(balance.add(totalGasPrice) - oldEthersBalance, 'ether') + ' ethers].'));
					return;
				}
				if (oldStagedBalance - newStagedBalance != web3.toWei(0.1, 'ether')) {
					done(new Error('Wrong staged balance [Diff ' + web3.fromWei(oldStagedBalance - newStagedBalance, 'ether') + ' ethers].'));
					return;
				}
				done();
			}).catch(function (err) {
				done(new Error('This test must succeed. [Error: ' + err.toString() + ']'));
			});
		});

		it("T036: MUST SUCCEED [withdrawEthers]: User A wants to withdraw 0.1 ETH", function (done) {
			glob.web3ClientFund.withdrawEthers(web3.toWei(0.1, 'ether'), { from: glob.user_a }).then(function () {
				done(new Error('This test must fail.'));
			}).catch(function (err) {
				done();
			});
		});
	});
};
