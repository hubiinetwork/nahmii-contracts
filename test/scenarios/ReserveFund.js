module.exports = function (glob) {

	describe("ReserveFund", function () {


		// Local test-wide variables
		// ------------------------------------------------------------------------------------------------------
		const TOKEN_DEPOSIT_AMOUNT_A = 5;
		const TOKEN_DEPOSIT_AMOUNT_B = 10;
		const TOKEN_DEPOSIT_AMOUNT_OWNER = 50;

		const ETHER_DEPOSIT_AMOUNT_OWNER = 3;
		const ETHER_DEPOSIT_AMOUNT_B = 0.25;
		const ETHER_DEPOSIT_AMOUNT_C = 3.14159;

		const TOKEN_STAGE_AMOUNT_A = 1;
		const ETHER_STAGE_AMOUNT_C = 3.14159;

		const ETHER_WITHDRAW_AMOUNT_C = 2;

		var tokenDepositBlockNumber_userA = -1;
		var tokenDepositBlockNumber_userB = -1;
		var etherDepositBlockNumber_userB = -1;
		var etherDepositBlockNumber_userC = -1;
		var etherDepositBlockNumber_owner = -1;
		var tokenDepositBlockNumber_owner = -1;

		// Helper functions
		// -----------------------------------------------------------------------------------------------------
		Number.prototype.pad = function (size) {
			var s = String(this);
			while (s.length < (size || 2)) { s = "0" + s; }
			return s;
		}

		function testId() {
			return "T" + (++testNum).pad(3);
		}
		var testNum = 0;
		// ------------------------------------------------------------------------------------------------------

		it(testId() + ": MUST SUCCEED [payable]: Owner deposits " + ETHER_DEPOSIT_AMOUNT_OWNER + "ETH", function (done) {
			web3.eth.sendTransaction({
				from: glob.owner,
				to: glob.web3ReserveFund.address,
				value: web3.toWei(ETHER_DEPOSIT_AMOUNT_OWNER, 'ether'),
				gas: glob.gasLimit
			}, function (err, txHash) {
				if (!err) {
					web3.eth.getTransactionReceipt(txHash, function (err, receipt) {
						if (!err)
							etherDepositBlockNumber_owner = receipt.blockNumber;

						done(err ? new Error('This test must succeed. Error is: ' + err.toString()) : null);
						return;
					});
				}
				else {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				}
			})
		});

		it(testId() + ": MUST SUCCEED [payable]: User B deposits " + ETHER_DEPOSIT_AMOUNT_B + "ETH", function (done) {
			web3.eth.sendTransaction({
				from: glob.user_b,
				to: glob.web3ReserveFund.address,
				value: web3.toWei(ETHER_DEPOSIT_AMOUNT_B, 'ether'),
				gas: glob.gasLimit
			}, function (err, txHash) {
				if (!err) {
					web3.eth.getTransactionReceipt(txHash, function (err, receipt) {
						if (!err)
							etherDepositBlockNumber_userB = receipt.blockNumber;

						done(err ? new Error('This test must succeed. Error is: ' + err.toString()) : null);
						return;
					});
				}
				else {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				}
			})
		});

		it(testId() + ": MUST SUCCEED [payable]: User C deposits " + ETHER_DEPOSIT_AMOUNT_C + "ETH", function (done) {
			web3.eth.sendTransaction({
				from: glob.user_c,
				to: glob.web3ReserveFund.address,
				value: web3.toWei(ETHER_DEPOSIT_AMOUNT_C, 'ether'),
				gas: glob.gasLimit
			}, function (err, txHash) {
				if (!err) {
					web3.eth.getTransactionReceipt(txHash, function (err, receipt) {
						if (!err)
							etherDepositBlockNumber_userC = receipt.blockNumber;

						done(err ? new Error('This test must succeed. Error is: ' + err.toString()) : null);
						return;
					});
				}
				else {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				}
			})
		});

		it(testId() + ": MUST FAIL [payable]: Cannot be called with zero amount ", function (done) {
			web3.eth.sendTransaction({
				from: glob.user_c,
				to: glob.web3ReserveFund.address,
				value: 0,
				gas: glob.gasLimit
			},
				function (err) {
					done(err == null ? new Error('This test must fail') : null);
				});
		});

		it(testId() + ": MUST FAIL [depositToken]: Cannot be called with zero amount", function (done) {
			glob.web3ReserveFund.depositTokens(glob.web3Erc20.address, 0, { from: glob.user_a })
				.then((result) => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
		});

		it(testId() + ": MUST FAIL [depositToken]: Cannot be called with null token address", function (done) {
			glob.web3ReserveFund.depositTokens(0, TOKEN_DEPOSIT_AMOUNT_A, { from: glob.user_a })
				.then((result) => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
		});

		it(testId() + ": MUST SUCCEED [depositToken]: Owner deposits " + TOKEN_DEPOSIT_AMOUNT_OWNER + " tokens", function (done) {
			glob.web3Erc20.approve(glob.web3ReserveFund.address, TOKEN_DEPOSIT_AMOUNT_OWNER)
				.then(() => {
					glob.web3ReserveFund.depositTokens(glob.web3Erc20.address, TOKEN_DEPOSIT_AMOUNT_OWNER)
						.then((result) => {
							tokenDepositBlockNumber_owner = result.receipt.blockNumber;
							done();
						})
						.catch((err) => {
							done(new Error('This test must succeed. Error is: ' + err.toString()));
						});
				})
				.catch((err) => {
					done(new Error('This test must succeed (failed to approve token transfer). Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [depositToken]: User A deposits " + TOKEN_DEPOSIT_AMOUNT_A + " tokens", function (done) {
			glob.web3Erc20.approve(glob.web3ReserveFund.address, TOKEN_DEPOSIT_AMOUNT_A, { from: glob.user_a })
				.then(() => {
					glob.web3ReserveFund.depositTokens(glob.web3Erc20.address, TOKEN_DEPOSIT_AMOUNT_A, { from: glob.user_a })
						.then((result) => {
							tokenDepositBlockNumber_userA = result.receipt.blockNumber;
							done();
						})
						.catch((err) => {
							done(new Error('This test must succeed. Error is: ' + err.toString()));
						});
				})
				.catch((err) => {
					done(new Error('This test must succeed (failed to approve token transfer). Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [depositToken]: User B deposits " + TOKEN_DEPOSIT_AMOUNT_B + " tokens", function (done) {
			glob.web3Erc20.approve(glob.web3ReserveFund.address, TOKEN_DEPOSIT_AMOUNT_B, { from: glob.user_b })
				.then(() => {
					glob.web3ReserveFund.depositTokens(glob.web3Erc20.address, TOKEN_DEPOSIT_AMOUNT_B, { from: glob.user_b })
						.then((result) => {
							tokenDepositBlockNumber_userB = result.receipt.blockNumber;
							done();
						})
						.catch((err) => {
							done(new Error('This test must succeed. Error is: ' + err.toString()));
						});
				})
				.catch((err) => {
					done(new Error('This test must succeed (failed to approve token transfer). Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [deposit]: User A deposit at index 0 is " + TOKEN_DEPOSIT_AMOUNT_A + " tokens ", function (done) {
			glob.web3ReserveFund.deposit(glob.user_a, 0)
				.then((depositData) => {
					if (depositData[0] != TOKEN_DEPOSIT_AMOUNT_A) {
						done(new Error('This test must succeed. Error: Amount differs: ' +
							TOKEN_DEPOSIT_AMOUNT_A + ' != ' + depositData[0]));
						return;
					}
					if (depositData[1] != glob.web3Erc20.address) {
						done(new Error('This test must succeed. Error: Token address differs: ' +
							glob.web3.web3Erc20.address + ' != ' + depositData[1]));
						return;
					}
					if (depositData[2] != tokenDepositBlockNumber_userA) {
						done(new Error('This test must succeed. Error: Block number differs: ' +
							tokenDepositBlockNumber_userA + ' != ' + depositData[2]));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [deposit]: User B deposit at index 0 is " + ETHER_DEPOSIT_AMOUNT_B + " ETH", function (done) {
			glob.web3ReserveFund.deposit(glob.user_b, 0)
				.then((depositData) => {
					if (web3.fromWei(depositData[0]) != ETHER_DEPOSIT_AMOUNT_B) {
						done(new Error('This test must succeed. Error: Amount differs: ' +
							ETHER_DEPOSIT_AMOUNT_B + ' != ' + web3.fromWei(depositData[0])));
						return;
					}
					if (depositData[1] != 0) {
						done(new Error('This test must succeed. Error: Token address differs: ' +
							' 0x0 != ' + depositData[1]));
						return;
					}
					if (depositData[2] != etherDepositBlockNumber_userB) {
						done(new Error('This test must succeed. Error: Block number differs: ' +
							tokenDepositBlockNumber_userB + ' != ' + depositData[2]));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [deposit]: User B deposit at index 1 is " + TOKEN_DEPOSIT_AMOUNT_B + " tokens", function (done) {
			glob.web3ReserveFund.deposit(glob.user_b, 1)
				.then((depositData) => {
					if (depositData[0] != TOKEN_DEPOSIT_AMOUNT_B) {
						done(new Error('This test must succeed. Error: Amount differs: ' +
							TOKEN_DEPOSIT_AMOUNT_B + ' != ' + depositData[0]));
						return;
					}
					if (depositData[1] != glob.web3Erc20.address) {
						done(new Error('This test must succeed. Error: Token address differs: ' +
							glob.web3.web3Erc20.address + ' != ' + depositData[1]));
						return;
					}
					if (depositData[2] != tokenDepositBlockNumber_userB) {
						done(new Error('This test must succeed. Error: Block number differs: ' +
							tokenDepositBlockNumber_userB + ' != ' + depositData[2]));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [depositCount]: User A deposit count equals 1", function (done) {
			glob.web3ReserveFund.depositCount(glob.user_a)
				.then((depositCount) => {
					if (depositCount != 1) {
						done(new Error('This test must succeed. Error: Deposit count differs: ' +
							depositCount + ' != 1'));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [depositCount]: User B deposit count equals 2", function (done) {
			glob.web3ReserveFund.depositCount(glob.user_b)
				.then((depositCount) => {
					if (depositCount != 2) {
						done(new Error('This test must succeed. Error: Deposit count differs: ' +
							depositCount + ' != 2'));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST FAIL [depositCount]: Cannot be called with address zero", function (done) {
			glob.web3ReserveFund.depositCount(0x0, 1)
				.then(() => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
		});

		it(testId() + ": MUST FAIL [depositCount]: Cannot be called with invalid index", function (done) {
			glob.web3ReserveFund.depositCount(glob.user_a, 999)
				.then(() => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
		});

		it(testId() + ": MUST SUCCEED [periodAccrualBalance]: Period accrual balance equals" + ETHER_DEPOSIT_AMOUNT_OWNER + " ETH", async () => {
			try {
				let balance = await glob.web3ReserveFund.periodAccrualBalance(0);
				if (balance != web3.toWei(ETHER_DEPOSIT_AMOUNT_OWNER, 'ether')) {
					throw (new Error('This test must succeed. Error: Period Accrual differs: ' +
						balance + ' != ' + ETHER_DEPOSIT_AMOUNT_OWNER));
				}
			}
			catch (err) {
				if (err instanceof Error) {
					throw err;
				}
				throw new Error('This test must succeed. Error is: ' + err.toString());
			}
		});

		it(testId() + ": MUST SUCCEED [aggregateAccrualBalance]: Aggregate accrual balance equals " + ETHER_DEPOSIT_AMOUNT_OWNER + "ETH", function (done) {
			glob.web3ReserveFund.aggregateAccrualBalance(0)
				.then((balance) => {
					if (balance != web3.toWei(ETHER_DEPOSIT_AMOUNT_OWNER, 'ether')) {
						done(new Error('This test must succeed. Error: Aggregate Accrual differs: ' +
							balance + ' != ' + ETHER_DEPOSIT_AMOUNT_OWNER));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [closeAccrualPeriod]", function (done) {
			done();
		});

		it(testId() + ": MUST SUCCEED [claimAccrual]", function (done) {
			done();
		});

		it(testId() + ": MUST SUCCEED [stage]: User A stages " + TOKEN_STAGE_AMOUNT_A + " token units", function (done) {
			glob.web3ReserveFund.stage(glob.web3Erc20.address, TOKEN_STAGE_AMOUNT_A, { from: glob.user_a })
				.then(() => {
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [stagedBalance]: User A staged balance equals " + TOKEN_STAGE_AMOUNT_A + " tokens", function (done) {
			glob.web3ReserveFund.stagedBalance(glob.user_a, glob.web3Erc20.address)
				.then((balance) => {
					if (balance != TOKEN_STAGE_AMOUNT_A) {
						done(new Error('This test must succeed. Error: Stage balance  differs: ' +
							balance + ' != ' + TOKEN_STAGE_AMOUNT_A));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [activeBalance]: User A active balance equals " + (TOKEN_DEPOSIT_AMOUNT_A - TOKEN_STAGE_AMOUNT_A) + " tokens", function (done) {
			glob.web3ReserveFund.activeBalance(glob.user_a, glob.web3Erc20.address)
				.then((balance) => {
					if (balance != (TOKEN_DEPOSIT_AMOUNT_A - TOKEN_STAGE_AMOUNT_A)) {
						done(new Error('This test must succeed. Error: Active balance  differs: ' +
							balance + ' != ' + (TOKEN_DEPOSIT_AMOUNT_A - TOKEN_STAGE_AMOUNT_A)));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [activeBalance]: User C active ether balance equals " + ETHER_DEPOSIT_AMOUNT_C + " ETHs", function (done) {
			glob.web3ReserveFund.activeBalance(glob.user_c, 0)
				.then((balance) => {
					if (balance != (web3.toWei(ETHER_DEPOSIT_AMOUNT_C))) {
						done(new Error('This test must succeed. Error: Active ether balance  differs: ' +
							balance + ' != ' + (web3.toWei(ETHER_DEPOSIT_AMOUNT_C))));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [stage]: User C stages " + ETHER_STAGE_AMOUNT_C + " ETHs", function (done) {
			glob.web3ReserveFund.stage(0, web3.toWei(ETHER_STAGE_AMOUNT_C, 'ether'), { from: glob.user_c })
				.then(() => {
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [stagedBalance]: User C staged balance equals " + ETHER_STAGE_AMOUNT_C + " ETHs", function (done) {
			glob.web3ReserveFund.stagedBalance(glob.user_c, 0)
				.then((balance) => {
					if (balance != web3.toWei(ETHER_STAGE_AMOUNT_C)) {
						done(new Error('This test must succeed. Error: Stage balance  differs: ' +
							balance + ' != ' + web3.toWei(ETHER_STAGE_AMOUNT_C)));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [withdrawEther]: User C withdraws " + ETHER_WITHDRAW_AMOUNT_C + " ETHs from it's staged balance", function (done) {
			const preWithdrawBalance = web3.eth.getBalance(glob.user_c);

			glob.web3ReserveFund.withdrawEther(web3.toWei(ETHER_WITHDRAW_AMOUNT_C, 'ether'), { from: glob.user_c })
				.then((result) => {

					// if withdrawn successfully, recheck staged balance

					glob.web3ReserveFund.stagedBalance(glob.user_c, 0)
						.then((stagedBalance) => {

							if (stagedBalance == web3.toWei(ETHER_STAGE_AMOUNT_C) - web3.toWei(ETHER_WITHDRAW_AMOUNT_C)) {

								// Check if user has finally got the requested amount 
								// (consider used gas to do the proper calculation)

								const postWithdrawBalance = web3.eth.getBalance(glob.user_c);
								var tx = web3.eth.getTransaction(result.tx);
								var totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
								totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

								const requiredPostbalance = new web3.BigNumber(web3.toWei(ETHER_WITHDRAW_AMOUNT_C))
									.add(preWithdrawBalance).sub(totalGasPrice);

								if (requiredPostbalance.eq(postWithdrawBalance)) {
									done();
								}
								else {
									done(new Error('This test must succeed. User C ether account should have: ' +
										web3.fromWei(requiredPostbalance) +
										' but got: ' + (web3.fromWei(postWithdrawBalance)) + ' ethers.'));

									return;
								}
							}
							else {
								done(new Error('This test must succeed. Error: Stage balance  differs: ' +
									stagedBalance + ' != ' + web3.toWei(ETHER_STAGE_AMOUNT_C).sub(web3.toWei(ETHER_WITHDRAW_AMOUNT_C))));
								return;
							}
						})
						.catch((err) => {
							done(new Error('This test must succeed. Cannot get stagedBalance. Error is:' + err.toString()));
						});
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is:' + err.toString()));

				})
		});

		it(testId() + ": MUST SUCCEED [withdrawTokens]", function (done) {
			done();
		});
	});
};
