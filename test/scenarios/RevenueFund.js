var Helpers = require('../helpers');

module.exports = function (glob) {
	var testCounter = Helpers.TestCounter();

	describe("RevenueFund", function () {
		it(testCounter.next() + ": MUST SUCCEED [payable]: UnitTestHelpers_MISC_1 'collaborates' with 1.2 Ethers", async() => {
			try {
				let oldPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(0);
				let oldAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(0);

				await web3.eth.sendTransactionPromise({
						from: glob.web3UnitTestHelpers_MISC_1.address,
						to: glob.web3RevenueFund.address,
						value: web3.toWei(1.2, 'ether'),
						gas: glob.gasLimit
					});

				let newPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(0);
				let newAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(0);
	
				assert.equal(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), web3.toWei(1.2, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), 'ether') + ' ethers].');
				assert.equal(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), web3.toWei(1.2, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [payable]: UnitTestHelpers_MISC_2 'collaborates' with 0.6 Ethers", async() => {
			try {
				let oldPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(0);
				let oldAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(0);

				await web3.eth.sendTransactionPromise({
						from: glob.web3UnitTestHelpers_MISC_2.address,
						to: glob.web3RevenueFund.address,
						value: web3.toWei(0.6, 'ether'),
						gas: glob.gasLimit
					});


				let newPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(0);
				let newAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(0);
	
				assert.equal(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), web3.toWei(0.6, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), 'ether') + ' ethers].');
				assert.equal(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), web3.toWei(0.6, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), 'ether') + ' ethers].');	
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		it(testCounter.next() + ": MUST FAIL [payable]: cannot be called from owner", async() => {
			try {
				await web3.eth.sendTransactionPromise({
						from: glob.owner,
						to: glob.web3RevenueFund.address,
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
						from: glob.user_d,
						to: glob.web3RevenueFund.address,
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

		it(testCounter.next() + ": MUST SUCCEED [depositTokens]: UnitTestHelpers_MISC_1 'collaborates' with 10 tokens", async() => {
			try {
				await glob.web3UnitTestHelpers_MISC_1.erc20_approve(glob.web3Erc20.address, glob.web3RevenueFund.address, 10);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
			try {
				let oldPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(glob.web3Erc20.address);
				let oldAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);

				await glob.web3RevenueFund.depositTokens(glob.web3Erc20.address, 10, { from: glob.web3UnitTestHelpers_MISC_1.address });

				let newPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(glob.web3Erc20.address);
				let newAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);

				assert.equal(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), 10, 'Wrong balance [Diff ' + newPeriodAccrualBalance.sub(oldPeriodAccrualBalance).toString() + ' tokens].');
				assert.equal(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), 10, 'Wrong balance [Diff ' + newAggregateAccrualBalance.sub(oldAggregateAccrualBalance).toString() + ' tokens].');	
			}
			catch (err) {
				assert(false, 'This test must succeed. Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: cannot be called from owner", async() => {
			try {
				await depositTokens(glob.web3Erc20.address, 0, { from: glob.owner });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: cannot be called with 0 tokens", async() => {
			try {
				await depositTokens(glob.web3Erc20.address, 0, { from: glob.web3UnitTestHelpers_MISC_2.address });
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
	});
};
