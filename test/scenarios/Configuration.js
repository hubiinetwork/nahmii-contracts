const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const {Wallet, utils} = require('ethers');
const address0 = require('../mocks').address0;
const setTimeoutPromise = require('util').promisify(setTimeout);

chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('Configuration', () => {
        let web3Configuration;
        let provider, blockNumberAhead, blockNumberBehind;
        const feeUpdates = {
            tradeMakerFee: 0,
            tradeTakerFee: 0,
            paymentFee: 0,
            tradeMakerMinimumFee: 0,
            tradeTakerMinimumFee: 0,
            paymentMininumFee: 0
        };

        before(async () => {
            web3Configuration = glob.web3Configuration;
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            const blockNumber = await provider.getBlockNumber();
            blockNumberAhead = blockNumber + 10;
            blockNumberBehind = blockNumber - 10;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await web3Configuration.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('operationalMode()', () => {
            it('should equal value initialized', async () => {
                const operationalMode = await web3Configuration.operationalMode.call();
                operationalMode.toNumber().should.equal(0);
            });
        });

        describe('isOperationalModeNormal()', () => {
            it('should equal value initialized', async () => {
                const operationalModeNormal = await web3Configuration.isOperationalModeNormal.call();
                operationalModeNormal.should.be.true;
            });
        });

        describe('isOperationalModeExit()', () => {
            it('should equal value initialized', async () => {
                const operationalModeExit = await web3Configuration.isOperationalModeExit.call();
                operationalModeExit.should.be.false;
            });
        });

        describe('setOperationalModeExit()', () => {
            describe('if called with owner as sender', () => {
                it('should set exit operational mode', async () => {
                    await web3Configuration.setOperationalModeExit();
                    const operationalModeExit = await web3Configuration.isOperationalModeExit.call();
                    operationalModeExit.should.be.true;
                });
            });

            describe('if called with registered service as sender', () => {
                before(async () => {
                    await web3Configuration.registerService(glob.user_a);
                    await web3Configuration.enableServiceAction(glob.user_a, 'operational_mode');
                });

                it('should set exit operational mode', async () => {
                    await web3Configuration.setOperationalModeExit({from: glob.user_a});
                    const operationalModeExit = await web3Configuration.isOperationalModeExit.call();
                    operationalModeExit.should.be.true;
                });
            });

            describe('if called with sender that is not owner or registered service', () => {
                it('should revert', async () => {
                    web3Configuration.setOperationalModeExit({from: glob.user_b}).should.be.rejected;
                });
            });
        });

        describe('getPartsPer()', () => {
            it('should get the value initialized at construction time', async () => {
                const partsPer = await web3Configuration.PARTS_PER.call();
                partsPer.toNumber().should.equal(1e18);
            });
        });

        describe('getTradeMakerFee()', () => {
            beforeEach(async () => {
                await web3Configuration.setTradeMakerFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.tradeMakerFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await web3Configuration.getTradeMakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await web3Configuration.getTradeMakerFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setTradeMakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.tradeMakerFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerFeeEvent');
                    const value = await web3Configuration.getTradeMakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getTradeMakerFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeMakerFee);
            });
        });

        describe('getTradeTakerFee()', () => {
            before(async () => {
                await web3Configuration.setTradeTakerFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.tradeTakerFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await web3Configuration.getTradeTakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await web3Configuration.getTradeTakerFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setTradeTakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.tradeTakerFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerFeeEvent');
                    const value = await web3Configuration.getTradeTakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getTradeTakerFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeTakerFee);
            });
        });

        describe('getPaymentFee()', () => {
            before(async () => {
                await web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.paymentFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await web3Configuration.getPaymentFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await web3Configuration.getPaymentFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setPaymentFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setPaymentFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.paymentFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentFeeEvent');
                    const value = await web3Configuration.getPaymentFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getPaymentFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getPaymentFeesCount.call();
                value.toNumber().should.equal(feeUpdates.paymentFee);
            });
        });

        describe('getCurrencyPaymentFee()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            beforeEach(async () => {
                await web3Configuration.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                await web3Configuration.setCurrencyPaymentFee(currency, blockNumberAhead, 2e15, [1, 10], [1e17, 2e17]);
            });

            describe('if called with non-existent currency', () => {
                it('should get the currency agnostic value', async () => {
                    const value = await web3Configuration.getCurrencyPaymentFee.call(Wallet.createRandom().address, blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent currency', () => {
                describe('if called with non-existent discount key', () => {
                    it('should get the nominal value', async () => {
                        const value = await web3Configuration.getCurrencyPaymentFee.call(currency, blockNumberAhead, 0);
                        value.toNumber().should.equal(2e15);
                    });
                });

                describe('if called with existent discount key', () => {
                    it('should get the discounted value', async () => {
                        const value = await web3Configuration.getCurrencyPaymentFee.call(currency, blockNumberAhead, 1);
                        value.toNumber().should.equal(18e14);
                    });
                });
            });
        });

        describe('setCurrencyPaymentFee()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCurrencyPaymentFee(currency, blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCurrencyPaymentFeeEvent');
                    const value = await web3Configuration.getCurrencyPaymentFee.call(currency, blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setCurrencyPaymentFee(currency, blockNumberAhead, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setCurrencyPaymentFee(currency, blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setCurrencyPaymentFee(currency, blockNumberAhead, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getCurrencyPaymentFeesCount()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getCurrencyPaymentFeesCount.call(currency);
                value.toNumber().should.equal(0);
            });
        });

        describe('getTradeMakerMinimumFee()', () => {
            before(async () => {
                await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.tradeMakerMinimumFee++;
            });

            it('should get the nominal value', async () => {
                const value = await web3Configuration.getTradeMakerMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setTradeMakerMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.tradeMakerMinimumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerMinimumFeeEvent');
                    const value = await web3Configuration.getTradeMakerMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeMakerMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getTradeMakerMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeMakerMinimumFee);
            });
        });

        describe('getTradeTakerMinimumFee()', () => {
            before(async () => {
                await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.tradeTakerMinimumFee++;
            });

            it('should get the nominal value', async () => {
                const value = await web3Configuration.getTradeTakerMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setTradeTakerMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.tradeTakerMinimumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerMinimumFeeEvent');
                    const value = await web3Configuration.getTradeTakerMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setTradeTakerMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getTradeTakerMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeTakerMinimumFee);
            });
        });

        describe('getPaymentMinimumFee()', () => {
            before(async () => {
                await web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.paymentMininumFee++;

            });

            it('should get the nominal value', async () => {
                const value = await web3Configuration.getPaymentMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setPaymentMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.paymentMininumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentMinimumFeeEvent');
                    const value = await web3Configuration.getPaymentMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setPaymentMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getPaymentMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getPaymentMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.paymentMininumFee);
            });
        });

        describe('getCurrencyPaymentMinimumFee()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            beforeEach(async () => {
                await web3Configuration.setCurrencyPaymentMinimumFee(currency, blockNumberAhead, 1e14);
            });

            describe('if called with non-existent currency', () => {
                it('should be reverted', () => {
                    web3Configuration.getCurrencyPaymentMinimumFee.call(Wallet.createRandom().address, blockNumberAhead, 0).should.be.rejected;
                });
            });

            describe('if called with existent currency', () => {
                it('should get the nominal value', async () => {
                    const value = await web3Configuration.getCurrencyPaymentMinimumFee.call(currency, blockNumberAhead);
                    value.toNumber().should.equal(1e14);
                });
            });
        });

        describe('setCurrencyPaymentMinimumFee()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCurrencyPaymentMinimumFee(currency, blockNumberAhead, 1e18);

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCurrencyPaymentMinimumFeeEvent');
                    const value = await web3Configuration.getCurrencyPaymentMinimumFee.call(currency, blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setCurrencyPaymentMinimumFee(currency, blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setCurrencyPaymentMinimumFee(currency, blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getCurrencyPaymentMinimumFeesCount()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            it('should return the number of block number dependent fee configurations', async () => {
                const value = await web3Configuration.getCurrencyPaymentMinimumFeesCount.call(currency);
                value.toNumber().should.equal(0);
            });
        });

        describe('getCancelOrderChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                const value = await web3Configuration.getCancelOrderChallengeTimeout.call();
                value.toNumber().should.equal(60 * 60 * 3);
            });
        });

        describe('setCancelOrderChallengeTimeout()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await web3Configuration.getCancelOrderChallengeTimeout.call();
                });

                after(async () => {
                    await web3Configuration.setCancelOrderChallengeTimeout(initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setCancelOrderChallengeTimeout(100);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrderChallengeTimeout');
                    const value = await web3Configuration.getCancelOrderChallengeTimeout.call();
                    value.toNumber().should.equal(100);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setCancelOrderChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getDriipSettlementChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                const value = await web3Configuration.driipSettlementChallengeTimeout.call();
                value.toNumber().should.equal(60 * 60 * 5);
            });
        });

        describe('setDriipSettlementChallengeTimeout()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await web3Configuration.driipSettlementChallengeTimeout.call();
                });

                after(async () => {
                    await web3Configuration.setDriipSettlementChallengeTimeout(initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setDriipSettlementChallengeTimeout(100);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDriipSettlementChallengeTimeout');
                    const value = await web3Configuration.driipSettlementChallengeTimeout.call();
                    value.toNumber().should.equal(100);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setDriipSettlementChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getUnchallengeOrderCandidateByTradeStake()', () => {
            it('should equal values initialized at construction time', async () => {
                const values = await web3Configuration.getUnchallengeOrderCandidateByTradeStake.call();
                values.should.be.an('array').and.have.lengthOf(2);
                values[0].should.equal(address0);
                values[1].toNumber().should.equal(0);
            });
        });

        describe('setUnchallengeOrderCandidateByTradeStake()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            describe('if called with sender that is owner', () => {
                let initialValues;

                before(async () => {
                    initialValues = await web3Configuration.unchallengeOrderCandidateByTradeStake.call();
                });

                after(async () => {
                    await web3Configuration.setUnchallengeOrderCandidateByTradeStake(initialValues[0], initialValues[1]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setUnchallengeOrderCandidateByTradeStake(currency, 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetUnchallengeDriipSettlementOrderByTradeStakeEvent');
                    const values = await web3Configuration.unchallengeOrderCandidateByTradeStake.call();
                    utils.getAddress(values[0]).should.equal(currency);
                    values[1].toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setUnchallengeOrderCandidateByTradeStake(currency, 1e18, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getFalseWalletSignatureStake()', () => {
            it('should equal values initialized at construction time', async () => {
                const values = await web3Configuration.getFalseWalletSignatureStake.call();
                values.should.be.an('array').and.have.lengthOf(2);
                values[0].should.equal(address0);
                values[1].toNumber().should.equal(0);
            });
        });

        describe('setFalseWalletSignatureStake()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            describe('if called with sender that is owner', () => {
                let initialValues;

                before(async () => {
                    initialValues = await web3Configuration.falseWalletSignatureStake.call();
                });

                after(async () => {
                    await web3Configuration.setFalseWalletSignatureStake(initialValues[0], initialValues[1]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setFalseWalletSignatureStake(currency, 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetFalseWalletSignatureStakeEvent');
                    const values = await web3Configuration.falseWalletSignatureStake.call();
                    utils.getAddress(values[0]).should.equal(currency);
                    values[1].toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setFalseWalletSignatureStake(currency, 1e18, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getDuplicateDriipNonceStake()', () => {
            it('should equal values initialized at construction time', async () => {
                const values = await web3Configuration.getDuplicateDriipNonceStake.call();
                values.should.be.an('array').and.have.lengthOf(2);
                values[0].should.equal(address0);
                values[1].toNumber().should.equal(0);
            });
        });

        describe('setDuplicateDriipNonceStake()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            describe('if called with sender that is owner', () => {
                let initialValues;

                before(async () => {
                    initialValues = await web3Configuration.duplicateDriipNonceStake.call();
                });

                after(async () => {
                    await web3Configuration.setDuplicateDriipNonceStake(initialValues[0], initialValues[1]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setDuplicateDriipNonceStake(currency, 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDuplicateDriipNonceStakeEvent');
                    const values = await web3Configuration.duplicateDriipNonceStake.call();
                    utils.getAddress(values[0]).should.equal(currency);
                    values[1].toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setDuplicateDriipNonceStake(currency, 1e18, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getDoubleSpentOrderStake()', () => {
            it('should equal values initialized at construction time', async () => {
                const values = await web3Configuration.getDoubleSpentOrderStake.call();
                values.should.be.an('array').and.have.lengthOf(2);
                values[0].should.equal(address0);
                values[1].toNumber().should.equal(0);
            });
        });

        describe('setDoubleSpentOrderStake()', () => {
            let currency;

            before(() => {
                currency = Wallet.createRandom().address;
            });

            describe('if called with sender that is owner', () => {
                let initialValues;

                before(async () => {
                    initialValues = await web3Configuration.doubleSpentOrderStake.call();
                });

                after(async () => {
                    await web3Configuration.setDoubleSpentOrderStake(initialValues[0], initialValues[1]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await web3Configuration.setDoubleSpentOrderStake(currency, 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDoubleSpentOrderStakeEvent');
                    const values = await web3Configuration.doubleSpentOrderStake.call();
                    utils.getAddress(values[0]).should.equal(currency);
                    values[1].toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    web3Configuration.setDoubleSpentOrderStake(currency, 1e18, {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};
