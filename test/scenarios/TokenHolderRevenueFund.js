var Helpers = require('../helpers');

module.exports = function (glob) {
	const _1e18 = '1000000000000000000';
	const fake_balanceBlocksIn = '10000000000'; //this is what our fake balanceBlocksIn in UnitTestHelper.sol returns

	var testCounter = Helpers.TestCounter();

	describe("TokenHolderRevenueFund", function () {
		it(testCounter.next() + ": MUST SUCCEED [payable]: UnitTestHelpers_MISC_1 'collaborates' with 0.6 Ethers", async() => {
			try {
				let oldPeriodAccrualBalance = await glob.web3TokenHolderRevenueFund.periodAccrualBalance(0);
				let oldAggregateAccrualBalance = await glob.web3TokenHolderRevenueFund.aggregateAccrualBalance(0);

				await glob.web3UnitTestHelpers_MISC_1.send_money(glob.web3TokenHolderRevenueFund.address, web3.toWei(0.6, 'ether'), { gasLimit: glob.gasLimit });

				let newPeriodAccrualBalance = await glob.web3TokenHolderRevenueFund.periodAccrualBalance(0);
				let newAggregateAccrualBalance = await glob.web3TokenHolderRevenueFund.aggregateAccrualBalance(0);
	
				assert.equal(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), web3.toWei(0.6, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), 'ether') + ' ethers].');
				assert.equal(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), web3.toWei(0.6, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [payable]: UnitTestHelpers_MISC_2 'collaborates' with 0.3 Ethers", async() => {
			try {
				let oldPeriodAccrualBalance = await glob.web3TokenHolderRevenueFund.periodAccrualBalance(0);
				let oldAggregateAccrualBalance = await glob.web3TokenHolderRevenueFund.aggregateAccrualBalance(0);

				await glob.web3UnitTestHelpers_MISC_2.send_money(glob.web3TokenHolderRevenueFund.address, web3.toWei(0.3, 'ether'), { gasLimit: glob.gasLimit });

				let newPeriodAccrualBalance = await glob.web3TokenHolderRevenueFund.periodAccrualBalance(0);
				let newAggregateAccrualBalance = await glob.web3TokenHolderRevenueFund.aggregateAccrualBalance(0);
	
				assert.equal(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), web3.toWei(0.3, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), 'ether') + ' ethers].');
				assert.equal(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), web3.toWei(0.3, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), 'ether') + ' ethers].');	
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [payable]: cannot be called with 0 ethers", async() => {
			try {
				await web3.eth.sendTransactionPromise({
						from: glob.user_d,
						to: glob.web3TokenHolderRevenueFund.address,
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

		it(testCounter.next() + ": MUST FAIL [setRevenueTokenAddress]: Set revenue token from a non-owner caller", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.setRevenueTokenAddress(glob.web3UnitTestHelpers_MISC_1.address, { from: glob.user_d });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [setRevenueTokenAddress]: Set UnitTestHelpers_MISC_1 as our dummy revenue token", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.setRevenueTokenAddress(glob.web3UnitTestHelpers_MISC_1.address);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositTokens]: UnitTestHelpers_MISC_1 'collaborates' with 7 tokens", async() => {
			try {
				await glob.web3UnitTestHelpers_MISC_1.callToApprove_ERC20(glob.web3Erc20.address, glob.web3TokenHolderRevenueFund.address, 7);
			}
			catch (err) {
				assert(false, 'Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']');
			}
			try {
				let oldPeriodAccrualBalance = await glob.web3TokenHolderRevenueFund.periodAccrualBalance(glob.web3Erc20.address);
				let oldAggregateAccrualBalance = await glob.web3TokenHolderRevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);

				await glob.web3UnitTestHelpers_MISC_1.callToDepositTokens_REVENUEFUND(glob.web3TokenHolderRevenueFund.address, glob.web3Erc20.address, 7, {gasLimit: glob.gasLimit});

				let newPeriodAccrualBalance = await glob.web3TokenHolderRevenueFund.periodAccrualBalance(glob.web3Erc20.address);
				let newAggregateAccrualBalance = await glob.web3TokenHolderRevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);

				assert.equal(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), 7, 'Wrong balance [Diff ' + newPeriodAccrualBalance.sub(oldPeriodAccrualBalance).toString() + ' tokens].');
				assert.equal(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), 7, 'Wrong balance [Diff ' + newAggregateAccrualBalance.sub(oldAggregateAccrualBalance).toString() + ' tokens].');	
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called from owner", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.depositTokens(glob.web3Erc20.address, 0, { from: glob.owner });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: cannot be called with 0 tokens", async() => {
			try {
				await glob.web3UnitTestHelpers_MISC_2.callToDepositTokens_TOKENHOLDERREVENUEFUND(glob.web3TokenHolderRevenueFund.address, glob.web3Erc20.address, 0);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called with zero address", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.depositTokens(0, 5, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [registerServiceAction]: Register UnitTestHelpers_FAIL SC as a service from non-owner", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.registerServiceAction(glob.web3UnitTestHelpers_FAIL_TESTS.address, "close_accrual_period", { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [registerServiceAction]: Register UnitTestHelpers_SUCCESS SC as a service", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.registerServiceAction(glob.web3UnitTestHelpers_SUCCESS_TESTS.address, "close_accrual_period");
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [claimAccrual]: Calling without closing accrual first", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.claimAccrual(0);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [closeAccrualPeriod]: Calling from non-owner and non-registerd address", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.closeAccrualPeriod({ from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [closeAccrualPeriod]: Calling from UnitTestHelpers_SUCCESS_TESTS", async() => {
			try {
				await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToCloseAccrualPeriod_TOKENHOLDERREVENUEFUND(glob.web3TokenHolderRevenueFund.address);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [claimAccrual]: Calling for a token without accrual deposits", async() => {
			const MOCK_TOKEN_XYZ = '0xcafeefac0000dddd0000cccc0000bbbb0000aaaa';

			try {
				await glob.web3TokenHolderRevenueFund.claimAccrual(MOCK_TOKEN_XYZ, { from: glob.user_a, gasLimit: glob.gasLimit });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [claimAccrual]: User A is claiming his ETH accrual", async() => {
			try {
				let BN = web3.BigNumber.another({ DECIMAL_PLACES: 0, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN }); //another is the old method name of "clone"

				let bn_1e18 = new BN(_1e18);

				let balance = await glob.web3TokenHolderRevenueFund.aggregateAccrualBalance(0);
				balance = new BN(balance);

				let bb = new BN(fake_balanceBlocksIn);
				let bn_low = new BN(0); //previous claim block 
				let bn_up = new BN(web3.eth.blockNumber - 1); //<<<--- No idea why blockNumber returns the next block instead of the current

				let oldStagedBalance = await glob.web3TokenHolderRevenueFund.stagedBalance(glob.user_a, 0);

				await glob.web3TokenHolderRevenueFund.claimAccrual(0, { from: glob.user_a, gasLimit: glob.gasLimit });

				let newStagedBalance = await glob.web3TokenHolderRevenueFund.stagedBalance(glob.user_a, 0);

				// let's do some math
				let fraction = bb.mul(bn_1e18).mul(balance).div( balance.mul( bn_up.sub(bn_low) ).mul(bn_1e18) );
				let amount = fraction.mul(balance).div(bn_1e18);

				assert.equal(newStagedBalance.sub(oldStagedBalance), amount.toString(), 'Wrong balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [claimAccrual]: Claiming more than once on the same period is not allowed", async() => {
			try {
				await glob.web3TokenHolderRevenueFund.claimAccrual(0, { from: glob.user_a, gasLimit: glob.gasLimit });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});
		
		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [claimAccrual]: User A is claiming his tokens accrual", async() => {
			try {
				let BN = web3.BigNumber.another({ DECIMAL_PLACES: 0, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN }); //another is the old method name of "clone"

				let bn_1e18 = new BN(_1e18);

				let balance = await glob.web3TokenHolderRevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);
				balance = new BN(balance);

				let bb = new BN(fake_balanceBlocksIn);
				let bn_low = new BN(0); //previous claim block 
				let bn_up = new BN(web3.eth.blockNumber - 1); //<<<--- No idea why blockNumber returns the next block instead of the current

				let oldStagedBalance = await glob.web3TokenHolderRevenueFund.stagedBalance(glob.user_a, glob.web3Erc20.address);

				await glob.web3TokenHolderRevenueFund.claimAccrual(glob.web3Erc20.address, { from: glob.user_a, gasLimit: glob.gasLimit });

				let newStagedBalance = await glob.web3TokenHolderRevenueFund.stagedBalance(glob.user_a, glob.web3Erc20.address);

				// let's do some math
				let fraction = bb.mul(bn_1e18).mul(balance).div( balance.mul( bn_up.sub(bn_low) ).mul(bn_1e18) );
				let amount = fraction.mul(balance).div(bn_1e18);
				amount = amount.toNumber();

				assert.equal(newStagedBalance.sub(oldStagedBalance), amount, 'Wrong balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------
		
		it(testCounter.next() + ": MUST SUCCEED [withdrawEthers]: User A wants to withdraw 1 ETH but he will get less", async() => {
			try {
				let oldStagedBalance = await glob.web3TokenHolderRevenueFund.stagedBalance(glob.user_a, 0);
				let oldEthersBalance = await web3.eth.getBalancePromise(glob.user_a);

				let result = await glob.web3TokenHolderRevenueFund.withdrawEthers(web3.toWei(1, 'ether'), { from: glob.user_a });

				let tx = web3.eth.getTransaction(result.tx);
				let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
				totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

				let newStagedBalance = await glob.web3TokenHolderRevenueFund.stagedBalance(glob.user_a, 0);
				let newEthersBalance = await web3.eth.getBalancePromise(glob.user_a);

				let amount = oldStagedBalance.sub(newStagedBalance).toNumber();

				assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), amount, 'Wrong balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
				assert.equal(newStagedBalance.sub(oldStagedBalance), -amount, 'Wrong balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [withdrawTokens]: User A withdraw 10 tokens (but only can get 0)", async() => {
			try {
				let oldStagedBalance = await glob.web3TokenHolderRevenueFund.stagedBalance(glob.user_a, glob.web3Erc20.address);
				let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.user_a);

				await glob.web3TokenHolderRevenueFund.withdrawTokens(10, glob.web3Erc20.address, { from: glob.user_c });

				let newStagedBalance = await glob.web3TokenHolderRevenueFund.stagedBalance(glob.user_a, glob.web3Erc20.address);
				let newTokensBalance = await glob.web3Erc20.balanceOf(glob.user_a);

				let amount = oldStagedBalance.sub(newStagedBalance).toNumber();

				assert.equal(newTokensBalance.sub(oldTokensBalance), amount, 'Wrong user A balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
				assert.equal(newStagedBalance.sub(oldStagedBalance), -amount, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});
	});




















};
