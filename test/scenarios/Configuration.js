const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
const Configuration = artifacts.require('Configuration');

chai.use(chaiAsPromised);
chai.should();

module.exports = (glob) => {
    describe('Configuration', () => {
        let truffleInstance, provider, blockNumberAhead, blockNumberBehind;
        const feeUpdates = {
            tradeMakerFee: 0,
            tradeTakerFee: 0,
            paymentFee: 0,
            tradeMakerMinimumFee: 0,
            tradeTakerMinimumFee: 0,
            paymentMininumFee: 0
        };

        before(async () => {
            truffleInstance = glob.web3Configuration;
            provider = glob.signer_owner.provider;
        });

        beforeEach(async () => {
            const blockNumber = await provider.getBlockNumber();
            blockNumberAhead = blockNumber + 10;
            blockNumberBehind = blockNumber - 10;
        });

        describe('constructor', () => {
            it('should initialize fields', async () => {
                const owner = await truffleInstance.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('owner()', () => {
            it('should equal value initialized at construction time', async () => {
                const owner = await truffleInstance.owner.call();
                owner.should.equal(glob.owner);
            });
        });

        describe('changeOwner()', () => {
            describe('if called with current owner as sender', () => {
                after(async () => {
                    await truffleInstance.changeOwner(glob.owner, {from: glob.user_a});
                });

                it('should successfully set new owner and emit event', async () => {
                    const result = await truffleInstance.changeOwner(glob.user_a);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('OwnerChangedEvent');
                    const owner = await truffleInstance.owner.call();
                    owner.should.equal(glob.user_a);
                });
            });

            describe('if called with sender that is not current owner', () => {
                it('should fail to set new owner', async () => {
                    truffleInstance.changeOwner(glob.user_a, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('PARTS_PER()', () => {
            it('should get the value initialized at construction time', async () => {
                const partsPer = await truffleInstance.PARTS_PER.call();
                partsPer.toNumber().should.equal(1e18);
            });
        });

        describe('getTradeMakerFee()', () => {
            beforeEach(async () => {
                await truffleInstance.setTradeMakerFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.tradeMakerFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await truffleInstance.getTradeMakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await truffleInstance.getTradeMakerFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setTradeMakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.tradeMakerFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerFeeEvent');
                    const value = await truffleInstance.getTradeMakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeMakerFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeMakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await truffleInstance.getTradeMakerFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeMakerFee);
            });
        });

        describe('getTradeTakerFee()', () => {
            before(async () => {
                await truffleInstance.setTradeTakerFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.tradeTakerFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await truffleInstance.getTradeTakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await truffleInstance.getTradeTakerFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setTradeTakerFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.tradeTakerFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerFeeEvent');
                    const value = await truffleInstance.getTradeTakerFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeTakerFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeTakerFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await truffleInstance.getTradeTakerFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeTakerFee);
            });
        });

        describe('getPaymentFee()', () => {
            before(async () => {
                await truffleInstance.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17]);
                feeUpdates.paymentFee++;
            });

            describe('if called with non-existent discount key', () => {
                it('should get the nominal value', async () => {
                    const value = await truffleInstance.getPaymentFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e15);
                });
            });

            describe('if called with existent discount key', () => {
                it('should get the discounted value', async () => {
                    const value = await truffleInstance.getPaymentFee.call(blockNumberAhead, 1);
                    value.toNumber().should.equal(9e14);
                });
            });
        });

        describe('setPaymentFee()', () => {
            describe('if provided with correct parameters and called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setPaymentFee(blockNumberAhead, 1e18, [1, 10], [1e17, 2e17]);
                    feeUpdates.paymentFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentFeeEvent');
                    const value = await truffleInstance.getPaymentFee.call(blockNumberAhead, 0);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17], {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setPaymentFee(blockNumberBehind, 1e18, [1, 10], [1e17, 2e17]).should.be.rejected;
                });
            });

            describe('if lengths of discount keys and values differ', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setPaymentFee(blockNumberAhead, 1e15, [1, 10], [1e17, 2e17, 3e17]).should.be.rejected;
                });
            });
        });

        describe('getPaymentFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await truffleInstance.getPaymentFeesCount.call();
                value.toNumber().should.equal(feeUpdates.paymentFee);
            });
        });

        describe('getTradeMakerMinimumFee()', () => {
            before(async () => {
                await truffleInstance.setTradeMakerMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.tradeMakerMinimumFee++;
            });

            it('should get the nominal value', async () => {
                const value = await truffleInstance.getTradeMakerMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setTradeMakerMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setTradeMakerMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.tradeMakerMinimumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeMakerMinimumFeeEvent');
                    const value = await truffleInstance.getTradeMakerMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeMakerMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeMakerMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getTradeMakerMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await truffleInstance.getTradeMakerMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeMakerMinimumFee);
            });
        });

        describe('getTradeTakerMinimumFee()', () => {
            before(async () => {
                await truffleInstance.setTradeTakerMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.tradeTakerMinimumFee++;
            });

            it('should get the nominal value', async () => {
                const value = await truffleInstance.getTradeTakerMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setTradeTakerMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setTradeTakerMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.tradeTakerMinimumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetTradeTakerMinimumFeeEvent');
                    const value = await truffleInstance.getTradeTakerMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeTakerMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setTradeTakerMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getTradeTakerMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await truffleInstance.getTradeTakerMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.tradeTakerMinimumFee);
            });
        });

        describe('getPaymentMinimumFee()', () => {
            before(async () => {
                await truffleInstance.setPaymentMinimumFee(blockNumberAhead, 1e14);
                feeUpdates.paymentMininumFee++;

            });

            it('should get the nominal value', async () => {
                const value = await truffleInstance.getPaymentMinimumFee.call(blockNumberAhead);
                value.toNumber().should.equal(1e14);
            });
        });

        describe('setPaymentMinimumFee()', () => {
            describe('if called with sender that is owner', () => {
                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setPaymentMinimumFee(blockNumberAhead, 1e18);
                    feeUpdates.paymentMininumFee++;

                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetPaymentMinimumFeeEvent');
                    const value = await truffleInstance.getPaymentMinimumFee.call(blockNumberAhead);
                    value.toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setPaymentMinimumFee(blockNumberAhead, 1e14, {from: glob.user_a}).should.be.rejected;
                });
            });

            describe('if called with block number behind the current one', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setPaymentMinimumFee(blockNumberBehind, 1e18).should.be.rejected;
                });
            });
        });

        describe('getPaymentMinimumFeesCount()', () => {
            it('should return the number of block number dependent fee configurations', async () => {
                const value = await truffleInstance.getPaymentMinimumFeesCount.call();
                value.toNumber().should.equal(feeUpdates.paymentMininumFee);
            });
        });

        describe('cancelOrderChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                const value = await truffleInstance.cancelOrderChallengeTimeout.call();
                value.toNumber().should.equal(0);
            });
        });

        describe('setCancelOrderChallengeTimeout()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await truffleInstance.cancelOrderChallengeTimeout.call();
                });

                after(async () => {
                    await truffleInstance.setCancelOrderChallengeTimeout(initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setCancelOrderChallengeTimeout(100);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetCancelOrderChallengeTimeout');
                    const value = await truffleInstance.cancelOrderChallengeTimeout.call();
                    value.toNumber().should.equal(100);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setCancelOrderChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('dealChallengeTimeout()', () => {
            it('should equal value initialized at construction time', async () => {
                const value = await truffleInstance.dealChallengeTimeout.call();
                value.toNumber().should.equal(0);
            });
        });

        describe('setDealChallengeTimeout()', () => {
            describe('if called with sender that is owner', () => {
                let initialValue;

                before(async () => {
                    initialValue = await truffleInstance.dealChallengeTimeout.call();
                });

                after(async () => {
                    await truffleInstance.setDealChallengeTimeout(initialValue);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setDealChallengeTimeout(100);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetDealChallengeTimeout');
                    const value = await truffleInstance.dealChallengeTimeout.call();
                    value.toNumber().should.equal(100);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setDealChallengeTimeout(100, {from: glob.user_a}).should.be.rejected;
                });
            });
        });

        describe('getUnchallengeDealSettlementOrderByTradeStake()', () => {
            it('should equal values initialized at construction time', async () => {
                const values = await truffleInstance.unchallengeDealSettlementOrderByTradeStake.call();
                values.should.be.an('array').and.have.lengthOf(2);
                values[0].should.equal('0x0000000000000000000000000000000000000000');
                values[1].toNumber().should.equal(0);
            });
        });

        describe('setUnchallengeDealSettlementOrderByTradeStake()', () => {
            describe('if called with sender that is owner', () => {
                let initialValues;

                before(async () => {
                    initialValues = await truffleInstance.unchallengeDealSettlementOrderByTradeStake.call();
                });

                after(async () => {
                    await truffleInstance.setUnchallengeDealSettlementOrderByTradeStake(initialValues[0], initialValues[1]);
                });

                it('should successfully set new values and emit event', async () => {
                    const result = await truffleInstance.setUnchallengeDealSettlementOrderByTradeStake('0x0000000000000000000000000000000000000001', 1e18);
                    result.logs.should.be.an('array').and.have.lengthOf(1);
                    result.logs[0].event.should.equal('SetUnchallengeDealSettlementOrderByTradeStakeEvent');
                    const values = await truffleInstance.unchallengeDealSettlementOrderByTradeStake.call();
                    values[0].should.equal('0x0000000000000000000000000000000000000001');
                    values[1].toNumber().should.equal(1e18);
                });
            });

            describe('if called with sender that is not owner', () => {
                it('should fail to set new values', async () => {
                    truffleInstance.setUnchallengeDealSettlementOrderByTradeStake('0x0000000000000000000000000000000000000001', 1e18, {from: glob.user_a}).should.be.rejected;
                });
            });
        });
    });
};
