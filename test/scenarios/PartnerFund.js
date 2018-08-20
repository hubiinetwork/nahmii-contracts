var Helpers = require('../helpers');

module.exports = function (glob) {
	var userATag = "0x1111111111222222222233333333334444444444";
	var userBTag = "0x4444444444333333333322222222221111111111";
	var dummyTag = "0x1234567890123456789012345678901234567890";
	var testCounter = Helpers.TestCounter();

	const _1e18 = '1000000000000000000';

	describe.skip("PartnerFund", function () {
		it(testCounter.next() + ": MUST FAIL [payable]: Payable is disabled", async() => {
			try {
				await web3.eth.sendTransactionPromise({
					from: glob.user_a,
					to: glob.web3PartnerFund.address,
					value: web3.toWei(0.2, 'ether'),
					gas: glob.gasLimit
				});
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositEthersTo]: Not registered tag", async() => {
			try {
				await glob.web3PartnerFund.depositEthersTo(dummyTag, { value: web3.toWei(0.2, 'ether') });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositTokensTo]: Not registered tag", async() => {
			try {
				await glob.web3PartnerFund.depositTokensTo(dummyTag, 2, glob.web3Erc20.address);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [registerPartner]: Register user A tag and owner can change the address", async() => {
			try {
				let BN = web3.BigNumber.another({DECIMAL_PLACES: 5, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});

				var fee_1_pct = (new BN(_1e18)).div(100);

				await glob.web3PartnerFund.registerPartner(userATag, fee_1_pct, false, true);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [setPartnerWallet]: Set user A address", async() => {
			try {
				await glob.web3PartnerFund.setPartnerWallet(userATag, glob.user_a);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [setPartnerWallet]: User A trying to modify his address", async() => {
			try {
				await glob.web3PartnerFund.setPartnerWallet(userATag, glob.user_a, { from: glob.user_a });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [registerPartner]: Register user B tag and only he can change the address", async() => {
			try {
				let BN = web3.BigNumber.another({DECIMAL_PLACES: 5, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});

				var fee_2_pct = (new BN(_1e18)).div(100).mul(2);

				await glob.web3PartnerFund.registerPartner(userBTag, fee_2_pct, true, false);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [setPartnerWallet]: User B trying to modify his address but not set previously", async() => {
			try {
				await glob.web3PartnerFund.setPartnerWallet(userBTag, glob.user_b, { from: glob.user_b });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [setPartnerWallet]: Set user B address", async() => {
			try {
				await glob.web3PartnerFund.setPartnerWallet(userBTag, glob.user_b);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [setPartnerWallet]: Owner trying to set user B address again", async() => {
			try {
				await glob.web3PartnerFund.setPartnerWallet(userBTag, glob.user_b);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [setPartnerWallet]: User B changing his address", async() => {
			try {
				await glob.web3PartnerFund.setPartnerWallet(userBTag, glob.user_b, { from: glob.user_b });
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [getPartnerFee]: Get user B fee", async() => {
			try {
				let BN = web3.BigNumber.another({DECIMAL_PLACES: 5, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});

				var fee_2_pct = (new BN(_1e18)).div(100).mul(2);

				let fee = await glob.web3PartnerFund.getPartnerFee(userBTag);
				assert.equal(fee.toString(), fee_2_pct.toString(), "Fee is not 2%. [Got " + fee_2_pct.div(_1e18).mul(100).toString() + "%].");
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [changePartnerFee]: Change non-registered user fee", async() => {
			try {
				let BN = web3.BigNumber.another({DECIMAL_PLACES: 5, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});

				var fee_5_pct = (new BN(_1e18)).div(100).mul(5);

				await glob.web3PartnerFund.changePartnerFee(dummyTag, fee_5_pct);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [changePartnerFee]: User B wants to change its fee", async() => {
			try {
				let BN = web3.BigNumber.another({DECIMAL_PLACES: 5, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});

				var fee_5_pct = (new BN(_1e18)).div(100).mul(5);

				await glob.web3PartnerFund.changePartnerFee(userBTag, fee_5_pct, { from: glob.user_b });
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [changePartnerFee]: Set new fee to user B", async() => {
			try {
				let BN = web3.BigNumber.another({DECIMAL_PLACES: 5, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});

				var fee_3_pct = (new BN(_1e18)).div(100).mul(3);

				await glob.web3PartnerFund.changePartnerFee(userBTag, fee_3_pct);
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [getPartnerFee]: Verify new user B fee", async() => {
			try {
				let BN = web3.BigNumber.another({DECIMAL_PLACES: 5, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});

				var fee_3_pct = (new BN(_1e18)).div(100).mul(3);

				let fee = await glob.web3PartnerFund.getPartnerFee(userBTag);
				assert.equal(fee.toString(), fee_3_pct.toString(), "Fee is not 3%. [Got " + fee_3_pct.div(_1e18).mul(100).toString() + "%].");
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositEthersTo]: add 1 ether to user A deposited balance", async() => {
			try {
				await glob.web3PartnerFund.depositEthersTo(userATag, { from: glob.owner, value: web3.toWei(1, 'ether') });
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositTokensTo]: 3 tokens added to A deposited balance", async() => {
			try {
				await glob.web3Erc20.approve(glob.web3PartnerFund.address, 3, { from: glob.owner });
			}
			catch (err) {
				assert(false, 'This test must succeed. Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']');
			}
			try {
				await glob.web3PartnerFund.depositTokensTo(userATag, 3, glob.web3Erc20.address, { from: glob.owner });
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [depositCountFromAddress]: User A should have 2 deposits", async() => {
			try {
				let count = await glob.web3PartnerFund.depositCountFromAddress(glob.user_a);
				assert.equal(count, 2, 'This test must succeed. Error: Deposit count: ' + count.toString());
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [depositCount]: Cannot be called from non-registered address", async() => {
			try {
				await glob.web3PartnerFund.depositCount(dummyTag);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [deposit]: User A should have 1 ETH at index 0", async() => {
			try {
				let args = await glob.web3PartnerFund.deposit(userATag, 0);
				const _amount = args[0];
				const _token = args[1];
				const _timestamp = args[2];

				assert.equal(_token, 0, "Unexpected token deposit.");
				assert.equal(_amount, web3.toWei(1, 'ether'), "Unexpected ether deposit amount.");
				assert.notEqual(_timestamp, 0, "Timestamp cannot be null.");
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//-------------------------------------------------------------------------

		it(testCounter.next() + ": MUST FAIL [deposit]: Invalid index deposit 0 for user B.", async() => {
			try {
				await glob.web3PartnerFund.deposit(userBTag, 0);
				assert(false, 'This test must fail.');
			}
			catch (err) {
				assert(err.toString().includes('revert'), err.toString());
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [deposit]: User A should have 3 tokens at index 1", async() => {
			try {
				let args = await glob.web3PartnerFund.deposit(userATag, 1);
				const _amount = args[0];
				const _token = args[1];
				const _timestamp = args[2];

				assert.equal(_token, glob.web3Erc20.address, "Unexpected ether or other token deposit.");
				assert.equal(_amount, 3, "Unexpeced token deposit amount.");
				assert.notEqual(_timestamp, 0, "Timestamp cannot be null.");
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [activeBalance]: 1 ETH for User A", async() => {
			try {
				let balance = await glob.web3PartnerFund.activeBalance(userATag, 0);
				assert.equal(balance, web3.toWei(1, 'ether'), 'Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [activeBalance]: 3 tokens for User A", async() => {
			try {
				let balance = await glob.web3PartnerFund.activeBalance(userATag, glob.web3Erc20.address);
				assert.equal(balance, 3, 'Wrong balance [' + balance.toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stagedBalance]: 0 ETH for User A", async() => {
			try {
				let balance = await glob.web3PartnerFund.stagedBalance(userATag, 0);
				assert.equal(balance, web3.toWei(0, 'ether'), 'Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stagedBalance]: 0 tokens for User A", async() => {
			try {
				let balance = await glob.web3PartnerFund.stagedBalance(userATag, glob.web3Erc20.address);
				assert.equal(balance, 0, 'Wrong balance [' + balance.toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stage]: User A wants to stage 0.2 ETH", async() => {
			try {
				let oldStagedBalance = await glob.web3PartnerFund.stagedBalance(userATag, 0);
				let oldActiveBalance = await glob.web3PartnerFund.activeBalance(userATag, 0);

				let result = await glob.web3PartnerFund.stage(web3.toWei(0.2, 'ether'), 0, { from: glob.user_a });

				let newStagedBalance = await glob.web3PartnerFund.stagedBalance(userATag, 0);
				let newActiveBalance = await glob.web3PartnerFund.activeBalance(userATag, 0);

				assert.equal(oldActiveBalance.sub(newActiveBalance), web3.toWei(0.2, 'ether'), 'Wrong active balance [Diff ' + web3.fromWei(oldActiveBalance.add(newActiveBalance), 'ether') + ' ethers].');
				assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(0.2, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [stage]: User A wants to stage 2 token", async() => {
			try {
				let oldStagedBalance = await glob.web3PartnerFund.stagedBalance(userATag, glob.web3Erc20.address);
				let oldActiveBalance = await glob.web3PartnerFund.activeBalance(userATag, glob.web3Erc20.address);

				let result = await glob.web3PartnerFund.stage(2, glob.web3Erc20.address, { from: glob.user_a });
				let newStagedBalance = await glob.web3PartnerFund.stagedBalance(userATag, glob.web3Erc20.address);
				let newActiveBalance = await glob.web3PartnerFund.activeBalance(userATag, glob.web3Erc20.address);

				assert.equal(oldActiveBalance.sub(newActiveBalance), 2, 'Wrong active balance [Diff ' + oldActiveBalance.add(newActiveBalance).toString() + ' tokens].');
				assert.equal(newStagedBalance.sub(oldStagedBalance), 2, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [withdrawEthers]: User A wants to withdraw 0.1 ETH", async() => {
			try {
				let oldStagedBalance = await glob.web3PartnerFund.stagedBalanceFromAddress(glob.user_a, 0);
				let oldEthersBalance = await web3.eth.getBalancePromise(glob.user_a);

				let result = await glob.web3PartnerFund.withdrawEthers(web3.toWei(0.1, 'ether'), { from: glob.user_a });

				let tx = web3.eth.getTransaction(result.tx);
				let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
				totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

				let newStagedBalance = await glob.web3PartnerFund.stagedBalanceFromAddress(glob.user_a, 0);
				let newEthersBalance = await web3.eth.getBalancePromise(glob.user_a);

				assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), web3.toWei(0.1, 'ether'), 'Wrong user A balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
				assert.equal(oldStagedBalance.sub(newStagedBalance), web3.toWei(0.1, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(oldStagedBalance.sub(newStagedBalance), 'ether') + ' ethers].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});

		//------------------------------------------------------------------------

		it(testCounter.next() + ": MUST SUCCEED [withdrawTokens]: User A wants to withdraw 1 token", async() => {
			try {
				let oldStagedBalance = await glob.web3PartnerFund.stagedBalanceFromAddress(glob.user_a, glob.web3Erc20.address);
				let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.user_a);

				let result = await glob.web3PartnerFund.withdrawTokens(1, glob.web3Erc20.address, { from: glob.user_a });

				let newStagedBalance = await glob.web3PartnerFund.stagedBalanceFromAddress(glob.user_a, glob.web3Erc20.address);
				let newTokensBalance = await glob.web3Erc20.balanceOf(glob.user_a);

				assert.equal(newTokensBalance.sub(oldTokensBalance), 1, 'Wrong user A balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
				assert.equal(oldStagedBalance.sub(newStagedBalance), 1, 'Wrong staged balance [Diff ' + oldStagedBalance.sub(newStagedBalance).toString() + ' tokens].');
			}
			catch (err) {
				assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
			}
		});
	});
};
