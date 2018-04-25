module.exports = function (glob) {

	describe("ReserveFund", function () {

		// Local test-wide variables

		const TOKEN_DEPOSIT_AMOUNT_A = 5;
		const TOKEN_STAGE_AMOUNT_A = 1;
		const ETHER_DEPOSIT_AMOUNT_OWNER = 3;

		var tokenDepositBlockNumber_userA = -1;

		it("T001: MUST SUCCEED [payable]: Owner deposits " + ETHER_DEPOSIT_AMOUNT_OWNER + "ETH", function (done) {
			web3.eth.sendTransaction({
				from: glob.owner,
				to: glob.web3ReserveFund.address,
				value: web3.toWei(ETHER_DEPOSIT_AMOUNT_OWNER, 'ether'),
				gas: glob.gasLimit
			},
				function (err) {
					done(err == null ? null : new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it("T002: MUST SUCCEED [depositToken]: User A deposits 5 tokens", function (done) {
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

		it("T003: MUST SUCCEED [deposit]: User A deposit at index 0 is 5 tokens", function (done) {
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

		it("T004: MUST SUCCEED [depositCount]: User A deposit count equals 1", function (done) {
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

		it("T005: MUST SUCCEED [periodAccrualBalance]: Period accrual balance equals" + ETHER_DEPOSIT_AMOUNT_OWNER + " ETH", async () => {
			try {
				let balance = await glob.web3ReserveFund.periodAccrualBalance(0);
				if (balance != web3.toWei(ETHER_DEPOSIT_AMOUNT_OWNER, 'ether')) {
					throw(new Error('This test must succeed. Error: Period Accrual differs: ' +
						balance + ' != ' + ETHER_DEPOSIT_AMOUNT_OWNER));
				}
			}
			catch(err) 
			{
				if (err instanceof Error) {
					throw err;
				}
				throw new Error('This test must succeed. Error is: ' + err.toString());
			}
		});

		it("T006: MUST SUCCEED [aggregateAccrualBalance]: Aggregate accrual balance equals " +  ETHER_DEPOSIT_AMOUNT_OWNER  + "ETH", function (done) {
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

		it("T007: MUST SUCCEED [closeAccrualPeriod]", function (done) {
			done();
		});

		it("T008: MUST SUCCEED [claimAccrual]", function (done) {
			done();
		});

		it("T009: MUST SUCCEED [stage]: User A stages " + TOKEN_STAGE_AMOUNT_A + " token units", function (done) {
			glob.web3ReserveFund.stage(glob.web3Erc20.address, TOKEN_STAGE_AMOUNT_A, { from: glob.user_a })
				.then(() => {
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it("T010: MUST SUCCEED [stagedBalance]: User A staged balance equals " + TOKEN_STAGE_AMOUNT_A + " tokens", function (done) {
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

		it("T011: MUST SUCCEED [activeBalance]: User A active balance equals " + (TOKEN_DEPOSIT_AMOUNT_A - TOKEN_STAGE_AMOUNT_A) + " tokens", function (done) {
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

		it("T012: MUST SUCCEED [withdrawEther]", function (done) {
			done();
		});

		it("T013: MUST SUCCEED [withdrawTokens]", function (done) {
			done();
		});
	});
};
