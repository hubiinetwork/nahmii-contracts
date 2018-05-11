module.exports = function (glob) {

	describe.only("ReserveFund", function () {

		var ethers = require('ethers');


		// Local test-wide variables
		// ------------------------------------------------------------------------------------------------------
		const TOKEN_DEPOSIT_AMOUNT_A = 5;
		const TOKEN_DEPOSIT_AMOUNT_B = 10;
		const TOKEN_DEPOSIT_AMOUNT_OWNER = 50;

		const ETHER_DEPOSIT_AMOUNT_OWNER = 3;
		const ETHER_DEPOSIT_AMOUNT_A = 4.7;
		const ETHER_DEPOSIT_AMOUNT_B = 0.25;
		const ETHER_DEPOSIT_AMOUNT_C = 3.14159;

		var ETHER_DEPOSIT_AMOUNT_D = [3, 1.2, 4];
		var etherDepositBlockNumber_userD = [-1, -1, -1];

		const TOKEN_STAGE_AMOUNT_A = 1;
		const ETHER_STAGE_AMOUNT_C = 3.14159;

		const ETHER_WITHDRAW_AMOUNT_C = 2;
		const TOKEN_WITHDRAW_AMOUNT_A = 1;

		var tokenDepositBlockNumber_userA = -1;
		var tokenDepositBlockNumber_userB = -1;
		var tokenDepositBlockNumber_owner = -1;

		var etherDepositBlockNumber_userA = -1;
		var etherDepositBlockNumber_userA_preAcc = -1;
		var etherDepositBlockNumber_userB = -1;
		var etherDepositBlockNumber_userC = -1;
		var etherDepositBlockNumber_owner = -1;

		var lastOwnerDepositBlock = -1;
		var lastAccrualBlock = -1;

		const MOCK_SERVICE_ADDRESS = '0xCAFECAFECAFECAFECAFECAFECAFECAFECAFECAFE'

		const _1e18 = '1000000000000000000';

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

		// "Promisified helpers"
		// -----------------------------------------------------------------------------------------------------

		var getTxBlock = function (_tx) {
			return new Promise(function (resolve, reject) {
				web3.eth.getTransactionReceipt(_tx, function (err, receipt) {
					if (!err) {
						resolve(receipt.blockNumber);
					}
					else {
						reject(err);
					}
				});
			});
		}

		var sendTx = function (_from, _to, _amountWei) {
			return new Promise(function (resolve, reject) {
				web3.eth.sendTransaction({
					from: _from,
					to: _to,
					value: _amountWei,
					gas: glob.gasLimit
				}, function (err, txHash) {
					if (!err)
						resolve(txHash);
					else
						reject(err);
				})
			})
		}

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
						lastOwnerDepositBlock = receipt.blockNumber;

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
							lastOwnerDepositBlock = result.receipt.blockNumber;
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

		it(testId() + ": MUST SUCCEED [payable]: User A deposits " + ETHER_DEPOSIT_AMOUNT_A + "ETH", function (done) {
			web3.eth.sendTransaction({
				from: glob.user_a,
				to: glob.web3ReserveFund.address,
				value: web3.toWei(ETHER_DEPOSIT_AMOUNT_A, 'ether'),
				gas: glob.gasLimit
			}, function (err, txHash) {
				if (!err) {
					web3.eth.getTransactionReceipt(txHash, function (err, receipt) {
						if (!err)
							etherDepositBlockNumber_userA = receipt.blockNumber;

						done(err ? new Error('This test must succeed. Error is: ' + err.toString()) : null);
						return;
					});
				}
				else {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				}
			})
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

		it(testId() + ": MUST SUCCEED [depositCount]: User A deposit count equals 2", function (done) {
			glob.web3ReserveFund.depositCount(glob.user_a)
				.then((depositCount) => {
					if (depositCount != 2) {
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


		it(testId() + ": MUST SUCCEED [activeBalance]: Contract aggregated Ether balance equals " + (ETHER_DEPOSIT_AMOUNT_A + ETHER_DEPOSIT_AMOUNT_B + ETHER_DEPOSIT_AMOUNT_C) + " ETH", function (done) {
			glob.web3ReserveFund.activeBalance(0, 0)
				.then((balance) => {
					if (balance != web3.toWei((ETHER_DEPOSIT_AMOUNT_A + ETHER_DEPOSIT_AMOUNT_B + ETHER_DEPOSIT_AMOUNT_C))) {
						done(new Error('This test must succeed. Error: Aggregated Ether balance  differs: ' +
							balance + ' != ' + web3.toWei(ETHER_DEPOSIT_AMOUNT_A + ETHER_DEPOSIT_AMOUNT_B + ETHER_DEPOSIT_AMOUNT_C)));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [activeBalance]: Contract aggregated token balance equals " + (TOKEN_DEPOSIT_AMOUNT_A + TOKEN_DEPOSIT_AMOUNT_B) + " tokens", function (done) {
			glob.web3ReserveFund.activeBalance(0, glob.web3Erc20.address)
				.then((balance) => {
					if (balance != (TOKEN_DEPOSIT_AMOUNT_A + TOKEN_DEPOSIT_AMOUNT_B)) {
						done(new Error('This test must succeed. Error: Aggregated Token balance  differs: ' +
							balance + ' != ' + (TOKEN_DEPOSIT_AMOUNT_A + TOKEN_DEPOSIT_AMOUNT_B)));
						return;
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST FAIL [stage]: Cannot be called by owner", function (done) {
			glob.web3ReserveFund.stage(glob.web3Erc20.address, TOKEN_STAGE_AMOUNT_A, { from: glob.owner })
				.then(() => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
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


		it(testId() + ": MUST SUCCEED [withdrawTokens]: User A withdraws " + TOKEN_WITHDRAW_AMOUNT_A + " tokens from it's staged balance", function (done) {

			glob.web3Erc20.balanceOf(glob.user_a)
				.then((preWithdrawBalance) => {

					glob.web3ReserveFund.withdrawTokens(glob.web3Erc20.address, TOKEN_WITHDRAW_AMOUNT_A, { from: glob.user_a })
						.then(() => {

							// Check new balance

							glob.web3Erc20.balanceOf(glob.user_a)
								.then((postWithdrawBalance) => {

									const expectedBalance = new web3.BigNumber(preWithdrawBalance).add(TOKEN_WITHDRAW_AMOUNT_A);

									if (new web3.BigNumber(postWithdrawBalance).eq(expectedBalance)) {

										// Staged token balance must be correct.

										glob.web3ReserveFund.stagedBalance(glob.user_a, glob.web3Erc20.address).then((newStagedBalance) => {
											done();
										}).catch((err) => {
											done(new Error('This test must succeed. Cannot get *new* staged balance. Error is ' + err.toString()));
										})
									}
									else {
										done(new Error('This test must succeed. Expected token balance: ' + expectedBalance + ' but got: ' + postWithdrawBalance));
									}

								}).catch((err) => done(new Error('This test must succeed. Cannot get token balance. Error is' + err.toString())));

						})
						.catch((err) => {
							done(new Error('This test must succeed. Error is:' + err.toString()));
						});

				})
				.catch((err) => done(new Error('This test must succeed. Cannot get token balance. Error is' + err.toString())));
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


		it(testId() + ": MUST SUCCEED [outboundTransferSupported]: Can we send TX 0.001 ETH to User C? Return TRUE", function (done) {
			const outboundTx = {
				tokenAddress: '0x0000000000000000000000000000000000000000',
				amount: ethers.utils.bigNumberify('1000000000000000')
			};

			var ctx = glob.ethersIoReserveFund.connect(glob.signer_owner);
			ctx.outboundTransferSupported(outboundTx)
				.then((result) => {
					done(result ? null : new Error("This test is expected to return TRUE"));
				})
				.catch((err) => {
					done(new Error("This test must succeed. Error is: " + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [outboundTransferSupported]:  Can we send 400 ETH to User C? Return FALSE  ", function (done) {
			const outboundTx = {
				tokenAddress: '0x0000000000000000000000000000000000000000',
				amount: ethers.utils.bigNumberify('400000000000000000000')
			};

			var ctx = glob.ethersIoReserveFund.connect(glob.signer_owner);
			ctx.outboundTransferSupported(outboundTx)
				.then((result) => {
					done(result ? new Error("This test is expected to return TRUE)") : null);
				})
				.catch((err) => {
					done(new Error("This test must succeed. Error is: " + err.toString()));
				});
		});

		it(testId() + ": MUST SUCCEED [twoWayTransfer]: Inbound (C to SC): 1 ETH. Outbound (SC to C): 1 token ", async () => {

			try {
				// LOGIC: 
				// 
				// wallet_balance.staged  += outbound.Amount;
				// aggregatedEtherBalance -= outbound.Amount;
				// wallet_balance.staged  -= inbound.Amount;
				// aggregatedEtherBalance += inbound.Amount;

				const inboundTx = {
					tokenAddress: '0x0000000000000000000000000000000000000000',
					amount: ethers.utils.bigNumberify('1000000000000000000')
				}; // 1ETH in Wei
				const outboundTx = {
					tokenAddress: glob.web3Erc20.address,
					amount: ethers.utils.bigNumberify('1')
				};

				var preTxEtherWalletBalance = await glob.web3ReserveFund.stagedBalance(glob.user_c, 0);
				var preTxTokenWalletBalance = await glob.web3ReserveFund.stagedBalance(glob.user_c, glob.web3Erc20.address);
				var preTxAggregateTokenBalance = await glob.web3ReserveFund.activeBalance(0, glob.web3Erc20.address);
				var preTxAggregateEtherBalance = await glob.web3ReserveFund.activeBalance(0, 0);

				var ctx = glob.ethersIoReserveFund.connect(glob.signer_owner);
				var result = await ctx.twoWayTransfer(glob.user_c, inboundTx, outboundTx, { gasLimit: 600000 });
				//await ctx.events.

				//console.log(result);
				//assert(result.value == true, 'TwoWayTransfer returned FALSE (check if amount exceeded aggregated balance).');

				var postTxEtherWalletBalance = await glob.web3ReserveFund.stagedBalance(glob.user_c, 0);
				var postTxTokenWalletBalance = await glob.web3ReserveFund.stagedBalance(glob.user_c, glob.web3Erc20.address);
				var postTxAggregateTokenBalance = await glob.web3ReserveFund.activeBalance(0, glob.web3Erc20.address);
				var postTxAggregateEtherBalance = await glob.web3ReserveFund.activeBalance(0, 0);

				var expectedTxEtherWalletBalance = new web3.BigNumber(preTxEtherWalletBalance).sub(inboundTx.amount);
				var expectedTxTokenWalletBalance = new web3.BigNumber(preTxTokenWalletBalance).add(outboundTx.amount);
				var expectedTxAggregateEtherBalance = new web3.BigNumber(preTxAggregateEtherBalance).add(inboundTx.amount);
				var expectedTxAggregateTokenBalance = new web3.BigNumber(preTxAggregateTokenBalance).sub(outboundTx.amount);

				assert(postTxEtherWalletBalance.eq(expectedTxEtherWalletBalance), 'Wallet staged ETH balance differs.');
				assert(postTxTokenWalletBalance.eq(expectedTxTokenWalletBalance), 'Wallet staged token balance differs.');
				assert(postTxAggregateTokenBalance.eq(expectedTxAggregateTokenBalance), 'Aggregate ETH balance differs. ');
				assert(postTxAggregateEtherBalance.eq(expectedTxAggregateEtherBalance), 'Aggregate token balance differs. ');
			}
			catch (err) {
				assert(false, 'This test must succeed. Error is:' + err.toString());
			}
		});

		it(testId() + ": MUST FAIL [twoWayTransfer]: Cannot be called by non-owner ", function (done) {

			const inboundTx = {
				tokenAddress: '0x0000000000000000000000000000000000000000',
				amount: ethers.utils.bigNumberify('1000000000000000000')
			}; // 1ETH in Wei
			const outboundTx = {
				tokenAddress: glob.web3Erc20.address,
				amount: ethers.utils.bigNumberify('1')
			};
			var ctx = glob.ethersIoReserveFund.connect(glob.signer_a);
			ctx.twoWayTransfer(glob.user_c, inboundTx, outboundTx, { gasLimit: 600000 })
				.then((result) => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				})
		});

		it(testId() + ": MUST FAIL [twoWayTransfer]: Cannot be called with inbound amount of zero ", function (done) {

			const inboundTx = { tokenAddress: '0x0000000000000000000000000000000000000000', amount: 0 };
			const outboundTx = { tokenAddress: glob.web3Erc20.address, amount: '1' };
			var ctx = glob.ethersIoReserveFund.connect(glob.signer_a);
			ctx.twoWayTransfer(glob.user_c, inboundTx, outboundTx, { gasLimit: 600000 })
				.then((result) => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				})
		});

		it(testId() + ": MUST FAIL [twoWayTransfer]: Cannot be called with outbound amount of zero ", function (done) {

			const inboundTx = { tokenAddress: '0x0000000000000000000000000000000000000000', amount: ethers.utils.bigNumberify('1000000000000000000') };
			const outboundTx = { tokenAddress: glob.web3Erc20.address, amount: 0 };
			var ctx = glob.ethersIoReserveFund.connect(glob.signer_a);
			ctx.twoWayTransfer(glob.user_c, inboundTx, outboundTx, { gasLimit: 600000 })
				.then((result) => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				})
		});

		it(testId() + ": MUST FAIL [twoWayTransfer]: Not enough aggregate balance for Outbound TX ", function (done) {

			const inboundTx = { tokenAddress: '0x0000000000000000000000000000000000000000', amount: ethers.utils.bigNumberify('1000000000000000000') };
			const outboundTx = { tokenAddress: glob.web3Erc20.address, amount: 9999 };
			var ctx = glob.ethersIoReserveFund.connect(glob.signer_a);
			ctx.twoWayTransfer(glob.user_c, inboundTx, outboundTx, { gasLimit: 600000 })
				.then((result) => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				})
		});

		it(testId() + ": MUST FAIL [twoWayTransfer]: Not enough wallet staged balance for Inbound TX ", function (done) {

			const inboundTx = { tokenAddress: '0x0000000000000000000000000000000000000000', amount: ethers.utils.bigNumberify('40000000000000000000000') };
			const outboundTx = { tokenAddress: glob.web3Erc20.address, amount: 1 };
			var ctx = glob.ethersIoReserveFund.connect(glob.signer_a);
			ctx.twoWayTransfer(glob.user_c, inboundTx, outboundTx, { gasLimit: 600000 })
				.then((result) => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				})
		});

		it(testId() + ": MUST SUCCEED [registerService]: Register a mock service  ", function (done) {
			glob.web3ReserveFund.registerService(MOCK_SERVICE_ADDRESS)
				.then(() => {
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});

		});

		it(testId() + ": MUST FAIL [registerService]: Cannot be called from non-owner address ", function (done) {
			glob.web3ReserveFund.registerService(MOCK_SERVICE_ADDRESS, { from: glob.user_a })
				.then(() => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
		});

		it(testId() + ": MUST FAIL [registerService]: Register a mock service twice  ", function (done) {
			glob.web3ReserveFund.registerService(MOCK_SERVICE_ADDRESS)
				.then(() => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});

		});

		it(testId() + ": MUST FAIL [deregisterService]: Cannot be called from non-owner address ", function (done) {
			glob.web3ReserveFund.deregisterService(MOCK_SERVICE_ADDRESS, { from: glob.user_a })
				.then(() => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
		});

		it(testId() + ": MUST SUCCEED [deregisterService]: Deregister a mock service  ", function (done) {
			glob.web3ReserveFund.deregisterService(MOCK_SERVICE_ADDRESS)
				.then(() => {
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it(testId() + ": MUST FAIL [deregisterService]: Deregister a non-existent or already unregistered service  ", function (done) {
			glob.web3ReserveFund.deregisterService(MOCK_SERVICE_ADDRESS)
				.then(() => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
		});

		it(testId() + ": MUST FAIL [closeAccrualPeriod]: Accrual period cannot be called by non-owner", function (done) {
			glob.web3ReserveFund.closeAccrualPeriod({ from: glob.user_c })
				.then((result) => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				})
		});

		it(testId() + ": MUST SUCCEED [closeAccrualPeriod]: Owner closes current accrual period", async () => {

			try {
				/* (!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!)
					
					   This issues  dummy TXs (pennies to B) to span the deposits over several blocks 
					   on Ganache/TestRPC with automining OFF.
		
					   May work different on TestNet (all TXs could perfectly be mined on the same block!) 
	
					   (!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!)				
				*/

				var tx0 = await sendTx(glob.user_d, glob.web3ReserveFund.address, web3.toWei(ETHER_DEPOSIT_AMOUNT_D[0]));
				await sendTx(glob.user_b, glob.web3ReserveFund.address, web3.toWei(0.00000001, 'ether'));
				var tx1 = await sendTx(glob.user_d, glob.web3ReserveFund.address, web3.toWei(ETHER_DEPOSIT_AMOUNT_D[1]));
				await sendTx(glob.user_b, glob.web3ReserveFund.address, web3.toWei(0.00000001, 'ether'));
				await sendTx(glob.user_b, glob.web3ReserveFund.address, web3.toWei(0.00000001, 'ether'));
				var tx2 = await sendTx(glob.user_d, glob.web3ReserveFund.address, web3.toWei(ETHER_DEPOSIT_AMOUNT_D[2]));
				await sendTx(glob.user_b, glob.web3ReserveFund.address, web3.toWei(0.00000001, 'ether'));

				etherDepositBlockNumber_userD[0] = await getTxBlock(tx0);
				etherDepositBlockNumber_userD[1] = await getTxBlock(tx1);
				etherDepositBlockNumber_userD[2] = await getTxBlock(tx2);

				// 	for (i = 0; i < etherDepositBlockNumber_userD.length; i++)
				// 		console.log("etherDeposit[" + i + "] of " + ETHER_DEPOSIT_AMOUNT_D[i] + "ETH @ block " + etherDepositBlockNumber_userD[i]);
			}
			catch (err) {
				assert(false, 'Cannot execute deposit for user D. Reason:  ' + err.toString());
			}

			try {
				const preCloseEthAccrual = await glob.web3ReserveFund.periodAccrualBalance(0);
				const preCloseTokenAccrual = await glob.web3ReserveFund.periodAccrualBalance(glob.web3Erc20.address);
				assert(preCloseEthAccrual.eq(0) == false, '(pre-CloseAccrual) periodAccrualBalance for ETH is zero');
				assert(preCloseTokenAccrual.eq(0) == false, '(pre-CloseAccrual) periodAccrualBalance for ERC20 is zero');

				await glob.web3ReserveFund.closeAccrualPeriod();

				lastAccrualBlock = web3.eth.blockNumber;

				const postCloseEthAccrual = await glob.web3ReserveFund.periodAccrualBalance(0);
				const postCloseTokenAccrual = await glob.web3ReserveFund.periodAccrualBalance(glob.web3Erc20.address);
				assert(postCloseEthAccrual.eq(0) == true, '(post-CloseAccrual) periodAccrualBalance for ETH is NOT zero but ' + postCloseEthAccrual);
				assert(postCloseTokenAccrual.eq(0) == true, '(post-CloseAccrual) periodAccrualBalance for ERC20 is NOT zero but ' + postCloseTokenAccrual);

			}
			catch (err) {
				assert(false, 'This test must succeed. Error is: ' + err.toString());
			}
		});

		it(testId() + ": MUST FAIL [claimAccrual]: User A claims accrual for a token without accrual deposits", (done) => {
			const MOCK_TOKEN_XYZ = '0xcafeefac0000dddd0000cccc0000bbbb0000aaaa';

			glob.web3ReserveFund.claimAccrual(MOCK_TOKEN_XYZ)
				.then(() => {
					done(new Error('This test must fail'));
				})
				.catch((err) => {
					done();
				});
		});

		it(testId() + ": MUST SUCCEED [claimAccrual]: User D claims ether accrual (use Active Balance)", async () => {

			// First we do a bunch of deposits for user D and record the block numbers 
			// -----------------------------------------------------------------------

			try {

				let BN = web3.BigNumber.another({ DECIMAL_PLACES: 0, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN });

				const bn_1e18 = new BN(_1e18);
				// bn_low = zero as no previous claims  for User D
				// bn_up  = the last block where owner deposited *any currency*

				const bn_low = new BN(0);
				const bn_up = new BN(lastAccrualBlock);

				// Balance blocks In. 

				var bbIn = await glob.web3ReserveFund.debugBalanceBlocksIn(glob.user_d, 0, bn_low, bn_up);
				bbIn = new BN(bbIn);

				var aggregateEtherBalance = await glob.web3ReserveFund.activeBalance(0, 0);
				aggregateEtherBalance = new BN(aggregateEtherBalance);

				var aggregateAccrualBalance = await glob.web3ReserveFund.aggregateAccrualBalance(0);
				aggregateAccrualBalance = new BN(aggregateAccrualBalance);

				var userBalance = await glob.web3ReserveFund.activeBalance(glob.user_d, 0);
				userBalance = new BN(userBalance);

				// console.log("bn_low=" + bn_low + " bn_up=" + bn_up + " bbIn=" + bbIn);

				// console.log("activeBalance=" + aggregateEtherBalance + " accrualBalance=" + aggregateAccrualBalance);
				// console.log("userBalance=" + userBalance);

				let fraction = bbIn.mul(bn_1e18).mul(aggregateAccrualBalance).div(aggregateEtherBalance.mul(bn_up.sub(bn_low)).mul(bn_1e18));
				let amount = fraction.mul(aggregateAccrualBalance).div(bn_1e18);

				// console.log("f= " + fraction + " amount = " + amount);

				const expectedPostAggregateEtherBalance = aggregateEtherBalance.sub(amount);
				const expectedPostUserBalance = userBalance.add(amount);
				const expectedPostAggregateAccrualBalance = aggregateAccrualBalance;

				await glob.web3ReserveFund.claimAccrual('0x0000000000000000000000000000000000000000', true, { from: glob.user_d });

				//
				// Check post-claim balances
				//
				var postAggregateEtherBalance = await glob.web3ReserveFund.activeBalance(0, 0);
				var postAggregateAccrualBalance = await glob.web3ReserveFund.aggregateAccrualBalance(0);
				var postUserBalance = await glob.web3ReserveFund.activeBalance(glob.user_d, 0);

				// console.log('post Aggregate (active) ETH balance =' + postAggregateEtherBalance);
				// console.log('post Accrual balance =' + postAggregateAccrualBalance);
				// console.log('post Active User balance =' + postUserBalance);


				assert(expectedPostAggregateEtherBalance.eq(postAggregateEtherBalance),
					'Post aggregate-ETH balance differs: ' + postAggregateEtherBalance + ' but expected:' + expectedPostAggregateEtherBalance);
				assert(expectedPostAggregateAccrualBalance.eq(postAggregateAccrualBalance),
					'Post accrual-ETH balance differs: ' + postAggregateAccrualBalance + ' but expected:' + expectedPostAggregateAccrualBalance);
				assert(expectedPostUserBalance.eq(postUserBalance),
					'Post active-ETH  user balance differs: ' + postUserBalance + ' but expected:' + web3.toWei(expectedPostUserBalance));
			}

			catch (err) {
				assert(false, 'This test must succeed. Error is: ' + err.toString());

			}
		});
	});
};
