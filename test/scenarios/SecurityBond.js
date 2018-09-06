var Helpers = require('../helpers');

module.exports = function (glob) {
    var testCounter = Helpers.TestCounter();

    describe("SecurityBond", function () {
        it(testCounter.next() + ": MUST FAIL [payable]: cannot be called with 0 ethers", async() => {
            try {
                await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: glob.web3SecurityBond.address,
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

        it(testCounter.next() + ": MUST SUCCEED [payable]: User A adds 0.5 ETH to active balance", async() => {
            try {
                await web3.eth.sendTransactionPromise({
                        from: glob.user_a,
                        to: glob.web3SecurityBond.address,
                        value: web3.toWei(0.5, 'ether'),
                        gas: glob.gasLimit
                    });
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [payable]: Owner adds 1.5 ETH to active balance", async() => {
            try {
                await web3.eth.sendTransactionPromise({
                        from: glob.owner,
                        to: glob.web3SecurityBond.address,
                        value: web3.toWei(1.5, 'ether'),
                        gas: glob.gasLimit
                    });
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [depositTokens]: User A adds 10 tokens to deposited balance", async() => {
            try {
                await glob.web3Erc20.approve(glob.web3SecurityBond.address, 10, { from: glob.user_a });
            }
            catch (err) {
                assert(false, 'This test must succeed. Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']');
            }
            try {
                await glob.web3SecurityBond.depositTokens(10, glob.web3Erc20.address, 0, "", { from: glob.user_a });
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called with zero address", async() => {
            try {
                await glob.web3SecurityBond.depositTokens(5, 0, 0, "", { from: glob.user_a });
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called with zero amount", async() => {
            try {
                await glob.web3SecurityBond.depositTokens(0, glob.web3Erc20.address, 0, "", { from: glob.user_a });
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [depositTokens]: User does not have enough tokens to deposit.", async() => {
            try {
                await glob.web3Erc20.approve(glob.web3SecurityBond.address, 9999, { from: glob.user_a });
            }
            catch (err) {
                assert(false, 'Error: ERC20 failed to approve token transfer.');
            }
            try {
                await glob.web3SecurityBond.depositTokens(9999, glob.web3Erc20.address, 0, "", { from: glob.user_a });
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [depositCount]: User A should have 2 deposits", async() => {
            try {
                let count = await glob.web3SecurityBond.depositCount(glob.user_a);
                assert.equal(count, 2, 'This test must succeed. Error: Deposit count: ' + count.toString());
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [depositCount]: Onwer should have 1 deposit", async() => {
            try {
                let count = await glob.web3SecurityBond.depositCount(glob.owner);
                assert.equal(count, 1, 'This test must succeed. Error: Deposit count: ' + count.toString());
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [deposit]: Owner should have 1.5 ETH at index 0", async() => {
            try {
                let args = await glob.web3SecurityBond.deposit(glob.owner, 0);
                const _amount = args[0];
                const _timestamp = args[1];
                const _currencyCt = args[2];
                const _currencyId = args[3];

                assert.equal(_currencyCt, 0, "Unexpected token deposit.");
                assert.equal(_currencyId, 0, "Unexpected token deposit.");
                assert.equal(_amount, web3.toWei(1.5, 'ether'), "Unexpected ether deposit amount.");
                assert.notEqual(_timestamp, 0, "Timestamp cannot be null.");
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [deposit]: Invalid index deposit 1 for user B.", async() => {
            try {
                await glob.web3SecurityBond.deposit(glob.user_b, 1);
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [deposit]: User A should have 10 tokens at index 1", async() => {
            try {
                let args = await glob.web3SecurityBond.deposit(glob.user_a, 1);
                const _amount = args[0];
                const _timestamp = args[1];
                const _currencyCt = args[2];
                const _currencyId = args[3];

                assert.equal(_currencyCt, glob.web3Erc20.address, "Unexpected ether or other token deposit.");
                assert.equal(_currencyId, 0, "Unexpected ether or other token deposit.");
                assert.equal(_amount, 10, "Unexpeced token deposit amount.");
                assert.notEqual(_timestamp, 0, "Timestamp cannot be null.");
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [activeBalance]: Total should be 2.0 ETH", async() => {
            try {
                let balance = await glob.web3SecurityBond.activeBalance(0, 0);
                assert.equal(balance, web3.toWei(2.0, 'ether'), 'Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [activeBalance]: Total should be 10 tokens", async() => {
            try {
                let balance = await glob.web3SecurityBond.activeBalance(glob.web3Erc20.address, 0);
                assert.equal(balance, 10, 'Wrong balance [' + balance.toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [stagedBalance]: 0 ETH for User A", async() => {
            try {
                let balance = await glob.web3SecurityBond.stagedBalance(glob.user_a, 0, 0);
                assert.equal(balance, web3.toWei(0, 'ether'), 'Wrong balance [' + web3.fromWei(balance, 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [stagedBalance]: 0 tokens for User A", async() => {
            try {
                let balance = await glob.web3SecurityBond.stagedBalance(glob.user_a, glob.web3Erc20.address, 0);
                assert.equal(balance, 0, 'Wrong balance [' + balance.toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [setWithdrawalTimeout]: Non-owner trying to set the withdrawal timeout", async() => {
            try {
                await glob.web3SecurityBond.setWithdrawalTimeout(30, { from: glob.user_a });
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [setWithdrawalTimeout]: Set the withdrawal timeout to 10 seconds", async() => {
            try {
                await glob.web3SecurityBond.setWithdrawalTimeout(10);
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------
 
        it(testCounter.next() + ": MUST FAIL [registerService]: Register UnitTestHelpers_FAIL SC as a service from non-owner", async() => {
            try {
                await glob.web3SecurityBond.registerService(glob.web3UnitTestHelpers_FAIL_TESTS.address, { from: glob.user_a });
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [registerServiceAction]: Register UnitTestHelpers_SUCCESS SC as a service", async() => {
            try {
                await glob.web3SecurityBond.registerService(glob.web3UnitTestHelpers_SUCCESS_TESTS.address);
                await glob.web3SecurityBond.enableServiceAction(glob.web3UnitTestHelpers_SUCCESS_TESTS.address, "stage");
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: User A wants to withdraw 1 ETH but thay are NOT staged", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_a, 0, 0);
                let oldEthersBalance = await web3.eth.getBalancePromise(glob.user_a);

                let result = await glob.web3SecurityBond.withdraw(web3.toWei(1, 'ether'), 0, 0, "", { from: glob.user_a });

                let tx = web3.eth.getTransaction(result.tx);
                let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
                totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_a, 0, 0);
                let newEthersBalance = await web3.eth.getBalancePromise(glob.user_a);

                assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), web3.toWei(0.0, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(0.0, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [stage]: UnitTestHelpers_FAIL stages 0.5 ETH to User A", async() => {
            try {
                await glob.web3UnitTestHelpers_FAIL_TESTS.callToStage_SECURITYBOND(glob.web3SecurityBond.address, glob.user_a, web3.toWei(0.5, 'ether'), 0, 0);
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [stage]: UnitTestHelpers_SUCCESS stages 0.5 ETH to User C", async() => {
            try {
                let oldActiveBalance = await glob.web3SecurityBond.activeBalance(0, 0);
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, 0, 0);

                await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToStage_SECURITYBOND(glob.web3SecurityBond.address, glob.user_c, web3.toWei(0.5, 'ether'), 0, 0);

                let newActiveBalance = await glob.web3SecurityBond.activeBalance(0, 0);
                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, 0, 0);

                assert.equal(newActiveBalance.sub(oldActiveBalance), web3.toWei(-0.5, 'ether'), 'Wrong active balance [Diff ' + web3.fromWei(newActiveBalance.sub(oldActiveBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(0.5, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [stage]: UnitTestHelpers_SUCCESS stages 2 tokens to User C", async() => {
            try {
                let oldActiveBalance = await glob.web3SecurityBond.activeBalance(glob.web3Erc20.address, 0);
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, glob.web3Erc20.address, 0);

                await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToStage_SECURITYBOND(glob.web3SecurityBond.address, glob.user_c, 2, glob.web3Erc20.address, 0);

                let newActiveBalance = await glob.web3SecurityBond.activeBalance(glob.web3Erc20.address, 0);
                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, glob.web3Erc20.address, 0);

                assert.equal(newActiveBalance.sub(oldActiveBalance), -2, 'Wrong active balance [Diff ' + newActiveBalance.sub(oldActiveBalance).toString() + ' tokens].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), 2, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: User C withdraw 1.0 ETH (but only can get 0.5)", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, 0, 0);
                let oldEthersBalance = await web3.eth.getBalancePromise(glob.user_c);

                let result = await glob.web3SecurityBond.withdraw(web3.toWei(1.0, 'ether'), 0, 0, "", { from: glob.user_c });

                let tx = web3.eth.getTransaction(result.tx);
                let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
                totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, 0, 0);
                let newEthersBalance = await web3.eth.getBalancePromise(glob.user_c);

                assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), web3.toWei(0.5, 'ether'), 'Wrong user C balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(-0.5, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: User C withdraw 10 tokens (but only can get 2)", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, glob.web3Erc20.address, 0);
                let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.user_c);

                await glob.web3SecurityBond.withdraw(10, glob.web3Erc20.address, 0, "", { from: glob.user_c });

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, glob.web3Erc20.address, 0);
                let newTokensBalance = await glob.web3Erc20.balanceOf(glob.user_c);

                assert.equal(newTokensBalance.sub(oldTokensBalance), 2, 'Wrong user C balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), -2, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: Repeat user C withdraw 1.0 ETH (but now he will get nothing)", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, 0, 0);
                let oldEthersBalance = await web3.eth.getBalancePromise(glob.user_c);

                let result = await glob.web3SecurityBond.withdraw(web3.toWei(1.0, 'ether'), 0, 0, "", { from: glob.user_c });

                let tx = web3.eth.getTransaction(result.tx);
                let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
                totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, 0, 0);
                let newEthersBalance = await web3.eth.getBalancePromise(glob.user_c);

                assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), web3.toWei(0, 'ether'), 'Wrong user C balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(0, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: Repeat user C withdraw 10 tokens (but now he will get nothing)", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, glob.web3Erc20.address, 0);
                let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.user_c);

                await glob.web3SecurityBond.withdraw(10, glob.web3Erc20.address, 0, "", { from: glob.user_c });

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.user_c, glob.web3Erc20.address, 0);
                let newTokensBalance = await glob.web3Erc20.balanceOf(glob.user_c);

                assert.equal(newTokensBalance.sub(oldTokensBalance), 0, 'Wrong user C balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), 0, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [stage]: UnitTestHelpers_SUCCESS stages 0.2 ETH to Owner", async() => {
            try {
                let oldActiveBalance = await glob.web3SecurityBond.activeBalance(0, 0);
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);

                await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToStage_SECURITYBOND(glob.web3SecurityBond.address, glob.owner, web3.toWei(0.2, 'ether'), 0, 0);

                let newActiveBalance = await glob.web3SecurityBond.activeBalance(0, 0);
                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);

                assert.equal(newActiveBalance.sub(oldActiveBalance), web3.toWei(-0.2, 'ether'), 'Wrong active balance [Diff ' + web3.fromWei(newActiveBalance.sub(oldActiveBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(0.2, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [stage]: UnitTestHelpers_SUCCESS stages 2 tokens to Owner", async() => {
            try {
                let oldActiveBalance = await glob.web3SecurityBond.activeBalance(glob.web3Erc20.address, 0);
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);

                await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToStage_SECURITYBOND(glob.web3SecurityBond.address, glob.owner, 2, glob.web3Erc20.address, 0);

                let newActiveBalance = await glob.web3SecurityBond.activeBalance(glob.web3Erc20.address, 0);
                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);

                assert.equal(newActiveBalance.sub(oldActiveBalance), -2, 'Wrong active balance [Diff ' + newActiveBalance.sub(oldActiveBalance).toString() + ' tokens].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), 2, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        it(testCounter.next() + ": MUST SUCCEED [stage]: After 2 seconds UnitTestHelpers_SUCCESS stages other 0.3 ETH to Owner", async() => {
            try {
                await Helpers.sleep(2000);

                let oldActiveBalance = await glob.web3SecurityBond.activeBalance(0, 0);
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);

                await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToStage_SECURITYBOND(glob.web3SecurityBond.address, glob.owner, web3.toWei(0.3, 'ether'), 0, 0);

                let newActiveBalance = await glob.web3SecurityBond.activeBalance(0, 0);
                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);

                assert.equal(newActiveBalance.sub(oldActiveBalance), web3.toWei(-0.3, 'ether'), 'Wrong active balance [Diff ' + web3.fromWei(newActiveBalance.sub(oldActiveBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(0.3, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [stage]: Also UnitTestHelpers_SUCCESS stages other 3 tokens to Owner", async() => {
            try {
                let oldActiveBalance = await glob.web3SecurityBond.activeBalance(glob.web3Erc20.address, 0);
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);

                await glob.web3UnitTestHelpers_SUCCESS_TESTS.callToStage_SECURITYBOND(glob.web3SecurityBond.address, glob.owner, 3, glob.web3Erc20.address, 0);

                let newActiveBalance = await glob.web3SecurityBond.activeBalance(glob.web3Erc20.address, 0);
                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);

                assert.equal(newActiveBalance.sub(oldActiveBalance), -3, 'Wrong active balance [Diff ' + newActiveBalance.sub(oldActiveBalance).toString() + ' tokens].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), 3, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: Owner wants to withdraw 1.0 ETH before timeout but will get 0", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);
                let oldEthersBalance = await web3.eth.getBalancePromise(glob.owner);

                let result = await glob.web3SecurityBond.withdraw(web3.toWei(1.0, 'ether'), 0, 0, "", { from: glob.owner });

                let tx = web3.eth.getTransaction(result.tx);
                let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
                totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);
                let newEthersBalance = await web3.eth.getBalancePromise(glob.owner);

                assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), web3.toWei(0, 'ether'), 'Wrong Owner balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(0, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: Onwer withdraw 10 tokens before timeout but will get 0", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);
                let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.owner);

                await glob.web3SecurityBond.withdraw(10, glob.web3Erc20.address, 0, "", { from: glob.owner });

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);
                let newTokensBalance = await glob.web3Erc20.balanceOf(glob.owner);

                assert.equal(newTokensBalance.sub(oldTokensBalance), 0, 'Wrong Owner balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), 0, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: After 8 secs, Owner withdraw 1.0 ETH (but only can get 0.2)", async() => {
            try {
                await Helpers.sleep(8000);

                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);
                let oldEthersBalance = await web3.eth.getBalancePromise(glob.owner);

                let result = await glob.web3SecurityBond.withdraw(web3.toWei(1.0, 'ether'), 0, 0, "", { from: glob.owner });

                let tx = web3.eth.getTransaction(result.tx);
                let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
                totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);
                let newEthersBalance = await web3.eth.getBalancePromise(glob.owner);

                assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), web3.toWei(0.2, 'ether'), 'Wrong Owner balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(-0.2, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: Onwer withdraw 10 tokens (but only can get 2)", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);
                let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.owner);

                await glob.web3SecurityBond.withdraw(10, glob.web3Erc20.address, 0, "", { from: glob.owner });

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);
                let newTokensBalance = await glob.web3Erc20.balanceOf(glob.owner);

                assert.equal(newTokensBalance.sub(oldTokensBalance), 2, 'Wrong Owner balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), -2, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: After other 3 secs, Owner withdraw 1.0 ETH (but only can get 0.3)", async() => {
            try {
                await Helpers.sleep(8000);

                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);
                let oldEthersBalance = await web3.eth.getBalancePromise(glob.owner);

                let result = await glob.web3SecurityBond.withdraw(web3.toWei(1.0, 'ether'), 0, 0, "", { from: glob.owner });

                let tx = web3.eth.getTransaction(result.tx);
                let totalGasPrice = new web3.BigNumber(result.receipt.gasUsed);
                totalGasPrice = totalGasPrice.mul(new web3.BigNumber(tx.gasPrice));

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, 0, 0);
                let newEthersBalance = await web3.eth.getBalancePromise(glob.owner);

                assert.equal(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), web3.toWei(0.3, 'ether'), 'Wrong Owner balance [Diff ' + web3.fromWei(newEthersBalance.add(totalGasPrice).sub(oldEthersBalance), 'ether') + ' ethers].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), web3.toWei(-0.3, 'ether'), 'Wrong staged balance [Diff ' + web3.fromWei(newStagedBalance.sub(oldStagedBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [withdraw]: Onwer withdraw 10 tokens (but only can get 3)", async() => {
            try {
                let oldStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);
                let oldTokensBalance = await glob.web3Erc20.balanceOf(glob.owner);

                await glob.web3SecurityBond.withdraw(10, glob.web3Erc20.address, 0, "", { from: glob.owner });

                let newStagedBalance = await glob.web3SecurityBond.stagedBalance(glob.owner, glob.web3Erc20.address, 0);
                let newTokensBalance = await glob.web3Erc20.balanceOf(glob.owner);

                assert.equal(newTokensBalance.sub(oldTokensBalance), 3, 'Wrong Owner balance [Diff ' + newTokensBalance.sub(oldTokensBalance).toString() + ' tokens].');
                assert.equal(newStagedBalance.sub(oldStagedBalance), -3, 'Wrong staged balance [Diff ' + newStagedBalance.sub(oldStagedBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });
    });
};
