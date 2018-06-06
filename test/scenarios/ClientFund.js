var Helpers = require('../helpers');

module.exports = function (glob) {
	var testCounter = Helpers.TestCounter();

	describe("ClientFund", function () {
		it(testCounter.next() + ": MUST SUCCEED [payable]: add 2.5 Ethers to user A deposited balance", async() => {
			try {
				await web3.eth.sendTransactionPromise({
						from: glob.user_a,
						to: glob.web3ClientFund.address,
						value: web3.toWei(2.5, 'ether'),
						gas: glob.gasLimit
					});
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [payable]: add 6.5 Ethers to user B deposited balance", async() => {
			try {
				await web3.eth.sendTransactionPromise({
						from: glob.user_b,
						to: glob.web3ClientFund.address,
						value: web3.toWei(6.5, 'ether'),
						gas: glob.gasLimit
					});
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		// it(testCounter.next() + ": MUST FAIL [payable]: Cannot be called from owner", async() => {
		// 	try {
		// 		await web3.eth.sendTransactionPromise({
		// 				from: glob.owner,
		// 				to: glob.web3ClientFund.address,
		// 				value: web3.toWei(10, 'ether'),
		// 				gas: glob.gasLimit
		// 			});
		// 		assert(false, 'This test must fail.');
		// 	}
		// 	catch (err) {
		// 		assert(err.toString().includes('revert'), err.toString());
		// 	}
		// });

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [payable]: cannot be called with 0 ethers", async() => {
			try {
				await web3.eth.sendTransactionPromise({
						from: glob.user_a,
						to: glob.web3ClientFund.address,
						value: web3.toWei(0, 'ether'),
						gas: glob.gasLimit
					});
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositTokens]: 10 tokens added to A deposited balance", async() => {
			try {
				await glob.web3Erc20.approve(glob.web3ClientFund.address, 10, { from: glob.user_a });
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
			try {
				await glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 10, { from: glob.user_a });
			}
			catch (err) {
				assert(false, 'This test must succeed. Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called from owner address", async() => {
			try {
				await glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 5, { from: glob.owner });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called with zero address", async() => {
			try {
				await glob.web3ClientFund.depositTokens(0, 5, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called with zero amount", async() => {
			try {
				await glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 0, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: User does not have enough tokens to deposit.", async() => {
			try {
				await glob.web3Erc20.approve(glob.web3ClientFund.address, 9999, { from: glob.user_a });
			}
			catch (err) {
				assert(false, 'Error: ERC20 failed to approve token transfer.');
			}
			try {
				await glob.web3ClientFund.depositTokens(glob.web3Erc20.address, 9999, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositCount]: User A should have 2 deposits", async() => {
			try {
				let count = await glob.web3ClientFund.depositCount(glob.user_a);
				assert.equal(count, 2, 'This test must succeed. Error: Deposit count: ' + count.toString());
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositCount]: User B should have 1 deposit", async() => {
			try {
				let count = await glob.web3ClientFund.depositCount(glob.user_b);
				assert.equal(count, 1, 'This test must succeed. Error: Deposit count: ' + count.toString());
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositCount]: Cannot be called from non-owner address", async() => {
			try {
				await glob.web3ClientFund.depositCount(glob.user_a, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [deposit]: User B should have 6.5 ETH at index 0", async() => {
			try {
				let args = await glob.web3ClientFund.deposit(glob.user_b, 0);
				const _amount = args[0];
				const _timestamp = args[1];
				const _token = args[2];

				assert.equal(_token, 0, "Unexpected token deposit.");
				assert.equal(_amount, web3.toWei(6.5, 'ether'), "Unexpected ether deposit amount.");
				assert.notEqual(_timestamp, 0, "Timestamp cannot be null.");
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [deposit]: Invalid index deposit 1 for user B.", async() => {
			try {
				await glob.web3ClientFund.deposit(glob.user_b, 1);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [deposit]: User A should have 10 tokens at index 1", async() => {
			try {
				let args = await glob.web3ClientFund.deposit(glob.user_a, 1);
				const _amount = args[0];
				const _timestamp = args[1];
				const _token = args[2];

				assert.equal(_token, glob.web3Erc20.address, "Unexpected ether or other token deposit.");
				assert.equal(_amount, 10, "Unexpeced token deposit amount.");
				assert.notEqual(_timestamp, 0, "Timestamp cannot be null.");
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositedBalance]: 2.5 ETH for User A", async() => {
			try {
				let balance = await glob.web3ClientFund.depositedBalance(glob.user_a, 0);
				assert.equal(balance, web3.toWei(2.5, 'ether'), 'Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositedBalance]: 10 tokens for User A", async() => {
			try {
				let balance = await glob.web3ClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address);
				assert.equal(balance, 10, 'Wrong balance [' + balance.toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositedBalance]: 0 tokens for User B", async() => {
			try {
				let balance = await glob.web3ClientFund.depositedBalance(glob.user_b, glob.web3Erc20.address);
				assert.equal(balance, 0, 'Wrong balance [' + balance.toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stagedBalance]: 0 ETH for User A", async() => {
			try {
				let balance = await glob.web3ClientFund.stagedBalance(glob.user_a, 0);
				assert.equal(balance, web3.toWei(0, 'ether'), 'Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stagedBalance]: 0 tokens for User A", async() => {
			try {
				let balance = await glob.web3ClientFund.stagedBalance(glob.user_a, glob.web3Erc20.address);
				assert.equal(balance, 0, 'Wrong balance [' + balance.toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stagedBalance]: 0 tokens for User B", async() => {
			try {
				let balance = await glob.web3ClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address);
				assert.equal(balance, 0, 'Wrong balance [' + balance.toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [setServiceActivationTimeout]: Set the service activation timeout to 5 seconds", async() => {
			try {
				await glob.web3ClientFund.setServiceActivationTimeout(5);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [setServiceActivationTimeout]: Non-owner trying to set the service activation timeout", async() => {
			try {
				await glob.web3ClientFund.setServiceActivationTimeout(30, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [registerService]: Register ReserveFunds SC as a service", async() => {
			try {
				await glob.web3ClientFund.registerService(glob.web3ReserveFund.address);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [registerService]: Register ClientFund SC as a service", async() => {
			try {
				await glob.web3ClientFund.registerService(glob.web3ClientFund.address);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [registerService]: Register UnitTestHelpers_FAIL SC as a service from non-owner", async() => {
			try {
				await glob.web3ClientFund.registerService(glob.web3UnitTestHelpers_FAIL_TESTS.address, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [registerService]: Register UnitTestHelpers_SUCCESS SC as a service", async() => {
			try {
				await glob.web3ClientFund.registerService(glob.web3UnitTestHelpers_SUCCESS_TESTS.address);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [registerService]: Register UnitTestHelpers_FAIL SC as a service", async() => {
			try {
				await glob.web3ClientFund.registerService(glob.web3UnitTestHelpers_FAIL_TESTS.address);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [disableRegisteredService]: Disable UnitTestHelpers_FAIL as a service for User A", async() => {
			try {
				await glob.web3ClientFund.disableRegisteredService(glob.web3UnitTestHelpers_FAIL_TESTS.address, { from: glob.user_a });
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [transferFromDepositedToSettledBalance]: User A uses UnitTestHelpers_SUCCESS as a service to send 0.2 ETH to User D but before timeout", async() => {
			try {
				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToTransferFromDepositedToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.2, 'ether'), 0);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [transferFromDepositedToSettledBalance]: User A uses UnitTestHelpers_SUCCESS as a service to send 0.2 ETH to User D", async() => {
			try {
				await Helpers.sleep(5000);

				let oldDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_a, 0);
				let oldSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, 0);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToTransferFromDepositedToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.2, 'ether'), 0);

				let newDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_a, 0);
				let newSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, 0);

				assert.equal(newSettledBalance.sub(oldSettledBalance), web3.toWei(0.2, 'ether'), 'Wrong settled balance [Diff ' + web3.fromWei(newSettledBalance.sub(oldSettledBalance), 'ether') + ' ethers].');
				assert.equal(newDepositedBalance.sub(oldDepositedBalance), web3.toWei(-0.2, 'ether'), 'Wrong deposited balance [Diff ' + web3.fromWei(newDepositedBalance.sub(oldDepositedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [transferFromDepositedToSettledBalance]: User A disabled UnitTestHelpers_FAIL as a service to send 0.2 ETH to User D", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToTransferFromDepositedToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.2, 'ether'), 0);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [transferFromDepositedToSettledBalance]: User A uses UnitTestHelpers_SUCCESS as a service to send 6 tokens to User D", async() => {
			try {
				let oldDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address);
				let oldSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, glob.web3Erc20.address);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToTransferFromDepositedToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.user_d, 6, glob.web3Erc20.address);

				let newDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address);
				let newSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, glob.web3Erc20.address);

				assert.equal(newSettledBalance.sub(oldSettledBalance), 6, 'Wrong settled balance [Diff ' + newSettledBalance.sub(oldSettledBalance).toString() + ' tokens].');
				assert.equal(newDepositedBalance.sub(oldDepositedBalance), -6, 'Wrong deposited balance [Diff ' + newDepositedBalance.sub(oldDepositedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [transferFromDepositedToSettledBalance]: User A disabled UnitTestHelpers_FAIL as a service to send 6 tokens to User D", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToTransferFromDepositedToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.user_d, 6, glob.web3Erc20.address);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [withdrawFromDepositedBalance]: User A uses UnitTestHelpers_SUCCESS as a service to withdraw 0.3 ETH to User D", async() => {
			try {
				let oldDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_a, 0);
				let oldEthersBalance = await web3.eth.getBalancePromise(glob.user_d);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToWithdrawFromDepositedBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.3, 'ether'), 0);

				let newDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_a, 0);
				let newEthersBalance = await web3.eth.getBalancePromise(glob.user_d);

				assert.equal(newEthersBalance.sub(oldEthersBalance), web3.toWei(0.3, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newEthersBalance.sub(oldEthersBalance), 'ether') + ' ethers].');
				assert.equal(newDepositedBalance.sub(oldDepositedBalance), web3.toWei(-0.3, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newDepositedBalance.sub(oldDepositedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [withdrawFromDepositedBalance]: User A disabled unit test helper SC as a service to withdraw 0.3 ETH to User D", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToWithdrawFromDepositedBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.3, 'ether'), 0);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositEthersToSettledBalance]: UnitTestHelpers_SUCCESS deposits 0.4 ETH to User C", async() => {
			try {
				let oldSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_c, 0);
				let oldEthersBalance = await web3.eth.getBalancePromise(glob.web3ClientFund.address);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToDepositEthersToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_c, { value: web3.toWei(0.4, 'ether') });

				let newSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_c, 0);
				let newEthersBalance = await web3.eth.getBalancePromise(glob.web3ClientFund.address);

				assert.equal(newEthersBalance.sub(oldEthersBalance), web3.toWei(0.4, 'ether'), 'Wrong SC balance [Diff ' + web3.fromWei(newEthersBalance.sub(oldEthersBalance), 'ether') + ' ethers].');
				assert.equal(newSettledBalance.sub(oldSettledBalance), web3.toWei(0.4, 'ether'), 'Wrong settled balance [Diff ' + web3.fromWei(newSettledBalance.sub(oldSettledBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositEthersToSettledBalance]: UnitTestHelpers_FAIL deposits 0.4 ETH to User A", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToDepositEthersToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, { value: web3.toWei(0.4, 'ether') });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositTokensToSettledBalance]: UnitTestHelpers_SUCCESS deposits 4 tokens to User D", async() => {
			try {
				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToApprove_ERC20(glob.web3Erc20.address, glob.web3ClientFund.address, 4);
			}
			catch (err) {
				assert(false, 'Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']');
			}
			try {
				let oldSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, glob.web3Erc20.address);
				let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.web3UnitTestHelpers_SUCCESS_TESTS.address);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToDepositTokensToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_d, glob.web3Erc20.address, 4);

				let newSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, glob.web3Erc20.address);
				let newTokensBalance = await glob.web3Erc20.balanceOf(glob.web3UnitTestHelpers_SUCCESS_TESTS.address);

				assert.equal(newTokensBalance.sub(oldTokensBalance), -4, 'Wrong SC balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
				assert.equal(newSettledBalance.sub(oldSettledBalance), 4, 'Wrong balance [Diff ' + newSettledBalance.sub(oldSettledBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokensToSettledBalance]: UnitTestHelpers_FAIL deposits 4 tokens to User A", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToApprove_ERC20(glob.web3Erc20.address, glob.web3ClientFund.address, 4);
			}
			catch (err) {
				assert(false, 'Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']');
			}
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToDepositTokensToSettledBalance_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.web3Erc20.address, 4);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stage]: User D wants to stage 0.2 ETH", async() => {
			try {
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, 0);
				let oldSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, 0);

				let result = await glob.web3ClientFund.stage(web3.toWei(0.2, 'ether'), 0, { from: glob.user_d });

				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, 0);
				let newSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, 0);

				assert.equal(oldSettledBalance.sub(newSettledBalance), web3.toWei(0.2, 'ether'), 'Wrong settled balance [Diff ' + web3.fromWei(oldSettledBalance.add(newSettledBalance), 'ether') + ' ethers].');
				assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(0.2, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stage]: User D wants to stage 3 tokens", async() => {
			try {
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
				let oldSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, glob.web3Erc20.address);

				let result = await glob.web3ClientFund.stage(3, glob.web3Erc20.address, { from: glob.user_d });
				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
				let newSettledBalance = await glob.web3ClientFund.settledBalance(glob.user_d, glob.web3Erc20.address);

				assert.equal(oldSettledBalance.sub(newSettledBalance), 3, 'Wrong settled balance [Diff ' + oldSettledBalance.add(newSettledBalance).toString() + ' tokens].');
				assert.equal(newStagedBalance.sub(oldStagedBalance), 3, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [stageTo]: User D now wants to stage 0.2 ETH to ReserveFunds (without being registered as beneficiary)", async() => {
			try {
				let result = await glob.web3ClientFund.stageTo(web3.toWei(0.2, 'ether'), 0, glob.web3ReserveFund.address, { from: glob.user_d });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [stageTo]: User D now wants to stage 3 tokens to ReserveFunds (without being registered as beneficiary)", async() => {
			try {
				let result = await glob.web3ClientFund.stageTo(3, glob.web3Erc20.address, glob.web3ReserveFund.address, { from: glob.user_d });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [registerBeneficiary]: Called from a non-onwer", async() => {
			try {
				let result = await glob.web3ClientFund.registerBeneficiary(glob.web3ReserveFund.address, { from: glob.user_d });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [registerBeneficiary]: Register ReserveFunds as a beneficiary of ClientFunds", async() => {
			try {
				let result = await glob.web3ClientFund.registerBeneficiary(glob.web3ReserveFund.address);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [withdrawEthers]: User D wants to withdraw 0.1 ETH", async() => {
			try {
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, 0);
				let oldEthersBalance = await web3.eth.getBalancePromise(glob.user_d);

				let result = await glob.web3ClientFund.withdrawEthers(web3.toWei(0.1, 'ether'), { from: glob.user_d });

				let tx = web3.eth.getTransaction(result.tx);
				let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
				totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, 0);
				let newEthersBalance = await web3.eth.getBalancePromise(glob.user_d);

				assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), web3.toWei(0.1, 'ether'), 'Wrong user D balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
				assert.equal(oldStagedBalance.sub(newStagedBalance), web3.toWei(0.1, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(oldStagedBalance.sub(newStagedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [withdrawTokens]: User D wants to withdraw 2 tokens", async() => {
			try {
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
				let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.user_d);

				let result = await glob.web3ClientFund.withdrawTokens(2, glob.web3Erc20.address, { from: glob.user_d });

				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
				let newTokensBalance = await glob.web3Erc20.balanceOf(glob.user_d);

				assert.equal(newTokensBalance.sub(oldTokensBalance), 2, 'Wrong user D balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
				assert.equal(oldStagedBalance.sub(newStagedBalance), 2, 'Wrong staged balance [Diff ' + oldStagedBalance.sub(newStagedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [withdrawEthers]: User D now wants to withdraw 0.5 ETH", async() => {
			try {
				await glob.web3ClientFund.withdrawEthers(web3.toWei(0.5, 'ether'), { from: glob.user_d });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [withdrawTokens]: User D now wants to withdraw 20 tokens", async() => {
			try {
				await glob.web3ClientFund.withdrawTokens(20, glob.web3Erc20.address, { from: glob.user_d });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [unstage]: User D wants to unstage 0.1 ETH", async() => {
			try {
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, 0);
				let oldDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_d, 0);

				let result = await glob.web3ClientFund.unstage(web3.toWei(0.1, 'ether'), 0, { from: glob.user_d });

				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, 0);
				let newDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_d, 0);

				assert.equal(newDepositedBalance.sub(oldDepositedBalance), web3.toWei(0.1, 'ether'), 'Wrong deposited balance [Diff ' + web3.fromWei(newDepositedBalance.add(oldDepositedBalance), 'ether') + ' ethers].');
				assert.equal(oldStagedBalance.sub(newStagedBalance), web3.toWei(0.1, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(oldStagedBalance.sub(newStagedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [unstage]: User D wants to unstage 1 token", async() => {
			try {
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
				let oldDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_d, glob.web3Erc20.address);

				let result = await glob.web3ClientFund.unstage(1, glob.web3Erc20.address, { from: glob.user_d });

				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
				let newDepositedBalance = await glob.web3ClientFund.depositedBalance(glob.user_d, glob.web3Erc20.address);

				assert.equal(newDepositedBalance.sub(oldDepositedBalance), 1, 'Wrong deposited balance [Diff ' + newDepositedBalance.add(oldDepositedBalance).toString() + ' tokens].');
				assert.equal(oldStagedBalance.sub(newStagedBalance), 1, 'Wrong staged balance [Diff ' + oldStagedBalance.sub(newStagedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [withdrawEthers]: User A wants to withdraw 0.1 ETH", async() => {
			try {
				await glob.web3ClientFund.withdrawEthers(web3.toWei(0.1, 'ether'), { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [withdrawTokens]: User A wants to withdraw 10 tokens", async() => {
			try {
				await glob.web3ClientFund.withdrawTokens(10, glob.web3Erc20.address, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [seizeDepositedAndSettledBalances]: Call from a non-registered service", async() => {
			try {
				await glob.web3ClientFund.seizeDepositedAndSettledBalances(glob.user_a, glob.user_b, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [seizeDepositedAndSettledBalances]: Seize User A funds into User B account", async() => {
			try {
				let oldDepositedEthersBalance_UserA = await glob.web3ClientFund.depositedBalance(glob.user_a, 0);
				let oldSettledEthersBalance_UserA = await glob.web3ClientFund.settledBalance(glob.user_a, 0);
				let oldStagedEthersBalance_UserB = await glob.web3ClientFund.stagedBalance(glob.user_b, 0);

				let oldDepositedTokensBalance_UserA = await glob.web3ClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address);
				let oldSettledTokensBalance_UserA = await glob.web3ClientFund.settledBalance(glob.user_a, glob.web3Erc20.address);
				let oldStagedTokensBalance_UserB = await glob.web3ClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToSeizeDepositedAndSettledBalances_CLIENTFUND(glob.web3ClientFund.address, glob.user_a, glob.user_b);

				let newDepositedEthersBalance_UserA = await glob.web3ClientFund.depositedBalance(glob.user_a, 0);
				let newSettledEthersBalance_UserA = await glob.web3ClientFund.settledBalance(glob.user_a, 0);
				let newStagedEthersBalance_UserB = await glob.web3ClientFund.stagedBalance(glob.user_b, 0);

				let newDepositedTokensBalance_UserA = await glob.web3ClientFund.depositedBalance(glob.user_a, glob.web3Erc20.address);
				let newSettledTokensBalance_UserA = await glob.web3ClientFund.settledBalance(glob.user_a, glob.web3Erc20.address);
				let newStagedTokensBalance_UserB = await glob.web3ClientFund.stagedBalance(glob.user_b, glob.web3Erc20.address);

				assert.equal(newDepositedEthersBalance_UserA, web3.toWei(0, 'ether'), 'Wrong deposited balance [Diff ' + web3.fromWei(newDepositedEthersBalance_UserA, 'ether') + ' ethers].');
				assert.equal(newSettledEthersBalance_UserA, web3.toWei(0, 'ether'), 'Wrong settled balance [Diff ' + web3.fromWei(newSettledEthersBalance_UserA, 'ether') + ' ethers].');
				assert.equal(newDepositedTokensBalance_UserA, 0, 'Wrong deposited balance [Diff ' + newDepositedTokensBalance_UserA.toString() + ' tokens].');
				assert.equal(newSettledTokensBalance_UserA, 0, 'Wrong settled balance [Diff ' + newDepositedTokensBalance_UserA.toString() + ' tokens].');

				assert.equal(oldStagedEthersBalance_UserB.add(oldDepositedEthersBalance_UserA).add(oldSettledEthersBalance_UserA), newStagedEthersBalance_UserB.toString(),
				             'Wrong staged balance [Diff ' + web3.fromWei(newStagedEthersBalance_UserB.sub(oldStagedEthersBalance_UserB.add(oldDepositedEthersBalance_UserA).add(oldSettledEthersBalance_UserA)), 'ether') + ' ethers].');

				assert.equal(oldStagedTokensBalance_UserB.add(oldDepositedTokensBalance_UserA).add(oldSettledTokensBalance_UserA), newStagedTokensBalance_UserB.toString(),
				             'Wrong staged balance [Diff ' + newStagedTokensBalance_UserB.sub(oldStagedTokensBalance_UserB.add(oldDepositedTokensBalance_UserA).add(oldSettledTokensBalance_UserA).toString()) + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});
	});
};
