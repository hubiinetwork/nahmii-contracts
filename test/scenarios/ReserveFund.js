module.exports = function (glob) {

	describe("ReserveFund", function () {

		// Local test-wide variables

		const tokenDepositAmount_userA = 5;
		
		var tokenDepositBlockNumber_userA = -1;

		it("T001: MUST SUCCEED [payable]", function (done) {
			web3.eth.sendTransaction({
				from: glob.owner,
				to: glob.web3ReserveFund.address,
				value: web3.toWei(10, 'ether'),
				gas: glob.gasLimit
			},
			function (err) {
				done(err == null ? null : new Error('This test must succeed. Error is: ' + err.toString()));
			});
		});

		it("T002: MUST SUCCEED [depositToken]: User A deposits 5 tokens", function (done) {
			web3ReserveFund.depositTokens(glob.web3Erc20, tokenDepositAmount_userA, { from: glob.user_a })
				.then( (result) => {
					tokenDepositBlockNumber_userA = result.receipt.blockNumber;
					done();
				} )
				.catch( (err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				} );
		});

		it("T003: MUST SUCCEED [deposit]: User A deposit at index 0 is 5 tokens", function (done) {
			web3ReserveFund.deposit(glob.user_a, 0)
				.then((depositData) => {
					if (depositData[0] != tokenDepositAmount_userA) {
						done (new Error('This test must succeed. Error: Amount differs: ' + 
						tokenDepositAmount_userA + ' != ' + depositData[0] ));
					}
					if (depositData[1] != glob.web3.web3Erc20.address) {
						done (new Error('This test must succeed. Error: Token address differs: ' + 
						glob.web3.web3Erc20.address + ' != ' + depositData[1] ));
					}
					if (depositData[2] != tokenDepositBlockNumber_userA) {
						done (new Error('This test must succeed. Error: Block number differs: ' + 
						tokenDepositBlockNumber_userA + ' != ' + depositData[2] ));
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it("T004: MUST SUCCEED [depositCount]: User A deposit count equals 1", function (done) {
			web3ReserveFund.depositCount(glob.user_a)
				.then((depositCount) => {
					if (depositCount != 1) {
						done (new Error('This test must succeed. Error: Deposit count differs: ' + 
						depositCount + ' != 1' ));
					}
					done();
				})
				.catch((err) => {
					done(new Error('This test must succeed. Error is: ' + err.toString()));
				});
		});

		it("T005: MUST SUCCEED [periodAccrualBalance]", function (done) {
			done();
		});

		it("T006: MUST SUCCEED [aggregateAccrualBalance]", function (done) {
			done();
		});

		it("T007: MUST SUCCEED [closeAccrualPeriod]", function (done) {
			done();
		});

		it("T008: MUST SUCCEED [claimAccrual]", function (done) {
			done();
		});

		it("T009: MUST SUCCEED [stage]", function (done) {
			done();
		});

		it("T010: MUST SUCCEED [stagedBalance]", function (done) {
			done();
		});

		it("T011: MUST SUCCEED [activeBalance]", function (done) {
			done();
		});

		it("T012: MUST SUCCEED [withdrawEther]", function (done) {
			done();
		});

		it("T013: MUST SUCCEED [withdrawTokens]", function (done) {
			done();
		});
	});
};
