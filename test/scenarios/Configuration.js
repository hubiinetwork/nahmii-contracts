const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const Configuration = artifacts.require('Configuration');

chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('Configuration', () => {

        let instance = null;

        before(async () => {
            instance = await Configuration.deployed();
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await instance.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized at construction time', async () => {
                const owner = await instance.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('changeOwner()', () => {
            describe('if called with current owner as sender', () => {
                after(async () => {
                    await instance.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should successfully set new owner and emit event', async () => {
                    const result = await instance.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await instance.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not current owner', () => {
                it('should fail to set new owner', async () => {
                    instance.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('partsPer()', () => {
            it('should get the value initialized at construction time', async () => {
                const partsPer = await instance.partsPer.call();
                partsPer.toNumber().should.equal(1e18);
            });
        });

        describe('getTradeMakerFee()', () => {
            before(async () => {
                await instance.setTradeMakerFee(0, 1e15, [1, 10], [1e17, 2e17])
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await instance.getTradeMakerFee.call(0, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await instance.getTradeMakerFee.call(0, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setTradeMakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await instance.getTradeMakerFee.call(0, 0);
                });

                after(async () => {
                    await instance.setTradeMakerFee(0, initialValue, [1, 10], [1e17, 2e17]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setTradeMakerFee(0, 1e18, [1, 10], [1e17, 2e17]);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerFeeEvent');
                    const value = await instance.getTradeMakerFee.call(0, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setTradeMakerFee(0, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    instance.setTradeMakerFee(0, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await instance.getTradeMakerFeesCount.call();
                value.toNumber().should.equal(1);
            });
        });

        describe('getTradeTakerFee()', () => {
            before(async () => {
                await instance.setTradeTakerFee(0, 1e15, [1, 10], [1e17, 2e17])
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await instance.getTradeTakerFee.call(0, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await instance.getTradeTakerFee.call(0, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setTradeTakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await instance.getTradeTakerFee.call(0, 0);
                });

                after(async () => {
                    await instance.setTradeTakerFee(0, initialValue, [1, 10], [1e17, 2e17]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setTradeTakerFee(0, 1e18, [1, 10], [1e17, 2e17]);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerFeeEvent');
                    const value = await instance.getTradeTakerFee.call(0, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setTradeTakerFee(0, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    instance.setTradeTakerFee(0, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await instance.getTradeTakerFeesCount.call();
                value.toNumber().should.equal(1);
            });
        });

        describe('getPaymentFee()', () => {
            before(async () => {
                await instance.setPaymentFee(0, 1e15, [1, 10], [1e17, 2e17])
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await instance.getPaymentFee.call(0, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await instance.getPaymentFee.call(0, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setPaymentFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await instance.getPaymentFee.call(0, 0);
                });

                after(async () => {
                    await instance.setPaymentFee(0, initialValue, [1, 10], [1e17, 2e17]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setPaymentFee(0, 1e18, [1, 10], [1e17, 2e17]);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentFeeEvent');
                    const value = await instance.getPaymentFee.call(0, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setPaymentFee(0, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    instance.setPaymentFee(0, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getPaymentFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await instance.getPaymentFeesCount.call();
                value.toNumber().should.equal(1);
            });
        });

        describe('getTradeMakerMinimumFee()', () => {
            before(async () => {
                await instance.setTradeMakerMinimumFee(0, 1e14);
            });

            it('should get the nominal value', async () => {
                const value = await instance.getTradeMakerMinimumFee.call(0);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setTradeMakerMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await instance.getTradeMakerMinimumFee.call(0);
                });

                after(async () => {
                    await instance.setTradeMakerMinimumFee(0, initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setTradeMakerMinimumFee(0, 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerMinimumFeeEvent');
                    const value = await instance.getTradeMakerMinimumFee.call(0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setTradeMakerMinimumFee(0, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await instance.getTradeMakerMinimumFeesCount.call();
                value.toNumber().should.equal(1);
            });
        });

        describe('getTradeTakerMinimumFee()', () => {
            before(async () => {
                await instance.setTradeTakerMinimumFee(0, 1e14);
            });

            it('should get the nominal value', async () => {
                const value = await instance.getTradeTakerMinimumFee.call(0);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setTradeTakerMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await instance.getTradeTakerMinimumFee(0);
                });

                after(async () => {
                    await instance.setTradeTakerMinimumFee(0, initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setTradeTakerMinimumFee(0, 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerMinimumFeeEvent');
                    const value = await instance.getTradeTakerMinimumFee.call(0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setTradeTakerMinimumFee(0, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await instance.getTradeTakerMinimumFeesCount.call();
                value.toNumber().should.equal(1);
            });
        });

        describe('getPaymentMinimumFee()', () => {
            before(async () => {
                await instance.setPaymentMinimumFee(0, 1e14);
            });

            it('should get the nominal value', async () => {
                const value = await instance.getPaymentMinimumFee.call(0);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setPaymentMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await instance.getPaymentMinimumFee(0);
                });

                after(async () => {
                    await instance.setPaymentMinimumFee(0, initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setPaymentMinimumFee(0, 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentMinimumFeeEvent');
                    const value = await instance.getPaymentMinimumFee.call(0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setPaymentMinimumFee(0, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getPaymentMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await instance.getPaymentMinimumFeesCount.call();
                value.toNumber().should.equal(1);
            });
        });

        describe('cancelOrderChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                const value = await instance.cancelOrderChallengeTimeout.call();
                value.toNumber().should.equal(0);
            });
        });

        describe('setCancelOrderChallengeTimeout()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await instance.cancelOrderChallengeTimeout.call();
                });

                after(async () => {
                    await instance.setCancelOrderChallengeTimeout(initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setCancelOrderChallengeTimeout(100);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrderChallengeTimeout');
                    const value = await instance.cancelOrderChallengeTimeout.call();
                    value.toNumber().should.equal(100);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setCancelOrderChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('dealChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                const value = await instance.dealChallengeTimeout.call();
                value.toNumber().should.equal(0);
            });
        });

        describe('setDealChallengeTimeout()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await instance.dealChallengeTimeout.call();
                });

                after(async () => {
                    await instance.setDealChallengeTimeout(initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setDealChallengeTimeout(100);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDealChallengeTimeout');
                    const value = await instance.dealChallengeTimeout.call();
                    value.toNumber().should.equal(100);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setDealChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getUnchallengeDealSettlementOrderByTradeStake()', () => {
            it('should equal values initialized at construction time', async () => {
                const values = await instance.unchallengeDealSettlementOrderByTradeStake.call();
                values.should.be.an('array').and.have.lengthOf(2);
                values[0].should.equal('0x0000000000000000000000000000000000000000');
                values[1].toNumber().should.equal(0);
            });
        });

        describe('setUnchallengeDealSettlementOrderByTradeStake()', () => {
            describe('if called with sender that is owner', () => {
                let initialValues;

                before(async () => {
                    initialValues = await instance.unchallengeDealSettlementOrderByTradeStake.call();
                });

                after(async () => {
                    await instance.setUnchallengeDealSettlementOrderByTradeStake(initialValues[0], initialValues[1]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await instance.setUnchallengeDealSettlementOrderByTradeStake('0x0000000000000000000000000000000000000001', 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetUnchallengeDealSettlementOrderByTradeStakeEvent');
                    const values = await instance.unchallengeDealSettlementOrderByTradeStake.call();
                    values[0].should.equal('0x0000000000000000000000000000000000000001');
                    values[1].toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    instance.setUnchallengeDealSettlementOrderByTradeStake('0x0000000000000000000000000000000000000001', 1e18, {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};
