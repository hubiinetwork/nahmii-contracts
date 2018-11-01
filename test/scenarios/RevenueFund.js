const Helpers = require('../helpers');
const chai = require('chai');

chai.should();

module.exports = function (glob) {
    var testCounter = Helpers.TestCounter();

    describe.skip("RevenueFund", function () {
        it(testCounter.next() + ": MUST SUCCEED [payable]: UnitTestHelpers_MISC_1 'collaborates' with 1.2 Ethers", async () => {
            try {
                let oldPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(0);
                let oldAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(0);

                await glob.web3UnitTestHelpers_MISC_1.send_money(glob.web3RevenueFund.address, web3.toWei(1.2, 'ether'), {gasLimit: glob.gasLimit});

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

        it(testCounter.next() + ": MUST SUCCEED [payable]: UnitTestHelpers_MISC_2 'collaborates' with 0.6 Ethers", async () => {
            try {
                let oldPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(0);
                let oldAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(0);

                await glob.web3UnitTestHelpers_MISC_2.send_money(glob.web3RevenueFund.address, web3.toWei(0.6, 'ether'), {gasLimit: glob.gasLimit});

                let newPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(0);
                let newAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(0);

                assert.equal(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), web3.toWei(0.6, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), 'ether') + ' ethers].');
                assert.equal(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), web3.toWei(0.6, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), 'ether') + ' ethers].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        // it(testCounter.next() + ": MUST FAIL [payable]: Cannot be called from owner", async () => {
        //     try {
        //         await web3.eth.sendTransactionPromise({
        //             from: glob.owner,
        //             to: glob.web3RevenueFund.address,
        //             value: web3.toWei(10, 'ether'),
        //             gas: glob.gasLimit
        //         });
        //         assert(false, 'This test must fail.');
        //     }
        //     catch (err) {
        //         assert(err.toString().includes('revert'), err.toString());
        //     }
        // });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [payable]: cannot be called with 0 ethers", async () => {
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

        it(testCounter.next() + ": MUST SUCCEED [depositTokens]: UnitTestHelpers_MISC_1 'collaborates' with 10 tokens", async () => {
            try {
                await glob.web3UnitTestHelpers_MISC_1.callToApprove_ERC20(glob.web3Erc20.address, glob.web3RevenueFund.address, 10);
            }
            catch (err) {
                assert(false, 'Error: ERC20 failed to approve token transfer. [Error: ' + err.toString() + ']');
            }
            try {
                let oldPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(glob.web3Erc20.address);
                let oldAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);

                await glob.web3UnitTestHelpers_MISC_1.callToDepositTokens_REVENUEFUND(glob.web3RevenueFund.address, glob.web3Erc20.address, 10, {gasLimit: glob.gasLimit});

                let newPeriodAccrualBalance = await glob.web3RevenueFund.periodAccrualBalance(glob.web3Erc20.address);
                let newAggregateAccrualBalance = await glob.web3RevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);

                assert.equal(newPeriodAccrualBalance.sub(oldPeriodAccrualBalance), 10, 'Wrong balance [Diff ' + newPeriodAccrualBalance.sub(oldPeriodAccrualBalance).toString() + ' tokens].');
                assert.equal(newAggregateAccrualBalance.sub(oldAggregateAccrualBalance), 10, 'Wrong balance [Diff ' + newAggregateAccrualBalance.sub(oldAggregateAccrualBalance).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called from owner", async () => {
            try {
                await glob.web3RevenueFund.depositTokens(glob.web3Erc20.address, 0, {from: glob.owner});
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [depositTokens]: cannot be called with 0 tokens", async () => {
            try {
                await glob.web3UnitTestHelpers_MISC_2.callToDepositTokens_REVENUEFUND(glob.web3RevenueFund.address, glob.web3Erc20.address, 0);
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [depositTokens]: Cannot be called with null address", async () => {
            try {
                await glob.web3RevenueFund.depositTokens(0, 5, {from: glob.user_a});
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [registerFractionalBeneficiary]: Register UnitTestHelpers_MISC_1 as 60% beneficiary", async () => {
            try {
                let fraction = await glob.web3RevenueFund.PARTS_PER();
                fraction = fraction.mul(0.6);
                await glob.web3RevenueFund.registerFractionalBeneficiary(glob.web3UnitTestHelpers_MISC_1.address, fraction);
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [registerFractionalBeneficiary]: Cannot be called from non-owner", async () => {
            try {
                let fraction = await glob.web3RevenueFund.PARTS_PER();
                fraction = fraction.mul(0.6);
                await glob.web3RevenueFund.registerFractionalBeneficiary(glob.web3UnitTestHelpers_MISC_1.address, fraction, {from: glob.user_a});
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        // it(testCounter.next() + ": MUST FAIL [registerFractionalBeneficiary]: Cannot register UnitTestHelpers_MISC_1 twice", async () => {
        //     try {
        //         let fraction = await glob.web3RevenueFund.PARTS_PER();
        //         fraction = fraction.mul(0.4);
        //         await glob.web3RevenueFund.registerFractionalBeneficiary(glob.web3UnitTestHelpers_MISC_1.address, fraction);
        //         assert(false, 'This test must fail.');
        //     }
        //     catch (err) {
        //         assert(err.toString().includes('revert'), err.toString());
        //     }
        // });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [registerFractionalBeneficiary]: Trying to register UnitTestHelpers_MISC_2 as 50% beneficiary", async () => {
            try {
                let fraction = await glob.web3RevenueFund.PARTS_PER();
                fraction = fraction.mul(0.5);
                await glob.web3RevenueFund.registerFractionalBeneficiary(glob.web3UnitTestHelpers_MISC_2.address, fraction);
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [closeAccrualPeriod]: Calling without 100% beneficiaries", async () => {
            try {
                await glob.web3RevenueFund.closeAccrualPeriod();
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [registerFractionalBeneficiary]: Register UnitTestHelpers_MISC_2 as 40% beneficiary", async () => {
            try {
                let fraction = await glob.web3RevenueFund.PARTS_PER();
                fraction = fraction.mul(0.4);

                await glob.web3RevenueFund.registerFractionalBeneficiary(glob.web3UnitTestHelpers_MISC_2.address, fraction);
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [closeAccrualPeriod]: Cannot be called from non-owner", async () => {
            try {
                await glob.web3RevenueFund.closeAccrualPeriod({from: glob.user_a});
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [closeAccrualPeriod]: Calling with 100% beneficiaries", async () => {
            try {
                let oldPeriodAccrualBalanceForEthers = await glob.web3RevenueFund.periodAccrualBalance(0);
                let oldAggregateAccrualBalanceForEthers = await glob.web3RevenueFund.aggregateAccrualBalance(0);
                let oldPeriodAccrualBalanceForTokens = await glob.web3RevenueFund.periodAccrualBalance(glob.web3Erc20.address);
                let oldAggregateAccrualBalanceForTokens = await glob.web3RevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);
                let oldEthersBalanceForUT1 = await web3.eth.getBalancePromise(glob.web3UnitTestHelpers_MISC_1.address);
                let oldEthersBalanceForUT2 = await web3.eth.getBalancePromise(glob.web3UnitTestHelpers_MISC_2.address);
                let oldTokensBalanceForUT1 = await glob.web3Erc20.balanceOf(glob.web3UnitTestHelpers_MISC_1.address);
                let oldTokensBalanceForUT2 = await glob.web3Erc20.balanceOf(glob.web3UnitTestHelpers_MISC_2.address);

                await glob.web3RevenueFund.closeAccrualPeriod();

                let newPeriodAccrualBalanceForEthers = await glob.web3RevenueFund.periodAccrualBalance(0);
                let newAggregateAccrualBalanceForEthers = await glob.web3RevenueFund.aggregateAccrualBalance(0);
                let newPeriodAccrualBalanceForTokens = await glob.web3RevenueFund.periodAccrualBalance(glob.web3Erc20.address);
                let newAggregateAccrualBalanceForTokens = await glob.web3RevenueFund.aggregateAccrualBalance(glob.web3Erc20.address);
                let newEthersBalanceForUT1 = await web3.eth.getBalancePromise(glob.web3UnitTestHelpers_MISC_1.address);
                let newEthersBalanceForUT2 = await web3.eth.getBalancePromise(glob.web3UnitTestHelpers_MISC_2.address);
                let newTokensBalanceForUT1 = await glob.web3Erc20.balanceOf(glob.web3UnitTestHelpers_MISC_1.address);
                let newTokensBalanceForUT2 = await glob.web3Erc20.balanceOf(glob.web3UnitTestHelpers_MISC_2.address);

                assert.equal(oldPeriodAccrualBalanceForEthers.sub(newPeriodAccrualBalanceForEthers), web3.toWei(1.8, 'ether'), 'Wrong balance [Diff ' + web3.fromWei(oldPeriodAccrualBalanceForEthers.sub(newPeriodAccrualBalanceForEthers), 'ether') + ' ethers].');
                assert.equal(oldAggregateAccrualBalanceForEthers.toString(), newAggregateAccrualBalanceForEthers.toString(), 'Wrong balance [' + web3.fromWei(oldAggregateAccrualBalanceForEthers, 'ether') + ' ethers].');

                assert.equal(oldPeriodAccrualBalanceForTokens.sub(newPeriodAccrualBalanceForTokens), 10, 'Wrong balance [' + oldPeriodAccrualBalanceForTokens.sub(newPeriodAccrualBalanceForTokens).toString() + ' tokens].');
                assert.equal(oldAggregateAccrualBalanceForTokens.toString(), newAggregateAccrualBalanceForTokens.toString(), 'Wrong balance [' + oldAggregateAccrualBalanceForTokens.toString() + ' tokens].');

                assert.equal(newEthersBalanceForUT1.sub(oldEthersBalanceForUT1), (new web3.BigNumber(web3.toWei(1.8, 'ether'))).mul(0.6).toString(), 'Wrong balance [Diff ' + web3.fromWei(newEthersBalanceForUT1.sub(oldEthersBalanceForUT1), 'ether') + ' ethers].');
                assert.equal(newEthersBalanceForUT2.sub(oldEthersBalanceForUT2), (new web3.BigNumber(web3.toWei(1.8, 'ether'))).mul(0.4).toString(), 'Wrong balance [Diff ' + web3.fromWei(newEthersBalanceForUT2.sub(oldEthersBalanceForUT2), 'ether') + ' ethers].');
                assert.equal(newTokensBalanceForUT1.sub(oldTokensBalanceForUT1), 6, 'Wrong balance [Diff ' + newTokensBalanceForUT1.sub(oldTokensBalanceForUT1).toString() + ' tokens].');
                assert.equal(newTokensBalanceForUT2.sub(oldTokensBalanceForUT2), 4, 'Wrong balance [Diff ' + newTokensBalanceForUT2.sub(oldTokensBalanceForUT2).toString() + ' tokens].');
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [deregisterBeneficiary]: Unregister UnitTestHelpers_MISC_2 as beneficiary", async () => {
            try {
                await glob.web3RevenueFund.deregisterBeneficiary(glob.web3UnitTestHelpers_MISC_2.address);
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [registerService]: Register UnitTestHelpers_FAIL SC as a service from non-owner", async () => {
            try {
                await glob.web3RevenueFund.registerService(glob.web3UnitTestHelpers_FAIL_TESTS.address, {from: glob.user_a});
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [registerService]: Register UnitTestHelpers_SUCCESS SC as a service", async () => {
            try {
                await glob.web3RevenueFund.registerService(glob.web3UnitTestHelpers_SUCCESS_TESTS.address);
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [deregisterService]: Deregister UnitTestHelpers_FAIL SC as a service from non-owner", async () => {
            try {
                await glob.web3RevenueFund.deregisterService(glob.web3UnitTestHelpers_FAIL_TESTS.address, {from: glob.user_a});
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST SUCCEED [deregisterService]: Deregister UnitTestHelpers_SUCCESS SC as a service", async () => {
            try {
                await glob.web3RevenueFund.deregisterService(glob.web3UnitTestHelpers_SUCCESS_TESTS.address);
            }
            catch (err) {
                assert(false, 'This test must succeed. [Error: ' + err.toString() + ']');
            }
        });

        //-------------------------------------------------------------------------

        it(testCounter.next() + ": MUST FAIL [closeAccrualPeriod]: Calling without 100% beneficiaries again", async () => {
            try {
                await glob.web3RevenueFund.closeAccrualPeriod();
                assert(false, 'This test must fail.');
            }
            catch (err) {
                assert(err.toString().includes('revert'), err.toString());
            }
        });
    });
};
