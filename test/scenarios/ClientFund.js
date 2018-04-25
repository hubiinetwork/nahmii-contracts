var Helpers = require('../helpers');

module.exports = function (glob) {
	var testCounter = Helpers.TestCounter();

	describe("ClientFund", function () {
		it(testCounter.next() + ": MUST FAIL [payable]: cannot be called from owner", async() => {
			try {
				await web3.eth.sendTransactionPromise({
						from: glob.owner,
						to: glob.web3ClientFund.address,
						value: web3.toWei(10, 'ether'),
						gas: glob.gasLimit
					});
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

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

		it(testCounter.next() + ": MUST SUCCEED [payable]: add 2.5 Ethers to user A active balance", async() => {
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

		it(testCounter.next() + ": MUST SUCCEED [payable]: add 6.5 Ethers to user B active balance", async() => {
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

		it(testCounter.next() + ": MUST SUCCEED [depositTokens]: 10 tokens added to A active balance", async() => {
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

		it(testCounter.next() + ": MUST SUCCEED [activeBalance]: 2.5 ETH for User A", async() => {
			try {
				let balance = await glob.web3ClientFund.activeBalance(glob.user_a, 0);
				assert.equal(balance, web3.toWei(2.5, 'ether'), 'Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [activeBalance]: 10 tokens for User A", async() => {
			try {
				let balance = await glob.web3ClientFund.activeBalance(glob.user_a, glob.web3Erc20.address);
				assert.equal(balance, 10, 'Wrong balance [' + balance.toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [activeBalance]: 0 tokens for User B", async() => {
			try {
				let balance = await glob.web3ClientFund.activeBalance(glob.user_b, glob.web3Erc20.address);
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

		it(testCounter.next() + ": MUST SUCCEED [setServiceActivationTimeout]: Set the service activation timeout to 0", async() => {
			try {
				await glob.web3ClientFund.setServiceActivationTimeout(0);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
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

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [transferFromActiveToStagedBalance]: User A uses UnitTestHelpers_SUCCESS as a service to send 0.2 ETH to User D", async() => {
			try {
				let oldActiveBalance = await glob.web3ClientFund.activeBalance(glob.user_a, 0);
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, 0);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToTransferFromActiveToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.2, 'ether'), 0);

				let newActiveBalance = await glob.web3ClientFund.activeBalance(glob.user_a, 0);
				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, 0);

				assert.equal(newStagedBalance - oldStagedBalance, web3.toWei(0.2, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance - oldStagedBalance, 'ether') + ' ethers].');
				assert.equal(oldActiveBalance - newActiveBalance, web3.toWei(0.2, 'ether'), 'Wrong active balance [Diff ' + web3.fromWei(oldActiveBalance - newActiveBalance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [transferFromActiveToStagedBalance]: User A disabled UnitTestHelpers_FAIL as a service to send 0.2 ETH to User D", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToTransferFromActiveToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.2, 'ether'), 0);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [transferFromActiveToStagedBalance]: User A uses UnitTestHelpers_SUCCESS as a service to send 6 tokens to User D", async() => {
			try {
				let oldActiveBalance = await glob.web3ClientFund.activeBalance(glob.user_a, glob.web3Erc20.address);
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToTransferFromActiveToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, 6, glob.web3Erc20.address);

				let newActiveBalance = await glob.web3ClientFund.activeBalance(glob.user_a, glob.web3Erc20.address);
				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);

				assert.equal(newStagedBalance - oldStagedBalance, 6, 'Wrong staged balance [Diff ' + (newStagedBalance - oldStagedBalance).toString() + ' tokens].');
				assert.equal(oldActiveBalance - newActiveBalance, 6, 'Wrong active balance [Diff ' + (oldActiveBalance - newActiveBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [transferFromActiveToStagedBalance]: User A disabled UnitTestHelpers_FAIL as a service to send 6 tokens to User D", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToTransferFromActiveToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, 6, glob.web3Erc20.address);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [withdrawFromActiveBalance]: User A uses UnitTestHelpers_SUCCESS as a service to withdraw 0.3 ETH to User D", async() => {
			try {
				let oldActiveBalance = await glob.web3ClientFund.activeBalance(glob.user_a, 0);
				let oldEthersBalance = await web3.eth.getBalancePromise(glob.user_d);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToWithdrawFromActiveBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.3, 'ether'), 0);

				let newActiveBalance = await glob.web3ClientFund.activeBalance(glob.user_a, 0);
				let newEthersBalance = await web3.eth.getBalancePromise(glob.user_d);

				assert.equal(newEthersBalance - oldEthersBalance, web3.toWei(0.3, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newEthersBalance - oldEthersBalance, 'ether') + ' ethers].');
				assert.equal(oldActiveBalance - newActiveBalance, web3.toWei(0.3, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(oldActiveBalance - newActiveBalance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [withdrawFromActiveBalance]: User A disabled unit test helper SC as a service to withdraw 0.3 ETH to User D", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToWithdrawFromActiveBalance(glob.web3ClientFund.address, glob.user_a, glob.user_d, web3.toWei(0.3, 'ether'), 0);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositEthersToStagedBalance]: UnitTestHelpers_SUCCESS deposits 0.4 ETH to User C", async() => {
			try {
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_c, 0);
				let oldEthersBalance = await web3.eth.getBalancePromise(glob.web3ClientFund.address);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToDepositEthersToStagedBalance(glob.web3ClientFund.address, glob.user_c, { value: web3.toWei(0.4, 'ether') });

				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_c, 0);
				let newEthersBalance = await web3.eth.getBalancePromise(glob.web3ClientFund.address);

				assert.equal(newEthersBalance - oldEthersBalance, web3.toWei(0.4, 'ether'), 'Wrong SC balance [Diff ' + web3.fromWei(newEthersBalance - oldEthersBalance, 'ether') + ' ethers].');
				assert.equal(newStagedBalance - oldStagedBalance, web3.toWei(0.4, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newStagedBalance - oldStagedBalance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositEthersToStagedBalance]: UnitTestHelpers_FAIL deposits 0.4 ETH to User A", async() => {
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToDepositEthersToStagedBalance(glob.web3ClientFund.address, glob.user_a, { value: web3.toWei(0.4, 'ether') });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------
/*
		it(testCounter.next() + ": MUST SUCCEED [depositTokensToStagedBalance]: UnitTestHelpers_SUCCESS deposits 4 tokens to User D", async() => {
			try {
				await glob.web3Erc20.approve(glob.web3ClientFund.address, 4, { from: glob.web3UnitTestHelpers_SUCCESS_TESTS.address });
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
			try {
				let oldStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
				let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.web3ClientFund.address);

				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToDepositTokensToStagedBalance(glob.web3ClientFund.address, glob.user_d, glob.web3Erc20.address, 4);

				let newStagedBalance = await glob.web3ClientFund.stagedBalance(glob.user_d, glob.web3Erc20.address);
				let newTokensBalance = await glob.web3Erc20.balanceOf(glob.web3ClientFund.address);

				assert.equal(newTokensBalance - oldTokensBalance, 4, 'Wrong SC balance [Diff ' + (newTokensBalance - oldTokensBalance).toString() + ' tokens].');
				assert.equal(newStagedBalance - oldStagedBalance, 4, 'Wrong balance [Diff ' + (newStagedBalance - oldStagedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokensToStagedBalance]: UnitTestHelpers_FAIL deposits 4 tokens to User A", async() => {
			try {
				await glob.web3Erc20.approve(glob.web3ClientFund.address, 4, { from: glob.web3UnitTestHelpers_FAIL_TESTS.address });
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
			try {
				await glob.web3UnitTestHelpers_FAIL_TESTS.callToDepositTokensToStagedBalance(glob.web3ClientFund.address, glob.user_a, glob.web3Erc20.address, 4);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});
*/
		//------------------------------------------------------------------------

		/*
		unstage(uint256 amount, address token) 
		*/

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

				assert.equal(newEthersBalance.add(totalGasPrice) - oldEthersBalance, web3.toWei(0.1, 'ether'), 'Wrong user D balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice) - oldEthersBalance, 'ether') + ' ethers].');
				assert.equal(oldStagedBalance - newStagedBalance, web3.toWei(0.1, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(oldStagedBalance - newStagedBalance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [withdrawEthers]: User A wants to withdraw 0.1 ETH", async() => {
			try {
				await glob.web3ClientFund.withdrawEthers(web3.toWei(0.1, 'ether'), { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------


	});
};

